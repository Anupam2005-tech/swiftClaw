import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.cloud import secretmanager
import structlog
from app.config import settings

logger = structlog.get_logger(__name__)

_master_key: bytes | None = None

def load_master_key() -> None:
    global _master_key
    if _master_key is not None:
        return
        
    try:
        # For local development / testing without GCP
        if os.environ.get("MOCK_SECRET_MANAGER") == "true" or not settings.gcp_project_id:
            logger.warning("using_mock_master_key", reason="GCP project ID not configured or mock enabled")
            _master_key = b"0" * 32
            return
            
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{settings.gcp_project_id}/secrets/{settings.master_key_secret_id}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        
        # Key must be 32 bytes (256-bit) decoded
        secret_string = response.payload.data.decode("UTF-8")
        _master_key = base64.b64decode(secret_string)
        
        if len(_master_key) != 32:
            raise ValueError("Master key must be exactly 32 bytes.")
            
        logger.info("master_key_loaded")
    except Exception as e:
        logger.error("master_key_load_failed", error=str(e))
        raise RuntimeError("Failed to load master encryption key") from e

def get_master_key() -> bytes:
    if _master_key is None:
        load_master_key()
    return _master_key

def encrypt_key(raw_key: str) -> tuple[str, str]:
    """
    Encrypts a raw API key using AES-256-GCM.
    Returns (ciphertext_b64, nonce_b64).
    """
    master_key = get_master_key()
    aesgcm = AESGCM(master_key)
    nonce = os.urandom(12)
    
    ciphertext = aesgcm.encrypt(nonce, raw_key.encode("utf-8"), None)
    
    return base64.b64encode(ciphertext).decode("utf-8"), base64.b64encode(nonce).decode("utf-8")

def decrypt_key(ciphertext_b64: str, nonce_b64: str) -> str:
    """
    Decrypts an API key.
    """
    master_key = get_master_key()
    aesgcm = AESGCM(master_key)
    
    nonce = base64.b64decode(nonce_b64)
    ciphertext = base64.b64decode(ciphertext_b64)
    
    raw_key = aesgcm.decrypt(nonce, ciphertext, None)
    return raw_key.decode("utf-8")
