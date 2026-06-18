## 1. Project Setup & Core Infrastructure

- [x] 1.1 Initialize FastAPI project structure (app, api, core, db, middleware)
- [x] 1.2 Setup `pydantic-settings` for environment configuration
- [x] 1.3 Configure structlog for JSON logging (scrubbing sensitive fields)
- [x] 1.4 Setup Sentry SDK integration
- [x] 1.5 Implement rate limiting using `slowapi`
- [x] 1.6 Add CORS and security headers middleware

## 2. Firebase & Auth Foundation

- [x] 2.1 Initialize Firebase Admin SDK
- [x] 2.2 Write and deploy Firestore security rules
- [x] 2.3 Implement Firebase ID token verification middleware
- [x] 2.4 Implement 30-day session CRUD in Firestore (`users/{uid}/sessions`)
- [x] 2.5 Implement `POST /api/v1/auth/session` (login/session creation)
- [x] 2.6 Implement `POST /api/v1/auth/logout` and `logout-all`

## 3. API Key Vault

- [x] 3.1 Fetch master encryption key from GCP Secret Manager at startup
- [x] 3.2 Implement AES-256-GCM encryption/decryption utilities
- [x] 3.3 Implement `POST /api/v1/keys/{provider}` (add key with pre-validation)
- [x] 3.4 Implement `GET /api/v1/keys` (list keys metadata)
- [x] 3.5 Implement `DELETE /api/v1/keys/{provider}` (remove key)

## 4. Provider Abstraction

- [x] 4.1 Define `ModelAdapter` ABC and `ProviderError` exceptions
- [x] 4.2 Create capability registry (`capabilities.json`) and loader
- [x] 4.3 Implement Gemini adapter
- [x] 4.4 Implement Claude adapter
- [x] 4.5 Implement OpenAI adapter
- [x] 4.6 Implement Groq adapter
- [x] 4.7 Implement Perplexity adapter
- [x] 4.8 Create provider factory `get_adapter`

## 5. Agent Orchestration

- [x] 5.1 Define `AgentState` TypedDict
- [x] 5.2 Implement complexity scorer node
- [x] 5.3 Implement evaluator node
- [x] 5.4 Implement generator node and router logic
- [x] 5.5 Compile LangGraph `StateGraph`
- [x] 5.6 Implement vault loader to populate `state.available_providers`

## 6. Chat Streaming & Conversation History

- [x] 6.1 Define Firestore schemas for conversations and messages
- [x] 6.2 Implement `POST /api/v1/chat/stream` SSE endpoint with `multipart/form-data` parsing
- [x] 6.3 Implement in-progress message persistence and disconnect handling
- [x] 6.4 Implement automatic provider fallback during generation
- [x] 6.5 Implement two-layer context assembly (token budget truncation)
- [x] 6.6 Implement rolling summary generation (Groq summarizer)
- [x] 6.7 Implement `GET /api/v1/conversations` (list)
- [x] 6.8 Implement `GET /api/v1/conversations/{id}/messages` (history)
- [x] 6.9 Implement `DELETE /api/v1/conversations/{id}`

## 7. Web Search Tool

- [x] 7.1 Include `duckduckgo-search` package and usage implementation
- [x] 7.2 Create `web_search` LangGraph tool node using DuckDuckGo
- [x] 7.3 Implement tool-result injection defense framing

## 8. File Analysis

- [x] 8.1 Implement multipart parser and file size limits for chat/stream endpoint
- [x] 8.2 Build in-memory file processor (extract text/bytes)
- [x] 8.3 Inject file content into LLM context (vision fallback handling)

## 9. Onboarding API

- [x] 9.1 Implement `GET /api/v1/onboarding/status`
- [x] 9.2 Implement `POST /api/v1/onboarding/validate-key` (live checking)
- [x] 9.3 Implement `POST /api/v1/onboarding/set-preferences` (auto-population)
- [x] 9.4 Add onboarding completion check to `/chat/stream` middleware
