## Why

Every AI prompt and tool description in swiftClaw is critically under-engineered. The agent, ask, and plan modes use bare-minimum system instructions (some have *zero* instructions), tool descriptions contain typos and ambiguities, and there is no role identity, behavioral guardrails, output formatting guidance, or reasoning directives anywhere. This directly causes lower accuracy, hallucinations, poor tool selection, inconsistent output quality, and wasted LLM tokens on confused reasoning. Fixing this is the single highest-leverage improvement possible — better prompts cost zero extra infrastructure and dramatically improve every interaction.

## What Changes

- **Centralize prompt constants**: Extract all system prompts and tool descriptions into a dedicated `prompts.ts` module for single-source-of-truth maintenance.
- **Agent Mode system prompt**: Add rich role identity, behavioral rules (staged mutations, security boundaries, step-by-step reasoning), output formatting (markdown), and error handling directives.
- **Ask Mode system prompt**: Add complete system instructions (currently *none*) with read-only research persona, answer quality standards, citation of sources, and formatting directives.
- **Plan Mode system prompt**: Rewrite with structured planning methodology — research-first approach, step granularity rules, dependency ordering, complexity estimation guidance, and output schema adherence.
- **Plan Execution prompt**: Add execution context framing — overall plan awareness, step continuity instructions, consistency enforcement across steps, progress narration.
- **Telegram-specific prompts**: Add Telegram-aware formatting constraints (message length limits, markdown compatibility), conversational tone, and concise response directives.
- **Tool descriptions**: Fix all typos ("tiles" → "files", missing parentheses), eliminate ambiguities (relative vs absolute paths), add usage guidance and behavioral hints, improve parameter descriptions.
- **Chain-of-thought directives**: Add explicit reasoning instructions across all modes to improve accuracy on complex tasks.

## Capabilities

### New Capabilities
- `prompt-engineering-system`: Centralized prompt management system — a single `prompts.ts` module containing all system instructions, role definitions, and tool descriptions with mode-specific composition functions.

### Modified Capabilities
- `agent-tool-execution`: Tool descriptions are being rewritten for clarity, typo fixes, and better behavioral guidance.
- `plan-auto-execution`: Plan step execution prompts are being enhanced with cross-step context retention and execution narration.

## Impact

- **Files modified**: `modes/agent/orchestrator.ts`, `modes/agent/agent-tools.ts`, `modes/ask/orchestrator.ts`, `modes/plan/planner.ts`, `modes/plan/orchestrator.ts`, `modes/plan/web-tools.ts`, `modes/telegram/agent-run.ts`
- **New file**: `modes/prompts.ts` (centralized prompt constants)
- **No API changes**: All changes are internal prompt strings — zero interface changes.
- **No dependency changes**: Pure refactor of string constants.
- **Risk**: Low — prompts are purely additive improvements. If any prompt performs worse, it can be individually reverted.
