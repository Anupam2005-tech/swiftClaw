Here is the completely unified, premium **PRD & FRD** document. It perfectly preserves your original core engineering requirements, tools, and architecture, while seamlessly integrating the high-octane, sassy UI/UX architecture and AI generation prompts for the landing page.

You can feed this single `.md` file directly to your development team or an AI coding assistant to build both the CLI backend and the jaw-dropping Next.js frontend.

---

# 🦅 swiftClaw — Premium Product & UI Architecture Blueprint (PRD/FRD)

> **Version:** 1.0.0 · **Status:** Production-Ready · **Classification:** Public
> **Aesthetic Vibe:** Dark-mode luxury, hyper-responsive, unapologetically sassy.

---

## 🦾 Table of Contents

1. [Executive Vision & Core Philosophy](https://www.google.com/search?q=%231-executive-vision--core-philosophy)
2. [Target Audience](https://www.google.com/search?q=%232-target-audience)
3. [Functional Blueprint (FRD)](https://www.google.com/search?q=%233-functional-blueprint-frd)
4. [UI/UX Architecture & AI Prompts (Landing Page)](https://www.google.com/search?q=%234-uiux-architecture--ai-prompts-landing-page)
5. [System Architecture & Agent Tools](https://www.google.com/search?q=%235-system-architecture--agent-tools)
6. [Remote Gateway (Telegram Core)](https://www.google.com/search?q=%236-remote-gateway-telegram-core)
7. [Installation & Non-Functional Requirements](https://www.google.com/search?q=%237-installation--non-functional-requirements)
8. [The Infinite Scale Roadmap](https://www.google.com/search?q=%238-the-infinite-scale-roadmap)
9. [Glossary](https://www.google.com/search?q=%239-glossary)

---

## 1. Executive Vision & Core Philosophy

**swiftClaw** is not just another terminal wrapper designed to hallucinate deletions over your production repository. It is a premium, high-octane, AI-powered terminal companion and autonomous developer agent—a spiritual fork of openClaw, rebuilt for speed and uncompromising human-in-the-loop control.

If other tools treat developers like passive observers, swiftClaw treats you like an orchestra conductor. You provide the intent; swiftClaw executes inside a beautiful sandbox, waiting for your absolute clearance before touching a single sector on your live disk.

**The Operational Modes:**

* 🟡 **Agent Mode (The Workhorse):** Give it a task, grab a coffee, watch it stack up staged files, and approve with a single keystroke.
* 🔵 **Plan Mode (The Architect):** Decomposes complex infrastructure migrations into step-by-step interactive milestones before writing code.
* 🟢 **Ask Mode (The Reader):** A strictly sandboxed, read-only system that charts out unknown codebases flawlessly.

---

## 2. Target Audience

| Persona | Description |
| --- | --- |
| **Solo Developer** | Needs an autonomous agent that can explore and refactor large codebases safely. |
| **Remote Developer** | Wants to trigger and approve agent tasks from a phone via Telegram while away from the desk. |
| **Open-Source Contributor** | Uses Ask mode to understand unfamiliar repositories faster than reading outdated docs. |
| **DevOps / Platform Eng.** | Uses Plan mode to decompose and execute multi-step infrastructure tasks securely. |

---

## 3. Functional Blueprint (FRD)

### FR-001: The Zero-Trust Staging Engine

* **FR-001.1:** All file creation, modification, deletion, and shell execution MUST be staged in an isolated buffer before application.
* **FR-001.2:** The system MUST present a buttery-smooth diff/preview of all staged changes to the user before commit.
* **FR-001.3:** User MUST be able to approve or reject each staged change independently. Rejection discards all related changes with zero side effects.
* **FR-001.4:** Approval applies changes atomically to the live filesystem.

### FR-002: Contextual Guardrails & Web Intelligence

* **FR-002.1:** Web discovery operations (`web_search`, `web_scrape`) are context-locked and require a valid `FIRECRAWL_API_KEY`.
* **FR-002.2:** Web-retrieved info updates LLM context only. Auto-injecting code from the web without human approval is strictly blocked.

### FR-003: Skill Customization Engine

* **FR-003.1:** Auto-discovers custom markdown workflows inside the root `.agent/` directory.
* **FR-003.2:** System dynamically parses instructions and registers them as selectable skills (`list_skills`, `read_skill_docs`).

---

## 4. UI/UX Architecture & AI Prompts (Landing Page)

This section contains the precise generative prompts required to build the `swiftclaw.dev` frontend.
**System Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, GSAP.

### A. The Canvas: Global Background

> **AI Generation Prompt:**
> "Initialize the root layout using `meghtrix/background-components` from 21st.dev. Create a deep `bg-zinc-950` canvas. Apply a subtle, hardware-accelerated grid ray effect using CSS radial masks and linear gradients (`bg-[size:4rem_4rem]`). The grid should faintly pulse with an amber/orange undertone. Ensure the background remains completely fixed (`fixed inset-0 z-0`) while the rest of the application scrolls smoothly over it."

### B. The Command Bridge: Navbar

> **AI Generation Prompt:**
> "Build a premium, sticky top navigation bar using a glassmorphic effect (`backdrop-blur-xl bg-zinc-950/50`). Left side: swiftClaw logo ('🦅') with gradient text. Center: Minimalist links ('Capabilities', 'Roadmap', 'FAQ') that feature a glowing amber underline on hover via Framer Motion. Right side: A primary CTA button ('Install CLI') with a glowing border effect. For mobile, integrate `andrewlu0/sidebar` from 21st.dev as a sleek, slide-out menu."

### C. The Hook: Hero Combo

> **AI Generation Prompt:**
> "Implement the `sensewood8/responsive-hero-banner` component. Use GSAP to orchestrate an entrance timeline: Fade in a glowing pill badge ('🦅 SWIFTCLAW V1.0 IS LIVE'), followed by the massive headline 'Code like a god. Supervise like a boss.' using text stagger animations. Make the second half a gradient text clip. Below this, render a floating, glassmorphic terminal mockup typing out the install script, using Framer Motion for levitation physics."

### D. The Revelation: 'What is swiftClaw?' Section

> **AI Generation Prompt:**
> "Transition from the hero using the `sshahaider/wave-path` component. A glowing amber SVG wave should draw itself down the page via ScrollTrigger, leading into a split-layout section. Left side: A bold heading 'Not just a wrapper. A lethal companion.' with sassy monospace copy explaining the zero-trust sandbox. Right side: A beautifully styled IDE window simulation showing a live 'Staging Buffer' diff."

### E. The Arsenal: Capabilities Component

> **AI Generation Prompt:**
> "Utilize the `kokonutd/bento-grid` from 21st.dev for a breathtaking asymmetric grid (`bg-zinc-900/60`, `backdrop-blur-md`).
> * Card 1 (Large): 'Agent Mode' looping log UI.
> * Card 2 (Wide): 'Telegram Gateway' mock chat bubble with an inline '✅ Approve' button.
> * Card 3 (Square): 'Plan & Ask Modes'.
> Apply Framer Motion `whileHover={{ scale: 1.02, y: -5 }}` with a subtle amber border glow on hover. Integrate `originui/tooltip` for any technical terms."
> 
> 

### F. The Horizon: 'What's Coming Next' (Roadmap)

> **AI Generation Prompt:**
> "Build a vertical timeline mapping the future of swiftClaw. Use a dashed vertical line. Nodes: v1.1 (Memory Integration), v1.2 (MCP Sync), v2.0 (Multimodal). As the user scrolls down, use Framer Motion `whileInView` to light up each node from gray to a vibrant blue/amber, filling the dashed line as if energy is flowing into the future."

### G. The Interrogation: Frequently Asked Questions

> **AI Generation Prompt:**
> "Implement `originui/accordion` for an elegant FAQ section. Strip away heavy borders; use only a 1px bottom border. Ensure smooth, hardware-accelerated height transitions. The questions are standard, but the answers must be sassy (e.g., 'Q: Will this delete my production db? A: No, because we actually implemented a staging sandbox unlike your last intern.')."

### H. The Exit: Footer Component

> **AI Generation Prompt:**
> "Implement `sshahaider/footer-section`. Top half: A newsletter signup disguised as a terminal input (`> root@swiftclaw: enter_email --subscribe`). Bottom half: Grid-aligned typographic links. The footer must have an aggressive gradient fade overlay merging into pure black at the bottom edge, with a subtle watermark: 'Built with arrogance and precision'."

---

## 5. System Architecture & Agent Tools

```text
                       ┌───────────────────────────────┐
                       │      Developer Intent         │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                               ┌───────────────────────┐
│     Local TUI Engine  │                               │    Remote Gateway     │
└───────────┬───────────┘                               └───────────┬───────────┘
            └──────────────────────────┬────────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │     ToolLoopAgent Context     │
                       └───────────────┬───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │  Strict Staging Sandboxing    │
                       └───────────────┬───────────────┘
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
   [❌ Action Rejected]                                  [✅ Action Approved]
  Discard Buffer / Rollback                              Commit Atomically to Live FS

```

### Agent Tools Reference

| Tool | Description | Staging Required |
| --- | --- | --- |
| `createfile` | Create a new file with specified content | ✅ Yes |
| `modify_file` | Patch or replace content in an existing file | ✅ Yes |
| `delete_file` | Remove a file from the workspace | ✅ Yes |
| `execute_shell` | Run a terminal shell command | ✅ Yes |
| `read_file` / `list_files` | Read file content or scan directories | ❌ No |
| `search_files` / `analyze` | Glob-pattern search and dependency analysis | ❌ No |

---

## 6. Remote Gateway (Telegram Core)

When you're away from the keyboard, your project shouldn't stall. The remote interface maps absolute terminal execution right into secure inline interactive messages.

**Acceptance Rules for Remote UI:**

1. **Diff Previews:** Staged changes must be published to the linked Telegram chat as a clean, monospaced diff block.
2. **Inline Controls:** Must feature instant-action inline buttons (`✅ Run Plan`, `✅ Approve`, `❌ Reject`).
3. **Strict Auth:** Only commands originating from the configured `TELEGRAM_OWNER_ID` will be processed. All other requests are silently dropped.

```text
┌────────────────────────────────────────────────────────┐
│  🦅 swiftClaw Agent Monitor                             │
├────────────────────────────────────────────────────────┤
│  ⚠️ STAGED MUTATION DETECTED                            │
│                                                        │
│  Task: Refactor auth middleware to parse Bearer tokens │
│                                                        │
│  Diff Preview:                                         │
│  ─── src/auth.ts                                       │
│  ▲ +  const token = authHeader.split(' ')[1];           │
│  ▼ -  const token = authHeader[1];                     │
│                                                        │
│  [ ✅ Approve & Commit ]     [ ❌ Reject & Burn ]      │
└────────────────────────────────────────────────────────┘

```

---

## 7. Installation & Non-Functional Requirements

### Installation

```bash
# Pick your poison. No bulk, no unnecessary packages.
npm install -g swiftclaw
pnpm add -g swiftclaw
bun add -g swiftclaw

# Universal shell injection (recommended)
curl -fsSL https://swiftclaw.dev/install | bash

```

### NFRs & Security

* **NFR-001 (Performance):** Like caching high-frequency data, the TUI must boot in under 2 seconds. The tool loop iteration must not introduce more than 500ms overhead per cycle.
* **NFR-002 (Security):** No code or context data is stored on external servers. The staging engine prevents all writes without explicit confirmation. `TELEGRAM_OWNER_ID` validation is absolute.
* **NFR-003 (Reliability):** Failed staged operations MUST cleanly roll back without partial writes.
* **NFR-004 (Portability):** Runs flawlessly across macOS, Linux, and Windows.

---

## 8. The Infinite Scale Roadmap

```text
v1.0  ──●── Now
         │   Agent / Plan / Ask modes
         │   Staging Engine & Premium 21st.dev Web UI
         │   Telegram Gateway
         │   Firecrawl Web Intelligence
         │
v1.1  ──○── Memory Integration
         │   Persistent cross-session context
         │   User preference memory
         │
v1.2  ──○── MCP + Workspace Integration
         │   Model Context Protocol support
         │   GitHub / GitLab / Jira sync
         │
v2.0  ──○── Multimodal
             Video & audio input recognition
             Multi-agent collaboration

```

---

## 9. Glossary

| Term | Definition |
| --- | --- |
| **Staging Engine** | The sandboxed, zero-trust environment where proposed changes are held pending user approval. |
| **ToolLoopAgent** | The core reasoning loop that selects and executes tools iteratively. |
| **Skill** | A user-defined markdown workflow stored in `.agent/` that guides agent behavior. |
| **Approval Flow** | The UI mechanism (TUI buttons or Telegram inline buttons) through which users approve or reject staged changes. |
| **MCP** | Model Context Protocol — a future integration target for standardized model context management. |

---

*swiftClaw v1.0 · Designed for builders. Supervised by humans.*