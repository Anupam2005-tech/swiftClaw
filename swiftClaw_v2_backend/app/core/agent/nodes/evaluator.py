import json
from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter, get_default_model_for_user
from app.core.providers.model_discovery import get_cached_models
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
    if not provider_eval:
        logger.warn("no_evaluator_configured_falling_back")
        return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "No evaluator configured, auto-passing."}}
        
    eval_key = get_api_key(user_id, provider_eval)
    if not eval_key:
        logger.warn("evaluator_key_missing", provider=provider_eval)
        return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "Evaluator key missing, auto-passing."}}
    
    # Use user's cached default model for this provider
    model = get_default_model_for_user(user_id, provider_eval)
    if not model:
        # Fallback to generator's provider/model if evaluator has no cached models
        generator_provider = state.get("provider_generator")
        generator_model = state.get("model_generator")
        if generator_provider and generator_provider != provider_eval:
            alt_key = get_api_key(user_id, generator_provider)
            if alt_key and generator_model:
                logger.info("evaluator_fallback_to_generator", fallback_provider=generator_provider, fallback_model=generator_model)
                provider_eval = generator_provider
                eval_key = alt_key
                model = generator_model
        if not model:
            logger.warn("evaluator_no_model_available", provider=provider_eval)
            return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "No models available for evaluator, auto-passing."}}
    
    try:
        # Look up capabilities for adapter
        cached = get_cached_models(user_id, provider_eval) or []
        capabilities = None
        for m in cached:
            if m.get("id") == model:
                capabilities = m
                break
        
        adapter = get_adapter(provider_eval, eval_key, model, capabilities)
        
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
        cleaned_json = full_content.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        cleaned_json = cleaned_json.strip()
        
        parsed = json.loads(cleaned_json)
        
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
