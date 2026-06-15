from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = False
    
    # GCP Secret Manager
    gcp_project_id: Optional[str] = None
    master_key_secret_id: str = "swiftclaw-master-key"
    
    # Auth
    firebase_credentials_path: Optional[str] = None
    
    # Core
    summary_every_n_messages: int = 20
    max_upload_size_bytes: int = 50 * 1024 * 1024
    
    # Rate Limiting
    rate_limit_chat: str = "20/minute"
    rate_limit_files: str = "10/minute"
    rate_limit_keys: str = "5/minute"
    
    # Observability
    sentry_dsn: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
