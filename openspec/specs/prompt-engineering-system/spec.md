# prompt-engineering-system Specification

## Purpose
TBD - created by archiving change enhance-ai-prompts. Update Purpose after archive.
## Requirements
### Requirement: Centralized Prompt Module
The system SHALL maintain all AI system prompts, role identities, and tool descriptions in a single `modes/prompts.ts` module that is imported by all orchestrators.

#### Scenario: Single source of truth
- **WHEN** a developer needs to modify any AI prompt or tool description
- **THEN** the change SHALL be made in `modes/prompts.ts` only, with no inline prompt strings in orchestrator files

### Requirement: Agent Mode System Prompt
The Agent Mode system prompt SHALL include: role identity (senior software engineer), workspace root, mutation staging rules, chain-of-thought reasoning directive, output formatting (Markdown), error handling instructions, and security boundaries (no path traversal, respect exclusions).

#### Scenario: Agent receives complete context
- **WHEN** the Agent Mode ToolLoopAgent is instantiated
- **THEN** the `instructions` parameter SHALL contain a multi-section prompt with identity, constraints, reasoning directives, and output format

### Requirement: Ask Mode System Prompt
The Ask Mode system prompt SHALL include: role identity (knowledgeable assistant), read-only constraint, research methodology (use tools to verify before answering), answer quality standards (accurate, cited, structured), and output formatting (Markdown with headers).

#### Scenario: Ask mode receives instructions
- **WHEN** the Ask Mode ToolLoopAgent is instantiated
- **THEN** the agent SHALL have a non-empty `instructions` parameter guiding response quality and tool usage

### Requirement: Plan Mode System Prompt
The Plan Mode system prompt SHALL include: role identity (expert architect/planner), research-first methodology (explore codebase before planning), step granularity rules (each step should be independently executable), dependency ordering guidance, complexity estimation criteria, and JSON schema adherence.

#### Scenario: Plan mode guides research
- **WHEN** the Plan Mode generates a plan
- **THEN** the system prompt SHALL instruct the model to use read-only tools to understand the codebase before producing step descriptions

### Requirement: Plan Execution System Prompt
The Plan Execution system prompt SHALL include: execution context (overall goal, total steps, current step position), consistency directive (maintain coding style across steps), progress narration instruction, and mutation staging awareness.

#### Scenario: Step executor has plan context
- **WHEN** a plan step is executed via ToolLoopAgent
- **THEN** the agent's instructions SHALL include the overall plan goal, the step's position in the sequence, and a directive to maintain consistency with prior steps

### Requirement: Telegram Formatting Constraints
All Telegram-targeted system prompts SHALL include constraints for Telegram-compatible output: response length limit (~3500 characters), Telegram Markdown v1 formatting rules (bold with *, code with backticks, no # headers), and concise conversational tone.

#### Scenario: Telegram agent respects message limits
- **WHEN** any Telegram mode (ask, agent, plan) generates a response
- **THEN** the system prompt SHALL instruct the model to keep responses under 3500 characters and use Telegram-compatible Markdown

### Requirement: Composable Prompt Architecture
The prompt module SHALL expose composition functions that layer shared base identity with mode-specific rules, allowing modes to build their prompts from reusable components.

#### Scenario: Mode-specific composition
- **WHEN** Agent Mode needs its system prompt
- **THEN** it SHALL call a composition function that combines `BASE_IDENTITY + AGENT_RULES + OUTPUT_FORMAT + CONSTRAINTS`

