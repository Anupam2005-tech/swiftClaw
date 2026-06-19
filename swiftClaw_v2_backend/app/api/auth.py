from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
import os
import structlog

from app.db.firestore import db
from app.core.auth.sessions import create_session, delete_session, delete_all_sessions
from app.core.auth.middleware import get_current_user
from app.core.providers.model_discovery import _static_models

router = APIRouter()
security = HTTPBearer()

class SessionRequest(BaseModel):
    device_info: str = "Web"

class SessionResponse(BaseModel):
    session_id: str

@router.post("/session", response_model=SessionResponse)
def create_user_session(
    request: SessionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Creates a new 30-day session.
    Expects a valid Firebase ID token in the Authorization header.
    """
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail={"code": "expired_token"})
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail={"code": "invalid_token"})
    except Exception:
        raise HTTPException(status_code=401, detail={"code": "missing_token"})

    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail={"code": "invalid_token"})

    # Upsert user document
    email = decoded_token.get("email", "")
    display_name = decoded_token.get("name", "")
    
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()
    
    if not doc.exists:
        user_ref.set({
            "email": email,
            "display_name": display_name,
            "created_at": datetime.now(timezone.utc),
            "plan": "free",
            "api_keys": {}
        })
    else:
        user_ref.update({
            "email": email,
            "display_name": display_name,
        })
        
    session_id = create_session(uid, request.device_info)
    
    return SessionResponse(session_id=session_id)

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: dict = Depends(get_current_user)):
    """Logs out the current device by deleting the session."""
    uid = current_user["uid"]
    session_id = current_user["session_id"]
    delete_session(uid, session_id)

@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
def logout_all(current_user: dict = Depends(get_current_user)):
    """Logs out all devices and revokes Firebase refresh tokens."""
    uid = current_user["uid"]
    delete_all_sessions(uid)
    firebase_auth.revoke_refresh_tokens(uid)

class SessionInfoResponse(BaseModel):
    session_id: str
    device_info: str
    created_at: str
    expires_at: str
    last_active: str
    is_current: bool

from typing import List

@router.get("/sessions", response_model=List[SessionInfoResponse])
def get_user_sessions(
    current_user: dict = Depends(get_current_user)
):
    """Lists all active sessions for the user."""
    uid = current_user["uid"]
    current_sess_id = current_user["session_id"]
    
    sessions_ref = db.collection("users").document(uid).collection("sessions").stream()
    sessions = []
    
    for s in sessions_ref:
        data = s.to_dict()
        
        # Format datetimes
        created_at_val = data.get("created_at")
        expires_at_val = data.get("expires_at")
        last_active_val = data.get("last_active")
        
        created_at_str = created_at_val.isoformat() if isinstance(created_at_val, datetime) else str(created_at_val)
        expires_at_str = expires_at_val.isoformat() if isinstance(expires_at_val, datetime) else str(expires_at_val)
        last_active_str = last_active_val.isoformat() if isinstance(last_active_val, datetime) else str(last_active_val)
        
        sessions.append(SessionInfoResponse(
            session_id=s.id,
            device_info=data.get("device_info", "Unknown"),
            created_at=created_at_str,
            expires_at=expires_at_str,
            last_active=last_active_str,
            is_current=(s.id == current_sess_id)
        ))
        
    return sessions

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_user_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Revokes a specific session for the user."""
    uid = current_user["uid"]
    delete_session(uid, session_id)

@router.delete("/delete-account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(current_user: dict = Depends(get_current_user)):
    """Permanently deletes the user's account and all associated data."""
    uid = current_user["uid"]

    delete_all_sessions(uid)

    # Delete all API keys
    api_keys = db.collection("users").document(uid).collection("api_keys").stream()
    batch = db.batch()
    for key_doc in api_keys:
        batch.delete(key_doc.reference)
    batch.commit()

    # Delete model cache if any
    cache = db.collection("users").document(uid).collection("model_cache").stream()
    batch = db.batch()
    for cache_doc in cache:
        batch.delete(cache_doc.reference)
    batch.commit()

    # Delete user document
    db.collection("users").document(uid).delete()

    # Revoke Firebase refresh tokens
    firebase_auth.revoke_refresh_tokens(uid)

    logger.info("account_deleted", uid=uid)


class RecaptchaVerifyRequest(BaseModel):
    token: str
    action: str = "login"

class RecaptchaVerifyResponse(BaseModel):
    success: bool
    score: float = 0.0
    action: str = ""
    challenge_ts: str = ""
    hostname: str = ""
    error_codes: list[str] = []

@router.post("/recaptcha/verify", response_model=RecaptchaVerifyResponse)
async def verify_recaptcha(request: RecaptchaVerifyRequest):
    """
    Verifies a reCAPTCHA Enterprise token.
    Returns score and action for risk-based decisions.
    """
    logger = structlog.get_logger(__name__)
    
    project_id = os.getenv("GCP_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT")
    recaptcha_key = os.getenv("RECAPTCHA_SITE_KEY") or os.getenv("RECAPTCHA_ENTERPRISE_KEY")
    
    if not project_id or not recaptcha_key:
        logger.warning("reCAPTCHA not configured, skipping verification")
        return RecaptchaVerifyResponse(
            success=True,
            score=1.0,
            action=request.action,
            challenge_ts="",
            hostname="localhost",
            error_codes=["RECAPTCHA_NOT_CONFIGURED"]
        )
    
    try:
        from google.cloud import recaptchaenterprise_v1
        
        client = recaptchaenterprise_v1.RecaptchaEnterpriseServiceAsyncClient()
        
        event = recaptchaenterprise_v1.Event(
            token=request.token,
            site_key=recaptcha_key,
            expected_action=request.action,
        )
        
        assessment = recaptchaenterprise_v1.Assessment(event=event)
        
        request_name = f"projects/{project_id}/assessments"
        response = await client.create_assessment(
            parent=request_name,
            assessment=assessment
        )
        
        token_properties = response.token_properties
        risk_analysis = response.risk_analysis
        
        valid = (
            token_properties.valid and
            token_properties.action == request.action and
            risk_analysis.score >= 0.5
        )
        
        if not valid:
            logger.warning(
                "reCAPTCHA verification failed",
                valid=token_properties.valid,
                action=token_properties.action,
                expected_action=request.action,
                score=risk_analysis.score,
                reasons=risk_analysis.reasons
            )
        
        return RecaptchaVerifyResponse(
            success=valid,
            score=risk_analysis.score,
            action=token_properties.action,
            challenge_ts=token_properties.create_time.isoformat() if token_properties.create_time else "",
            hostname=token_properties.hostname or "",
            error_codes=[e.name for e in token_properties.invalid_reason] if token_properties.invalid_reason else []
        )
        
    except Exception as e:
        logger.error("reCAPTCHA verification error", error=str(e))
        return RecaptchaVerifyResponse(
            success=False,
            score=0.0,
            action=request.action,
            challenge_ts="",
            hostname="",
            error_codes=["VERIFICATION_ERROR"]
        )


class PublicModelsResponse(BaseModel):
    provider: str
    models: list[dict]

@router.get("/public/models/{provider}", response_model=PublicModelsResponse)
async def get_public_models(provider: str):
    """
    Returns static fallback models for a provider.
    Used during onboarding when user hasn't added API keys yet.
    No authentication required.
    """
    models = _static_models(provider)
    return PublicModelsResponse(provider=provider, models=models)

