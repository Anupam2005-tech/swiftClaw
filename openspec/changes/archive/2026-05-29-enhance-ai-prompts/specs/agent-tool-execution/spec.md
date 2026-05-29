## ADDED Requirements

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
