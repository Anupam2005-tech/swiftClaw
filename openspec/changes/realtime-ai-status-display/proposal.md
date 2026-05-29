## Why

Currently, when the AI is processing requests across different modes (plan, ask, agent, telegram), the user lacks detailed visibility into the AI's step-by-step actions and tool usage. Adding real-time status updates will make the AI's thought process and actions transparent, allowing the user to better engage with and understand what the system is doing at any given moment.

## What Changes

- Introduce a standardized status tracking and display mechanism for AI operations.
- Update the execution loops in all modes (`plan`, `ask`, `agent`, `telegram`) to emit real-time status updates (e.g., "Thinking...", "Running tool X...", "Waiting for response...").
- Render these updates visually in the CLI using spinners or progress indicators (`@clack/prompts` or similar).
- Relay these updates in Telegram mode by editing a "status message" dynamically.

## Capabilities

### New Capabilities
- `realtime-ai-status`: A centralized tracking mechanism and UI components to display real-time AI progress and tool execution details across CLI and Telegram modes.

### Modified Capabilities
- `agent-tool-execution`: Must integrate with the new status tracking to emit events when tools are called, executed, and completed.
- `plan-auto-execution`: Must emit status updates during plan execution steps.
- `telegram-plan-session`: Must handle real-time status updates by dynamically editing a status message in the chat.

## Impact

- **Affected Code**: AI execution loops (`agent`, `plan`, `ask` modes), Telegram bot message handlers, and Tool execution wrappers.
- **Dependencies**: May require additional UI components or better state management for spinners/progress in CLI and Telegram.
