import json
from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter
from app.core.vault.vault import get_api_key
import structlog

logger = structlog.get_logger(__name__)

async def complexity_scorer_node(state: AgentState) -> dict:
    """
    Classifies the user's task complexity using Groq (llama-3.1-8b-instant).
    Falls back to 'medium' on failure or if Groq is not available.
    """
    user_id = state.get("user_id")
    task = state.get("task", "")
    
    # Attempt to get Groq API key from vault
    groq_key = get_api_key(user_id, "groq")
    if not groq_key:
        logger.warn("groq_key_missing_complexity_fallback", uid=user_id)
        return {"complexity": "medium"}
        
    try:
        adapter = get_adapter("groq", groq_key, "llama-3.1-8b-instant")
        
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
