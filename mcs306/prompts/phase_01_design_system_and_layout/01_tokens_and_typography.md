# 01.1 Tokens and Typography

## Context

<context>
The visual appeal and credibility of an academic reviewer rely heavily on typography and aesthetic restraint. Generic blue-and-gray bootstrap styling feels like a homework assignment, while a warm editorial aesthetic evokes a prestigious university publication. This step creates the foundational CSS token system and typography rules described in Section 5 of the project specification.
</context>

## Prerequisites

<prerequisites>
- Phase 00 complete.
- Project directory structure established.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `css/style.css` establishing the complete design token system using CSS Custom Properties and typography rules.

Think step by step:

1. **Import Google Fonts**
   - Preconnect to `https://fonts.googleapis.com` and `https://fonts.gstatic.com`.
   - Import `DM Serif Display:ital@0;1` and `Source Sans 3:ital,wght@0,300..900;1,300..900` and `JetBrains Mono:wght@400;600`.

2. **Define Design Tokens on `:root`**
   - **Backgrounds:**
     - `--bg-primary: #FAF8F5` (warm cream/parchment)
     - `--surface-card: #FFFFFF`
     - `--surface-subtle: #F4EFEA`
   - **Text Colors:**
     - `--text-primary: #1A1A1A` (deep charcoal)
     - `--text-secondary: #6B6B6B` (warm gray)
     - `--text-muted: #8C8782`
   - **Accent & Interaction:**
     - `--accent-teal: #2D6A5A`
     - `--accent-teal-hover: #245A4C`
     - `--accent-teal-light: #E9F1EF`
   - **Status Colors:**
     - `--correct-green: #2E7D52`
     - `--correct-bg: #E8F5EC`
     - `--incorrect-red: #C44D3E`
     - `--incorrect-bg: #FDECEA`
     - `--warning-amber: #D4880F`
     - `--warning-bg: #FFF8EB`
   - **Borders & Shadows:**
     - `--border-subtle: #E5E1DC`
     - `--border-medium: #D0CAC2`
     - `--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)`
     - `--shadow-md: 0 4px 12px rgba(45, 106, 90, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)`
     - `--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)`
   - **Radii:**
     - `--radius-sm: 6px`
     - `--radius-md: 10px`
     - `--radius-lg: 16px`
     - `--radius-full: 9999px`

3. **Establish Global Resets & Typography**
   - Box-sizing border-box reset.
   - Body font family: `'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif`.
   - Headings font family: `'DM Serif Display', Georgia, serif`.
   - Monospace font family: `'JetBrains Mono', monospace`.
   - Fluid responsive typography scales.
</instructions>

<requirements>
### Functional Requirements
- High-contrast, highly readable academic layout with zero eye fatigue.
- Clear visual hierarchy between headings, question stems, choices, and code/logic formulas.
- Interactive states (hover, active, focus-visible) with smooth transition timings (0.15s–0.2s).

### Technical Requirements
- Pure CSS with standard `:root` custom properties.
- Responsive base font size: 16px desktop, 15px mobile.
- Accessible color contrast ratios meeting WCAG AA standard (4.5:1 minimum for normal text).

### File Naming Conventions
- Path: `css/style.css`
</requirements>

<output_files>
Generate the following file:

1. `css/style.css` - Core design tokens, global resets, typography styles, button styles, and utility classes.
</output_files>

## Directory Structure

After completing this step, the project should have:

```
project-root/
├── css/
│   └── style.css  ← NEW
├── data/
│   └── questions.js
└── index.html (pending step 01.2)
```

## Verification

<verification>
After completing this step, confirm:

- [ ] `css/style.css` exists and parses cleanly with no unclosed blocks.
- [ ] CSS custom properties are accessible under `:root`.
- [ ] Fonts load correctly from Google Fonts CDN with fallbacks.
- [ ] Contrast between `--text-primary` (`#1A1A1A`) and `--bg-primary` (`#FAF8F5`) is greater than 14:1.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Fonts fail to load offline | Google Fonts CDN requires internet connection | Ensure robust fallback fonts (`Georgia, serif` and `sans-serif`) are specified |
| Text appears washed out | Color tokens applied with incorrect opacity | Check that `--text-primary` is `#1A1A1A` without unintended opacity values |

---

**Previous**: [Phase 01 Overview](./00_PHASE_OVERVIEW.md) | **Next**: [02 Scaffolding & Screens](./02_dom_scaffolding_and_screens.md)
