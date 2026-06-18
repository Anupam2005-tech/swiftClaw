## ADDED Requirements

### Requirement: ModelAdapter Interface
The system SHALL define a `ModelAdapter` abstract base class that every provider adapter implements. It SHALL expose an async `stream()` method returning `AsyncIterator[StreamChunk]` and a `capabilities` property returning a `ProviderCapabilities` object. All provider-specific exceptions SHALL be caught inside the adapter and re-raised as `ProviderError`.

#### Scenario: Adapter yields StreamChunks
- **WHEN** `adapter.stream(messages=[...], tools=[...])` is called
- **THEN** it yields a sequence of `StreamChunk` dicts with `type` in `["text", "tool_call", "error", "done"]`, then terminates

#### Scenario: Provider SDK exception converted to ProviderError
- **WHEN** the underlying provider SDK raises a rate-limit exception during streaming
- **THEN** the adapter catches it and raises `ProviderError(code="rate_limited", retryable=True, message="...")`

---

### Requirement: Capability Registry
The system SHALL maintain a JSON file (`capabilities.json`) mapping `"provider:model"` identifiers to `ProviderCapabilities` objects containing `{supports_tools, supports_vision, supports_streaming, max_context_tokens, supports_image_gen, supports_video_gen}`. This registry SHALL be the single source of truth for capability queries.

#### Scenario: Registry loaded at startup
- **WHEN** the FastAPI application starts
- **THEN** `capabilities.json` is parsed and a registry dict is available in memory; startup fails if the file is missing or malformed

#### Scenario: Capability lookup for known model
- **WHEN** `registry.get("gemini:gemini-2.0-flash")` is called
- **THEN** a `ProviderCapabilities` object is returned with all fields populated

#### Scenario: Unknown model returns None
- **WHEN** `registry.get("unknown:model-x")` is called
- **THEN** `None` is returned (no exception)

---

### Requirement: Per-Provider Adapters
The system SHALL implement adapters for: Gemini, Claude (Anthropic), OpenAI, Groq, Perplexity, OpenRouter, and NVIDIA. Each adapter SHALL accept a decrypted API key at construction time, implement `ModelAdapter`, and handle the provider's native streaming format, mapping it to the common `StreamChunk` shape.

#### Scenario: Gemini adapter streams text chunks
- **WHEN** the Gemini adapter's `stream()` is called with a chat message
- **THEN** it yields `StreamChunk(type="text", content="...")` chunks as the model generates, followed by `StreamChunk(type="done", ...)`

#### Scenario: All adapters raise ProviderError on auth failure
- **WHEN** any adapter receives an invalid/expired API key from the vault and the provider SDK returns an authentication error
- **THEN** the adapter raises `ProviderError(code="invalid_key", retryable=False, message="...")`

---

### Requirement: Provider Factory
The system SHALL provide a factory function `get_adapter(provider: str, api_key: str, model: str) -> ModelAdapter` that instantiates the correct adapter. Requesting an unsupported provider SHALL raise `ProviderError(code="unsupported_capability")`.

#### Scenario: Factory returns correct adapter type
- **WHEN** `get_adapter("groq", key, "llama-3.1-70b-versatile")` is called
- **THEN** a `GroqAdapter` instance is returned

#### Scenario: Unknown provider raises error
- **WHEN** `get_adapter("nonexistent", key, "model")` is called
- **THEN** `ProviderError(code="unsupported_capability")` is raised
