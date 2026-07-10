import asyncio
from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter, validate_model_for_provider_for_user, get_default_model_for_user
from app.core.vault.vault import get_api_key, mark_key_used
from app.core.providers.model_discovery import get_cached_models
from app.core.providers.base import ProviderError
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
import structlog

logger = structlog.get_logger(__name__)


def _clean_error_message(e: Exception) -> tuple[str, str]:
    """Return (code, human_readable_message) from an exception."""
    if isinstance(e, ProviderError):
        code = e.code or "generation_error"
        if code == "invalid_key":
            return code, "Invalid or expired API key. Please update it in Settings."
        if code == "rate_limited":
            return code, "Rate limit reached. Please wait a moment and try again."
        return code, e.message or "Something went wrong. Please try again."
    return "generation_error", "Something went wrong. Please try again."


async def generator_node(state: AgentState, config: RunnableConfig = None) -> dict:
    """
    Generator node. Calls the selected generator provider adapter and produces
    the output. If a critique exists from a failed evaluation, appends the critique
    and prompts the model for revision.
    """
    user_id = state.get("user_id")
    provider = state.get("provider_generator")
    model = state.get("model_generator")
    messages = state.get("messages", [])
    retries = state.get("retries", 0)
    evaluation = state.get("evaluation") or {}
    available_providers = state.get("available_providers", [])
    
    # Validate model for provider, fallback to user's default if invalid
    if model:
        is_valid = await asyncio.to_thread(validate_model_for_provider_for_user, user_id, provider, model)
        if not is_valid:
            fallback = await asyncio.to_thread(get_default_model_for_user, user_id, provider)
            model = fallback
            logger.warning("model_fallback_in_generator", provider=provider, original_model=model, fallback_model=fallback)
    else:
        model = await asyncio.to_thread(get_default_model_for_user, user_id, provider)
    
    gen_key = get_api_key(user_id, provider)
    if not gen_key:
        logger.error("generator_key_missing", provider=provider)
        stream_callback = None
        if config and "configurable" in config:
            stream_callback = config["configurable"].get("stream_callback")
        if stream_callback:
            await stream_callback({"type": "error", "code": "invalid_key", "message": "API key missing for this provider. Please add it in Settings."})
        return {"output": ""}
    
    stream_callback = None
    if config and "configurable" in config:
        stream_callback = config["configurable"].get("stream_callback")
    
    async def try_generate(prov: str, mdl: str, key: str) -> str:
        """Try to generate with given provider/model/key. Returns output or raises."""
        # Look up discovered capabilities for adapter
        cached = await asyncio.to_thread(get_cached_models, user_id, prov) or []
        capabilities = None
        for m in cached:
            if m.get("id") == mdl:
                capabilities = m
                break
        
        adapter = get_adapter(prov, key, mdl, capabilities)
        
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
            
        # If the model does not support vision, strip out the image blocks
        if not adapter.capabilities.supports_vision:
            cleaned_messages = []
            for msg in formatted_messages:
                content = msg.get("content")
                if isinstance(content, list):
                    text_parts = []
                    for part in content:
                        if isinstance(part, dict):
                            if part.get("type") == "text":
                                text_parts.append(part.get("text", ""))
                            elif part.get("type") == "image_url":
                                text_parts.append(f"[Image Attached]")
                        else:
                            text_parts.append(str(part))
                    cleaned_messages.append({**msg, "content": "\n".join(text_parts)})
                else:
                    cleaned_messages.append(msg)
            formatted_messages = cleaned_messages
        
        full_output = ""
        
        async for chunk in adapter.stream(formatted_messages):
            if chunk["type"] == "text" and chunk["content"]:
                full_output += chunk["content"]
                if stream_callback:
                    await stream_callback(chunk)
            elif chunk["type"] == "thinking" and chunk["content"]:
                # Forward LLM thinking/reasoning tokens to the frontend
                if stream_callback:
                    await stream_callback(chunk)
            elif chunk["type"] == "tool_call" and stream_callback:
                await stream_callback(chunk)
            elif chunk["type"] == "error" and chunk.get("code") == "unsupported_capability":
                if stream_callback:
                    await stream_callback({
                        "type": "text",
                        "content": f"The selected model ({mdl}) doesn't support this feature ({chunk.get('message', '')}). Please choose a different model."
                    })
                return f"Error: The selected model ({mdl}) doesn't support this feature."
        
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
        
        is_rate_limited = "rate" in error_str or "429" in error_str or "quota" in error_str
        
        if is_rate_limited and available_providers:
            fallback_provider = None
            for p in available_providers:
                if p != provider:
                    fallback_provider = p
                    break
            
            if fallback_provider:
                fallback_key = get_api_key(user_id, fallback_provider)
                if fallback_key:
                    # Determine if we need vision support
                    needs_vision = False
                    for msg in messages:
                        if isinstance(msg, HumanMessage) and isinstance(msg.content, list):
                            if any(isinstance(part, dict) and part.get("type") == "image_url" for part in msg.content):
                                needs_vision = True
                                break
                    
                    fallback_model = None
                    if needs_vision:
                        # Find a model from fallback provider cache that supports vision
                        cached = await asyncio.to_thread(get_cached_models, user_id, fallback_provider) or []
                        for m in cached:
                            if m.get("supports_vision"):
                                fallback_model = m.get("id")
                                break
                    
                    if not fallback_model:
                        fallback_model = await asyncio.to_thread(get_default_model_for_user, user_id, fallback_provider)
                    
                    if stream_callback:
                        await stream_callback({
                            "type": "text",
                            "content": f"\n\n **Provider Fallback**: {provider} rate limited. Switching to {fallback_provider} ({fallback_model})...\n\n"
                        })
                    
                    logger.info("provider_fallback", from_provider=provider, to_provider=fallback_provider, model=fallback_model)
                    
                    try:
                        output = await try_generate(fallback_provider, fallback_model, fallback_key)
                        return {"output": output, "retries": retries + 1, "provider_fallback": fallback_provider}
                    except Exception as fallback_error:
                        logger.error("fallback_generation_failed", error=str(fallback_error), fallback=fallback_provider)
        
        err_code, err_msg = _clean_error_message(e)
        if stream_callback:
            await stream_callback({"type": "error", "code": err_code, "message": err_msg})
        return {"output": ""}
