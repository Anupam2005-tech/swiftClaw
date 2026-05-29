## ADDED Requirements

### Requirement: Unified Real-time Status Tracker
The system SHALL provide a unified tracking interface (`ActionTracker`) to emit real-time status updates (e.g., "Thinking...", "Running tool...", "Success") across all AI execution modes (`plan`, `ask`, `agent`, `telegram`).

#### Scenario: Unified interface usage
- **WHEN** the AI starts a new execution step or calls a tool
- **THEN** the system calls `tracker.update("status message")` to reflect the current state

### Requirement: CLI Status Rendering
The system SHALL render real-time AI status updates in the command-line interface using dynamic loading indicators (such as spinners) so as not to spam the terminal with static log lines for every micro-action.

#### Scenario: Tool execution in CLI
- **WHEN** the AI executes a tool in CLI mode
- **THEN** a spinner appears with the text "Executing [Tool Name]..." and updates to a success/error state upon completion

### Requirement: Telegram Status Rendering
The system SHALL render real-time AI status updates in Telegram by dynamically editing a persistent "status message" for the current operation.

#### Scenario: Tool execution in Telegram
- **WHEN** the AI executes a tool in Telegram mode
- **THEN** the bot edits the status message in the chat to "⚙️ Executing [Tool Name]..."

### Requirement: Telegram Rate Limit Mitigation
The Telegram status renderer SHALL debounce or rate-limit message edit requests to avoid hitting the Telegram API limits (e.g., 429 Too Many Requests).

#### Scenario: Rapid state changes
- **WHEN** the AI emits multiple status updates within 1 second
- **THEN** the Telegram renderer batches or drops intermediate updates, ensuring no more than one API edit request is sent per second
