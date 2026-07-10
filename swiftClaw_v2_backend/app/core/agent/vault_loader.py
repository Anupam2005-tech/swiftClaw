from app.db.firestore import db
from app.core.vault.vault import list_api_keys, get_api_key

def populate_user_context(uid: str) -> dict:
    """
    Retrieves available providers and model preferences from Firestore
    to initialize the AgentState.
    """
    # 1. Fetch keys — only include providers whose keys are actually decryptable
    keys_meta = list_api_keys(uid)
    available_providers = [
        k["provider"] for k in keys_meta
        if k.get("validated", True) and get_api_key(uid, k["provider"]) is not None
    ]
    
    # 2. Fetch model preferences
    prefs_doc = db.collection("users").document(uid).collection("preferences").document("model_preferences").get()
    
    model_preferences = {}
    if prefs_doc.exists:
        model_preferences = prefs_doc.to_dict()
        
    return {
        "available_providers": available_providers,
        "model_preferences": model_preferences
    }
