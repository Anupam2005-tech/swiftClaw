from app.core.agent.state import AgentState
from app.core.providers.factory import get_default_model_for_user
import structlog

logger = structlog.get_logger(__name__)


def get_model_for_provider(uid: str, provider: str, prefs: dict, category: str) -> str:
    """Get the model for a provider from preferences or return default from user's cache."""
    pref_model = prefs.get(category)
    if pref_model:
        if ":" in pref_model:
            pref_provider, pref_model_name = pref_model.split(":", 1)
            if pref_provider == provider:
                return pref_model_name
        else:
            # If pref_model is just a provider name, use default for that provider
            return get_default_model_for_user(uid, provider)
    return get_default_model_for_user(uid, provider)


async def router_node(state: AgentState) -> dict:
    """
    Decides the provider_generator, model_generator, provider_evaluator, model_evaluator
    based on complexity, task_category, model_preferences, and available_providers.
    """
    uid = state.get("user_id")
    available = state.get("available_providers", [])
    if not available:
        return {
            "provider_generator": "",
            "model_generator": "",
            "provider_evaluator": "",
            "model_evaluator": ""
        }
        
    complexity = state.get("complexity", "medium")
    category = state.get("task_category", "chat")
    prefs = state.get("model_preferences", {})
    
    # 1. Select the generator provider
    provider_gen = None
    pref_model = prefs.get(category)
    
    if pref_model:
        if ":" in pref_model:
            provider_gen = pref_model.split(":")[0]
        else:
            provider_gen = pref_model
    
    if not provider_gen or provider_gen not in available:
        provider_gen = available[0]
    
    # Get model for generator provider
    model_gen = get_model_for_provider(uid, provider_gen, prefs, category)
    
    # 2. Select the evaluator provider
    if len(available) == 1:
        # Self-reevaluation: use same model for generator and evaluator
        provider_eval = provider_gen
        model_eval = model_gen
    else:
        other_providers = [p for p in available if p != provider_gen]
        if other_providers:
            provider_eval = other_providers[0]
            model_eval = get_model_for_provider(uid, provider_eval, prefs, category)
        else:
            provider_eval = provider_gen
            model_eval = model_gen
            
    logger.info(
        "routing_decided", 
        complexity=complexity, 
        category=category, 
        generator_provider=provider_gen,
        generator_model=model_gen,
        evaluator_provider=provider_eval,
        evaluator_model=model_eval
    )
    
    return {
        "provider_generator": provider_gen,
        "model_generator": model_gen,
        "provider_evaluator": provider_eval,
        "model_evaluator": model_eval
    }