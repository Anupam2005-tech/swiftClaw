## Why

The `groupPending` function in `modes/agent/approvals.ts` is currently incomplete, ending abruptly in a syntax error (`for(const [path,list])`). This prevents the application from grouping pending changes for user review and approval in agent mode.

## What Changes

- Complete the implementation of the `groupPending` function to group pending mutations.
- Group file/folder mutations by their target path, sorting actions sequentially.
- Map shell command executions (`tool_execute` actions) into individual review groups.
- Generate unified diff patches for file modifications using helper functions from `diff-view.ts`.
- Integrate `groupPending` into the interactive `runApprovalFlow` review flow.

## Capabilities

### New Capabilities
- `grouppending-approvals`: Implements the grouping logic for staged agent mutations to enable interactive review and diff visualization.

### Modified Capabilities

## Impact

- `modes/agent/approvals.ts`: Fixes the syntax error and completes `groupPending` and the review flow.
- `modes/agent/orchestrator.ts`: Re-enables safe agent flow where modifications are verified.
