## Context

SwiftClaw is a dual-surface AI assistant (web + CLI) whose entire intelligence lives in a single Python FastAPI + LangGraph backend. This design covers the v1.0 web backend only — the first and largest release because every foundational decision (auth model, Firestore schema, LangGraph state shape, encryption scheme, SSE contract) is made here. All subsequent releases (v1.1 MCP, v1.2 RAG, v2.0 CLI) are additive; no redesign should be needed after this foundation is laid.

The system design document (`SwiftClaw_System_Design.md`) is the authoritative source for theory and rationale. This design document records the key technical decisions for implementation.

## Goals / Non-Goals

**Goals:**
- Deliver a fully functional FastAPI backend powering: Firebase auth + 30-day sessions, AES-256-GCM key vault, LangGraph evaluator-optimizer agent, SSE streaming chat, web search tool, in-memory file analysis, Firestore conversation history, per-task model preferences, provider fallback with SSE notification
- Establish the canonical project structure, configuration pattern, and module boundaries that every future release extends
- Ensure Firestore security rules, encryption, and rate limiting are correct from day one (not retrofitted)
- Keep the web client a thin client — all orchestration, routing, and tool execution stays server-side

**Non-Goals:**
- Frontend / Next.js (separate change)
- Vector DB / RAG pipeline (v1.2)
- MCP integrations beyond the single web-search tool (v1.1)
- CLI surface (v2.0)
- Video/image generation (v1.3 / v1.4)
- Competitive / parallel orchestration modes (those unlock automatically once users add 3+ keys, but implementation is v1.0 only for single-agent and eval-optimizer)

## Decisions

### D1: Project Layout — Feature-Based Modules

```
swiftClaw-backend/
├── app/
│   ├── main.py                  # FastAPI app factory, lifespan, CORS, middleware
│   ├── config.py                # Pydantic Settings (env-driven)
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py          # /auth/session, /auth/logout, /auth/device/*
│   │   │   ├── keys.py          # /keys CRUD
│   │   │   ├── chat.py          # /chat/stream (SSE), /chat/stop
│   │   │   ├── files.py         # /files/upload
│   │   │   ├── conversations.py # /conversations CRUD, history
│   │   │   └── onboarding.py    # /onboarding/validate-key, /onboarding/preferences
│   ├── core/
│   │   ├── auth/
│   │   │   ├── middleware.py    # Firebase token verification + session check
│   │   │   └── sessions.py      # 30-day session CRUD (Firestore)
│   │   ├── vault/
│   │   │   ├── encryption.py   # AES-256-GCM, nonce generation
│   │   │   └── vault.py        # Key CRUD over Firestore
│   │   ├── providers/
│   │   │   ├── base.py          # ModelAdapter ABC, StreamChunk, ProviderError
│   │   │   ├── registry.py      # JSON capability registry loader
│   │   │   ├── adapters/        # gemini.py, claude.py, openai.py, groq.py, etc.
│   │   │   └── capabilities.json
│   │   ├── agent/
│   │   │   ├── state.py         # AgentState TypedDict
│   │   │   ├── graph.py         # LangGraph StateGraph definition
│   │   │   ├── nodes/           # generator.py, evaluator.py, router.py, output.py
│   │   │   └── tools/
│   │   │       ├── web_search.py
│   │   │       └── file_context.py
│   │   └── context/
│   │       ├── assembly.py      # Per-request context assembly (truncation + summary)
│   │       └── summarizer.py    # Rolling summary generation
│   ├── db/
│   │   ├── firestore.py         # Firebase Admin SDK init, typed collection helpers
│   │   └── schemas.py           # Pydantic models for Firestore documents
│   └── middleware/
│       ├── rate_limit.py        # slowapi setup
│       ├── security_headers.py  # X-Frame-Options, CSP, etc.
│       └── logging.py           # structlog configuration
├── openspec/
├── requirements.txt
├── .env.example
└── Dockerfile
```

**Rationale**: Feature-based layout keeps each concern isolated. Future modules (RAG, MCP, CLI) slot in without restructuring existing code. `app/core/` holds business logic with no FastAPI dependency — fully unit-testable.

---

### D2: Configuration — Pydantic Settings + `.env`

All runtime config loaded from environment variables via `pydantic-settings`. A single `Settings` singleton initialized at startup. Secrets (master encryption key) are fetched from Google Cloud Secret Manager at startup and cached in memory — never in `.env`.

**Rationale**: 12-factor, easy Fly.io/Railway deployment, type-safe config access throughout the codebase.

---

### D3: Firebase Auth Middleware — Two-Check Pattern

Every authenticated route goes through:
1. `firebase_admin.auth.verify_id_token(token)` — cryptographic validity check
2. Firestore session document lookup (`users/{uid}/sessions/{session_id}`) — policy enforcement (30-day expiry, explicit logout)

The session ID is passed as a custom claim or via a separate header. Check 1 alone is insufficient because Firebase refresh tokens don't expire by default.

**Alternative considered**: Store sessions in Redis for lower latency. **Rejected** for v1.0: Firestore is already in the stack, Redis adds infrastructure complexity. At the scale of a solo-launched product, Firestore read latency (~10ms) per request is acceptable. Redis session cache can be added in v1.1 if needed.

---

### D4: API Key Vault — AES-256-GCM with Per-Key Nonces

- Master key: 256-bit, stored in Google Cloud Secret Manager, loaded at startup
- Per-key encryption: `cryptography.hazmat.primitives.ciphers.aead.AESGCM`; fresh 12-byte nonce per encryption operation
- Storage: Firestore `users/{uid}/api_keys/{provider}` with `{ciphertext_b64, nonce_b64, added_at, last_used, validated, key_version}`
- Decryption happens in memory at inference time; decrypted key lives only for the duration of the provider call

**Alternative considered**: HashiCorp Vault. **Rejected**: operational overhead is too high for a solo project. GCP Secret Manager is sufficient for the master key, and the per-key encryption handles the rest.

---

### D5: Provider Abstraction — `ModelAdapter` ABC

Each provider adapter implements:
```python
class ModelAdapter(ABC):
    @abstractmethod
    async def stream(self, messages, tools, **kwargs) -> AsyncIterator[StreamChunk]: ...
    
    @property
    @abstractmethod
    def capabilities(self) -> ProviderCapabilities: ...
```

`StreamChunk = TypedDict("StreamChunk", type=Literal["text","tool_call","error","done"], content=str, metadata=dict)`

All provider-specific exceptions are caught internally and re-raised as `ProviderError(code: ProviderErrorCode, retryable: bool, message: str)` where `ProviderErrorCode` is a small enum: `rate_limited | quota_exceeded | invalid_key | unavailable | unsupported_capability`.

The capability registry (`capabilities.json`) maps `"provider:model"` → `ProviderCapabilities` and is loaded once at startup. This avoids runtime introspection and makes capability changes version-controlled.

---

### D6: LangGraph Agent Graph — Fixed Topology, Dynamic Routing

The `StateGraph` topology is fixed for all orchestration modes. Only which nodes are reachable changes based on `state.available_providers`:

```
START → complexity_scorer → router → generator → evaluator → output_router
                                          ↑______________|  (retry loop)
```

- **Single-agent** (1 provider): the `evaluator` node always runs; in single-provider mode it self-evaluates via the same provider with a distinct prompt.
- **Eval-optimizer** (2+ providers): `generator` uses provider A, `evaluator` uses provider B independently
- `max_retries: int = 3` is a hard field in `AgentState` — never implicit

`AgentState` fields mirror exactly what's in the system design doc (Section 2.3). Additional fields for v1.0: `session_id`, `user_id`, `complexity`, `task_category`, `available_providers`, `model_preferences`.

**Rationale**: Fixed topology with conditional edges is easier to test and debug than dynamically assembled graphs. Adding parallel/competitive modes in v1.x is a matter of adding new conditional branches and nodes, not rewriting the graph.

---

### D7: SSE Streaming Contract

Endpoint: `POST /api/v1/chat/stream`, accepting a `multipart/form-data` request with `conversation_id`, `message`, and any `files`, returning a `text/event-stream` response.

Event types emitted on the SSE stream:
```
data: {"type": "text_delta", "content": "..."}
data: {"type": "tool_call", "tool": "web_search", "args": {...}}
data: {"type": "tool_result", "tool": "web_search", "content": "..."}
data: {"type": "provider_switch", "from": "gemini", "to": "groq", "reason": "quota_exceeded"}
data: {"type": "low_confidence", "confidence": 0.42, "message": "Consider rephrasing..."}
data: {"type": "done", "message_id": "...", "tokens_used": 1234}
data: {"type": "error", "code": "all_providers_unavailable", "message": "..."}
```

On disconnect: the in-progress assistant message is marked `status: "interrupted"` with whatever content was saved. No resumable streaming in v1.0.

Token validation happens at stream start; the stream is terminated immediately on an invalid/expired token mid-stream. Session ID is transported via the `X-Session-Id` header.

---

### D8: Conversation Context Assembly — Two-Layer Strategy

**Layer 1 (Rolling Summary)**: after every 20 messages (configurable), a fast cheap model (Groq `llama-3.1-8b-instant`) compresses older history into a plain-text summary stored on the conversation document. Provider-agnostic.

**Layer 2 (Per-Request Assembly)**: at request time, read `target_model.max_context_tokens` from the capability registry. Reserve budget for system prompt + RAG chunks (v1.2) + expected output. Walk backward through recent messages counting tokens via `tiktoken` until budget is exhausted. Older messages are represented by the Layer 1 summary only.

```
[system prompt] + [rolling summary, if any] + [recent raw messages, up to budget] + [current message]
```

**Rationale**: decoupling the two layers means switching providers mid-conversation only changes the cut point, never triggers re-summarization. This is the right design for a multi-provider system.

---

### D9: Web Search Tool — DuckDuckGo First

Use DuckDuckGo Search (via `duckduckgo-search` Python package) for v1.0. It requires no API keys, has no hard usage limits, and returns structured results well-suited for LLM context.

The tool is registered as a standard LangGraph tool node. Tool results are wrapped with explicit injection-defense framing before being added to the LLM context (Section 10 of system design).

---

### D10: Rate Limiting — `slowapi` Per-UID

`slowapi` with a `uid`-keyed limiter (not IP — VPNs and shared IPs make IP-based limiting unreliable for authenticated users). Default limits:
- Chat stream: 20 req/min per user
- File upload: 10 req/min per user  
- Key management: 5 req/min per user

Request size limit: reject files >50MB before any processing.

---

### D11: Observability — Structured Logging + Sentry

`structlog` configured to emit JSON logs with fields: `user_id`, `model`, `provider`, `task_category`, `latency_ms`, `tokens_used`, `event`, `level`. **Never** log message content, file content, or API keys.

Sentry SDK integrated for both FastAPI (uncaught exceptions) and LangGraph node errors. Sentry is configured to scrub headers and request bodies from error reports.

---

### D12: Deployment Target — Fly.io

Fly.io natively supports long-lived SSE connections, has a Python/Docker-based deploy workflow, and has a free tier suitable for launch. `Dockerfile` targets Python 3.12 slim, uvicorn with workers set via `WEB_CONCURRENCY` env var.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Firestore security rules have a gap on day one | Write and test rules (Section 4.5 of system design) before any other feature. Rules are the first commit. |
| AES master key rotation is complex | `key_version` field in schema from day one; rotation script designed upfront even if not needed for months |
| LangGraph graph topology is non-obvious to debug | Structured logging in every node; Sentry captures node-level errors with full `AgentState` snapshot (scrubbed of content) |
| Provider SDK breaking changes | Pin all provider SDK versions in `requirements.txt`; `pip-audit` in CI |
| SSE disconnect mid-stream loses content | Persist `text_delta` chunks to Firestore incrementally every N characters; on disconnect mark `status: "interrupted"` |
| Groq used as evaluator may rate-limit aggressively | Fallback evaluator selection from `available_providers`; eval-optimizer mode degrades to single-agent on evaluator rate-limit |
| `tiktoken` token counting is an approximation for non-OpenAI models | Hard-cap context at 80% of model's reported `max_context_tokens` to absorb approximation errors |

## Open Questions

- **DuckDuckGo Rate Limits**: Confirm that the `duckduckgo-search` package is stable under moderate concurrent use without getting IP banned.
- **Incremental SSE persistence**: determine the right N-character chunk size for Firestore writes (too small = excessive writes; too large = too much lost on disconnect)
- **`WEB_CONCURRENCY`**: determine appropriate worker count for Fly.io free tier instance size given SSE connection hold time
