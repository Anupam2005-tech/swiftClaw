from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any

from app.core.auth.middleware import get_current_user
from app.core.vault.vault import list_api_keys, store_api_key
from app.db.firestore import db
from app.core.providers.factory import get_adapter
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter()

class OnboardingStatusResponse(BaseModel):
    is_onboarded: bool
    has_keys: bool
    has_preferences: bool

class ValidateKeyRequest(BaseModel):
    provider: str
    api_key: str

class SetPreferencesRequest(BaseModel):
    preferences: Dict[str, str] # e.g., {"chat": "openai:gpt-4o", "file_analysis": "gemini:gemini-2.0-flash"}

@router.get("/status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(current_user: dict = Depends(get_current_user)):
    """
    Checks if the user has added at least one API key and configured model preferences.
    """
    uid = current_user["uid"]
    
    # 1. Check keys
    keys = list_api_keys(uid)
    has_keys = len(keys) > 0
    
    # 2. Check preferences
    prefs_doc = db.collection("users").document(uid).collection("preferences").document("model_preferences").get()
    has_preferences = prefs_doc.exists
    
    return OnboardingStatusResponse(
        is_onboarded=has_keys and has_preferences,
        has_keys=has_keys,
        has_preferences=has_preferences
    )

@router.post("/validate-key")
async def validate_and_save_key(
    request: ValidateKeyRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Performs a live validation check on a candidate API key against the provider.
    Saves it if valid.
    """
    uid = current_user["uid"]
    provider = request.provider
    key = request.api_key
    
    # Simple model mapping for checking validity
    check_model = ""
    if provider == "openai":
        check_model = "gpt-4o"
    elif provider == "claude":
        check_model = "claude-3-5-sonnet-latest"
    elif provider == "gemini":
        check_model = "gemini-2.0-flash"
    elif provider == "groq":
        check_model = "llama-3.1-8b-instant"
    elif provider == "perplexity":
        check_model = "sonar"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "unsupported_provider", "message": f"Provider {provider} is not supported."}
        )
        
    try:
        # Perform validation call using the factory
        adapter = get_adapter(provider, key, check_model)
        # Call a very quick query
        test_messages = [{"role": "user", "content": "hello"}]
        
        # Consume the stream to check if it throws an error
        async for chunk in adapter.stream(test_messages):
            pass
            
        # If no exceptions, save the key
        store_api_key(uid, provider, key, validated=True)
        logger.info("key_validated_and_stored", uid=uid, provider=provider)
        return {"status": "success", "message": "Key is valid and has been saved."}
        
    except Exception as e:
        logger.warn("key_validation_failed", uid=uid, provider=provider, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "invalid_api_key", "message": f"Failed to validate key: {str(e)}"}
        )

@router.post("/set-preferences")
async def set_preferences(
    request: SetPreferencesRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Sets or updates the model preferences map for different task categories.
    """
    uid = current_user["uid"]
    prefs_ref = db.collection("users").document(uid).collection("preferences").document("model_preferences")
    prefs_ref.set(request.preferences)
    logger.info("model_preferences_updated", uid=uid)
    return {"status": "success"}
