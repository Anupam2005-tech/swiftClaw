from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

from app.db.firestore import db
from app.core.auth.sessions import create_session, delete_session, delete_all_sessions
from app.core.auth.middleware import get_current_user

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

