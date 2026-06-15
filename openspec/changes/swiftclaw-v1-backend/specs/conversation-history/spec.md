## ADDED Requirements

### Requirement: Conversation Document Schema
The system SHALL store each conversation as a Firestore document at `users/{uid}/conversations/{conversation_id}` with fields: `{id, title, created_at, updated_at, summary, message_count, last_message_preview}`. Messages SHALL be stored in a subcollection `messages/{message_id}` with fields: `{id, role, content, status, created_at, tokens_used, provider, model}`. `status` SHALL be one of `"done" | "streaming" | "interrupted"`.

#### Scenario: New conversation document created
- **WHEN** a user sends their first message to a new conversation
- **THEN** a conversation document is created with `message_count: 1`, `title` auto-generated from the first message (first 60 chars), and `created_at` set to now

#### Scenario: Message status transitions correctly
- **WHEN** an assistant message stream completes successfully
- **THEN** the message document transitions from `status: "streaming"` to `status: "done"` and `content` contains the full response

---

### Requirement: Conversation List API
`GET /api/v1/conversations` SHALL return a paginated list of the authenticated user's conversations, ordered by `updated_at` descending. Each item SHALL include `{id, title, created_at, updated_at, last_message_preview}`. The endpoint SHALL support `limit` (default 20, max 50) and `cursor` query parameters for cursor-based pagination.

#### Scenario: User retrieves conversation list
- **WHEN** an authenticated user calls `GET /api/v1/conversations`
- **THEN** the response contains up to 20 conversations ordered by most recently updated, with a `next_cursor` field if more exist

---

### Requirement: Conversation History API
`GET /api/v1/conversations/{conversation_id}/messages` SHALL return the full message history for a conversation. Only the authenticated user who owns the conversation SHALL be able to access it. The endpoint SHALL return messages ordered by `created_at` ascending with `limit` and `cursor` pagination.

#### Scenario: Owner retrieves message history
- **WHEN** an authenticated user calls `GET /api/v1/conversations/{their_conversation_id}/messages`
- **THEN** messages are returned in chronological order

#### Scenario: Another user cannot access the conversation
- **WHEN** a different authenticated user attempts to access another user's `conversation_id`
- **THEN** HTTP 403 is returned

---

### Requirement: Resumable Conversations
The system SHALL allow a user to resume an existing conversation by sending a new message referencing an existing `conversation_id` via `POST /api/v1/chat/stream`. The conversation context (history + rolling summary) SHALL be loaded and assembled for the new request.

#### Scenario: Resume conversation with prior history
- **WHEN** a user POSTs to `/chat/stream` with an existing `conversation_id`
- **THEN** prior messages are included in the assembled context (up to the model's token budget) and the agent responds with awareness of the conversation history

---

### Requirement: Rolling Summary Generation
After every 20 new messages in a conversation (configurable via `SUMMARY_EVERY_N_MESSAGES` env var), the system SHALL invoke a fast model (Groq `llama-3.1-8b-instant`) to compress older messages into a plain-text summary and update the `summary` field on the conversation document. The summary SHALL be provider-agnostic.

#### Scenario: Summary generated at threshold
- **WHEN** a conversation accumulates 20 messages since the last summary
- **THEN** the older messages are passed to the summarizer model and the `summary` field on the conversation document is updated

#### Scenario: Summary generation failure is non-fatal
- **WHEN** the summarizer model is unavailable during a request
- **THEN** summarization is skipped for that request; the conversation proceeds without an updated summary and no error is returned to the user

---

### Requirement: Per-Request Context Assembly
At the start of each chat request, the system SHALL assemble the LLM message list using the two-layer strategy: `[system prompt] + [rolling summary if older messages excluded] + [recent raw messages up to token budget] + [current message]`. The token budget SHALL be `target_model.max_context_tokens * 0.80` minus the system prompt token count.

#### Scenario: Context fits within budget
- **WHEN** the full conversation history fits within 80% of the model's context window
- **THEN** all messages are included verbatim with no summary prefix

#### Scenario: Context exceeds budget — summary used
- **WHEN** the conversation history exceeds the token budget
- **THEN** only the most recent messages that fit are included; the `summary` field is prepended as a context block

---

### Requirement: Conversation Deletion
`DELETE /api/v1/conversations/{conversation_id}` SHALL delete the conversation document and all messages in its `messages` subcollection. Only the owning user SHALL be able to delete their conversations.

#### Scenario: Owner deletes conversation
- **WHEN** an authenticated user calls `DELETE /api/v1/conversations/{their_conversation_id}`
- **THEN** the conversation document and all its messages are deleted; the endpoint returns HTTP 204
