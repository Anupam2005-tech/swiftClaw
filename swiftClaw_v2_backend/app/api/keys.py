from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.auth.middleware import get_current_user
from app.core.vault.vault import store_api_key, list_api_keys, remove_api_key
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
    
    # TODO: Implement actual live validation via provider factory
    # For now, we assume valid if not empty
    if not raw_key.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "key_invalid", "provider": provider}
        )
        
    try:
        # TODO: Add real validation call here
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
