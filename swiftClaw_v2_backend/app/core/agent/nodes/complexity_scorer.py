import asyncio
import json
from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter, get_default_model_for_user
from app.core.vault.vault import get_api_key
import structlog

logger = structlog.get_logger(__name__)

async def complexity_scorer_node(state: AgentState) -> dict:
    """
    Classifies the user's task complexity using the preferred LLM model provided by the user.
    """
    user_id = state.get("user_id")
    task = state.get("task", "")
    category = state.get("task_category", "chat")
    prefs = state.get("model_preferences", {})
    available = state.get("available_providers", [])
    
    provider = None
    model = None
    
    # 1. Determine preferred provider & model
    pref_model = prefs.get(category) or prefs.get("chat")
    if pref_model:
        if ":" in pref_model:
            provider, model = pref_model.split(":", 1)
        else:
            provider = pref_model
            model = await asyncio.to_thread(get_default_model_for_user, user_id, provider)
            
    # Fallback to first available provider if preferred is not in available
    if not provider or provider not in available:
        if available:
            provider = available[0]
            model = await asyncio.to_thread(get_default_model_for_user, user_id, provider)
            
    if not provider:
        logger.warn("no_provider_available_for_complexity_scoring", uid=user_id)
        return {"complexity": "medium"}
        
    # 2. Get API key with dynamic fallback
    api_key = get_api_key(user_id, provider)
    if not api_key:
        found_alternative = False
        for alt_provider in available:
            alt_key = get_api_key(user_id, alt_provider)
            if alt_key:
                provider = alt_provider
                model = await asyncio.to_thread(get_default_model_for_user, user_id, provider)
                api_key = alt_key
                found_alternative = True
                break
        if not found_alternative:
            logger.warn("all_provider_keys_missing_complexity_fallback", uid=user_id)
            return {"complexity": "medium"}
            
    if not model:
        model = await asyncio.to_thread(get_default_model_for_user, user_id, provider)
        
    logger.info("complexity_scoring_started", provider=provider, model=model)
        
    try:
        adapter = get_adapter(provider, api_key, model)
        
        system_prompt = (
            "You are a fast complexity scorer. Classify the user task as either 'simple', 'medium', or 'complex'.\n"
            "- simple: basic queries, single facts, greeting, trivial calculations, short chats.\n"
            "- complex: coding tasks, complex reasoning, multi-step math, writing long essays, planning.\n"
            "- medium: everything else.\n"
            "Respond ONLY with one of these three words: simple, medium, complex."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task}
        ]
        
        full_content = ""
        async for chunk in adapter.stream(messages):
            if chunk["type"] == "text" and chunk["content"]:
                full_content += chunk["content"]
                
        cleaned = full_content.strip().lower()
        if cleaned in ["simple", "medium", "complex"]:
            logger.info("complexity_scored", complexity=cleaned)
            return {"complexity": cleaned}
        else:
            logger.warn("invalid_complexity_response", response=cleaned)
            return {"complexity": "medium"}
            
    except Exception as e:
        logger.error("complexity_scoring_failed", error=str(e))
        return {"complexity": "medium"}
