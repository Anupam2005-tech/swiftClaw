from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter
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
    """
    user_id = state.get("user_id")
    provider = state.get("provider_generator")
    messages = state.get("messages", [])
    retries = state.get("retries", 0)
    evaluation = state.get("evaluation") or {}
    
    gen_key = get_api_key(user_id, provider)
    if not gen_key:
        logger.error("generator_key_missing", provider=provider)
        return {"output": "Error: Generator API key missing."}
        
    # Pick the model from preferences or fall back to complexity-aware defaults
    prefs = state.get("model_preferences", {})
    category = state.get("task_category", "chat")
    complexity = state.get("complexity", "medium")
    model = prefs.get(category)
    
    # Extract model name if formatted as provider:model
    if model and ":" in model:
        model = model.split(":")[1]
    if not model:
        # Complexity-aware defaults: use cheaper/faster models for simple tasks
        if provider == "openai":
            model = "gpt-4o-mini" if complexity == "simple" else "gpt-4o"
        elif provider == "claude":
            model = "claude-3-5-haiku-latest" if complexity == "simple" else "claude-3-5-sonnet-latest"
        elif provider == "gemini":
            model = "gemini-2.0-flash-lite" if complexity == "simple" else "gemini-2.0-flash"
        elif provider == "groq":
            model = "llama-3.1-8b-instant" if complexity == "simple" else "llama-3.1-70b-versatile"
        else:
            model = "sonar" if provider == "perplexity" else ""
            
    try:
        adapter = get_adapter(provider, gen_key, model)
        
        # Format messages from state — system prompt, history, and current query
        # are already assembled by chat.py via assemble_context_with_budget()
        formatted_messages = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                formatted_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                formatted_messages.append({"role": "assistant", "content": msg.content})
            elif isinstance(msg, SystemMessage):
                formatted_messages.append({"role": "system", "content": msg.content})
                
        # On retry, append the evaluator's critique as a revision prompt
        if retries > 0 and evaluation.get("critique"):
            retry_prompt = (
                f"Your previous attempt did not pass evaluation. Here is the critique:\n"
                f"\"{evaluation.get('critique')}\"\n\n"
                f"Please revise your answer and fix the issues noted."
            )
            formatted_messages.append({"role": "user", "content": retry_prompt})
                
        # Call adapter stream
        full_output = ""
        # Get optional streaming callback from config configurable
        stream_callback = None
        if config and "configurable" in config:
            stream_callback = config["configurable"].get("stream_callback")
            
        async for chunk in adapter.stream(formatted_messages):
            if chunk["type"] == "text" and chunk["content"]:
                full_output += chunk["content"]
                if stream_callback:
                    await stream_callback(chunk)
            elif chunk["type"] == "tool_call" and stream_callback:
                await stream_callback(chunk)
                
        logger.info("generation_complete", provider=provider, model=model, output_length=len(full_output))
        
        # Track API key usage timestamp
        mark_key_used(user_id, provider)
        
        return {"output": full_output, "retries": retries + 1}
        
    except Exception as e:
        logger.error("generation_failed", error=str(e), provider=provider)
        return {"output": f"Error: Generation failed: {str(e)}"}
