## ADDED Requirements

### Requirement: Global canvas and background (PRD §4.A)
The landing page SHALL render a fixed deep `zinc-950` background with a subtle amber grid ray effect that remains fixed while content scrolls over it.

#### Scenario: User loads the site
- **WHEN** the root layout renders
- **THEN** a hardware-accelerated grid background is visible at `z-0` and page content scrolls above it

### Requirement: Navigation (PRD §4.B)
The landing page SHALL provide a sticky glassmorphic navbar with logo, section links (Capabilities, Roadmap, FAQ), Install CLI CTA, and a mobile slide-out sidebar.

#### Scenario: User navigates on desktop
- **WHEN** user hovers a nav link
- **THEN** an amber underline animation is shown

#### Scenario: User navigates on mobile
- **WHEN** user opens the menu
- **THEN** a slide-out sidebar exposes the same links and CTA

### Requirement: Hero section (PRD §4.C)
The landing page SHALL display a GSAP-animated hero with live badge, headline "Code like a god. Supervise like a boss." (gradient on second half), and a floating glassmorphic terminal mockup showing the install script.

#### Scenario: User lands on homepage
- **WHEN** the page first loads
- **THEN** badge, headline, and terminal animate in via staggered entrance

### Requirement: What is swiftClaw (PRD §4.D)
The landing page SHALL transition from hero via an amber SVG wave (ScrollTrigger) into a split section: zero-trust copy on the left and a staging-buffer IDE diff mock on the right.

#### Scenario: User scrolls past hero
- **WHEN** the wave-path section enters view
- **THEN** the wave draws and the what-is section becomes visible

### Requirement: Capabilities bento (PRD §4.E)
The landing page SHALL showcase Agent Mode, Telegram Gateway, and Plan & Ask modes in an asymmetric bento grid with hover scale/glow and tooltips for technical terms.

#### Scenario: User views capabilities
- **WHEN** user scrolls to the capabilities section
- **THEN** three distinct cards display mode-specific mock UIs

### Requirement: Roadmap timeline (PRD §4.F)
The landing page SHALL show a vertical timeline for v1.1 (Memory), v1.2 (MCP Sync), and v2.0 (Multimodal) with nodes lighting up on scroll.

#### Scenario: User scrolls roadmap
- **WHEN** a timeline node enters the viewport
- **THEN** it animates from gray to blue/amber

### Requirement: FAQ (PRD §4.G)
The landing page SHALL provide an accordion FAQ with minimal borders and sassy answers.

#### Scenario: User expands a question
- **WHEN** user clicks a FAQ item
- **THEN** the answer expands with a smooth height transition

### Requirement: Footer (PRD §4.H)
The landing page SHALL include a terminal-styled newsletter input, link grid, gradient fade to black, and watermark "Built with arrogance and precision".

#### Scenario: User reaches page bottom
- **WHEN** user scrolls to the footer
- **THEN** footer content and gradient overlay are visible

### Requirement: Installation instructions (FR-008.2)
The landing page SHALL provide copy-pasteable install commands for npm, pnpm, bun, and curl.

#### Scenario: User seeks installation
- **WHEN** user views the hero terminal or install section
- **THEN** all four install methods are visible and copyable

### Requirement: Feature showcase (FR-008.1, FR-008.3)
The landing page SHALL highlight premium aesthetics, Agent/Plan/Ask modes, and Telegram Gateway approval flow.

#### Scenario: User reviews the page
- **WHEN** user visits the full page
- **THEN** modes and Telegram remote approval are clearly demonstrated
