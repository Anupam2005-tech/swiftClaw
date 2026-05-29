## Context

SwiftClaw relies heavily on AI-driven workflows (plan, agent, ask, telegram). Currently, when an AI model processes a prompt, makes tool calls, and evaluates results, the operations are opaque to the user. Providing real-time visibility into the AI's internal loops (e.g., "Calling search_web", "Analyzing results", "Drafting plan") will drastically improve user engagement and trust. The system operates in two main environments: the CLI (interactive terminal) and Telegram (chat messages).

## Goals / Non-Goals

**Goals:**
- Provide a unified interface for emitting AI execution status events.
- Implement a CLI status renderer using `@clack/prompts` or terminal spinners.
- Implement a Telegram status renderer that updates a single message with the current state.
- Ensure tool calls and responses are tracked and surfaced in real-time.

**Non-Goals:**
- Showing the full raw JSON of tool inputs/outputs (keep it human-readable).
- Complete refactoring of how the AI SDK is invoked, aside from attaching the tracker/callbacks.

## Decisions

**1. Unified Action Tracker Interface**
- *Rationale*: We need a standard way for `agent`, `plan`, and `ask` modes to report their status regardless of the environment. We'll introduce an `ActionTracker` interface with methods like `start(message)`, `update(message)`, `stop(message)`, and `fail(error)`.

**2. Telegram Rate Limiting (Debouncing)**
- *Rationale*: Telegram has strict API rate limits for editing messages (e.g., 1 edit per second). The Telegram implementation of `ActionTracker` will debounce message updates to prevent `429 Too Many Requests` errors while still feeling "real-time" to the user.

**3. CLI Rendering via Clack**
- *Rationale*: SwiftClaw already uses `@clack/prompts`. We will leverage `spinner()` to show a continuously updating loading indicator with text reflecting the AI's current action.

**4. Integration with AI SDK**
- *Rationale*: The Vercel AI SDK provides `onStepFinish` or stream-based callbacks. We will hook into the tool calling lifecycle to trigger updates on the `ActionTracker` whenever a tool is invoked or completes.

## Risks / Trade-offs

- **Risk: Telegram Rate Limits** → *Mitigation*: Debounce the `editMessageText` calls and batch rapid state changes.
- **Risk: Too much noise in CLI** → *Mitigation*: Use a spinner that updates in place rather than printing a new line for every micro-action, keeping the terminal clean.
