from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter, validate_model_for_provider, get_fallback_provider, get_default_model
from app.core.vault.vault import get_api_key, mark_key_used
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
import structlog

logger = structlog.get_logger(__name__)


async def generator_node(state: AgentState, config: RunnableConfig = None) -> dict:
    """
    Generator node. Calls the selected generator provider adapter and produces
    the output. If a critique exists from a failed evaluation, appends the critique
    and prompts the model for revision.
    Supports auto-fallback on rate limits with toast notification.
    """
    user_id = state.get("user_id")
    provider = state.get("provider_generator")
    model = state.get("model_generator")  # Use model directly from router
    messages = state.get("messages", [])
    retries = state.get("retries", 0)
    evaluation = state.get("evaluation") or {}
    available_providers = state.get("available_providers", [])
    
    # Validate model for provider, fallback to default if invalid
    if model:
        is_valid, validated_model = validate_model_for_provider(provider, model)
        if not is_valid:
            model = validated_model
            logger.warning("model_fallback_in_generator", provider=provider, fallback_model=model)
    else:
        model = get_default_model(provider)
    
    gen_key = get_api_key(user_id, provider)
    if not gen_key:
        logger.error("generator_key_missing", provider=provider)
        stream_callback = None
        if config and "configurable" in config:
            stream_callback = config["configurable"].get("stream_callback")
        if stream_callback:
            await stream_callback({"type": "text", "content": "Error: Generator API key missing."})
        return {"output": "Error: Generator API key missing."}
    
    stream_callback = None
    if config and "configurable" in config:
        stream_callback = config["configurable"].get("stream_callback")
    
    async def try_generate(prov: str, mdl: str, key: str) -> str:
        """Try to generate with given provider/model/key. Returns output or raises."""
        adapter = get_adapter(prov, key, mdl)
        
        formatted_messages = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                formatted_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                formatted_messages.append({"role": "assistant", "content": msg.content})
            elif isinstance(msg, SystemMessage):
                formatted_messages.append({"role": "system", "content": msg.content})
                
        if retries > 0 and evaluation.get("critique"):
            retry_prompt = (
                f"Your previous attempt did not pass evaluation. Here is the critique:\n"
                f"\"{evaluation.get('critique')}\"\n\n"
                f"Please revise your answer and fix the issues noted."
            )
            formatted_messages.append({"role": "user", "content": retry_prompt})
        
        full_output = ""
        async for chunk in adapter.stream(formatted_messages):
            if chunk["type"] == "text" and chunk["content"]:
                full_output += chunk["content"]
                if stream_callback:
                    await stream_callback(chunk)
            elif chunk["type"] == "tool_call" and stream_callback:
                await stream_callback(chunk)
        
        mark_key_used(user_id, prov)
        logger.info("generation_complete", provider=prov, model=mdl, output_length=len(full_output))
        return full_output
    
    # Try primary provider
    try:
        output = await try_generate(provider, model, gen_key)
        return {"output": output, "retries": retries + 1}
    
    except Exception as e:
        error_str = str(e).lower()
        logger.error("generation_failed", error=str(e), provider=provider, model=model)
        
        # Check for rate limit / quota exceeded
        is_rate_limited = "rate" in error_str or "429" in error_str or "quota" in error_str
        
        if is_rate_limited and available_providers:
            # Try fallback provider
            fallback = get_fallback_provider(available_providers, provider)
            if fallback:
                fallback_key = get_api_key(user_id, fallback)
                if fallback_key:
                    fallback_model = get_default_model(fallback)
                    
                    # Send toast notification about fallback
                    if stream_callback:
                        await stream_callback({
                            "type": "text",
                            "content": f"\n\n⚠️ **Provider Fallback**: {provider} rate limited. Switching to {fallback} ({fallback_model})...\n\n"
                        })
                    
                    logger.info("provider_fallback", from_provider=provider, to_provider=fallback, model=fallback_model)
                    
                    try:
                        output = await try_generate(fallback, fallback_model, fallback_key)
                        return {"output": output, "retries": retries + 1, "provider_fallback": fallback}
                    except Exception as fallback_error:
                        logger.error("fallback_generation_failed", error=str(fallback_error), fallback=fallback)
        
        # If we get here, either not rate limited or fallback failed
        error_msg = f"Error: Generation failed: {str(e)}"
        if stream_callback:
            await stream_callback({"type": "text", "content": error_msg})
        return {"output": error_msg}