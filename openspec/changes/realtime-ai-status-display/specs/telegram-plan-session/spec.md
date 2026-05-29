## ADDED Requirements

### Requirement: Telegram Real-time Status UI
The Telegram bot SHALL display real-time status updates received from the `ActionTracker` by persistently editing a single status message within the chat session to reflect the AI's current activity (e.g., "⚙️ Executing [Tool Name]...").

#### Scenario: Status message rendering
- **WHEN** the AI emits a status update via the `ActionTracker`
- **THEN** the Telegram session creates or edits a status message to display the current state to the user, respecting rate limit mitigations
