# grouppending-approvals Specification

## Purpose
TBD - created by archiving change create-grouppending-function. Update Purpose after archive.
## Requirements
### Requirement: Group Pending Mutations
The system SHALL group pending `ActionLog` entries into `ReviewGroup` objects.

#### Scenario: Grouping file mutations by path
- **WHEN** the input contains multiple file creations and modifications for the same path
- **THEN** they SHALL be grouped into a single `ReviewGroup` with a patch showing the net change

#### Scenario: Mapping shell executions
- **WHEN** the input contains `tool_execute` actions
- **THEN** each `tool_execute` action SHALL become its own `ReviewGroup` with `patch` set to null

