## 1. Action Tracker Core

- [x] 1.1 Create `ActionTracker` interface and standard types (e.g. `start`, `update`, `stop`, `fail`)
- [x] 1.2 Implement CLI specific tracker (`CliActionTracker`) using `@clack/prompts` spinner
- [x] 1.3 Implement Telegram specific tracker (`TelegramActionTracker`) that debounces edits
- [x] 1.4 Refactor AI SDK tool invocation loops to accept and call the `ActionTracker` correctly

## 2. Agent Mode Updates

- [x] 2.1 Update `agent` mode CLI to instantiate and pass `CliActionTracker`
- [x] 2.2 Wire up tool start/finish events in `agent` mode to update the tracker

## 3. Plan Mode Updates

- [x] 3.1 Update `plan` mode CLI to instantiate and pass `CliActionTracker`
- [x] 3.2 Ensure plan step execution emits granular progress using the tracker
- [x] 3.3 Clear or reset the spinner state between plan steps

## 4. Ask Mode Updates

- [x] 4.1 Update `ask` mode CLI to instantiate and pass `CliActionTracker`
- [x] 4.2 Wire up tool start/finish events in `ask` mode

## 5. Telegram Mode Updates

- [x] 5.1 Update Telegram `plan-session` and `ask` handlers to use `TelegramActionTracker`
- [x] 5.2 Test and verify Telegram rate limits are properly mitigated with debounce
