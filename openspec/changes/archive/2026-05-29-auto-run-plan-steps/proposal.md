## Why

Currently, when a user approves a plan in Telegram's plan mode, the plan steps are executed, but the user experience doesn't smoothly transition them into tracking the step-by-step progress automatically in an agentic fashion. We want the agent to automatically switch to execution mode and handle the execution of plan steps one by one until finished, providing clear progress feedback for each step.

## What Changes

- When a plan is approved (`✅ Run Plan`), the system will automatically transition to an active execution mode (Agent mode) for that plan.
- The agent will execute each step sequentially.
- The Telegram session will report progress back to the user step-by-step, making it clear which step is currently being executed.
- After all steps finish, the agent will present the final changes for review (as it does now, but ensuring a smooth workflow transition from Plan -> Execute -> Review).

## Capabilities

### New Capabilities
- `plan-auto-execution`: The capability to seamlessly transition from an approved plan into automated, step-by-step execution mode in the Telegram interface, providing granular step-by-step progress tracking and execution.

### Modified Capabilities
- `telegram-plan-session`: Changing the requirements for how plans are executed once approved, transitioning the user session to active step execution state.

## Impact

- Telegram handlers (`plan-session.ts` and `agent-run.ts`).
- Plan execution logic (`runPlanSteps`) may need better Telegram integration to stream step progress to the user.
