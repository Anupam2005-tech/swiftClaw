## ADDED Requirements

### Requirement: Onboarding Status Check
The system SHALL expose `GET /api/v1/onboarding/status` returning the authenticated user's onboarding completion state: `{has_key: bool, keys_count: int, preferences_set: bool, onboarding_complete: bool}`. `onboarding_complete` is `true` when `has_key == true` and `preferences_set == true`.

#### Scenario: New user has incomplete onboarding
- **WHEN** a newly registered user calls `GET /api/v1/onboarding/status`
- **THEN** the response is `{"has_key": false, "keys_count": 0, "preferences_set": false, "onboarding_complete": false}`

#### Scenario: User with key and preferences is complete
- **WHEN** a user with at least one validated key and a `model_preferences` document calls `GET /api/v1/onboarding/status`
- **THEN** the response is `{"has_key": true, "keys_count": 1, "preferences_set": true, "onboarding_complete": true}`

---

### Requirement: Live Key Validation Endpoint
The system SHALL expose `POST /api/v1/onboarding/validate-key` accepting `{provider: str, api_key: str}`. The endpoint SHALL perform a cheap real API call to the provider to confirm the key is valid and has quota, returning `{valid: bool, error: str | null}` without storing the key. This is used by the onboarding wizard for immediate feedback before the user submits to the vault.

#### Scenario: Valid key returns success
- **WHEN** a user submits a valid Gemini key to `/onboarding/validate-key`
- **THEN** the response is `{"valid": true, "error": null}`

#### Scenario: Invalid key returns failure reason
- **WHEN** a user submits an invalid key
- **THEN** the response is `{"valid": false, "error": "key_invalid"}`

#### Scenario: Rate-limited key reports error
- **WHEN** a user submits a key that authenticates but has no quota
- **THEN** the response is `{"valid": false, "error": "key_no_quota"}`

---

### Requirement: Default Model Preferences Population
The system SHALL expose `POST /api/v1/onboarding/set-preferences` which reads the user's currently validated provider keys, consults the capability registry, and writes a `model_preferences` document to Firestore at `users/{uid}/model_preferences` with sensible defaults. Defaults SHALL prefer specialist providers for relevant task categories (e.g., Perplexity for `web_search` if available).

#### Scenario: Preferences set with Gemini and Perplexity keys
- **WHEN** a user with validated Gemini and Perplexity keys calls `POST /api/v1/onboarding/set-preferences`
- **THEN** `model_preferences.web_search` is set to a Perplexity model and `model_preferences.chat` is set to a Gemini model

#### Scenario: Single-provider user gets all preferences set to that provider
- **WHEN** a user with only a Groq key calls `POST /api/v1/onboarding/set-preferences`
- **THEN** all task categories in `model_preferences` are set to a Groq model (or `null` for capabilities Groq doesn't support like image/video generation)

---

### Requirement: Chat Blocked Until Onboarding Complete
The system SHALL reject `POST /api/v1/chat/stream` requests from users whose `onboarding_complete` is `false`, returning HTTP 403 with `{"code": "onboarding_required", "message": "Complete setup to start chatting."}`.

#### Scenario: Unonboarded user blocked from chat
- **WHEN** an authenticated user with no API keys POSTs to `/chat/stream`
- **THEN** HTTP 403 is returned with `code: "onboarding_required"` before any LangGraph execution begins

#### Scenario: Onboarded user can chat
- **WHEN** an authenticated user with `onboarding_complete: true` POSTs to `/chat/stream`
- **THEN** the request proceeds normally to the agent graph
