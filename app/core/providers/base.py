from abc import ABC, abstractmethod
from typing import AsyncIterator, Literal, TypedDict, Dict, Any, Optional
from pydantic import BaseModel

class StreamChunk(TypedDict):
    type: Literal["text", "tool_call", "error", "done", "provider_switch", "low_confidence"]
    content: Optional[str]
    metadata: Optional[Dict[str, Any]]
    tool: Optional[str]
    args: Optional[Dict[str, Any]]
    confidence: Optional[float]
    message: Optional[str]
    code: Optional[str]
    from_provider: Optional[str]
    to_provider: Optional[str]
    reason: Optional[str]
    message_id: Optional[str]
    tokens_used: Optional[int]

class ProviderCapabilities(BaseModel):
    supports_tools: bool = False
    supports_vision: bool = False
    supports_streaming: bool = True
    max_context_tokens: int = 8192
    supports_image_gen: bool = False
    supports_video_gen: bool = False

class ProviderErrorCode(str):
    rate_limited = "rate_limited"
    quota_exceeded = "quota_exceeded"
    invalid_key = "invalid_key"
    unavailable = "unavailable"
    unsupported_capability = "unsupported_capability"
    unknown = "unknown"

class ProviderError(Exception):
    def __init__(self, code: str, retryable: bool, message: str):
        self.code = code
        self.retryable = retryable
        self.message = message
        super().__init__(f"ProviderError({code}): {message}")

class ModelAdapter(ABC):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model_name = model
        
    @property
    @abstractmethod
    def capabilities(self) -> ProviderCapabilities:
        pass

    @abstractmethod
    async def stream(self, messages: list[Any], tools: Optional[list[Any]] = None, **kwargs) -> AsyncIterator[StreamChunk]:
        """
        Streams response back from the underlying provider model.
        Converts native exception types to ProviderError.
        """
        pass
        # generator requires yield, so we add a dummy yield to satisfy the type checker 
        # for an abstract async generator
        yield # type: ignore
