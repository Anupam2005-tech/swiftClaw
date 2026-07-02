from typing import AsyncIterator, Any, Optional, Tuple
import re
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessageChunk
from app.core.providers.base import ModelAdapter, ProviderCapabilities, StreamChunk, ProviderError
from app.core.providers.model_discovery import get_cached_models
import structlog

logger = structlog.get_logger(__name__)

class GeminiAdapter(ModelAdapter):
    def __init__(self, api_key: str, model: str, discovered_metadata: dict = None):
        super().__init__(api_key, model, discovered_metadata)
        from langchain_google_genai import ChatGoogleGenerativeAI
        self.llm = ChatGoogleGenerativeAI(
            model=model,
            google_api_key=api_key,
            request_timeout=30,
            convert_system_message_to_human=True,
        )

    @property
    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_tools=self.discovered_metadata.get("supports_tools", False),
            supports_vision=self.discovered_metadata.get("supports_vision", False),
            max_context_tokens=self.discovered_metadata.get("context_length", 8192),
            input_cost_per_1k=self.discovered_metadata.get("input_cost_per_1k", 0.0),
            output_cost_per_1k=self.discovered_metadata.get("output_cost_per_1k", 0.0),
        )

    @staticmethod
    def _convert_to_gemini_messages(messages: list) -> list:
        """Converts OpenAI-style image_url blocks to Gemini inline_data format."""
        converted = []
        for msg in messages:
            content = msg.get("content")
            if isinstance(content, list):
                new_parts = []
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "image_url":
                        url = part.get("image_url", {}).get("url", "")
                        match = re.match(r"data:(.+?);base64,(.+)", url)
                        if match:
                            new_parts.append({
                                "type": "inline_data",
                                "inline_data": {
                                    "mime_type": match.group(1),
                                    "data": match.group(2)
                                }
                            })
                        else:
                            new_parts.append(part)
                    else:
                        new_parts.append(part)
                converted.append({**msg, "content": new_parts})
            else:
                converted.append(msg)
        return converted

    async def stream(self, messages: list[Any], tools: Optional[list[Any]] = None, **kwargs) -> AsyncIterator[StreamChunk]:
        gemini_messages = self._convert_to_gemini_messages(messages)
        llm_with_tools = self.llm
        if tools and self.capabilities.supports_tools:
            llm_with_tools = self.llm.bind_tools(tools)
        
        try:
            async for chunk in llm_with_tools.astream(gemini_messages, **kwargs):
                if isinstance(chunk, AIMessageChunk):
                    if getattr(chunk, "tool_calls", None):
                        for tool_call in chunk.tool_calls:
                            yield {
                                "type": "tool_call",
                                "tool": tool_call.get("name"),
                                "args": tool_call.get("args"),
                                "content": None, "metadata": None, "confidence": None,
                                "message": None, "code": None, "from_provider": None,
                                "to_provider": None, "reason": None, "message_id": None
                            }
                    if chunk.content:
                        yield {
                            "type": "text",
                            "content": chunk.content,
                            "tool": None, "args": None, "metadata": None,
                            "confidence": None, "message": None, "code": None, "from_provider": None,
                            "to_provider": None, "reason": None, "message_id": None
                        }

            # Token usage for Gemini usually comes in response_metadata of the last chunk or separate call
            # Simplified: assume 0 for now or extract if available
            yield {
                "type": "done",
                "content": None, "tool": None, "args": None, "metadata": None,
                "confidence": None, "message": None, "code": None, "from_provider": None,
                "to_provider": None, "reason": None, "message_id": "done"
            }
        except Exception as e:
            raise self._handle_error(e)

    def _handle_error(self, e: Exception) -> ProviderError:
        err_str = str(e).lower()
        if "rate" in err_str or "429" in err_str:
            return ProviderError(code="rate_limited", retryable=True, message=str(e))
        if "api_key" in err_str or "auth" in err_str or "401" in err_str:
            return ProviderError(code="invalid_key", retryable=False, message=str(e))
        return ProviderError(code="unknown", retryable=False, message=str(e))


class OpenAIAdapter(ModelAdapter):
    def __init__(self, api_key: str, model: str, discovered_metadata: dict = None):
        super().__init__(api_key, model, discovered_metadata)
        from langchain_openai import ChatOpenAI
        self.llm = ChatOpenAI(model=model, api_key=api_key)

    @property
    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_tools=self.discovered_metadata.get("supports_tools", False),
            supports_vision=self.discovered_metadata.get("supports_vision", False),
            max_context_tokens=self.discovered_metadata.get("context_length", 128000),
            input_cost_per_1k=self.discovered_metadata.get("input_cost_per_1k", 0.0),
            output_cost_per_1k=self.discovered_metadata.get("output_cost_per_1k", 0.0),
        )

    async def stream(self, messages: list[Any], tools: Optional[list[Any]] = None, **kwargs) -> AsyncIterator[StreamChunk]:
        llm_with_tools = self.llm
        if tools and self.capabilities.supports_tools:
            llm_with_tools = self.llm.bind_tools(tools)
        
        total_tokens = 0
        try:
            async for chunk in llm_with_tools.astream(messages, stream_options={"include_usage": True}, **kwargs):
                if isinstance(chunk, AIMessageChunk):
                    # Extract usage if present
                    if hasattr(chunk, "usage_metadata") and chunk.usage_metadata:
                        total_tokens = chunk.usage_metadata.get("total_tokens", 0)
                    
                    if getattr(chunk, "tool_calls", None):
                        for tool_call in chunk.tool_calls:
                            yield {
                                "type": "tool_call",
                                "tool": tool_call.get("name"),
                                "args": tool_call.get("args"),
                                "content": None, "metadata": None, "confidence": None, 
                                "message": None, "code": None, "from_provider": None,
                                "to_provider": None, "reason": None, "message_id": None
                            }
                    if chunk.content:
                        yield {
                            "type": "text",
                            "content": chunk.content,
                            "tool": None, "args": None, "metadata": None,
                            "confidence": None, "message": None, "code": None, "from_provider": None,
                            "to_provider": None, "reason": None, "message_id": None
                        }
            
            yield {
                "type": "done",
                "content": None, "tool": None, "args": None, "metadata": None,
                "confidence": None, "message": None, "code": None, "from_provider": None,
                "to_provider": None, "reason": None, "message_id": "done"
            }
        except Exception as e:
            raise self._handle_error(e)

    def _handle_error(self, e: Exception) -> ProviderError:
        err_str = str(e).lower()
        if "rate" in err_str or "429" in err_str:
            return ProviderError(code="rate_limited", retryable=True, message=str(e))
        if "api_key" in err_str or "auth" in err_str or "401" in err_str:
            return ProviderError(code="invalid_key", retryable=False, message=str(e))
        return ProviderError(code="unknown", retryable=False, message=str(e))


class GroqAdapter(ModelAdapter):
    def __init__(self, api_key: str, model: str, discovered_metadata: dict = None):
        super().__init__(api_key, model, discovered_metadata)
        from langchain_groq import ChatGroq
        self.llm = ChatGroq(model=model, api_key=api_key)

    @property
    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_tools=self.discovered_metadata.get("supports_tools", False),
            supports_vision=self.discovered_metadata.get("supports_vision", False),
            max_context_tokens=self.discovered_metadata.get("context_length", 131072),
            input_cost_per_1k=self.discovered_metadata.get("input_cost_per_1k", 0.0),
            output_cost_per_1k=self.discovered_metadata.get("output_cost_per_1k", 0.0),
        )

    async def stream(self, messages: list[Any], tools: Optional[list[Any]] = None, **kwargs) -> AsyncIterator[StreamChunk]:
        llm_with_tools = self.llm
        if tools and self.capabilities.supports_tools:
            llm_with_tools = self.llm.bind_tools(tools)
        
        try:
            async for chunk in llm_with_tools.astream(messages, **kwargs):
                if isinstance(chunk, AIMessageChunk):
                    if getattr(chunk, "tool_calls", None):
                        for tool_call in chunk.tool_calls:
                            yield {
                                "type": "tool_call",
                                "tool": tool_call.get("name"),
                                "args": tool_call.get("args"),
                                "content": None, "metadata": None, "confidence": None, 
                                "message": None, "code": None, "from_provider": None,
                                "to_provider": None, "reason": None, "message_id": None
                            }
                    if chunk.content:
                        yield {
                            "type": "text",
                            "content": chunk.content,
                            "tool": None, "args": None, "metadata": None,
                            "confidence": None, "message": None, "code": None, "from_provider": None,
                            "to_provider": None, "reason": None, "message_id": None
                        }
            yield {
                "type": "done",
                "content": None, "tool": None, "args": None, "metadata": None,
                "confidence": None, "message": None, "code": None, "from_provider": None,
                "to_provider": None, "reason": None, "message_id": "done"
            }
        except Exception as e:
            raise self._handle_error(e)

    def _handle_error(self, e: Exception) -> ProviderError:
        err_str = str(e).lower()
        if "rate" in err_str or "429" in err_str:
            return ProviderError(code="rate_limited", retryable=True, message=str(e))
        if "api_key" in err_str or "auth" in err_str or "401" in err_str:
            return ProviderError(code="invalid_key", retryable=False, message=str(e))
        return ProviderError(code="unknown", retryable=False, message=str(e))


class NVIDIAAdapter(ModelAdapter):
    def __init__(self, api_key: str, model: str, discovered_metadata: dict = None):
        super().__init__(api_key, model, discovered_metadata)
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        self.llm = ChatNVIDIA(model=model, api_key=api_key)

    @property
    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_tools=self.discovered_metadata.get("supports_tools", False),
            supports_vision=self.discovered_metadata.get("supports_vision", False),
            max_context_tokens=self.discovered_metadata.get("context_length", 128000),
            input_cost_per_1k=self.discovered_metadata.get("input_cost_per_1k", 0.0),
            output_cost_per_1k=self.discovered_metadata.get("output_cost_per_1k", 0.0),
        )

    async def stream(self, messages: list[Any], tools: Optional[list[Any]] = None, **kwargs) -> AsyncIterator[StreamChunk]:
        llm_with_tools = self.llm
        if tools and self.capabilities.supports_tools:
            llm_with_tools = self.llm.bind_tools(tools)
        
        try:
            async for chunk in llm_with_tools.astream(messages, **kwargs):
                if isinstance(chunk, AIMessageChunk):
                    if getattr(chunk, "tool_calls", None):
                        for tool_call in chunk.tool_calls:
                            yield {
                                "type": "tool_call",
                                "tool": tool_call.get("name"),
                                "args": tool_call.get("args"),
                                "content": None, "metadata": None, "confidence": None, 
                                "message": None, "code": None, "from_provider": None,
                                "to_provider": None, "reason": None, "message_id": None
                            }
                    if chunk.content:
                        yield {
                            "type": "text",
                            "content": chunk.content,
                            "tool": None, "args": None, "metadata": None,
                            "confidence": None, "message": None, "code": None, "from_provider": None,
                            "to_provider": None, "reason": None, "message_id": None
                        }
            yield {
                "type": "done",
                "content": None, "tool": None, "args": None, "metadata": None,
                "confidence": None, "message": None, "code": None, "from_provider": None,
                "to_provider": None, "reason": None, "message_id": "done"
            }
        except Exception as e:
            raise self._handle_error(e)

    def _handle_error(self, e: Exception) -> ProviderError:
        err_str = str(e).lower()
        if "rate" in err_str or "429" in err_str:
            return ProviderError(code="rate_limited", retryable=True, message=str(e))
        if "api_key" in err_str or "auth" in err_str or "401" in err_str:
            return ProviderError(code="invalid_key", retryable=False, message=str(e))
        return ProviderError(code="unknown", retryable=False, message=str(e))


def get_default_model_for_user(uid: str, provider: str) -> str:
    """Returns the first discovered model from user's cache for a provider."""
    cached = get_cached_models(uid, provider)
    if cached and len(cached) > 0:
        return cached[0]["id"]
    return ""


def validate_model_for_provider_for_user(uid: str, provider: str, model: str) -> bool:
    """Validates if a model is in the user's cached list for a provider."""
    cached = get_cached_models(uid, provider)
    if not cached:
        return False
    return any(m["id"] == model for m in cached)


def get_adapter(provider: str, api_key: str, model: str, capabilities: dict = None) -> ModelAdapter:
    """Factory function to instantiate the correct native adapter."""
    if provider == "gemini":
        return GeminiAdapter(api_key, model, capabilities)
    elif provider == "openai":
        return OpenAIAdapter(api_key, model, capabilities)
    elif provider == "groq":
        return GroqAdapter(api_key, model, capabilities)
    elif provider == "nvidia":
        return NVIDIAAdapter(api_key, model, capabilities)
    else:
        raise ProviderError(code="unsupported_capability", retryable=False, message=f"Unsupported provider: {provider}")
