## 1. Action Tracker Core

- [ ] 1.1 Create `ActionTracker` interface and standard types (e.g. `start`, `update`, `stop`, `fail`)
- [ ] 1.2 Implement CLI specific tracker (`CliActionTracker`) using `@clack/prompts` spinner
- [ ] 1.3 Implement Telegram specific tracker (`TelegramActionTracker`) that debounces edits
- [ ] 1.4 Refactor AI SDK tool invocation loops to accept and call the `ActionTracker` correctly

## 2. Agent Mode Updates

- [ ] 2.1 Update `agent` mode CLI to instantiate and pass `CliActionTracker`
- [ ] 2.2 Wire up tool start/finish events in `agent` mode to update the tracker

## 3. Plan Mode Updates

- [ ] 3.1 Update `plan` mode CLI to instantiate and pass `CliActionTracker`
- [ ] 3.2 Ensure plan step execution emits granular progress using the tracker
- [ ] 3.3 Clear or reset the spinner state between plan steps

## 4. Ask Mode Updates

- [ ] 4.1 Update `ask` mode CLI to instantiate and pass `CliActionTracker`
- [ ] 4.2 Wire up tool start/finish events in `ask` mode

## 5. Telegram Mode Updates

- [ ] 5.1 Update Telegram `plan-session` and `ask` handlers to use `TelegramActionTracker`
- [ ] 5.2 Test and verify Telegram rate limits are properly mitigated with debounce
