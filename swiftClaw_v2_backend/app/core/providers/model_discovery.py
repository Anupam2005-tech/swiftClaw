import asyncio
from typing import Optional
from datetime import datetime, timezone
import structlog
import httpx

from app.db.firestore import db
from app.core.auth.cache import SimpleTTLCache

logger = structlog.get_logger(__name__)

# Local in-memory cache for models, valid for 5 minutes (300 seconds)
model_list_cache = SimpleTTLCache(ttl_seconds=300)

CACHE_TTL_HOURS = 24
EXCLUDED_SUBSTRINGS = ("embedding", "whisper", "tts", "dall-e", "moderation", "davinci", "babbage", "audio")

# OpenAI: vision is the default for current chat models; these are the known exceptions
# that are text-only. Update this list if OpenAI ships new small/reasoning variants.
NON_VISION_SUBSTRINGS_OPENAI = ("o1-mini", "o3-mini", "gpt-3.5", "gpt-oss")

# Groq: unlike OpenAI, most Groq model IDs do NOT contain "vision" even when they
# support image input, so this must be an allowlist of known multimodal families
# rather than a keyword match. Groq's multimodal lineup changes frequently -
# verify against https://console.groq.com/docs/vision when models are added/removed.
VISION_SUBSTRINGS_GROQ = ("scout", "maverick", "-vl-", "vision")


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


def _gemini_supports_vision(modalities) -> bool:
    """Determine if a Gemini model supports vision input.
    
    Most Gemini chat models support vision. If the modalities attribute is
    None or empty (which happens for some models), we default to True.
    """
    if modalities is None or (isinstance(modalities, (list, tuple)) and len(modalities) == 0):
        return True  # Default to True — nearly all Gemini chat models support images
    return "image" in str(modalities).lower()


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
                    "supports_vision": _gemini_supports_vision(getattr(m, "supported_input_modalities", None)),
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
            if any(s in model_id.lower() for s in EXCLUDED_SUBSTRINGS):
                continue
            models.append({
                "id": model_id,
                "provider": "openai",
                "name": model_id,
                "context_length": None,
                "supports_vision": not any(s in model_id.lower() for s in NON_VISION_SUBSTRINGS_OPENAI),
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
                "supports_vision": any(s in lower_id for s in VISION_SUBSTRINGS_GROQ),
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
                "supports_vision": "vision" in model_id.lower() or "-vl-" in model_id.lower(),
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
    cache_key = f"{uid}:{provider}"
    models = model_list_cache.get(cache_key)
    if models is not None:
        logger.debug("model_cache_hit_memory", uid=uid, provider=provider)
        return models

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
    
    models_data = data.get("models")
    if models_data:
        model_list_cache.set(cache_key, models_data)
        logger.debug("model_cache_hit_firestore", uid=uid, provider=provider)
    return models_data


def set_cached_models(uid: str, provider: str, models: list[dict]) -> None:
    db.collection("users").document(uid).collection("model_cache").document(provider).set({
        "models": models,
        "fetched_at": datetime.now(timezone.utc),
    })
    model_list_cache.set(f"{uid}:{provider}", models)


def invalidate_cache(uid: str, provider: str) -> None:
    db.collection("users").document(uid).collection("model_cache").document(provider).delete()
    model_list_cache.invalidate(f"{uid}:{provider}")