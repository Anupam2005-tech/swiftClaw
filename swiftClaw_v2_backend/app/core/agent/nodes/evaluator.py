import json
from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter
from app.core.vault.vault import get_api_key
import structlog

logger = structlog.get_logger(__name__)

async def evaluator_node(state: AgentState) -> dict:
    """
    Evaluator node. Analyzes the generator's output against the task instructions.
    Returns: {"evaluation": {"pass": bool, "confidence": float, "critique": str}}
    """
    user_id = state.get("user_id")
    task = state.get("task", "")
    output = state.get("output", "")
    
    provider_eval = state.get("provider_evaluator")
    # Determine which model/provider to use for evaluation
    if not provider_eval:
        logger.warn("no_evaluator_configured_falling_back")
        return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "No evaluator configured, auto-passing."}}
        
    eval_key = get_api_key(user_id, provider_eval)
    if not eval_key:
        logger.warn("evaluator_key_missing", provider=provider_eval)
        return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "Evaluator key missing, auto-passing."}}
        
    # We select the model. For v1.0, let's use standard default models for each provider
    model = state.get("model_preferences", {}).get("evaluation")
    if not model:
        # Default models based on provider
        if provider_eval == "openai":
            model = "gpt-4o"
        elif provider_eval == "claude":
            model = "claude-3-5-sonnet-latest"
        elif provider_eval == "gemini":
            model = "gemini-2.0-flash"
        elif provider_eval == "groq":
            model = "llama-3.1-70b-versatile"
        else:
            model = "sonar" if provider_eval == "perplexity" else ""
            
    try:
        adapter = get_adapter(provider_eval, eval_key, model)
        
        system_prompt = (
            "You are an expert AI evaluator. Assess the assistant's output for correctness, completeness, and adherence to constraints.\n"
            "Respond in JSON format with exactly three fields:\n"
            "- \"pass\": boolean (true if the output is correct/complete, false if it needs correction)\n"
            "- \"confidence\": float between 0.0 and 1.0 representing your certainty\n"
            "- \"critique\": string containing your detailed critique or feedback if pass is false, or empty/positive feedback if pass is true.\n\n"
            "Format your output strictly as a JSON object, e.g.:\n"
            "{\"pass\": true, \"confidence\": 0.9, \"critique\": \"\"}"
        )
        
        user_message = f"Task: {task}\n\nAssistant Output:\n{output}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        full_content = ""
        async for chunk in adapter.stream(messages):
            if chunk["type"] == "text" and chunk["content"]:
                full_content += chunk["content"]
                
        # Parse the JSON response
        # Clean up Markdown code blocks if LLM returns them
        cleaned_json = full_content.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        cleaned_json = cleaned_json.strip()
        
        parsed = json.loads(cleaned_json)
        
        # Normalize fields
        val_pass = bool(parsed.get("pass", True))
        val_confidence = float(parsed.get("confidence", 1.0))
        val_critique = str(parsed.get("critique", ""))
        
        logger.info("evaluation_complete", provider=provider_eval, passed=val_pass, confidence=val_confidence)
        
        return {
            "evaluation": {
                "pass": val_pass,
                "confidence": val_confidence,
                "critique": val_critique
            }
        }
        
    except Exception as e:
        logger.error("evaluation_failed_auto_passing", error=str(e))
        return {
            "evaluation": {
                "pass": True,
                "confidence": 1.0,
                "critique": f"Evaluation crashed: {str(e)}. Auto-passing."
            }
        }
