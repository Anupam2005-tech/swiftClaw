import asyncio
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timezone
import structlog
import httpx

from app.db.firestore import db

logger = structlog.get_logger(__name__)

CACHE_TTL_HOURS = 24


@dataclass
class ModelInfo:
    id: str
    provider: str
    name: str
    context_length: Optional[int] = None
    supports_vision: bool = False
    supports_tools: bool = False
    supports_streaming: bool = True
    input_cost_per_1k: Optional[float] = None
    output_cost_per_1k: Optional[float] = None


class ModelDiscoveryError(Exception):
    """Raised when model discovery fails. Carries a short error code for the frontend."""
    def __init__(self, code: str, detail: str):
        super().__init__(detail)
        self.code = code
        self.detail = detail


async def discover_models(provider: str, api_key: str) -> list[dict]:
    """Discover models for a provider using live API calls only."""
    if provider == "gemini":
        return await _discover_gemini(api_key)
    elif provider == "openai":
        return await _discover_openai(api_key)
    elif provider == "groq":
        return await _discover_groq(api_key)
    elif provider == "nvidia":
        return await _discover_nvidia(api_key)
    else:
        raise ModelDiscoveryError("unsupported_provider", f"Provider {provider} is not supported")


async def _discover_gemini(api_key: str) -> list[dict]:
    try:
        from google import genai
        from google.genai import errors as genai_errors
        client = genai.Client(api_key=api_key)

        def list_models_sync():
            result = []
            for m in client.models.list():
                model_id = m.name.replace("models/", "")
                try:
                    if hasattr(m, "supported_generation_methods") and "generateContent" not in m.supported_generation_methods:
                        continue
                    if hasattr(m, "support_generate_content") and not m.support_generate_content:
                        continue
                except Exception:
                    pass
                result.append({
                    "id": model_id,
                    "provider": "gemini",
                    "name": getattr(m, "display_name", model_id) or model_id,
                    "context_length": getattr(m, "input_token_limit", None),
                    "supports_vision": "image" in str(getattr(m, "supported_input_modalities", [])).lower(),
                    "supports_tools": True,
                    "supports_streaming": True,
                    "input_cost_per_1k": None,
                    "output_cost_per_1k": None,
                })
            return result

        models = await asyncio.to_thread(list_models_sync)
        if not models:
            raise ModelDiscoveryError("empty_response", "No models returned by Gemini API")
        return models
    except ModelDiscoveryError:
        raise
    except Exception as e:
        err_str = str(e).lower()
        if "api key" in err_str or "api_key" in err_str or "invalid" in err_str or "401" in err_str or "unauthenticated" in err_str:
            raise ModelDiscoveryError("invalid_key", f"Gemini API key is invalid or missing permissions: {e}")
        elif "429" in err_str or "quota" in err_str or "rate" in err_str or "resource_exhausted" in err_str:
            raise ModelDiscoveryError("rate_limited", f"Gemini API key has exceeded its quota: {e}")
        else:
            raise ModelDiscoveryError("network_error", f"Failed to reach Gemini API: {e}")


async def _discover_openai(api_key: str) -> list[dict]:
    url = "https://api.openai.com/v1/models"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.status_code in (401, 403):
                raise ModelDiscoveryError("invalid_key", "OpenAI API key is invalid or unauthorised.")
            if resp.status_code == 429:
                raise ModelDiscoveryError("rate_limited", "OpenAI API key has exceeded its quota.")
            resp.raise_for_status()
            data = resp.json()
        models = []
        for m in data.get("data", []):
            model_id = m.get("id", "")
            if not model_id:
                continue
            if not any(prefix in model_id for prefix in ("gpt-", "o1-", "o3-")):
                continue
            models.append({
                "id": model_id,
                "provider": "openai",
                "name": model_id,
                "context_length": None,
                "supports_vision": "vision" in model_id.lower() or "gpt-4o" in model_id,
                "supports_tools": True,
                "supports_streaming": True,
                "input_cost_per_1k": None,
                "output_cost_per_1k": None,
            })
        if not models:
            raise ModelDiscoveryError("empty_response", "No models returned by OpenAI API")
        return models
    except ModelDiscoveryError:
        raise
    except Exception as e:
        raise ModelDiscoveryError("network_error", f"Failed to reach OpenAI API: {e}")


async def _discover_groq(api_key: str) -> list[dict]:
    url = "https://api.groq.com/openai/v1/models"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.status_code in (401, 403):
                raise ModelDiscoveryError("invalid_key", "Groq API key is invalid or unauthorised.")
            if resp.status_code == 429:
                raise ModelDiscoveryError("rate_limited", "Groq API key has exceeded its quota.")
            resp.raise_for_status()
            data = resp.json()
        models = []
        for m in data.get("data", []):
            model_id = m.get("id", "")
            if not model_id:
                continue
            lower_id = model_id.lower()
            if "guard" in lower_id or "classif" in lower_id or "embed" in lower_id:
                continue
            models.append({
                "id": model_id,
                "provider": "groq",
                "name": model_id,
                "context_length": m.get("context_window"),
                "supports_vision": "vision" in model_id.lower(),
                "supports_tools": "tool" in model_id.lower() or "llama" in model_id.lower(),
                "supports_streaming": True,
                "input_cost_per_1k": None,
                "output_cost_per_1k": None,
            })
        if not models:
            raise ModelDiscoveryError("empty_response", "No models returned by Groq API")
        return models
    except ModelDiscoveryError:
        raise
    except Exception as e:
        raise ModelDiscoveryError("network_error", f"Failed to reach Groq API: {e}")


async def _discover_nvidia(api_key: str) -> list[dict]:
    try:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        
        available_models = await asyncio.to_thread(ChatNVIDIA.available_models, api_key)
        
        models = []
        for m in available_models:
            if isinstance(m, str):
                model_id = m
                model_name = m
                context_length = None
            elif isinstance(m, dict):
                model_id = m.get("id", "")
                model_name = m.get("name", model_id)
                context_length = m.get("context_length")
            else:
                continue
            
            if not model_id:
                continue
                
            models.append({
                "id": model_id,
                "provider": "nvidia",
                "name": model_name,
                "context_length": context_length,
                "supports_vision": False,
                "supports_tools": False,
                "supports_streaming": True,
                "input_cost_per_1k": None,
                "output_cost_per_1k": None,
            })
        
        if not models:
            raise ModelDiscoveryError("empty_response", "No models returned by NVIDIA API")
        return models
    except ModelDiscoveryError:
        raise
    except Exception as e:
        err_str = str(e).lower()
        if "api key" in err_str or "api_key" in err_str or "invalid" in err_str or "401" in err_str or "unauthenticated" in err_str:
            raise ModelDiscoveryError("invalid_key", f"NVIDIA API key is invalid: {e}")
        elif "429" in err_str or "quota" in err_str or "rate" in err_str:
            raise ModelDiscoveryError("rate_limited", f"NVIDIA API key has exceeded its quota: {e}")
        else:
            raise ModelDiscoveryError("network_error", f"Failed to reach NVIDIA API: {e}")


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


def invalidate_cache(uid: str, provider: str) -> None:
    db.collection("users").document(uid).collection("model_cache").document(provider).delete()