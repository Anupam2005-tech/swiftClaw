from app.core.providers.factory import get_adapter
from app.core.vault.vault import get_api_key
from app.db.firestore import db
import structlog

logger = structlog.get_logger(__name__)

async def generate_rolling_summary(uid: str, conversation_id: str, history: list[dict]) -> str:
    """
    Generates a brief rolling summary of the conversation using Groq (llama-3.1-8b-instant).
    Updates the conversation document.
    """
    groq_key = get_api_key(uid, "groq")
    if not groq_key:
        logger.warn("groq_key_missing_for_summary_generation", uid=uid)
        return ""
        
    try:
        # Format history into a simple transcript
        transcript = []
        for msg in history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            transcript.append(f"{role.capitalize()}: {content}")
            
        transcript_str = "\n".join(transcript)
        
        adapter = get_adapter("groq", groq_key, "llama-3.1-8b-instant")
        
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
        
        # Save summary to Firestore
        db.collection("users").document(uid).collection("conversations").document(conversation_id).update({
            "summary": summary
        })
        
        logger.info("rolling_summary_updated", uid=uid, conversation_id=conversation_id)
        return summary
        
    except Exception as e:
        logger.error("rolling_summary_failed", error=str(e))
        return ""
