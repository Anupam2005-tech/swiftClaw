from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.core.auth.sessions import is_session_valid
from app.core.auth.cache import token_cache, session_cache

security = HTTPBearer()

def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to verify Firebase ID token and 30-day session.
    Returns a dict with 'uid' and 'session_id'.
    """
    token = credentials.credentials
    
    # Check in-memory token cache first
    uid = token_cache.get(token)
    if not uid:
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token.get("uid")
            if not uid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={"code": "invalid_token"}
                )
            token_cache.set(token, uid)
        except auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "expired_token"}
            )
        except auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "invalid_token"}
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "missing_token"}
            )

    session_id = request.headers.get("X-Session-Id")
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "session_not_found"}
        )

    # Check in-memory session cache
    cache_key = f"{uid}:{session_id}"
    is_valid = session_cache.get(cache_key)
    if is_valid is None:
        is_valid = is_session_valid(uid, session_id)
        session_cache.set(cache_key, is_valid)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "session_expired"}
        )

    return {"uid": uid, "session_id": session_id}
