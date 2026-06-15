## ADDED Requirements

### Requirement: SSE Streaming Chat Endpoint
The system SHALL expose `POST /api/v1/chat/stream` accepting `multipart/form-data` with fields `conversation_id` (string), `message` (string), and zero or more `files` (binary attachments). The response SHALL use `Content-Type: text/event-stream` and stream SSE events. The endpoint SHALL require authentication (Firebase token + valid session, transported per the "Session Transport" requirement below).

Any files included in the request SHALL be processed in-memory for the duration of that single request only, per the "In-Memory File Processing" requirement, and injected into the model context for that turn. Files SHALL NOT be referenceable in later requests via a separate identifier in v1.0.

#### Scenario: Successful chat stream with no files
- **WHEN** an authenticated user POSTs to `/api/v1/chat/stream` with a valid `conversation_id` and `message`, no files attached
- **THEN** the server streams SSE events (`text_delta`, `tool_call`, `tool_result`, `done`) and closes the stream on completion

#### Scenario: Successful chat stream with an attached file
- **WHEN** an authenticated user POSTs to `/api/v1/chat/stream` with a `conversation_id`, `message`, and one attached PDF
- **THEN** the file is processed in-memory, its extracted text is injected into the model context for this turn alongside the message, and the response streams normally; the file is discarded after the request completes

#### Scenario: Unauthenticated request rejected before streaming
- **WHEN** a request without a valid auth token and session hits `/api/v1/chat/stream`
- **THEN** HTTP 401 is returned before any SSE stream is opened

#### Scenario: Token expires mid-stream
- **WHEN** a Firebase token expires while an SSE stream is active
- **THEN** the server closes the stream and emits `{"type": "error", "code": "token_expired"}` as the last event

---

### Requirement: SSE Event Types
The system SHALL emit the following SSE event types on the chat stream:
- `{"type": "text_delta", "content": "..."}` — incremental text from the model
- `{"type": "tool_call", "tool": "...", "args": {...}}` — agent invoking a tool
- `{"type": "tool_result", "tool": "...", "content": "..."}` — tool execution result
- `{"type": "provider_switch", "from": "...", "to": "...", "reason": "..."}` — automatic provider fallback
- `{"type": "low_confidence", "confidence": 0.42, "message": "..."}` — retry cap reached, best attempt returned
- `{"type": "done", "message_id": "...", "tokens_used": 1234}` — stream complete
- `{"type": "error", "code": "...", "message": "..."}` — terminal error

#### Scenario: All standard events emitted in correct order
- **WHEN** the agent calls a web search tool and generates a response
- **THEN** the stream emits `tool_call` → `tool_result` → `text_delta` (one or more) → `done` in that order

---

### Requirement: In-Progress Message Persistence
The system SHALL persist the in-progress assistant message to Firestore incrementally while streaming. The message document SHALL have `status: "streaming"` during generation and `status: "done"` on successful completion. On client disconnect, the message status SHALL be updated to `status: "interrupted"` with whatever content had been accumulated.

#### Scenario: Stream completes successfully
- **WHEN** the full SSE stream completes with a `done` event
- **THEN** the Firestore message document has `status: "done"` and `content` contains the full assistant response

#### Scenario: Client disconnects mid-stream
- **WHEN** the client disconnects before the `done` event is emitted
- **THEN** the Firestore message document is updated to `status: "interrupted"` with whatever `content` was saved up to the disconnect point

---

### Requirement: Stop Stream
The system SHALL expose `POST /api/v1/chat/stop` accepting `{conversation_id}` to allow a client to signal that the current stream should be terminated. The current agent run for that conversation SHALL be cancelled and the in-progress message marked `status: "interrupted"`.

#### Scenario: Stop cancels active stream
- **WHEN** an authenticated user POSTs to `/api/v1/chat/stop` while a stream is active for their conversation
- **THEN** the stream is terminated within 500ms and the message is marked `status: "interrupted"`

---

### Requirement: Session Transport
The system SHALL return `session_id` in the JSON response body of `POST /api/v1/auth/session`. Clients SHALL include this value on every subsequent authenticated request via a custom header: `X-Session-Id: {session_id}`.

`session_id` SHALL NOT be transported via a Firebase custom claim (claim propagation requires a token refresh, introducing up to ~1 hour of delay before a freshly-created session would be recognized) and SHALL NOT be transported via a cookie.

#### Scenario: Session ID returned on login
- **WHEN** `POST /api/v1/auth/session` succeeds
- **THEN** the JSON response includes `session_id`, and the client stores it for use on subsequent requests

#### Scenario: Session ID required on authenticated requests
- **WHEN** an authenticated request is missing the `X-Session-Id` header
- **THEN** the middleware returns HTTP 401 with `{"code": "session_not_found"}`
