# plan-auto-execution Specification

## Purpose
TBD - created by archiving change auto-run-plan-steps. Update Purpose after archive.
## Requirements
### Requirement: Plan Automatic Execution Loop
The system SHALL automatically transition an approved plan into an active agent execution loop, processing each step sequentially without requiring manual continuation prompts from the user.

#### Scenario: Running multiple steps
- **WHEN** the user selects the "✅ Run Plan" action for a generated plan
- **THEN** the system initializes a single plan execution state and iteratively executes all steps in the plan

### Requirement: Execution Context Retention
The system SHALL maintain context across the execution of different steps of a plan, rather than instantiating a fresh, memoryless agent for each step.

#### Scenario: Step context usage
- **WHEN** step 2 relies on the output of step 1
- **THEN** the agent executing step 2 should have access to the conversation history and changes made in step 1

### Requirement: Granular Progress Updates
The system SHALL provide immediate feedback before and after executing each step of the plan.

#### Scenario: Notifying progress
- **WHEN** the agent begins executing Step N
- **THEN** a status message `*Executing Step N/Total:* [Title]` is sent to the user

#### Scenario: Output reporting
- **WHEN** the agent finishes executing Step N
- **THEN** the agent's textual output is sent to the user before moving to Step N+1

### Requirement: Plan Step Execution Prompt Quality
The system SHALL provide the plan step executor with a rich system prompt that includes the overall goal, total number of steps, current step position, and directives for maintaining consistency across steps.

#### Scenario: Step executor receives plan context
- **WHEN** a plan step is sent to the ToolLoopAgent for execution
- **THEN** the agent's instructions SHALL include the plan goal, step N of M positioning, and a directive to maintain consistent coding style and conventions with prior steps

### Requirement: Plan Step Narration
The plan step executor's system prompt SHALL instruct the model to narrate its progress — explaining what it is doing and why — so the user can follow along via Telegram messages.

#### Scenario: Narrated execution
- **WHEN** the agent completes a plan step
- **THEN** its text output SHALL include a brief summary of what was done, what files were affected, and any decisions made

