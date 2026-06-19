from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.auth.middleware import get_current_user
from app.core.vault.vault import store_api_key, list_api_keys, remove_api_key, get_api_key
from app.core.providers.model_discovery import discover_models, get_cached_models, set_cached_models, ModelDiscoveryError
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter()

class KeyAddRequest(BaseModel):
    api_key: str

class KeyMetadataResponse(BaseModel):
    provider: str
    added_at: Optional[datetime]
    last_used: Optional[datetime]
    validated: bool

@router.post("/{provider}", status_code=status.HTTP_201_CREATED)
async def add_key(
    provider: str,
    request: KeyAddRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Adds a new API key for the specified provider.
    Validates the key against the provider before storage.
    """
    uid = current_user["uid"]
    raw_key = request.api_key
    
    if not raw_key.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "key_invalid", "provider": provider}
        )
        
    try:
        validated = True
        store_api_key(uid, provider, raw_key, validated=validated)
        logger.info("api_key_stored", uid=uid, provider=provider)
        return {"status": "success", "provider": provider}
    except Exception as e:
        logger.error("api_key_storage_failed", error=str(e), provider=provider)
        raise HTTPException(status_code=500, detail="Failed to store API key")

@router.get("", response_model=List[KeyMetadataResponse])
async def get_keys(current_user: dict = Depends(get_current_user)):
    """
    Lists metadata for all stored API keys.
    """
    uid = current_user["uid"]
    keys_meta = list_api_keys(uid)
    return keys_meta

@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_key(
    provider: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Removes the specified provider API key from the vault.
    """
    uid = current_user["uid"]
    remove_api_key(uid, provider)
    logger.info("api_key_removed", uid=uid, provider=provider)

@router.get("/{provider}/models")
async def get_provider_models(
    provider: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Discovers available models for a provider using the stored API key.
    Returns deduplicated models list. Results are cached in Firestore for 24 hours.
    """
    uid = current_user["uid"]

    cached = get_cached_models(uid, provider)
    if cached is not None:
        logger.debug("model_cache_hit", uid=uid, provider=provider)
        return {"provider": provider, "models": cached, "cached": True}

    api_key = get_api_key(uid, provider)
    if not api_key:
        return {"provider": provider, "models": [], "cached": False}

    try:
        models = await discover_models(provider, api_key)
        # Deduplicate by model ID
        seen = set()
        deduped = []
        for m in models:
            if m["id"] not in seen:
                seen.add(m["id"])
                deduped.append(m)
        set_cached_models(uid, provider, deduped)
        logger.info("models_discovered", uid=uid, provider=provider, count=len(deduped))
        return {"provider": provider, "models": deduped, "cached": False, "error": None}
    except ModelDiscoveryError as e:
        logger.warning("model_discovery_error", provider=provider, code=e.code, detail=e.detail)
        return {"provider": provider, "models": [], "cached": False, "error": {"code": e.code, "message": e.detail}}
    except Exception as e:
        logger.error("model_discovery_unexpected", provider=provider, error=str(e))
        return {"provider": provider, "models": [], "cached": False, "error": {"code": "unknown", "message": str(e)}}

@router.get("/models")
async def get_all_models(current_user: dict = Depends(get_current_user)):
    """
    Returns all discovered models for all providers the user has keys for.
    Returns a map of provider -> models list.
    """
    uid = current_user["uid"]
    keys_meta = list_api_keys(uid)
    
    result = {}
    for k in keys_meta:
        provider = k["provider"]
        cached = get_cached_models(uid, provider)
        if cached is not None:
            result[provider] = cached
            continue
            
        api_key = get_api_key(uid, provider)
        if not api_key:
            result[provider] = []
            continue
            
        try:
            models = await discover_models(provider, api_key)
            seen = set()
            deduped = []
            for m in models:
                if m["id"] not in seen:
                    seen.add(m["id"])
                    deduped.append(m)
            set_cached_models(uid, provider, deduped)
            result[provider] = {"models": deduped, "error": None}
        except ModelDiscoveryError as e:
            logger.warning("model_discovery_error", provider=provider, code=e.code, detail=e.detail)
            result[provider] = {"models": [], "error": {"code": e.code, "message": e.detail}}
        except Exception as e:
            logger.error("model_discovery_unexpected", provider=provider, error=str(e))
            result[provider] = {"models": [], "error": {"code": "unknown", "message": str(e)}}
    
    return result