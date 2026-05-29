# telegram-plan-session Specification

## Purpose
TBD - created by archiving change auto-run-plan-steps. Update Purpose after archive.
## Requirements
### Requirement: Telegram Plan Execution Transition
The system SHALL transition the user session immediately into execution mode when a plan is approved, clearing the plan-approval UI elements and starting execution feedback.

#### Scenario: Running the approved plan
- **WHEN** the user selects the "✅ Run Plan" callback action
- **THEN** the system replaces the plan message's inline keyboard, acknowledges the plan execution has started, and hands control over to the Plan Automatic Execution Loop

