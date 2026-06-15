from app.core.agent.state import AgentState
import structlog

logger = structlog.get_logger(__name__)

async def router_node(state: AgentState) -> dict:
    """
    Decides the provider_generator and provider_evaluator based on complexity,
    task_category, model_preferences, and available_providers.
    """
    available = state.get("available_providers", [])
    if not available:
        # Default fallback to nothing (error will be thrown downstream if empty)
        return {"provider_generator": "", "provider_evaluator": ""}
        
    complexity = state.get("complexity", "medium")
    category = state.get("task_category", "chat")
    prefs = state.get("model_preferences", {})
    
    # 1. Select the generator provider
    # Look up the model preference for the category
    pref_model = prefs.get(category) # e.g. "openai:gpt-4o" or "openai" or "gemini-2.0-flash"
    
    # Determine provider from preference
    provider_gen = None
    if pref_model:
        # If pref_model is formatted as "provider:model", extract provider
        if ":" in pref_model:
            provider_gen = pref_model.split(":")[0]
        else:
            provider_gen = pref_model
            
    # Fallback if preferred provider not available or not set
    if not provider_gen or provider_gen not in available:
        provider_gen = available[0]
        
    # 2. Select the evaluator provider
    # In single-provider mode: evaluator is same as generator
    if len(available) == 1:
        provider_eval = provider_gen
    else:
        # In multi-provider mode, we choose a different provider for evaluation
        # to ensure independent evaluation.
        # We can pick the second available provider, or a preferred one if specified.
        other_providers = [p for p in available if p != provider_gen]
        if other_providers:
            provider_eval = other_providers[0]
        else:
            provider_eval = provider_gen
            
    logger.info(
        "routing_decided", 
        complexity=complexity, 
        category=category, 
        generator=provider_gen, 
        evaluator=provider_eval
    )
    
    return {
        "provider_generator": provider_gen,
        "provider_evaluator": provider_eval
    }
