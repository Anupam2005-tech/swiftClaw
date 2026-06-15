## Why

SwiftClaw needs a complete, production-ready v1 backend to power the web client. Before any frontend is built, the backend must establish every foundational decision — auth model, data schema, LangGraph state, encryption scheme, and streaming architecture — because all subsequent releases (MCP, RAG, image, video, CLI) are additions on top of this foundation, not redesigns.

## What Changes

- **New FastAPI application**: project scaffolding, configuration management, CORS, security headers, and SSE streaming gateway
- **Firebase Auth integration**: ID token verification middleware, session creation/validation, 30-day multi-device session tracking in Firestore
- **API Key Vault**: AES-256-GCM encryption of user-provided provider keys using a master key from Google Cloud Secret Manager; full CRUD lifecycle
- **Provider Abstraction Layer**: `ModelAdapter` per provider (Gemini, Claude, OpenAI, Groq, Perplexity, OpenRouter, NVIDIA) with unified `.stream()`, `.capabilities`, and `ProviderError` handling; JSON capability registry
- **LangGraph Agent Brain**: `AgentState` TypedDict, evaluator-optimizer loop (generator → evaluator → router → output), `max_retries` hard cap, single-agent mode for v1.0
- **Web Search Tool**: one hardcoded tool (DuckDuckGo Search) integrated as a LangGraph tool node; lays groundwork for MCP
- **File Analysis**: in-memory file upload handling (PDF, images, docs) injected directly into model context; no vector DB in v1.0
- **Conversation History**: Firestore-backed conversation documents, session lists, resumable conversations with context assembly (rolling summary + per-provider truncation)
- **Onboarding Wizard API**: guided setup endpoints — provider key validation, default task-model preference population
- **Per-Task Model Preferences**: `model_preferences` Firestore document per user; task classifier → model routing
- **Automatic Provider Fallback**: SSE event emitted on provider switch; clean error messaging when all providers exhausted
- **Rate Limiting**: `slowapi` per-user throttling; request size limits
- **Observability**: `structlog` structured JSON logging (metadata only, no content); Sentry integration

## Capabilities

### New Capabilities

- `firebase-auth`: Firebase ID token verification, 30-day session tracking, multi-device session management, Firestore security rules
- `api-key-vault`: AES-256-GCM encryption/decryption of provider API keys, key lifecycle (add, validate, list, remove), master key rotation support
- `provider-abstraction`: `ModelAdapter` interface, per-provider adapters, capability registry JSON, unified error types
- `agent-orchestration`: LangGraph `AgentState`, evaluator-optimizer loop, single-agent mode, complexity scoring, per-task model preferences, automatic fallback with SSE notification
- `streaming-chat`: SSE-based streaming endpoint, in-progress message persistence, disconnect handling, `status: interrupted` on drop
- `web-search-tool`: DuckDuckGo search as a LangGraph tool node; tool-result injection defenses
- `file-analysis`: multipart file upload endpoint, in-memory processing, file injected into model context (no RAG yet)
- `conversation-history`: Firestore conversation documents, session list API, resumable conversations, rolling summary + per-provider context truncation
- `onboarding-api`: first-login wizard endpoints — provider key validation flow, default model preference assignment

### Modified Capabilities

*(No existing specs — this is the initial backend implementation)*

## Impact

- **New project**: Python FastAPI application in `/home/anupam/development/swiftClaw-backend`
- **External dependencies**: Firebase (Auth + Firestore), Google Cloud Secret Manager, DuckDuckGo Search, LangGraph/LangChain, provider SDKs (google-generativeai, anthropic, openai, groq, etc.), `cryptography`, `slowapi`, `structlog`, `sentry-sdk`, `qdrant-client` (placeholder for v1.2)
- **Infrastructure**: Fly.io or Railway deployment target; SSE-compatible hosting required
- **No frontend**: this change delivers the API layer only; the Next.js frontend is a separate subsequent change
