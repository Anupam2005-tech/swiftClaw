## Context

The agent execution flow captures filesystem mutations (file creation, modification, deletion) and shell executions (`tool_execute` actions) in an `ActionTracker`. These are held in a pending state until reviewed and approved by the user. Currently, `groupPending` in `modes/agent/approvals.ts` is incomplete, ending in a syntax error, which blocks the interactive review flow.

## Goals / Non-Goals

**Goals:**
- Implement `groupPending` to partition a list of `ActionLog` entries into `ReviewGroup[]`.
- Group all file/folder mutations relating to the same path together, preserving sequence order.
- Generate unified diff patches for file mutations using existing helper functions `composeBeforeAfter` and `formatPatch` from `diff-view.ts`.
- Map shell command executions (`tool_execute`) into individual review groups so they can be separately reviewed.
- Correct loop/review flow termination handling.

**Non-Goals:**
- Changing `ActionTracker` or `ActionLog` types.
- Modifying how the model generates proposed files.

## Decisions

### 1. Grouping File & Folder Mutations by Path
- **Choice:** Map pending mutations by target path using a `Map<string, ActionLog[]>`.
- **Rationale:** Ensures all mutations (e.g. creating, modifying) to the same file are displayed together as a single cohesive unit with a single net patch.

### 2. Mapping Shell Executions (tool_execute)
- **Choice:** Map each `tool_execute` action directly to its own `ReviewGroup` with `patch: null`.
- **Rationale:** Shell executions have no filesystem path to group them together and should be individually approved or rejected by the user.

## Risks / Trade-offs

- **Risk:** Creating and then deleting a file in the same session might cause `composeBeforeAfter` to raise an empty diff.
- **Mitigation:** Label the review group clearly as "Create & Delete file" to indicate it is a net deletion/cleanup.
