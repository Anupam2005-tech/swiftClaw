## 1. Create Centralized Prompt Module

- [x] 1.1 Create `modes/prompts.ts` with `BASE_IDENTITY` constant (swiftClaw role identity, behavioral rules, security constraints shared across all modes).
- [x] 1.2 Add `AGENT_SYSTEM_PROMPT` — composing BASE_IDENTITY + agent-specific rules (mutation staging, step-by-step reasoning, Markdown output, error handling).
- [x] 1.3 Add `ASK_SYSTEM_PROMPT` — composing BASE_IDENTITY + read-only research persona, answer quality standards, citation directives, structured Markdown output.
- [x] 1.4 Add `PLAN_SYSTEM_PROMPT` — composing BASE_IDENTITY + expert planner identity, research-first methodology, step granularity rules, dependency ordering, complexity estimation, JSON schema adherence.
- [x] 1.5 Add `PLAN_STEP_EXECUTION_PROMPT(goal, stepIndex, totalSteps, stepTitle)` — dynamic function composing BASE_IDENTITY + execution context, consistency directive, progress narration instruction.
- [x] 1.6 Add `TELEGRAM_LAYER` constant — Telegram-specific constraints (3500 char limit, Markdown v1 subset, concise tone) to be appended to any mode prompt when running in Telegram.

## 2. Rewrite Tool Descriptions

- [x] 2.1 Fix all typos in `agent-tools.ts`: "tiles" → "files", ".(not" → " (not", missing closing parenthesis on `list_skills`.
- [x] 2.2 Rewrite all tool descriptions in `agent-tools.ts` using the WHAT/WHEN/CONSTRAINTS template from the design doc.
- [x] 2.3 Rewrite all tool descriptions in `planner.ts` read-only tools (or import from shared module to eliminate duplication).
- [x] 2.4 Rewrite all tool descriptions in `modes/telegram/agent-run.ts` read-only tools (or import from shared module).
- [x] 2.5 Rewrite web tool descriptions in `web-tools.ts` with clearer WHEN guidance.
- [x] 2.6 Fix inconsistent path convention: ensure all `inputSchema.describe()` strings match the tool description (all relative, no "absolute" contradictions).

## 3. Wire Prompts into Orchestrators

- [x] 3.1 Update `modes/agent/orchestrator.ts` to import and use `AGENT_SYSTEM_PROMPT` from `prompts.ts`.
- [x] 3.2 Update `modes/ask/orchestrator.ts` to import and use `ASK_SYSTEM_PROMPT` from `prompts.ts` (currently has zero instructions).
- [x] 3.3 Update `modes/plan/planner.ts` to import and use `PLAN_SYSTEM_PROMPT` from `prompts.ts`, replacing the inline `PLAN_INSTRUCTIONS` function.
- [x] 3.4 Update `modes/plan/orchestrator.ts` to use `PLAN_STEP_EXECUTION_PROMPT` for each step's ToolLoopAgent.
- [x] 3.5 Update `modes/telegram/agent-run.ts` `agentoptions()` to use mode-specific prompts with `TELEGRAM_LAYER` appended.
- [x] 3.6 Update `runPlanSteps()` in `agent-run.ts` to use `PLAN_STEP_EXECUTION_PROMPT` with Telegram layer.

## 4. Eliminate Tool Description Duplication

- [x] 4.1 Extract shared read-only tool definitions into a `TOOL_DESCRIPTIONS` constant object in `modes/prompts.ts`.
- [x] 4.2 Update `planner.ts`, `ask/orchestrator.ts`, and `telegram/agent-run.ts` to import from `TOOL_DESCRIPTIONS` instead of copy-pasting strings.

## 5. Verify

- [x] 5.1 Run `npx tsc --noEmit` to confirm zero type errors.
- [x] 5.2 Verify all orchestrators import from `prompts.ts` with no remaining inline prompt strings.
