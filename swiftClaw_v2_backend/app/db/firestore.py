import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings
import structlog

logger = structlog.get_logger("app.firebase")

class FirestoreUnavailableError(RuntimeError):
    pass

_db = None

def init_firebase():
    global _db
    if not firebase_admin._apps:
        if settings.firebase_credentials_path:
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()

    try:
        client = firestore.client(database_id="swiftclaw-72966")
        _db = client
        logger.info("Firestore connection established")
    except Exception as e:
        logger.warning("Firestore unavailable", error=str(e))
        _db = None

def get_db():
    if _db is None:
        raise FirestoreUnavailableError("Firestore database is not available. Create it at https://console.cloud.google.com/firestore?project=swiftclaw-72966")
    return _db

init_firebase()

class _DBProxy:
    def __getattr__(self, name):
        return getattr(get_db(), name)

db = _DBProxy() if _db is None else _db