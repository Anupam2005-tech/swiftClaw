## Context

The `modes/agent/tool-executor.ts` is the central component that translates high-level agent intents into specific system tools (like read, write, modify files, run shell commands, etc.). The agent's activity is logged via the `ActionTracker`. Currently, several mismatches between logged types, defined TypeScript types in `types.ts`, and target check patterns exist, breaking the compilation of the project.

## Goals / Non-Goals

**Goals:**
- Fix all TypeScript compiler errors in `tool-executor.ts` and `types.ts`.
- Ensure type safety of the `ActionLog` details and action types.
- Correctly handle mutations inside `applyApprovedFromTracker()` by mapping logged types to actual operations.

**Non-Goals:**
- Add new features or agents to the CLI.
- Re-architect the tool execution mechanism itself.

## Decisions

### 1. Correct the Type Definition for ActionType
- **Choice**: Make it a proper TypeScript union in `types.ts`:
  ```typescript
  export type ActionType =
      | 'file_create'
      | 'file_modify'
      | 'file_delete'
      | 'folder_create'
      | 'code_analysis'
      | 'tool_execute';
  ```
- **Rationale**: This resolves the syntax error where only `'file_create'` was parsed.

### 2. Map Action Logging and Execution cleanly
- **Choice**: Use the exact `ActionType` values throughout `tool-executor.ts`:
  - `createFile` logs `type: 'file_create'`
  - `modifyFile` logs `type: 'file_modify'`
  - `deleteFile` logs `type: 'file_delete'`
  - `createFolder` logs `type: 'folder_create'`
  - `queueShell` logs `type: 'tool_execute'`
- **Rationale**: Keeps logging consistent and avoids introducing extra unmapped states like `'code_modification'` or `'system_command'`.

### 3. Extend ActionLog Details type
- **Choice**: Add `content` and `query` properties to details in `types.ts`.
- **Rationale**: Avoids TSC complaining about missing fields when logging the file contents or search queries.

## Risks / Trade-offs

- **Risk**: Mismatches during task execution if any other files depend on the old/invalid type names.
- **Mitigation**: Grep showed that only `tool-executor.ts` and `types.ts` are using these types, so changing them is entirely safe.
