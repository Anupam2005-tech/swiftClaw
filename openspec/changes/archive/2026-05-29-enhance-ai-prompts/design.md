## Context

swiftClaw is an AI coding agent with four interaction modes (Agent, Ask, Plan, Telegram) that use Vercel AI SDK's `ToolLoopAgent`/`generateText`. Currently, the system prompts are:

| Mode | Current System Prompt | Quality |
|---|---|---|
| Agent (CLI) | `"Workspace root: /path\nAll mutations are staged until approval"` | 2 lines, no identity |
| Ask (CLI) | *None* — zero instructions | Completely absent |
| Plan (CLI) | 6 terse lines, no planning methodology | Minimal |
| Plan Execution (CLI) | Zero instructions on the `ToolLoopAgent` | Absent |
| Telegram Ask/Agent/Plan | `"Workspace root: /path"` | 1 line, shared across all modes |

Tool descriptions contain typos (`"tiles"` → `"files"`), missing punctuation, ambiguous path conventions (descriptions say "absolute" but schemas say "relative"), and no behavioral guidance.

## Goals / Non-Goals

**Goals:**
- Create a centralized `modes/prompts.ts` module that is the single source of truth for all system prompts and tool descriptions.
- Write production-grade system prompts for every mode following prompt engineering best practices: role identity, behavioral constraints, output formatting, chain-of-thought directives, and negative examples.
- Fix every typo, ambiguity, and inconsistency in tool descriptions.
- Make tool descriptions provide *when-to-use* guidance so the model selects tools more accurately.
- Add Telegram-specific formatting constraints (4096 char limit, Markdown v1 subset).

**Non-Goals:**
- Changing the underlying AI model or SDK.
- Adding new tools or modifying tool execution logic.
- Changing the approval/staging flow.
- Dynamic prompt generation from user preferences — all prompts remain static constants.

## Decisions

### 1. Centralized `modes/prompts.ts` module
**Decision**: Extract all prompt strings into a single `prompts.ts` file with exported constants and composition functions.
**Rationale**: Currently, prompts are scattered inline across 7 files, many duplicated (readOnlyTools is copy-pasted in 3 files). A central module eliminates drift, enables A/B testing, and makes auditing trivial.
**Alternative**: Keep prompts inline. Rejected because the current duplication has already caused inconsistencies.

### 2. Structured prompt architecture per mode
**Decision**: Each mode gets a composable system prompt built from layers:
```
BASE_IDENTITY → MODE_RULES → TOOL_USAGE_HINTS → OUTPUT_FORMAT → CONSTRAINTS
```
**Rationale**: Layered composition lets modes share the identity/constraint layers while diverging on mode-specific rules. E.g., Plan Mode gets "DO NOT modify files" while Agent Mode gets "stage all mutations."

### 3. Chain-of-thought directives
**Decision**: Add explicit `<thinking>` directives that instruct the model to reason before acting.
**Rationale**: For complex tasks (multi-file refactors, plan generation), explicit CoT instructions measurably improve accuracy. The model token cost is marginal compared to the cost of wrong tool calls.

### 4. Tool description rewrite strategy
**Decision**: Every tool description follows this template:
```
[WHAT] - one-line summary
[WHEN] - when to use this tool vs alternatives
[INPUT] - clarify any ambiguous parameters
[OUTPUT] - what to expect back
```
**Rationale**: Models select tools based on description matching. Vague descriptions cause wrong tool selection and wasted steps.

### 5. Telegram-specific prompt layer
**Decision**: Telegram modes get an additional constraint layer:
- Max response: ~3500 chars (buffer for Telegram's 4096 limit)
- Use Telegram-compatible Markdown (bold via `*`, code via backticks, no headers)
- Concise, conversational tone
**Rationale**: Telegram has hard message limits and a restricted Markdown subset. Without these constraints, the model generates responses that get truncated or render badly.

## Risks / Trade-offs

- **Longer system prompts increase input tokens** → Mitigated by using concise, high-density phrasing. The improvement in output quality and reduced retries more than offsets the token cost.
- **Overly prescriptive prompts may reduce flexibility** → Mitigated by keeping constraints to behavioral guardrails, not micro-managing the response content.
- **Centralized module creates a single point of change** → This is actually a benefit. Risk of accidental breakage mitigated by having the module be pure string exports with no logic.
