# Phase 00: Data Extraction & Structuring

> **Objective**: Parse, validate, and structure all 50 questions from the MCS 306 Midterm Reviewer into a clean, typed JavaScript data structure with verified correct answers, Unicode math symbols, and topic associations.  
> **Duration**: ~20 minutes (AI execution)  
> **Dependencies**: None  

---

## Phase Goals

1. Extract all 50 multiple choice questions from `MCS306_Midterm_Reviewer.content.txt` / `MCS306_Midterm_Reviewer.json` into a well-structured array.
2. Normalize mathematical and logic expressions into universal Unicode characters ($\forall$, $\exists$, $\wedge$, $\vee$, $\neg$, $\to$, $\models$, $\in$).
3. Categorize each question into one of the 7 designated curriculum topics.
4. Export the questions array cleanly into `data/questions.js` (or embedded in `index.html`).

---

## Prompt Files in This Phase

| # | Prompt | Purpose |
|---|--------|---------|
| 00.1 | [01_question_bank_structuring.md](01_question_bank_structuring.md) | Parse, clean, and structure the 50 multiple-choice questions into a standardized JavaScript array |

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Question Storage | JavaScript Array of Objects (`questions.js`) | Avoids external network latency or CORS file-loading errors when running directly via `file://`. |
| Math Rendering | Native Unicode Characters | Zero bundle weight and 100% browser compatibility without requiring heavy MathJax or KaTeX libraries. |
| Topic Mapping | Strict 7-Category Taxonomy | Directly reflects BulSU MCS 306 midterm exam syllabus structure (Q1-Q4 AI Foundations, Q5-Q10 Agents, etc.). |

---

## Skills to Load

Before starting this phase, load these skill files if available:
- `clean-code` — Clean data structuring, standard formatting, and descriptive keys.
- `cc-skill-coding-standards` — ES6 export conventions and strict object shapes.

---

## Exit Criteria

Before moving to Phase 01, verify:

- [ ] Exactly 50 question objects are present in the dataset.
- [ ] Every question object has `id` (1–50), `question` (string), `choices` (keys a, b, c, d), `answer` ("a" | "b" | "c" | "d"), and `topic` (string).
- [ ] No placeholder or missing choices exist.
- [ ] Mathematical symbols in questions 13, 18, 38-47 use verified Unicode symbols.
- [ ] The file loads into the browser console without syntax errors.

---

**Next Phase**: [Phase 01: Design System & Layout Scaffolding](../phase_01_design_system_and_layout/00_PHASE_OVERVIEW.md)
