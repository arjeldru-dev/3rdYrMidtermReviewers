# Phase 01: Design System & Layout Scaffolding

> **Objective**: Establish the warm academic editorial design system, CSS custom properties token system, typography integration, and complete semantic DOM screen hierarchy.  
> **Duration**: ~30 minutes (AI execution)  
> **Dependencies**: Phase 00 (Data Extraction)  

---

## Phase Goals

1. Define CSS custom properties for colors, elevation, spacing, radii, and typography matching Section 5 of the specification.
2. Integrate Google Fonts (`DM Serif Display` and `Source Sans 3`) with fallback system fonts.
3. Scaffold the complete HTML shell with all five core view sections (`welcome-screen`, `quiz-screen`, `feedback-panel`, `results-screen`, `review-screen`).
4. Implement screen visibility state classes (`.screen`, `.active`, `.hidden`) so screens can be toggled cleanly via CSS.

---

## Prompt Files in This Phase

| # | Prompt | Purpose |
|---|--------|---------|
| 01.1 | [01_tokens_and_typography.md](01_tokens_and_typography.md) | Create `css/style.css` containing CSS custom properties, academic palette, Google Fonts, and typography rules |
| 01.2 | [02_dom_scaffolding_and_screens.md](02_dom_scaffolding_and_screens.md) | Scaffold semantic HTML5 layout in `index.html` with containers for all quiz screens and fixed header |

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Styling Strategy | Vanilla CSS + CSS Custom Properties | No build step required; lightweight, zero runtime cost, and full control over editorial styles. |
| Font Pairing | `DM Serif Display` + `Source Sans 3` | Delivers a distinguished university examination look without sacrificing body readability. |
| View Management | CSS Display Toggling (`.screen.active`) | Simple, declarative screen switching without heavy client-side router dependencies. |

---

## Skills to Load

Before starting this phase, load these skill files if available:
- `design-taste-frontend` — Distinctive editorial visual design principles and anti-generic aesthetic tokens.
- `high-end-visual-design` — Subtle card shadows, typographic hierarchy, and warm background calibration.
- `emil-design-eng` — Attention to layout spacing, typography, and optical balance.

---

## Exit Criteria

Before moving to Phase 02, verify:

- [ ] `index.html` and `css/style.css` load cleanly without 404 errors.
- [ ] Google Fonts `DM Serif Display` and `Source Sans 3` are active.
- [ ] CSS variables are defined on `:root` including `--bg-warm`, `--accent-teal`, `--text-primary`, `--correct-green`, etc.
- [ ] All 5 application screens are present in the DOM with proper unique IDs and semantic HTML tags.
- [ ] Toggling `.active` class switches visible screens smoothly in browser inspection.

---

**Next Phase**: [Phase 02: Quiz Engine & State Machine](../phase_02_quiz_engine/00_PHASE_OVERVIEW.md)
