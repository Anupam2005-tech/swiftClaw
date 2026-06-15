## ADDED Requirements

### Requirement: AgentState TypedDict
The system SHALL define `AgentState` as a `TypedDict` with fields: `messages`, `task`, `output`, `evaluation`, `retries`, `max_retries`, `critique`, `provider_generator`, `provider_evaluator`, `session_id`, `user_id`, `complexity`, `task_category`, `available_providers`, `model_preferences`. The `max_retries` field SHALL default to `3` and SHALL always be present in the state.

`complexity` and `task_category` are distinct fields representing different taxonomies:
- `complexity: Literal["simple", "medium", "complex"]` — output of the complexity scorer, used for orchestration-mode selection.
- `task_category: Literal["chat", "web_search", "file_analysis", "image_analysis", "image_generation", "video_analysis", "video_generation"]` — used for `model_preferences` lookup.

#### Scenario: State initialized with correct defaults
- **WHEN** a new agent run is initialized
- **THEN** `AgentState.max_retries` is set to `3`, `retries` is `0`, `available_providers` is populated from the user's vault, and `task_category` is set per the deterministic rule in "Per-Task Model Preferences" below

---

### Requirement: Fixed LangGraph Topology
The system SHALL implement a `StateGraph` with nodes: `complexity_scorer`, `router`, `generator`, `evaluator`, `output_router`. Conditional edges SHALL route based on `state.available_providers` count and `state.evaluation.pass`. The topology (nodes and edge definitions) SHALL NOT change based on orchestration mode — only which path is taken changes.

The **evaluator node SHALL always execute and always produce `{pass, confidence, critique}`**, regardless of `state.available_providers` count. There is no "no-op passthrough" variant of the evaluator node.

#### Scenario: Graph compiled at startup
- **WHEN** the FastAPI application starts
- **THEN** the compiled `StateGraph` is available as a module-level singleton (no re-compilation per request)

#### Scenario: Single-provider path routes through self-eval
- **WHEN** `state.available_providers` has exactly one entry
- **THEN** the `evaluator` node calls that same provider using a distinct self-evaluation system prompt and produces `{pass, confidence, critique}`; `provider_evaluator` is identical to `provider_generator`

#### Scenario: Two-provider path uses independent evaluator
- **WHEN** `state.available_providers` has two or more entries
- **THEN** the `evaluator` node uses a different provider from `provider_generator`; it sees only the task and the generator's output, not the generator's reasoning trace

---

### Requirement: Hard Retry Cap
The system SHALL enforce that the generator-evaluator retry loop NEVER executes more than `state.max_retries` times. When `state.retries >= state.max_retries`, the output_router SHALL route to the output node with the best available attempt, attaching a `low_confidence` metadata event. The system SHALL never silently fail or loop indefinitely.

#### Scenario: Max retries exhausted yields best attempt
- **WHEN** the evaluator marks `pass: false` and `state.retries` reaches `state.max_retries`
- **THEN** the output node receives the best available output and emits a `{"type": "low_confidence", "confidence": ..., "message": "..."}` SSE event before the final text

#### Scenario: Successful evaluation stops loop early
- **WHEN** the evaluator marks `pass: true` on the first attempt
- **THEN** the output node is reached immediately without further retries

---

### Requirement: Complexity Scoring
The system SHALL use a fast, cheap model (Groq `llama-3.1-8b-instant`) to classify each incoming task as `simple | medium | complex`. This score SHALL be stored in `state.complexity` and used by the router node to determine `orchestration_mode`.

#### Scenario: Simple task classified correctly
- **WHEN** a user sends "What is 2+2?"
- **THEN** the complexity scorer returns `"simple"` within 2 seconds, stored in `state.complexity`

#### Scenario: Complexity scorer failure falls back to "medium"
- **WHEN** the complexity scoring provider is unavailable
- **THEN** `state.complexity` defaults to `"medium"` and processing continues

---

### Requirement: Per-Task Model Preferences
The system SHALL read the user's `model_preferences` document from Firestore at the start of each request. The `router` node SHALL use `model_preferences.{task_category}` to select `state.provider_generator`. If no preference is set for a category, the router SHALL default to the first available provider with required capabilities.

For v1.0, `state.task_category` SHALL be derived **deterministically from the request shape**, without an LLM classification step:
- If the request includes one or more files → `task_category = "file_analysis"`
- Otherwise → `task_category = "chat"`

The categories `image_analysis`, `image_generation`, `video_analysis`, and `video_generation` exist in the `model_preferences` schema (for forward compatibility with v1.3/v1.4) but are **unreachable** in v1.0 — no request in v1.0 can produce these values for `task_category`.

`model_preferences.web_search` SHALL be used to select the model that processes and summarizes `web_search` tool results when the agent invokes that tool mid-conversation. It SHALL NOT be used to select `provider_generator` for the initial turn — `web_search` is a tool the agent may call during a `"chat"`-category turn, not a separate primary task category for v1.0.

#### Scenario: Preference routes to correct provider
- **WHEN** a user has `model_preferences.chat = "gemini-2.0-flash"` and sends a chat message with no attached files
- **THEN** `task_category` is set to `"chat"` and `state.provider_generator` is set to `"gemini"` with model `"gemini-2.0-flash"`

#### Scenario: File analysis routes via task_category
- **WHEN** a user sends a chat message with one or more attached files
- **THEN** `task_category` is set to `"file_analysis"` and `state.provider_generator` is selected from `model_preferences.file_analysis` (or the first capable provider if unset)

#### Scenario: Missing preference falls back to first capable provider
- **WHEN** `model_preferences.file_analysis` is `null` and the user attaches a file
- **THEN** the first provider in `available_providers` that `supports_vision` (for images) or has no special capability requirement (for text documents) is selected

---

### Requirement: Automatic Provider Fallback
When a `ModelAdapter.stream()` call raises `ProviderError` with `retryable=True`, the system SHALL select the next available provider from `state.available_providers`, emit a `{"type": "provider_switch", "from": "...", "to": "...", "reason": "..."}` SSE event, and retry generation with the new provider. If no fallback is available, the system SHALL emit `{"type": "error", "code": "all_providers_unavailable", "message": "..."}`.

#### Scenario: Fallback on rate limit
- **WHEN** the generator raises `ProviderError(code="rate_limited", retryable=True)` and a second provider is available
- **THEN** a `provider_switch` SSE event is emitted and generation continues with the second provider

#### Scenario: All providers exhausted
- **WHEN** all providers in `available_providers` have been tried and all return retryable errors
- **THEN** an `all_providers_unavailable` error SSE event is emitted and the stream ends

---

### Requirement: Available Providers Loaded from Vault
The system SHALL populate `state.available_providers` at the start of each request by reading which provider keys exist in the user's vault (Firestore `users/{uid}/api_keys/*`). Only providers with `validated: true` keys SHALL be included.

#### Scenario: Only validated keys are available
- **WHEN** a user has a validated Gemini key and an invalidated OpenAI key (failed validation at time of entry)
- **THEN** `state.available_providers` contains only `["gemini"]`
