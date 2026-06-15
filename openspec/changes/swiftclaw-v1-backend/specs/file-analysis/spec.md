## REMOVED Requirements

### Requirement: File Upload Endpoint
**Reason**: Superseded by the modified "SSE Streaming Chat Endpoint" requirement, which accepts files inline via `multipart/form-data` in the same request as the chat message. The standalone `POST /api/v1/files/upload` endpoint and its returned `file_id` are not part of v1.0.
**Migration**: The file-type allowlist (PDF, PNG, JPEG, WEBP, GIF, DOCX, TXT, CSV, MD), the 50MB size limit, the in-memory-only processing constraint, and the no-file-logging constraint all carry forward unchanged — they now apply to files attached directly to `POST /api/v1/chat/stream` instead of to a separate upload endpoint. A persistent, cross-message `file_id` model returns in v1.2 alongside the RAG pipeline.

## ADDED Requirements

---

### Requirement: In-Memory File Processing
Attached files SHALL be processed entirely in memory. File content SHALL NOT be written to disk on the backend server. After the single request completes, the in-memory buffer SHALL be discarded.

#### Scenario: File content never written to disk
- **WHEN** a file is attached to a chat stream request and processed
- **THEN** no temporary file is created on the server filesystem; the file is held in memory only

---

### Requirement: File Injected into Model Context
When a `chat/stream` request includes attached files, the system SHALL retrieve the in-memory file content, extract text (for PDFs/docs) or pass raw bytes (for images), and inject the content into the model context window. For image files, the content SHALL be passed as a vision-compatible message part if `provider_capabilities.supports_vision` is true.

#### Scenario: PDF text injected into context
- **WHEN** a user sends a message with an attached PDF file
- **THEN** the text extracted from the PDF is included in the messages array as a user content block before the user's message

#### Scenario: Image passed as vision part
- **WHEN** a user sends a message with an attached PNG and the selected provider supports vision
- **THEN** the image is included as a vision-compatible message part (base64 encoded) in the messages array

#### Scenario: Image with non-vision provider falls back gracefully
- **WHEN** a user sends a message with an attached image and the selected provider does NOT support vision
- **THEN** the system returns an error `{"code": "capability_not_supported", "detail": "Selected provider does not support image input"}` before starting the stream

---

### Requirement: No File Logging
File content, filenames, and file metadata SHALL NOT appear in structured logs or error reports. Only `file_id`, `mime_type`, and `size_bytes` are permissible metadata fields in logs.

#### Scenario: File content absent from logs
- **WHEN** a file is processed and a log event is emitted
- **THEN** the log entry contains only `file_id`, `mime_type`, `size_bytes` — never file content or filename in any form
