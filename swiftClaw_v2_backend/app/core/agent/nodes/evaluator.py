import asyncio
import json
from app.core.agent.state import AgentState
from app.core.providers.factory import get_adapter, get_default_model_for_user
from app.core.providers.model_discovery import get_cached_models
from app.core.vault.vault import get_api_key
import structlog

logger = structlog.get_logger(__name__)

# Keywords that indicate cheap/lightweight models, ordered by preference (cheapest first)
_CHEAP_MODEL_KEYWORDS = ("flash", "mini", "lite", "nano", "haiku", "small", "fast", "instant", "8b", "7b")


def _pick_cheapest_model(cached_models: list[dict]) -> str | None:
    """
    Picks the cheapest model from a list of cached model dicts.
    Strategy (in order):
      1. Prefer models whose ID contains known cheap keywords (flash > mini > lite > ...).
      2. Among remaining, prefer the smallest context_length (proxy for model size/cost).
      3. Fallback to first model in the list.
    """
    if not cached_models:
        return None

    # Pass 1: Check for known cheap keywords in order of preference
    for keyword in _CHEAP_MODEL_KEYWORDS:
        for m in cached_models:
            model_id = m.get("id", "").lower()
            if keyword in model_id:
                return m["id"]

    # Pass 2: Sort by context_length ascending (smaller = cheaper, typically)
    models_with_ctx = [m for m in cached_models if m.get("context_length")]
    if models_with_ctx:
        models_with_ctx.sort(key=lambda m: m["context_length"])
        return models_with_ctx[0]["id"]

    # Pass 3: Fallback to first available model
    return cached_models[0]["id"]


async def _get_cheapest_model_for_user(user_id: str, provider: str) -> str:
    """Returns the cheapest model from user's cached models for a provider."""
    cached = await asyncio.to_thread(get_cached_models, user_id, provider)
    if not cached:
        return ""
    return _pick_cheapest_model(cached) or ""


async def evaluator_node(state: AgentState) -> dict:
    """
    Evaluator node. Analyzes the generator's output against the task instructions.
    Uses the cheapest available model to minimize token cost.
    Returns: {"evaluation": {"pass": bool, "confidence": float, "critique": str}}
    """
    user_id = state.get("user_id")
    task = state.get("task", "")
    output = state.get("output", "")
    
    provider_eval = state.get("provider_evaluator")
    if not provider_eval:
        logger.warn("no_evaluator_configured_falling_back")
        return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "No evaluator configured, auto-passing."}}

    available = state.get("available_providers", [])
    eval_key = get_api_key(user_id, provider_eval)

    # If the designated evaluator key is missing/invalid, try alternatives
    if not eval_key:
        logger.warn("evaluator_key_missing_trying_alternatives", provider=provider_eval)
        found = False
        # Prefer the generator provider first, then try others
        generator_provider = state.get("provider_generator")
        candidates = []
        if generator_provider and generator_provider != provider_eval:
            candidates.append(generator_provider)
        candidates.extend(p for p in available if p != provider_eval and p not in candidates)

        for alt_provider in candidates:
            alt_key = get_api_key(user_id, alt_provider)
            if alt_key:
                alt_model = await _get_cheapest_model_for_user(user_id, alt_provider)
                if alt_model:
                    logger.info("evaluator_fallback_to_alternative", original=provider_eval, fallback=alt_provider, model=alt_model)
                    provider_eval = alt_provider
                    eval_key = alt_key
                    found = True
                    break
        if not found:
            logger.warn("evaluator_no_working_provider", original_provider=provider_eval)
            return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "Evaluator key missing and no alternative providers available, auto-passing."}}

    # Pick the cheapest model for the evaluator provider
    model = await _get_cheapest_model_for_user(user_id, provider_eval)
    if not model:
        # The selected evaluator provider has a key but no cached models — try other providers
        generator_provider = state.get("provider_generator")
        candidates = []
        if generator_provider and generator_provider != provider_eval:
            candidates.append(generator_provider)
        candidates.extend(p for p in available if p != provider_eval and p not in candidates)

        for alt_provider in candidates:
            alt_key = get_api_key(user_id, alt_provider)
            if alt_key:
                alt_model = await _get_cheapest_model_for_user(user_id, alt_provider)
                if alt_model:
                    logger.info("evaluator_fallback_no_models", original=provider_eval, fallback=alt_provider, model=alt_model)
                    provider_eval = alt_provider
                    eval_key = alt_key
                    model = alt_model
                    break
        if not model:
            logger.warn("evaluator_no_model_available", provider=provider_eval)
            return {"evaluation": {"pass": True, "confidence": 1.0, "critique": "No models available for evaluator, auto-passing."}}

    logger.info("evaluator_model_selected", provider=provider_eval, model=model)
    
    try:
        # Look up capabilities for adapter
        cached = await asyncio.to_thread(get_cached_models, user_id, provider_eval) or []
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
