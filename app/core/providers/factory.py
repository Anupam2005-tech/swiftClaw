from typing import AsyncIterator, Any, Optional
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessageChunk
from langchain_core.exceptions import OutputParserException
from httpx import HTTPStatusError

from app.core.providers.base import ModelAdapter, ProviderCapabilities, StreamChunk, ProviderError
from app.core.providers.registry import get_capabilities

class LangChainAdapter(ModelAdapter):
    """
    A generic adapter that wraps any LangChain ChatModel and normalizes
    its output into SwiftClaw's StreamChunk format.
    """
    def __init__(self, provider: str, model_name: str, llm: BaseChatModel):
        super().__init__("", model_name)
        self.provider = provider
        self.llm = llm
        
    @property
    def capabilities(self) -> ProviderCapabilities:
        caps = get_capabilities(self.provider, self.model_name)
        if not caps:
            # Fallback safe defaults if missing from registry
            return ProviderCapabilities()
        return caps

    async def stream(self, messages: list[Any], tools: Optional[list[Any]] = None, **kwargs) -> AsyncIterator[StreamChunk]:
        llm_with_tools = self.llm
        if tools and self.capabilities.supports_tools:
            llm_with_tools = self.llm.bind_tools(tools)
            
        try:
            async for chunk in llm_with_tools.astream(messages, **kwargs):
                if isinstance(chunk, AIMessageChunk):
                    # Check for tool calls first
                    if getattr(chunk, "tool_calls", None):
                        for tool_call in chunk.tool_calls:
                            yield {
                                "type": "tool_call",
                                "tool": tool_call.get("name"),
                                "args": tool_call.get("args"),
                                "content": None,
                                "metadata": None,
                                "confidence": None, "message": None, "code": None, "from_provider": None,
                                "to_provider": None, "reason": None, "message_id": None, "tokens_used": None
                            }
                    # Yield text delta
                    if chunk.content:
                        content_str = chunk.content
                        if isinstance(content_str, list):
                            # Sometimes anthropic returns a list of content blocks
                            texts = [c.get("text", "") for c in content_str if c.get("type") == "text"]
                            content_str = "".join(texts)
                        if content_str:
                            yield {
                                "type": "text",
                                "content": content_str,
                                "tool": None, "args": None, "metadata": None,
                                "confidence": None, "message": None, "code": None, "from_provider": None,
                                "to_provider": None, "reason": None, "message_id": None, "tokens_used": None
                            }
            yield {
                "type": "done",
                "content": None, "tool": None, "args": None, "metadata": None,
                "confidence": None, "message": None, "code": None, "from_provider": None,
                "to_provider": None, "reason": None, "message_id": "TODO", "tokens_used": 0
            }
        except Exception as e:
            # Convert native exceptions to ProviderError
            # This is a simplified error mapping; in a real app this would check specific error types
            # from openai, anthropic, google, etc.
            error_str = str(e).lower()
            code = "unknown"
            retryable = False
            
            if "rate" in error_str or "429" in error_str:
                code = "rate_limited"
                retryable = True
            elif "quota" in error_str or "insufficient" in error_str:
                code = "quota_exceeded"
                retryable = True
            elif "api_key" in error_str or "auth" in error_str or "401" in error_str:
                code = "invalid_key"
                retryable = False
                
            raise ProviderError(code=code, retryable=retryable, message=str(e))

def get_adapter(provider: str, api_key: str, model: str) -> ModelAdapter:
    """
    Factory function to instantiate the correct LangChain adapter.
    """
    if provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model=model, google_api_key=api_key)
    elif provider == "claude":
        from langchain_anthropic import ChatAnthropic
        llm = ChatAnthropic(model=model, api_key=api_key)
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        llm = ChatOpenAI(model=model, api_key=api_key)
    elif provider == "groq":
        from langchain_groq import ChatGroq
        llm = ChatGroq(model=model, api_key=api_key)
    elif provider == "perplexity":
        from langchain_openai import ChatOpenAI
        # Perplexity is OpenAI-compatible
        llm = ChatOpenAI(model=model, api_key=api_key, base_url="https://api.perplexity.ai")
    else:
        raise ProviderError(code="unsupported_capability", retryable=False, message=f"Unsupported provider: {provider}")
        
    return LangChainAdapter(provider=provider, model_name=model, llm=llm)
