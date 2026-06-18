# SwiftClaw Frontend — Product Requirements Document (PRD)

**Scope**: UI for v1.0 → v1.4 backend capabilities. Built against a mock data layer; zero live backend integration until the backend reaches v1.4.

---

## 1. Purpose

swiftclaw.online currently has only a landing/marketing page. This PRD defines the complete chat-application frontend — every screen, flow, and state needed to support the full v1.0–v1.4 backend feature set — so that once the backend is ready, integration is a matter of replacing a mock data layer with real API calls, not building new UI.

## 2. Goals

- Ship a fully navigable, fully interactive frontend covering every feature across v1.0–v1.4, indistinguishable in *behavior* from the real thing — driven entirely by a mock data/SSE layer.
- Establish the design system, layout shell, and component library now, so later versions (v1.1–v1.4) are additive to an existing structure rather than redesigns.
- Define every UI state a real integration will need to handle (loading, streaming, error, empty, interrupted, low-confidence, provider-switched, async job pending) so the eventual integration step only swaps data sources, never rewrites component logic.
- Preserve the existing landing page's visual identity (dark, minimalist, high-contrast, glassmorphism) as the design language for the authenticated app.

## 3. Non-Goals

- No real backend calls, no Firebase SDK wiring, no real SSE connections — all driven by a mock layer (Section 6 of the FRD).
- No CLI-related UI (v2.0 is out of scope entirely).
- No payment/billing UI (not part of v1.0–v1.4 backend scope).
- No changes to the existing landing page, FAQ, install, privacy, or terms pages beyond adding navigation entry points (Sign In / Get Started) into the new app shell.
- No reimplementation of existing `components/ui/` primitives — new chat-specific primitives are sourced from the 21st.dev registry (via shadcn CLI) and added alongside what already exists.

## 4. Target Users

Individuals who bring their own LLM provider API keys (Gemini, Claude, OpenAI, Groq, Perplexity, OpenRouter, NVIDIA) and want a unified chat interface with web search, file analysis, MCP tool integrations, document grounding (RAG), and image/video generation — without juggling multiple provider dashboards.

## 5. Feature Scope by Version

| Version | UI Capability |
|---|---|
| **v1.0** | Firebase-style login UI, guided onboarding wizard (provider selection, key entry, task-model preferences), streaming chat with text, file attachments (inline with message), conversation history sidebar, resumable conversations, settings (API key management, model preferences, active sessions/devices), provider-switch & low-confidence inline notifications, stop/regenerate controls |
| **v1.1** | MCP integrations panel (connect/disconnect GitHub, Notion, Slack, Linear, Google Drive, Brave Search), in-chat tool-call/tool-result indicators |
| **v1.2** | RAG "Sources" panel under grounded responses (retrieved chunks with filename/page/snippet), file-indexed status indicator |
| **v1.3** | Image generation mode in chat input, generated-image message rendering with download, formalized image-analysis display for vision-capable attachments |
| **v1.4** | Video generation mode in chat input, async job status UI (queued/processing/done), in-chat video player for completed jobs |

## 6. High-Level User Flows

**First-time user**: lands on marketing page → "Get Started" → `/login` → `/onboarding` (5-step wizard) → redirected to `/chat`, empty state, ready to send first message.

**Returning user**: lands on marketing page → "Sign In" → `/login` → straight to `/chat` with conversation history populated in the sidebar (skips onboarding — `onboarding_complete: true`).

**Mid-conversation provider issue**: user is chatting → mock stream emits a `provider_switch` event → an inline toast appears ("Gemini quota reached — switched to Groq") → conversation continues without interruption.

**Settings management**: from any app screen, user opens `/settings` → manages API keys, adjusts task-model preferences, connects MCP integrations (v1.1), reviews/revokes active device sessions.

**Image/video generation (v1.3/v1.4)**: user switches the input mode to "Image" or "Video", submits a prompt → for image, a generated-image bubble appears once streaming completes; for video, a job card appears showing `queued → processing → done`, then renders a video player.

## 7. Design System Carryover

The existing landing page establishes: dark background, high contrast text, glassmorphism panels (translucent, blurred backgrounds), precise/minimal typography, restrained color accents. The authenticated app (sidebar, chat window, settings panels, onboarding wizard) SHALL extend this same visual language — no new design system is introduced. Tailwind config and design tokens should be shared between the marketing page and the app shell.

## 8. Definition of Done (for this frontend release)

- Every route in the FRD routing table exists and renders.
- Every SSE event type the backend will eventually emit has a corresponding UI behavior, demonstrable today via the mock stream.
- Every screen has defined loading, empty, error, and populated states.
- The mock data layer's function signatures exactly match the real API contracts from the backend OpenSpec documents — so integration is a drop-in replacement, not a refactor.
- A user can complete the entire flow — onboarding → chat → file attach → image gen → video gen → settings management — using only mock data, with no broken links or dead-end states.

## 9. Assumptions & Risks

- **Assumption**: the backend's SSE event schema (Section D7 of the backend design + corrections doc) is stable enough that the mock layer built against it now won't need significant rework at integration time. If the backend spec changes materially, the mock layer's types (Section 6 of the FRD) need a corresponding update — but component logic, which consumes those types, should remain unaffected.
- **Risk**: building UI for v1.3/v1.4 (image/video) before the backend exists means some assumptions about response shapes (especially the async video job polling contract) are frontend-originated. The FRD flags these as "frontend-assumed contracts" for backend alignment later.