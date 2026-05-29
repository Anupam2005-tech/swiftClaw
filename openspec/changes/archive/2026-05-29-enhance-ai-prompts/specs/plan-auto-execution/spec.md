## ADDED Requirements

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
