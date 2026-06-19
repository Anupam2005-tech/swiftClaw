import asyncio
from dataclasses import dataclass, asdict
from typing import Optional
from datetime import datetime, timezone
import structlog
import httpx

from app.db.firestore import db
from app.core.providers.registry import get_capabilities

logger = structlog.get_logger(__name__)

CACHE_TTL_HOURS = 24

OPENAI_COMPATIBLE_BASE_URLS = {
    "openai": "https://api.openai.com",
    "groq": "https://api.groq.com/openai",
    "openrouter": "https://openrouter.ai/api/v1",
}

@dataclass
class ModelInfo:
    id: str
    provider: str
    name: str
    context_length: Optional[int] = None
    supports_vision: bool = False
    supports_tools: bool = False
    supports_streaming: bool = True


async def discover_models(provider: str, api_key: str) -> list[dict]:
    if provider == "gemini":
        return await _discover_gemini(api_key)
    elif provider in OPENAI_COMPATIBLE_BASE_URLS:
        return await _discover_openai_compatible(provider, api_key)
    else:
        return _static_models(provider)


class ModelDiscoveryError(Exception):
    """Raised when model discovery fails. Carries a short error code for the frontend."""
    def __init__(self, code: str, detail: str):
        super().__init__(detail)
        self.code = code
        self.detail = detail


async def _discover_gemini(api_key: str) -> list[dict]:
    try:
        from google import genai
        from google.genai import errors as genai_errors
        client = genai.Client(api_key=api_key)

        def list_models_sync():
            result = []
            for m in client.models.list():
                if "generateContent" not in m.supported_generation_methods:
                    continue
                model_id = m.name.replace("models/", "")
                result.append({
                    "id": model_id,
                    "provider": "gemini",
                    "name": getattr(m, "display_name", model_id) or model_id,
                    "context_length": getattr(m, "input_token_limit", None),
                    "supports_vision": "image" in str(getattr(m, "supported_input_modalities", [])).lower(),
                    "supports_tools": True,
                    "supports_streaming": True,
                })
            return result

        return await asyncio.to_thread(list_models_sync)
    except Exception as e:
        err_str = str(e).lower()
        if "api key" in err_str or "api_key" in err_str or "invalid" in err_str or "401" in err_str or "unauthenticated" in err_str:
            raise ModelDiscoveryError("invalid_key", f"Gemini API key is invalid or missing permissions: {e}")
        elif "429" in err_str or "quota" in err_str or "rate" in err_str or "resource_exhausted" in err_str:
            raise ModelDiscoveryError("rate_limited", f"Gemini API key has exceeded its free-tier quota: {e}")
        else:
            raise ModelDiscoveryError("network_error", f"Failed to reach Gemini API: {e}")


async def _discover_openai_compatible(provider: str, api_key: str) -> list[dict]:
    base_url = OPENAI_COMPATIBLE_BASE_URLS.get(provider)
    if not base_url:
        return _static_models(provider)

    url = f"{base_url}/v1/models"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.status_code in (401, 403):
                raise ModelDiscoveryError("invalid_key", f"{provider} API key is invalid or unauthorised.")
            if resp.status_code == 429:
                raise ModelDiscoveryError("rate_limited", f"{provider} API key has exceeded its quota.")
            resp.raise_for_status()
            data = resp.json()
        models = []
        for m in data.get("data", []):
            model_id = m.get("id", "")
            if not model_id:
                continue
            models.append({
                "id": model_id,
                "provider": provider,
                "name": model_id,
                "context_length": None,
                "supports_vision": False,
                "supports_tools": "gpt" in model_id.lower() or "llama" in model_id.lower(),
                "supports_streaming": True,
            })
        if not models:
            raise ModelDiscoveryError("empty_response", f"No models returned by {provider} API.")
        return models
    except ModelDiscoveryError:
        raise
    except Exception as e:
        raise ModelDiscoveryError("network_error", f"Failed to reach {provider} API: {e}")


def _static_models(provider: str) -> list[dict]:
    known_models = {
        "gemini": [
            {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "context_length": 1048576, "supports_vision": True, "supports_tools": True},
            {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "context_length": 1048576, "supports_vision": True, "supports_tools": True},
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "context_length": 2097152, "supports_vision": True, "supports_tools": True},
            {"id": "gemini-2.0-flash-lite", "name": "Gemini 2.0 Flash Lite", "context_length": 1048576, "supports_vision": True, "supports_tools": False},
        ],
        "claude": [
            {"id": "claude-3-5-sonnet-latest", "name": "Claude 3.5 Sonnet", "context_length": 200000, "supports_vision": True, "supports_tools": True},
            {"id": "claude-3-5-haiku-latest", "name": "Claude 3.5 Haiku", "context_length": 200000, "supports_vision": True, "supports_tools": True},
        ],
        "openai": [
            {"id": "gpt-4o", "name": "GPT-4o", "context_length": 128000, "supports_vision": True, "supports_tools": True},
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "context_length": 128000, "supports_vision": True, "supports_tools": True},
        ],
        "groq": [
            {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "context_length": 131072, "supports_tools": True},
            {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B", "context_length": 131072, "supports_tools": True},
            {"id": "llama-3.1-70b-versatile", "name": "Llama 3.1 70B", "context_length": 131072, "supports_tools": True},
        ],
        "perplexity": [
            {"id": "sonar", "name": "Sonar", "context_length": 127000, "supports_tools": False},
            {"id": "sonar-pro", "name": "Sonar Pro", "context_length": 127000, "supports_tools": False},
        ],
        "openrouter": [
            {"id": "nousresearch/hermes-3-llama-3.1-405b", "name": "Hermes 3 Llama 3.1 405B", "context_length": 131072, "supports_tools": True},
            {"id": "meta-llama/llama-3.3-70b-instruct", "name": "Llama 3.3 70B", "context_length": 131072, "supports_tools": True},
            {"id": "mistralai/mixtral-8x22b-instruct", "name": "Mixtral 8x22B", "context_length": 65536, "supports_tools": True},
        ],
        "nvidia": [
            {"id": "nvidia/llama-3.1-nemotron-70b-instruct", "name": "Nemotron 70B", "context_length": 128000, "supports_tools": True},
            {"id": "meta/llama-3.1-405b-instruct", "name": "Llama 3.1 405B", "context_length": 128000, "supports_tools": True},
            {"id": "meta/llama-3.1-70b-instruct", "name": "Llama 3.1 70B", "context_length": 128000, "supports_tools": True},
            {"id": "meta/llama-3.1-8b-instruct", "name": "Llama 3.1 8B", "context_length": 128000, "supports_tools": True},
            {"id": "mistralai/mistral-nemo-12b-instruct", "name": "Mistral Nemo 12B", "context_length": 128000, "supports_tools": True},
            {"id": "mistralai/mixtral-8x22b-instruct", "name": "Mixtral 8x22B", "context_length": 65536, "supports_tools": True},
            {"id": "google/gemma-2-27b-it", "name": "Gemma 2 27B", "context_length": 8192, "supports_tools": False},
            {"id": "nvidia/nemotron-4-340b-reward", "name": "Nemotron-4 340B Reward", "context_length": 4096, "supports_tools": False},
        ],
    }

    entries = known_models.get(provider, [])
    for m in entries:
        m.setdefault("provider", provider)
        m.setdefault("supports_vision", False)
        m.setdefault("supports_tools", True)
        m.setdefault("supports_streaming", True)
        caps = get_capabilities(provider, m["id"])
        if caps:
            m["supports_vision"] = caps.supports_vision
            m["supports_tools"] = caps.supports_tools
            if caps.max_context_tokens:
                m["context_length"] = caps.max_context_tokens
    return entries


def get_cached_models(uid: str, provider: str) -> Optional[list[dict]]:
    doc = db.collection("users").document(uid).collection("model_cache").document(provider).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    fetched_at = data.get("fetched_at")
    if not fetched_at:
        return None
    if isinstance(fetched_at, datetime):
        age_hours = (datetime.now(timezone.utc) - fetched_at).total_seconds() / 3600
    else:
        age_hours = CACHE_TTL_HOURS + 1
    if age_hours > CACHE_TTL_HOURS:
        return None
    return data.get("models")


def set_cached_models(uid: str, provider: str, models: list[dict]) -> None:
    db.collection("users").document(uid).collection("model_cache").document(provider).set({
        "models": models,
        "fetched_at": datetime.now(timezone.utc),
    })