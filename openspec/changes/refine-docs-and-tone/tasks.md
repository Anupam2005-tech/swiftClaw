## 1. Extract and Share THEME

- [x] 1.1 Export the `THEME` object from `tui/wakeup.ts` so it can be used across orchestrators, or create a new `utils/theme.ts` file if necessary.

## 2. CLI Tone Standardization

- [ ] 2.1 Update `modes/agent/orchestrator.ts` to use the `THEME` and premium tone strings.
- [ ] 2.2 Update `modes/ask/orchestrator.ts` to use the `THEME` and premium tone strings.
- [ ] 2.3 Update `modes/plan/orchestrator.ts` to use the `THEME` and premium tone strings.

## 3. Telegram Bot Tone

- [ ] 3.1 Update strings in `modes/telegram/constants.ts` to match the premium identity (e.g., change "Hi,i'm swift claw an AI based personal AI assistant" to a more professional greeting).

## 4. Web Docs Updates

- [ ] 4.1 Refine copy in `apps/web/src/app/page.tsx` and related landing components (like `responsive-hero-banner.tsx`) to reflect the new tone.
- [ ] 4.2 Update documentation text under `apps/web/src/components/docs/` and `apps/web/src/app/docs/` to present the tool as an advanced, premium developer utility.
