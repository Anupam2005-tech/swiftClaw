import logging
import structlog
from typing import Any, Dict

def setup_logging(json_logs: bool = True, log_level: int = logging.INFO) -> None:
    shared_processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        _scrub_sensitive_fields,
    ]

    if json_logs:
        processors = shared_processors + [structlog.processors.JSONRenderer()]
    else:
        processors = shared_processors + [structlog.dev.ConsoleRenderer()]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        level=log_level,
    )

def _scrub_sensitive_fields(logger: logging.Logger, log_method: str, event_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Scrub sensitive fields from logs to prevent PII/credential leaks."""
    sensitive_keys = {"message_content", "api_key", "password", "token", "authorization"}
    
    # Check top-level keys
    for key in list(event_dict.keys()):
        if any(sensitive in key.lower() for sensitive in sensitive_keys):
            event_dict[key] = "[REDACTED]"
            
    # Optional: more advanced nested scrubbing could go here if needed.
    return event_dict
