## ADDED Requirements

### Requirement: Firebase ID Token Verification
The backend SHALL verify every authenticated request by validating the Firebase ID token using `firebase_admin.auth.verify_id_token()`. Requests with missing, malformed, or expired tokens SHALL be rejected with HTTP 401.

#### Scenario: Valid token accepted
- **WHEN** a request arrives with a valid, non-expired Firebase ID token in the `Authorization: Bearer` header
- **THEN** the middleware extracts `uid` and passes the request to the route handler

#### Scenario: Missing token rejected
- **WHEN** a request arrives with no `Authorization` header
- **THEN** the middleware returns HTTP 401 with `{"code": "missing_token"}`

#### Scenario: Expired token rejected
- **WHEN** a request arrives with a Firebase ID token whose expiry has passed
- **THEN** the middleware returns HTTP 401 with `{"code": "expired_token"}`

#### Scenario: Invalid token rejected
- **WHEN** a request arrives with a token that fails cryptographic verification
- **THEN** the middleware returns HTTP 401 with `{"code": "invalid_token"}`

---

### Requirement: 30-Day Session Tracking
The system SHALL maintain a session document in Firestore at `users/{uid}/sessions/{session_id}` with fields `{device_info, created_at, expires_at, last_active, refresh_token_hash}`. A session SHALL expire 30 days after creation (`expires_at = created_at + 30d`). Once a user logs in or signs in, they SHALL NOT need to log in again for 30 days. Every authenticated request SHALL check that the session document exists and `expires_at` is in the future.

#### Scenario: Active session allowed without re-login
- **WHEN** a request carries a valid Firebase token AND the corresponding session document exists with `expires_at` in the future
- **THEN** the request proceeds normally and the user is not prompted to log in again

#### Scenario: Expired session rejected
- **WHEN** a request carries a valid Firebase token BUT the session document has `expires_at` in the past
- **THEN** the middleware returns HTTP 401 with `{"code": "session_expired"}` even though the Firebase token itself is still cryptographically valid

#### Scenario: Deleted session rejected
- **WHEN** a request carries a valid Firebase token BUT no session document exists for `session_id`
- **THEN** the middleware returns HTTP 401 with `{"code": "session_not_found"}`

---

### Requirement: Session Creation on Login
The system SHALL create a session document when a user successfully authenticates via `POST /api/v1/auth/session`. The endpoint SHALL accept an ID token, verify it, upsert the user document at `users/{uid}`, and create a new session document. The response SHALL include `session_id`.

#### Scenario: New user first login
- **WHEN** `POST /api/v1/auth/session` is called with a valid ID token for a uid that has no Firestore user document
- **THEN** a user document is created at `users/{uid}` with `{email, display_name, created_at, plan: "free", api_keys: {}}` and a session document is created; HTTP 200 with `session_id` is returned

#### Scenario: Returning user login
- **WHEN** `POST /api/v1/auth/session` is called with a valid ID token for an existing uid
- **THEN** the user document is updated (upserted) and a new session document is created; existing sessions are unaffected

---

### Requirement: Multi-Device Session Support
The system SHALL support multiple simultaneous active sessions per user. Each session SHALL have an independent 30-day expiry window. A user with sessions from laptop, desktop, and CLI simultaneously SHALL be able to use all of them without interference.

#### Scenario: Two active sessions on different devices
- **WHEN** a user is logged in on both a browser and a second device simultaneously with different `session_id` values
- **THEN** requests from both sessions are accepted independently

---

### Requirement: Logout — Single Device
The `POST /api/v1/auth/logout` endpoint SHALL delete the session document for the requesting `session_id`. The underlying Firebase refresh token SHALL remain valid at the Firebase level, but subsequent requests with that `session_id` SHALL be rejected by the middleware.

#### Scenario: Logout clears session
- **WHEN** `POST /api/v1/auth/logout` is called with a valid session
- **THEN** the session document is deleted; subsequent requests with that `session_id` return HTTP 401

---

### Requirement: Logout — All Devices
The `POST /api/v1/auth/logout-all` endpoint SHALL delete ALL session documents for the authenticated user's `uid` AND call `firebase_admin.auth.revoke_refresh_tokens(uid)` to invalidate Firebase-level tokens.

#### Scenario: Logout all invalidates every session
- **WHEN** `POST /api/v1/auth/logout-all` is called
- **THEN** all session documents for that uid are deleted, refresh tokens are revoked, and all devices are locked out on their next request

---

### Requirement: Firestore Security Rules
The Firestore security rules SHALL enforce that users can only read/write their own `users/{uid}/**` subtree. The `device_codes/{code}` collection SHALL be inaccessible to all client-SDK access (only the Admin SDK bypass is allowed). A default-deny rule SHALL cover all other documents.

#### Scenario: User cannot access another user's data
- **WHEN** a Firestore client-SDK request attempts to read `users/{other_uid}/api_keys/gemini`
- **THEN** Firestore rejects the request with a permission error

#### Scenario: Device codes are not client-accessible
- **WHEN** a Firestore client-SDK request attempts to read any document in `device_codes/`
- **THEN** Firestore rejects the request with a permission error
