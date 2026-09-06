# Appendix A: Design System Specification

## Visual Concept & Atmosphere

The MCS 306 Quiz Reviewer utilizes a **Warm Academic Editorial** aesthetic, reminiscent of prestigious university examination papers, high-end technical publications, and thoughtful interactive learning environments.

---

## 1. Color Palette

| Token | Hex Value | Semantic Purpose |
|---|---|---|
| `--bg-primary` | `#FAF8F5` | Main viewport parchment background |
| `--surface-card` | `#FFFFFF` | Question and results card surface |
| `--surface-subtle` | `#F4EFEA` | Secondary panels, choice idle background |
| `--text-primary` | `#1A1A1A` | Main question text, high contrast headers |
| `--text-secondary` | `#6B6B6B` | Meta labels, timestamps, descriptive guidance |
| `--text-muted` | `#8C8782` | Topic tags, keyboard hint shortcuts |
| `--accent-teal` | `#2D6A5A` | Primary brand accent, CTA buttons, active state |
| `--accent-teal-hover` | `#245A4C` | Button hover and interactive focus |
| `--accent-teal-light` | `#E9F1EF` | Selected choice tint, topic badge background |
| `--correct-green` | `#2E7D52` | Success answer borders, correct icons |
| `--correct-bg` | `#E8F5EC` | Correct choice card background |
| `--incorrect-red` | `#C44D3E` | Mistake answer borders, incorrect icons |
| `--incorrect-bg` | `#FDECEA` | Mistake choice card background |
| `--warning-amber` | `#D4880F` | Weak topic flag (< 60% mastery) |
| `--warning-bg` | `#FFF8EB` | Weak topic alert highlight |
| `--border-subtle` | `#E5E1DC` | Card borders, dividers, choice idle border |
| `--border-medium` | `#D0CAC2` | Input borders, elevated dividers |

---

## 2. Typography

### Font Families
- **Display / Headings:** `'DM Serif Display', Georgia, serif`
  - Used for course title, screen titles, and score hero.
- **Body & Interface:** `'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif`
  - Used for questions, answer choices, explanation text, and buttons.
- **Monospace / Logic:** `'JetBrains Mono', 'Courier New', monospace`
  - Used for formal logic symbols, formulas, and state notation.

### Typographic Scale
- **Display Large (Hero Score):** `48px / 1.1` (`font-weight: 400`, serif)
- **H1 (Page/Screen Title):** `28px / 1.25` (`font-weight: 400`, serif)
- **H2 (Section Header):** `22px / 1.3` (`font-weight: 600`, sans-serif)
- **Question Stem:** `18px / 1.5` (`font-weight: 600`, sans-serif)
- **Choice Text:** `16px / 1.45` (`font-weight: 400`, sans-serif)
- **Body & Explanations:** `15px / 1.6` (`font-weight: 400`, sans-serif)
- **Captions & Badges:** `13px / 1.4` (`font-weight: 600`, uppercase, letter-spacing +0.5px)

---

## 3. Elevation & Shadows

- `--shadow-sm`: `0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)`
- `--shadow-md`: `0 4px 12px rgba(45, 106, 90, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)`
- `--shadow-lg`: `0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)`

---

## 4. Spacing & Border Radii

- Container Max Width: `800px` (centered horizontally with `margin: 0 auto`)
- Component Radii:
  - Small elements / Badges: `6px` (`--radius-sm`)
  - Choice cards & Inputs: `10px` (`--radius-md`)
  - Main containers & Modals: `16px` (`--radius-lg`)
  - Pills & Progress Tracks: `9999px` (`--radius-full`)
