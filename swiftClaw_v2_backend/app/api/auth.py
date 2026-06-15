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
