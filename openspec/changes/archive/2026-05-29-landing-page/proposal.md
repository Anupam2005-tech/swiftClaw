## Why

swiftClaw lacks a public marketing site at `swiftclaw.dev`. The unified PRD ([swiftclaw-prd-frd.md](../../../swiftclaw-prd-frd.md)) defines **FR-008** and **Section 4 (UI/UX Architecture)** — a premium dark-mode landing page that showcases modes, Telegram gateway, and install paths. This change delivers that web presence.

## What Changes

- Add a Next.js 15 app at `apps/web` with Tailwind CSS v4, Framer Motion, and GSAP.
- Install and compose 21st.dev components (background, sidebar, hero, wave-path, bento-grid, tooltip, accordion, footer).
- Implement PRD sections A–H: global canvas, navbar, hero, what-is + staging diff, capabilities bento, roadmap timeline, FAQ, footer.
- Satisfy FR-008.1–3: premium aesthetics, install instructions (npm/pnpm/bun/curl), multi-mode + Telegram highlights.

## Capabilities

### New Capabilities

- `landing-page`: Marketing and distribution hub for swiftClaw at `swiftclaw.dev`.

### Modified Capabilities

- (none)

## Impact

- **New code:** `apps/web/` — standalone Next.js app, not bundled into CLI `dist/`.
- **Dependencies:** React, Next.js 15, Tailwind v4, framer-motion, gsap, shadcn/ui + 21st.dev components.
- **Distribution:** Primary entry point for new users; deployable to Vercel.

## Non-Goals

- CLI staging engine, Telegram gateway, or agent backend changes.
- Full web dashboard, auth, or newsletter API backend.
