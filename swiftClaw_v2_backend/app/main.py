import sentry_sdk
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import structlog

from app.api.auth import router as auth_router
from app.api.keys import router as keys_router
from app.api.chat import router as chat_router
from app.api.onboarding import router as onboarding_router
from app.api.memory import router as memory_router
from app.api.upload import router as upload_router

from app.config import settings
from app.middleware.logging import setup_logging
from app.db.firestore import FirestoreUnavailableError

# Setup structlog
setup_logging(json_logs=not settings.debug)
logger = structlog.get_logger("app")

# Setup Sentry
if settings.sentry_dsn:
    def strip_sensitive_data(event, hint):
        if "request" in event:
            if "data" in event["request"]:
                event["request"]["data"] = "[REDACTED]"
            if "headers" in event["request"]:
                headers = event["request"]["headers"]
                for h in ["authorization", "x-session-id", "cookie"]:
                    if h in headers:
                        headers[h] = "[REDACTED]"
        return event

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        traces_sample_rate=1.0,
        before_send=strip_sensitive_data
    )

# Setup slowapi rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="SwiftClaw API", version="1.0.0")

# Register rate limiter exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Firestore unavailable handler
@app.exception_handler(FirestoreUnavailableError)
async def firestore_unavailable_handler(request: Request, exc: FirestoreUnavailableError):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=503,
        content={"detail": {"code": "database_unavailable", "message": str(exc)}}
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002", "http://localhost:8080", "https://swiftclaw.online"], # Explicit origins required when credentials=True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    # Allow Firebase auth popup and Google APIs for authentication
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "connect-src 'self' https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com "
        "https://swiftclaw-72966.firebaseio.com https://firestore.googleapis.com; "
        "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://swiftclaw-72966.firebaseapp.com; "
        "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com;"
    )
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# ── API Routers ────────────────────────────────────────────────────────────────


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(keys_router, prefix="/api/keys", tags=["keys"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(onboarding_router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(memory_router, prefix="/api/memory", tags=["memory"])
app.include_router(upload_router, prefix="/api/upload", tags=["upload"])
