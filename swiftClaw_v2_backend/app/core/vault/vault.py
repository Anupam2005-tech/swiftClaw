from datetime import datetime, timezone
from cryptography.exceptions import InvalidTag
from app.db.firestore import db
from app.core.vault.encryption import encrypt_key, decrypt_key
import structlog

logger = structlog.get_logger(__name__)

def store_api_key(uid: str, provider: str, raw_key: str, validated: bool = True) -> None:
    ciphertext_b64, nonce_b64 = encrypt_key(raw_key)
    
    key_doc = {
        "ciphertext_b64": ciphertext_b64,
        "nonce_b64": nonce_b64,
        "added_at": datetime.now(timezone.utc),
        "last_used": None,
        "validated": validated,
        "key_version": 1
    }
    
    db.collection("users").document(uid).collection("api_keys").document(provider).set(key_doc)

def get_api_key(uid: str, provider: str) -> str | None:
    """
    Retrieves and decrypts the API key for a provider.
    """
    doc = db.collection("users").document(uid).collection("api_keys").document(provider).get()
    if not doc.exists:
        return None
        
    data = doc.to_dict()
    ciphertext_b64 = data.get("ciphertext_b64")
    nonce_b64 = data.get("nonce_b64")
    
    if not ciphertext_b64 or not nonce_b64:
        return None

    try:
        return decrypt_key(ciphertext_b64, nonce_b64)
    except InvalidTag:
        logger.warning(
            "decrypt_failed_invalid_tag",
            uid=uid,
            provider=provider,
            hint="Master key may have changed since this key was stored. Re-add the API key.",
        )
        return None

def list_api_keys(uid: str) -> list[dict]:
    """
    Lists metadata for all stored API keys (no decryption).
    """
    docs = db.collection("users").document(uid).collection("api_keys").stream()
    keys_metadata = []
    
    for doc in docs:
        data = doc.to_dict()
        keys_metadata.append({
            "provider": doc.id,
            "added_at": data.get("added_at"),
            "last_used": data.get("last_used"),
            "validated": data.get("validated")
        })
        
    return keys_metadata

def remove_api_key(uid: str, provider: str) -> None:
    db.collection("users").document(uid).collection("api_keys").document(provider).delete()

def mark_key_used(uid: str, provider: str) -> None:
    db.collection("users").document(uid).collection("api_keys").document(provider).update({
        "last_used": datetime.now(timezone.utc)
    })
