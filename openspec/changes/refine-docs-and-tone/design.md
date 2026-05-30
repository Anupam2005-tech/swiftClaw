## Context

Currently, the swiftClaw CLI, Telegram bot, and web documentation use a mix of different tones and copy styles. The `wakeup.ts` module introduces a high-end, futuristic "SaaS Premium" identity (e.g., "Deploy excellence," "Synchronizing with Telegram Cloud"), while other parts of the system (like the Telegram `constants.ts` and orchestrator status prompts) use more generic or casual phrasing. To build a strong brand identity, the entire toolchain needs to adopt a unified, premium tone.

## Goals / Non-Goals

**Goals:**
- Unify the brand voice across all interfaces (CLI, Telegram, Web Docs).
- Ensure all status messages, prompts, and documentation reflect a professional, "premium" AI assistant identity.
- Refactor existing string constants and chalk formatting to follow the `THEME` palette defined in the TUI.

**Non-Goals:**
- Changing functional logic or adding new features to the CLI/Telegram bot.
- Rewriting the entire documentation structure (just refining the copy/tone of the components).

## Decisions

- **Unified Palette**: We will extract or reuse the `THEME` palette from `tui/wakeup.ts` across `modes/agent/orchestrator.ts`, `modes/ask/orchestrator.ts`, and `modes/plan/orchestrator.ts`.
- **String Refactoring**: All generic strings (e.g., "Agent is thinking...", "Hi,i'm swift claw...") will be updated to match the brand voice (e.g., "Agent synthesizing...", "swiftClaw Engine Active").
- **Documentation Updates**: We will review and update the copy in the `apps/web/src/components/docs/` and `apps/web/src/app/` pages to ensure consistency with the new voice.

## Risks / Trade-offs

- **Risk**: Changing constants might break tests if any are checking exact string matches.
- **Mitigation**: We will review string usages and update any associated tests if necessary.
