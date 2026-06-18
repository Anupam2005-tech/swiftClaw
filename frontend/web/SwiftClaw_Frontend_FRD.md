# SwiftClaw Frontend — Functional Requirements Document (FRD)

Companion to the PRD. Covers folder structure, routing, screen-by-screen functional specs, component inventory, and the mock data layer that stands in for the backend until v1.4 integration.

---

## 1. Tech Stack & Architecture

- **Framework**: Next.js (App Router), TypeScript
- **Styling**: Tailwind CSS, extending the existing landing page's design tokens
- **State**: React state/context for UI state; no external state library needed at this scope
- **Data layer**: a single abstraction (`lib/api/client.ts`) that every screen calls through. For this release, `client.ts` is implemented entirely by `lib/mock/*`. Integration later means swapping the *implementation* of `client.ts` to make real HTTP/SSE calls — **no component changes required** if the function signatures match.
- **Streaming**: a `MockEventSource`-style async generator that yields the same SSE event shapes the real backend will emit (Section 7).

## 2. Folder Structure
only add new files which are not pressent and if any file with the name is present then dont create new file and use the existing file .maintain the same universal theme for this also.

```
frontend/
├── app/
│   ├── layout.tsx                       # root layout (theme, fonts, providers)
│   ├── globals.css
│   ├── page.tsx                         # existing landing page (marketing)
│   │
│   ├── (auth)/
│   │   ├── layout.tsx                   # minimal layout, no sidebar
│   │   └── login/
│   │       └── page.tsx                 # /login
│   │
│   └── (app)/
│       ├── layout.tsx                   # authenticated shell: sidebar + topbar
│       │
│       ├── onboarding/
│       │   └── page.tsx                 # /onboarding
│       │
│       ├── chat/
│       │   ├── page.tsx                 # /chat (new/empty conversation)
│       │   └── [conversationId]/
│       │       └── page.tsx             # /chat/[conversationId]
│       │
│       └── settings/
│           ├── layout.tsx               # settings sub-nav layout
│           ├── page.tsx                 # /settings -> redirects to api-keys
│           ├── api-keys/
│           │   └── page.tsx             # /settings/api-keys
│           ├── model-preferences/
│           │   └── page.tsx             # /settings/model-preferences
│           ├── integrations/
│           │   └── page.tsx             # /settings/integrations  (v1.1)
│           ├── sessions/
│           │   └── page.tsx             # /settings/sessions
│           └── usage/
│               └── page.tsx             # /settings/usage (optional, v1.0 polish)
│
├── components/
│   ├── ui/                              # shared primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Toast.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Tabs.tsx
│   │
│   ├── auth/
│   │   ├── LoginCard.tsx
│   │   └── ProviderSignInButtons.tsx    # Google / GitHub / email
│   │
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx         # step controller
│   │   ├── WelcomeStep.tsx
│   │   ├── ProviderSelectionStep.tsx
│   │   ├── KeyEntryStep.tsx
│   │   ├── TaskModelMappingStep.tsx
│   │   └── ProviderCard.tsx
│   │
│   ├── sidebar/
│   │   ├── AppSidebar.tsx
│   │   ├── ConversationList.tsx
│   │   ├── ConversationListItem.tsx
│   │   └── NewChatButton.tsx
│   │
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── InputModeToggle.tsx          # Chat / Image / Video (v1.3/v1.4)
│   │   ├── FileAttachmentChip.tsx
│   │   ├── FileAttachmentPreview.tsx
│   │   ├── ToolCallIndicator.tsx        # v1.1
│   │   ├── SourcesPanel.tsx             # v1.2
│   │   ├── ProviderSwitchToast.tsx
│   │   ├── LowConfidenceBanner.tsx
│   │   ├── StopGenerationButton.tsx
│   │   ├── RegenerateButton.tsx
│   │   ├── ImageMessage.tsx             # v1.3
│   │   └── VideoJobCard.tsx             # v1.4
│   │
│   └── settings/
│       ├── SettingsNav.tsx
│       ├── ApiKeyList.tsx
│       ├── ApiKeyForm.tsx
│       ├── ModelPreferencesTable.tsx
│       ├── IntegrationsGrid.tsx         # v1.1
│       ├── IntegrationCard.tsx          # v1.1
│       ├── ActiveSessionsList.tsx
│       └── UsageSummary.tsx             # optional
│
├── lib/
│   ├── api/
│   │   └── client.ts                    # single data-access abstraction
│   │
│   ├── mock/
│   │   ├── mockAuth.ts
│   │   ├── mockOnboarding.ts
│   │   ├── mockConversations.ts
│   │   ├── mockChatStream.ts            # mock SSE generator
│   │   ├── mockKeys.ts
│   │   ├── mockIntegrations.ts          # v1.1
│   │   ├── mockMediaJobs.ts             # v1.4
│   │   └── fixtures/                    # static sample data (JSON/TS)
│   │
│   ├── types/
│   │   ├── agent.ts                     # SSE event types, AgentState-derived types
│   │   ├── conversation.ts
│   │   ├── provider.ts
│   │   ├── user.ts
│   │   └── integration.ts               # v1.1
│   │
│   └── hooks/
│       ├── useAuth.ts
│       ├── useOnboardingStatus.ts
│       ├── useConversations.ts
│       ├── useChatStream.ts
│       ├── useApiKeys.ts
│       ├── useModelPreferences.ts
│       ├── useIntegrations.ts           # v1.1
│       └── useMediaJob.ts               # v1.4
│
└── public/
    └── ... (existing landing page assets)
```

## 3. Routing Table

| Route | Auth required | Purpose |
|---|---|---|
| `/` | No | Existing landing page (unchanged, add Sign In / Get Started CTAs) |
| `/login` | No | Sign-in screen (mocked provider buttons) |
| `/onboarding` | Yes (post-login, pre-`onboarding_complete`) | 5-step setup wizard |
| `/chat` | Yes | New/empty conversation |
| `/chat/[conversationId]` | Yes | Existing conversation, resumable |
| `/settings` | Yes | Redirects to `/settings/api-keys` |
| `/settings/api-keys` | Yes | API key vault management |
| `/settings/model-preferences` | Yes | Per-task model mapping |
| `/settings/integrations` | Yes | MCP connections (v1.1) |
| `/settings/sessions` | Yes | Active devices, 30-day sessions, logout-all |
| `/settings/usage` | Yes | Per-provider usage summary (optional v1.0 polish) |

**Routing logic**: `(app)/layout.tsx` checks mock auth state. If unauthenticated → redirect to `/login`. If authenticated but `onboarding_complete: false` → redirect to `/onboarding` (mirrors the backend's "chat blocked until onboarding complete" requirement). If authenticated and onboarded → render normally.

---

## 4. Screen-by-Screen Functional Specs

### 4.1 `/login`

- `LoginCard` with `ProviderSignInButtons` (Google, GitHub, Email — all call `mockAuth.signIn(provider)`).
- On success, `mockAuth` returns a fake `{uid, session_id, onboarding_complete}`. Routing logic (above) sends new users to `/onboarding`, returning users to `/chat`.
- States: default, loading (button shows spinner), error (mock can simulate a failed sign-in to test the error toast).

### 4.2 `/onboarding` — 5-Step Wizard

Driven by `OnboardingWizard.tsx`, which manages step index and collected state, persisted to `mockOnboarding` between steps.

1. **WelcomeStep** — static copy, "Get Started" button.
2. **ProviderSelectionStep** — `ProviderCard` grid for Gemini, Claude, OpenAI, Groq, Perplexity, OpenRouter, NVIDIA. Multi-select. Each card shows name, one-line description, and a link to that provider's key page. At least one selection required to proceed.
3. **KeyEntryStep** — for each selected provider, a masked `Input` + "Validate" button calling `mockOnboarding.validateKey(provider, key)`. Returns `{valid, error}` per the backend contract. Valid keys show a green check; invalid show the error reason inline. "Continue" disabled until at least one key is validated.
4. **TaskModelMappingStep** — `ModelPreferencesTable` pre-populated via `mockOnboarding.setPreferences()` defaults (specialist providers preferred per capability — e.g., Perplexity for `web_search` if present). Editable dropdowns per task category (`chat`, `web_search`, `file_analysis`; `image_analysis`/`image_generation`/`video_analysis`/`video_generation` shown but only enabled if a capable provider was added — ties into v1.3/v1.4 readiness even though those backends don't exist yet).
5. **Done** — confirmation, redirects to `/chat`.

No skip option on any step; matches the "no trial experience" decision.

### 4.3 `/chat` and `/chat/[conversationId]`

**Layout**: `AppSidebar` (left, `ConversationList` + `NewChatButton`) + `ChatWindow` (main area: `MessageList` + `MessageInput`).

**`ConversationList`**: populated via `mockConversations.list()` — paginated, ordered by `updated_at` descending, each item shows `title`, `last_message_preview`, relative timestamp. Clicking navigates to `/chat/[conversationId]`. `NewChatButton` navigates to `/chat` (empty state).

**`MessageList`**: renders `MessageBubble` per message from `mockConversations.getMessages(conversationId)`. Each bubble shows role, content (rendered as markdown), and a small `provider`/`model` tag (e.g., "via Groq") — this is what makes `provider_switch` events meaningful later.

**`MessageInput`**:
- Text field + send button.
- `FileAttachmentChip` — attach button opens a file picker; selected files render as chips with name/size before sending. On send, files are bundled with the message (matches the corrected `multipart/form-data` chat endpoint contract — no separate upload step, no `file_id`).
- `InputModeToggle` (v1.3/v1.4) — segmented control: **Chat / Image / Video**. Switching mode changes the placeholder text and which mock stream handler is invoked on send.
- `StopGenerationButton` — visible only while a message is streaming; calls `mockChatStream.stop()`.

**Streaming behavior** (via `useChatStream`, consuming `mockChatStream.send()`): see Section 7 for the full SSE event → UI mapping table. At a high level: assistant bubble appears immediately with `status: "streaming"`, text fills in incrementally, tool calls/results render as `ToolCallIndicator` (v1.1) inline, a `SourcesPanel` (v1.2) appears under the bubble if the mock response includes retrieved chunks, `ProviderSwitchToast` and `LowConfidenceBanner` appear as needed, and on `done` the bubble's status becomes `"done"`.

**Disconnect/interrupt simulation**: a debug control (visible only in this mock-driven build, removable at integration) lets the developer force a mid-stream "disconnect" to verify the `status: "interrupted"` bubble + `RegenerateButton` rendering.

**Empty state** (`/chat` with no messages yet): centered prompt, suggested starter messages, `InputModeToggle` visible.

### 4.4 `/settings/api-keys`

`ApiKeyList` — table of `{provider, added_at, last_used, validated}` from `mockKeys.list()`. Never displays key values. Each row has a "Remove" action (`mockKeys.remove(provider)`) with a confirmation modal. `ApiKeyForm` — "Add Key" button opens a modal with provider dropdown + masked key input + live validation, same component used in onboarding's `KeyEntryStep` (shared component, different entry point).

### 4.5 `/settings/model-preferences`

`ModelPreferencesTable` — same component as onboarding step 4, but editable any time. Task categories with no capable provider among the user's current keys show as disabled/greyed with a tooltip ("Add a provider that supports image generation to enable this").

### 4.6 `/settings/integrations` (v1.1)

`IntegrationsGrid` of `IntegrationCard`s — GitHub, Notion, Slack, Linear, Google Drive, Brave Search. Each card shows name, description, and a Connect/Disconnect toggle backed by `mockIntegrations`. Connected cards show a "connected" badge and last-sync time (mocked).

### 4.7 `/settings/sessions`

`ActiveSessionsList` — table of `{device_info, created_at, last_active, expires_at}` from a mock session list. Each row has "Log out this device"; a top-level "Log out everywhere" button triggers a confirmation modal, then clears all mock sessions and redirects to `/login`. This is the UI for the 30-day multi-device session model — entirely mockable since it's just a list + two actions.

### 4.8 `/settings/usage` (optional)

`UsageSummary` — simple per-provider token-usage bars from mock data: `{provider, tokens_used_today, tokens_used_month}`. Lower priority; include if time allows, doesn't block other screens.

---

## 5. Component Inventory (Selected)

| Component | Version introduced | Notes |
|---|---|---|
| `OnboardingWizard` + steps | v1.0 | Gates all access until complete |
| `ChatWindow`, `MessageList`, `MessageBubble`, `MessageInput` | v1.0 | Core surface |
| `FileAttachmentChip/Preview` | v1.0 | Files inline with message, no `file_id` |
| `ProviderSwitchToast` | v1.0 | Renders on `provider_switch` SSE event |
| `LowConfidenceBanner` | v1.0 | Renders on `low_confidence` SSE event |
| `StopGenerationButton`, `RegenerateButton` | v1.0 | Stream control + interrupted recovery |
| `ApiKeyList/Form`, `ModelPreferencesTable`, `ActiveSessionsList` | v1.0 | Settings |
| `ToolCallIndicator` | v1.1 | Renders `tool_call`/`tool_result` events with MCP tool names |
| `IntegrationsGrid/Card` | v1.1 | MCP connect/disconnect |
| `SourcesPanel` | v1.2 | RAG citations under grounded messages |
| `InputModeToggle`, `ImageMessage` | v1.3 | Image generation mode + result rendering |
| `VideoJobCard` | v1.4 | Async job status + embedded player |

---

## 6. Mock Data Layer & Types

`lib/api/client.ts` exposes one function per backend endpoint, matching the OpenSpec contracts exactly:

```typescript
// lib/api/client.ts (signatures only — implementations point to lib/mock/*)
signIn(provider): Promise<{uid, session_id}>
getOnboardingStatus(): Promise<{has_key, keys_count, preferences_set, onboarding_complete}>
validateKey(provider, apiKey): Promise<{valid, error}>
setPreferences(): Promise<ModelPreferences>
listConversations(cursor?, limit?): Promise<{items: Conversation[], next_cursor?}>
getMessages(conversationId, cursor?): Promise<Message[]>
deleteConversation(conversationId): Promise<void>
sendChatMessage(conversationId, message, files): AsyncIterator<SSEEvent>  // Section 7
stopStream(conversationId): Promise<void>
listKeys(): Promise<KeyMeta[]>
removeKey(provider): Promise<void>
listIntegrations(): Promise<Integration[]>          // v1.1
toggleIntegration(id, enabled): Promise<void>        // v1.1
getMediaJob(jobId): Promise<MediaJob>                // v1.4
```

`lib/types/agent.ts` defines `SSEEvent` as a discriminated union mirroring the corrected backend contract exactly (`text_delta | tool_call | tool_result | provider_switch | low_confidence | done | error`), plus two **frontend-assumed, not-yet-backend-confirmed** additions for v1.3/v1.4:

```typescript
type SSEEvent =
  | { type: "text_delta"; content: string }
  | { type: "tool_call"; tool: string; args: Record<string, unknown> }
  | { type: "tool_result"; tool: string; content: string }
  | { type: "provider_switch"; from: string; to: string; reason: string }
  | { type: "low_confidence"; confidence: number; message: string }
  | { type: "done"; message_id: string; tokens_used: number }
  | { type: "error"; code: string; message: string }
  | { type: "image_generated"; url: string }                          // v1.3 — frontend-assumed
  | { type: "media_job_started"; job_id: string; kind: "video" };      // v1.4 — frontend-assumed
```

The two `// frontend-assumed` entries are flagged explicitly so that during backend integration, these are the first things to confirm or adjust against the real v1.3/v1.4 SSE contract.

---

## 7. SSE Event → UI Behavior Mapping

| Event | UI behavior |
|---|---|
| `text_delta` | Append `content` to the current assistant `MessageBubble`, `status: "streaming"` |
| `tool_call` | Render `ToolCallIndicator` inline ("Calling `web_search`...") — v1.1 |
| `tool_result` | Update the same indicator to show completion; result content available on expand — v1.1 |
| `provider_switch` | Show `ProviderSwitchToast` ("Gemini quota reached — switched to Groq") |
| `low_confidence` | Render `LowConfidenceBanner` below the completed message with a "regenerate with more context" suggestion |
| `done` | Set bubble `status: "done"`, store `message_id`/`tokens_used`, hide stop button |
| `error` | Render an inline error message in place of/appended to the bubble, with a retry action |
| `image_generated` *(v1.3, frontend-assumed)* | Render `ImageMessage` with the image and a download button |
| `media_job_started` *(v1.4, frontend-assumed)* | Render `VideoJobCard` in `queued` state, begin polling `getMediaJob(jobId)` via `useMediaJob` until `status: "done"`, then render the video player |

**Disconnect simulation**: when the mock stream is interrupted (via the debug control in Section 4.3), the bubble's `status` becomes `"interrupted"` and `RegenerateButton` appears — matching the backend's documented disconnect behavior exactly.

---

## 8. Integration Checklist (for when v1.4 backend is ready)

1. Replace each function in `lib/api/client.ts` with a real `fetch`/SSE implementation — function signatures stay identical, so no component changes.
2. Confirm the two `frontend-assumed` SSE event types against the real v1.3/v1.4 backend contracts; adjust `lib/types/agent.ts` if needed.
3. Wire `useAuth` to real Firebase SDK + `X-Session-Id` header handling (per the session transport correction).
4. Remove the debug "force disconnect" control from `MessageInput`.
5. Point `mockMediaJobs` polling interval/contract at the real `GET /media-jobs/{id}` endpoint once defined.