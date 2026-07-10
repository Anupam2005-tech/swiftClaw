from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = False
    
    # GCP Secret Manager
    gcp_project_id: Optional[str] = None
    master_key_secret_id: str = "swiftclaw-master-key"
    master_key: Optional[str] = None
    
    # Auth
    firebase_credentials_path: Optional[str] = None
    
    # Storage (Cloudflare R2)
    r2_account_id: Optional[str] = None
    r2_access_key_id: Optional[str] = None
    r2_secret_access_key: Optional[str] = None
    r2_bucket_name: Optional[str] = None
    r2_public_domain: Optional[str] = None
    
    # Core
    summary_every_n_messages: int = 20
    max_upload_size_bytes: int = 10 * 1024 * 1024
    
    # Rate Limiting
    rate_limit_chat: str = "15/minute"
    rate_limit_files: str = "10/minute"
    rate_limit_keys: str = "5/minute"
    
    # Observability
    sentry_dsn: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
