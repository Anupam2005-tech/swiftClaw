## ADDED Requirements

### Requirement: Master Key from Secret Manager
The system SHALL load a 256-bit AES master encryption key from Google Cloud Secret Manager at FastAPI startup. The key SHALL be cached in memory for the process lifetime. It SHALL never be written to disk, logs, or environment variables.

#### Scenario: Startup loads master key
- **WHEN** the FastAPI application starts
- **THEN** the master key is fetched from Secret Manager and stored in a module-level in-memory variable; the application is ready to serve requests

#### Scenario: Secret Manager unavailable at startup
- **WHEN** Secret Manager is unreachable during startup
- **THEN** the application fails to start and logs a structured error with `event: "master_key_load_failed"`

---

### Requirement: API Key Encryption (AES-256-GCM)
The system SHALL encrypt each user-provided provider API key using AES-256-GCM with a unique 12-byte random nonce per encryption operation. The stored document at `users/{uid}/api_keys/{provider}` SHALL contain only `{ciphertext_b64, nonce_b64, added_at, last_used, validated, key_version}`. No raw key field SHALL exist in this schema.

#### Scenario: Key stored encrypted
- **WHEN** a user submits a raw API key via `POST /api/v1/keys/{provider}`
- **THEN** the key is encrypted in memory with a fresh nonce, the ciphertext is written to Firestore, and the raw key is discarded immediately (never written to disk or logs)

#### Scenario: Raw key never in Firestore
- **WHEN** the Firestore document `users/{uid}/api_keys/{provider}` is read
- **THEN** it contains only `ciphertext_b64`, `nonce_b64`, and metadata — no plaintext key field

---

### Requirement: Key Validation Before Storage
The system SHALL validate a user-provided API key by making a cheap real API call (e.g., list models) to the provider before encrypting and storing it. Keys that fail validation SHALL be rejected with an informative error. Only validated keys SHALL be stored.

#### Scenario: Valid key accepted and stored
- **WHEN** a user submits a valid, quota-bearing Gemini API key
- **THEN** the system validates it against the Gemini API, encrypts it, stores it in Firestore with `validated: true`, and returns HTTP 201

#### Scenario: Invalid key rejected
- **WHEN** a user submits an expired or wrong-project API key
- **THEN** the system returns HTTP 422 with `{"code": "key_invalid", "provider": "gemini"}` and nothing is stored

#### Scenario: Zero-quota key rejected
- **WHEN** a user submits an API key that passes authentication but has no remaining quota
- **THEN** the system returns HTTP 422 with `{"code": "key_no_quota", "provider": "gemini"}` and nothing is stored

---

### Requirement: Key Decryption at Inference Time
The system SHALL decrypt a user's provider API key in memory only at inference time. The decrypted key SHALL be used to instantiate the provider SDK client for that request and SHALL be discarded when the request completes. It SHALL never be written to disk, logs, or returned in any API response.

#### Scenario: Decrypted key used for provider call
- **WHEN** an agent request requires the Groq provider for a user with a Groq key stored in the vault
- **THEN** the key is decrypted in memory, passed to `ChatGroq(api_key=...)`, the API call is made, and the decrypted key is garbage-collected after the call

---

### Requirement: Key Listing
`GET /api/v1/keys` SHALL return a list of stored provider keys showing `{provider, added_at, last_used, validated}`. The raw or decrypted key value SHALL never be returned.

#### Scenario: List keys returns metadata only
- **WHEN** a user calls `GET /api/v1/keys`
- **THEN** the response contains provider names and metadata; no ciphertext or plaintext key values are present

---

### Requirement: Key Removal
`DELETE /api/v1/keys/{provider}` SHALL delete the Firestore document for that provider key. After deletion, that provider SHALL no longer be available for orchestration for that user.

#### Scenario: Removed key no longer used
- **WHEN** a user deletes their Groq key and then initiates a chat
- **THEN** Groq is not in `state.available_providers` for that chat request

---

### Requirement: key_version Field for Rotation Support
Every stored key document SHALL include a `key_version: int` field (default `1`). This field enables future master key rotation by tracking which version of the master key was used to encrypt the stored ciphertext.

#### Scenario: New key has key_version=1
- **WHEN** a key is first stored
- **THEN** its Firestore document contains `key_version: 1`
