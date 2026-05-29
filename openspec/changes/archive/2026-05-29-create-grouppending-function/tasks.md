## 1. Implement groupPending Function

- [x] 1.1 Add required imports `composeBeforeAfter` and `formatPatch` from `./diff-view` to `modes/agent/approvals.ts`
- [x] 1.2 Complete the `groupPending` implementation to process Map entries and format labels & patches for file mutations
- [x] 1.3 Map shell executions (`tool_execute`) into individual `ReviewGroup` elements with descriptive labels and null patches
- [x] 1.4 Handle folder creations (`folder_create`) with custom labels and null patches

## 2. Test and Verify

- [x] 2.1 Verify TypeScript compiles without issues using `bun x tsc --noEmit`
