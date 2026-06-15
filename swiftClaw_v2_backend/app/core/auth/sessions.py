import uuid
from datetime import datetime, timedelta, timezone
from app.db.firestore import db
import structlog

logger = structlog.get_logger(__name__)

SESSION_DURATION_DAYS = 30

def create_session(uid: str, device_info: str) -> str:
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=SESSION_DURATION_DAYS)
    
    session_data = {
        "device_info": device_info,
        "created_at": now,
        "expires_at": expires_at,
        "last_active": now,
        # refresh_token_hash is left empty for now as it's not strictly required in v1.0
        # since we manage expiration via expires_at
    }
    
    db.collection("users").document(uid).collection("sessions").document(session_id).set(session_data)
    logger.info("session_created", uid=uid, session_id=session_id)
    return session_id

def get_session(uid: str, session_id: str) -> dict:
    doc = db.collection("users").document(uid).collection("sessions").document(session_id).get()
    if doc.exists:
        return doc.to_dict()
    return None

def is_session_valid(uid: str, session_id: str) -> bool:
    session = get_session(uid, session_id)
    if not session:
        return False
    
    expires_at = session.get("expires_at")
    if not expires_at:
        return False
        
    if isinstance(expires_at, datetime):
        return expires_at > datetime.now(timezone.utc)
    return False

def delete_session(uid: str, session_id: str):
    db.collection("users").document(uid).collection("sessions").document(session_id).delete()
    logger.info("session_deleted", uid=uid, session_id=session_id)

def delete_all_sessions(uid: str):
    sessions = db.collection("users").document(uid).collection("sessions").stream()
    batch = db.batch()
    for session in sessions:
        batch.delete(session.reference)
    batch.commit()
    logger.info("all_sessions_deleted", uid=uid)
