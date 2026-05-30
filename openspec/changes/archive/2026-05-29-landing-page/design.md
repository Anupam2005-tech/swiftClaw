## Context

Per [swiftclaw-prd-frd.md](../../../swiftclaw-prd-frd.md) Section 4 and FR-008, swiftClaw needs a premium marketing landing page. Prior OpenSpec tasks were marked complete without code; this design aligns implementation with the PRD stack and 21st.dev component registry.

## Goals / Non-Goals

**Goals:**
- Next.js 15 App Router app at `apps/web`.
- Tailwind CSS v4, Framer Motion, GSAP (+ ScrollTrigger where needed).
- PRD sections A–H using specified 21st.dev `shadcn add` URLs.
- FR-008 install block and mode/Telegram showcase.

**Non-Goals:**
- Web dashboard (v1.3+).
- Newsletter backend (footer email: client placeholder for v1).
- Production DNS deploy (document Vercel only).

## Decisions

| Decision | Choice |
|----------|--------|
| Location | `apps/web` — sibling to CLI root package |
| Framework | Next.js 15, TypeScript, App Router, `src/` dir |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` |
| Animation | Framer Motion (hover/scroll), GSAP (hero entrance, wave ScrollTrigger) |
| UI primitives | shadcn/ui init + 21st.dev registry components |
| Deploy | Vercel or static export |

### 21st.dev component installs (from `apps/web`)

```bash
npx shadcn@latest add https://21st.dev/r/meghtrix/background-components
npx shadcn@latest add https://21st.dev/r/andrewlu0/sidebar
npx shadcn@latest add https://21st.dev/r/sensewood8/responsive-hero-banner
npx shadcn@latest add https://21st.dev/r/sshahaider/wave-path
npx shadcn@latest add https://21st.dev/r/kokonutd/bento-grid
npx shadcn@latest add https://21st.dev/r/originui/tooltip
npx shadcn@latest add https://21st.dev/r/originui/accordion
npx shadcn@latest add https://21st.dev/r/sshahaider/footer-section
```

## Risks / Trade-offs

- **21st.dev + Tailwind v4 peer conflicts** — Mitigate by adjusting `components.json` and postcss config after each add.
- **Maintenance burden** — Keep page mostly static; minimal custom logic beyond composition.
