from app.core.providers.factory import get_adapter
from app.core.vault.vault import get_api_key
from app.db.firestore import db
import structlog

logger = structlog.get_logger(__name__)

CHEAP_MODELS = {
    "groq": "llama-3.1-8b-instant",
    "openai": "gpt-4o-mini",
    "gemini": "gemini-1.5-flash",
}

async def generate_rolling_summary(uid: str, conversation_id: str, history: list[dict]) -> str:
    """
    Generates a brief rolling summary of the conversation using the cheapest available provider.
    Updates the conversation document.
    """
    # Try providers in order of cost/speed
    for provider in ["groq", "openai", "gemini"]:
        api_key = get_api_key(uid, provider)
        if not api_key:
            continue
        
        model = CHEAP_MODELS.get(provider)
        if not model:
            continue

        try:
            # Format history into a simple transcript
            transcript = []
            for msg in history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                transcript.append(f"{role.capitalize()}: {content}")
                
            transcript_str = "\n".join(transcript)
            
            adapter = get_adapter(provider, api_key, model)
            
            system_prompt = (
                "You are a rolling summarizer. Summarize the following dialogue briefly (in under 3 paragraphs).\n"
                "Focus on the main user questions, core answers, and key context established. Keep it concise."
            )
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Transcript:\n{transcript_str}"}
            ]
            
            summary = ""
            async for chunk in adapter.stream(messages):
                if chunk["type"] == "text" and chunk["content"]:
                    summary += chunk["content"]
                    
            summary = summary.strip()
            if not summary:
                continue

            # Save summary to Firestore
            db.collection("conversations").document(conversation_id).update({
                "summary": summary
            })
            
            logger.info("rolling_summary_updated", uid=uid, conversation_id=conversation_id, provider=provider, model=model)
            return summary
            
        except Exception as e:
            logger.warning("summarizer_provider_failed", provider=provider, error=str(e))
            continue
            
    logger.error("rolling_summary_all_providers_failed", uid=uid)
    return ""
