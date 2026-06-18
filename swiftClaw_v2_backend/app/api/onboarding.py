from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.core.auth.middleware import get_current_user
from app.core.vault.vault import list_api_keys
from app.db.firestore import db
from datetime import datetime, timezone
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter()

class OnboardingStatusResponse(BaseModel):
    is_onboarded: bool
    has_keys: bool
    has_preferences: bool

class SetPreferencesRequest(BaseModel):
    preferences: Dict[str, str]

class ProfileRequest(BaseModel):
    nickname: Optional[str] = None
    profession: Optional[str] = None

@router.get("/status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]

    keys = list_api_keys(uid)
    has_keys = len(keys) > 0

    prefs_doc = db.collection("users").document(uid).collection("preferences").document("model_preferences").get()
    has_preferences = prefs_doc.exists

    return OnboardingStatusResponse(
        is_onboarded=has_keys and has_preferences,
        has_keys=has_keys,
        has_preferences=has_preferences
    )

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    user_doc = db.collection("users").document(uid).get()
    if user_doc.exists:
        data = user_doc.to_dict()
        return {
            "nickname": data.get("nickname", ""),
            "profession": data.get("profession", ""),
            "email": current_user.get("email", ""),
        }
    return {"nickname": "", "profession": "", "email": current_user.get("email", "")}

@router.post("/profile")
async def set_profile(
    request: ProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user["uid"]

    user_ref = db.collection("users").document(uid)
    user_ref.set({
        "nickname": request.nickname,
        "profession": request.profession,
        "updated_at": datetime.now(timezone.utc),
    }, merge=True)

    logger.info("user_profile_updated", uid=uid, nickname=request.nickname, profession=request.profession)
    return {"status": "success"}

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

@router.get("/preferences")
async def get_preferences(current_user: dict = Depends(get_current_user)):
    """
    Retrieves the model preferences map for different task categories.
    """
    uid = current_user["uid"]
    prefs_ref = db.collection("users").document(uid).collection("preferences").document("model_preferences")
    prefs_doc = prefs_ref.get()
    if prefs_doc.exists:
        return prefs_doc.to_dict()
    return {}

