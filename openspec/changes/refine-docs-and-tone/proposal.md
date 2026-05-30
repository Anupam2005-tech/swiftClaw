## Why

The current tone and messaging across the swiftClaw CLI, Telegram bot, and documentation are inconsistent. While parts of the CLI (like the wakeup screen) use a "SaaS Premium" and highly professional/futuristic tone (e.g., "Deploy excellence", "Synchronizing with Telegram Cloud"), other parts (like the Telegram constants and standard orchestrator messages) are more generic or casually phrased. We need to unify the tone to present a cohesive, premium, and professional identity across all interfaces, and update the documentation to match.

## What Changes

- Update all prompt messages and status indicators in CLI orchestrators (`agent`, `ask`, `plan`) to match the premium SaaS tone established in the wakeup screen.
- Revise Telegram bot welcome messages and command descriptions in `constants.ts` to be more professional and polished.
- Update UI components and documentation text in the web app to reflect the new tone.
- Standardize the use of chalk colors across the CLI based on the `THEME` defined in `wakeup.ts`.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- `cli-tone`: Standardize the CLI and Telegram bot tone and messaging.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

- CLI user experience (status messages, prompts)
- Telegram bot user experience (welcome messages)
- Documentation and Web App copy
