# agent-tool-execution Specification

## Purpose
TBD - created by archiving change fix-tool-executor-errors. Update Purpose after archive.
## Requirements
### Requirement: Agent File Creation Execution
The system MUST allow the agent to create files in the workspace with correct type mapping and log the action status.

#### Scenario: Successful file creation
- **WHEN** the tool executor receives a request to create a file
- **THEN** the system logs a `file_create` action and creates the file on disk when approved

### Requirement: Agent File Modification Execution
The system MUST allow the agent to modify files in the workspace with correct type mapping and log the action status.

#### Scenario: Successful file modification
- **WHEN** the tool executor receives a request to modify a file
- **THEN** the system logs a `file_modify` action and modifies the file on disk when approved

### Requirement: Agent Shell Command Execution
The system MUST allow the agent to queue shell commands in the workspace with correct type mapping and log the action status.

#### Scenario: Successful shell command execution
- **WHEN** the tool executor receives a request to run a shell command
- **THEN** the system logs a `tool_execute` action and runs the shell command when approved

### Requirement: Tool Description Accuracy
All tool `description` strings SHALL be free of typos, grammatical errors, and ambiguities. Each description SHALL clearly state what the tool does, when to use it, and any constraints on its inputs.

#### Scenario: No typos in tool descriptions
- **WHEN** a tool is registered with the AI SDK
- **THEN** its `description` field SHALL contain no misspellings (e.g., "files" not "tiles"), no missing punctuation, and no unclosed parentheses

### Requirement: Tool Description When-to-Use Guidance
Each tool description SHALL include guidance on when to prefer this tool over alternatives, enabling the model to select the correct tool on the first attempt.

#### Scenario: Model selects correct file tool
- **WHEN** the model needs to find files matching a pattern
- **THEN** the `search_files` description SHALL distinguish itself from `list_files` by specifying it supports glob patterns and optional content filtering

### Requirement: Consistent Path Convention in Tool Descriptions
All tool descriptions and their corresponding `inputSchema` parameter descriptions SHALL use consistent path conventions — either relative or absolute — with no contradictions between the description text and the schema.

#### Scenario: Path convention consistency
- **WHEN** a tool's description says "Use a path relative to the project root"
- **THEN** the corresponding input schema `describe()` for that path parameter SHALL also say "Relative path" and NOT "absolute path"

