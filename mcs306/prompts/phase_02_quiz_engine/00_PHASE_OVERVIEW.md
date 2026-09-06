# Phase 02: Quiz Engine & State Machine

> **Objective**: Implement the finite state machine, session management (shuffling, settings, `localStorage`), dynamic question card rendering, answer choice selection, and the persistent progress tracking header.  
> **Duration**: ~35 minutes (AI execution)  
> **Dependencies**: Phase 00 (Data), Phase 01 (Design & DOM Scaffolding)  

---

## Phase Goals

1. Implement an in-memory session manager handling question ordering (sequential or Fisher-Yates shuffle), current question index, running score, and recorded selections.
2. Build the state transition engine controlling screen changes (`WELCOME` $\rightarrow$ `QUESTION` $\rightarrow$ `FEEDBACK` $\rightarrow$ `RESULTS` $\rightarrow$ `REVIEW`).
3. Render questions and multiple-choice cards with interactive single-choice selection states and a conditional "Submit Answer" button.
4. Drive the sticky header showing live animated progress bar, question counter ("Question X of 50"), and running score ("Score: Y/Z").

---

## Prompt Files in This Phase

| # | Prompt | Purpose |
|---|--------|---------|
| 02.1 | [01_state_machine_and_session.md](01_state_machine_and_session.md) | Implement `js/state.js` managing application state machine, quiz session state, Fisher-Yates shuffle, and `localStorage` API key persistence |
| 02.2 | [02_question_rendering_and_selection.md](02_question_rendering_and_selection.md) | Implement `js/quiz.js` for rendering question cards, choice selection, and Submit button visibility |
| 02.3 | [03_progress_header_and_counter.md](03_progress_header_and_counter.md) | Implement `js/progress.js` updating the sticky progress bar, question counter, and running score animations |

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Pattern | Vanilla JS In-Memory State Object + Event Dispatch | Avoids heavy frameworks like Redux or React; keeps the whole app light and fast. |
| Shuffling Scope | Question Order Only (Option Order Fixed) | In the official exam, choices are keyed specifically (a, b, c, d) and questions reference specific choice letters. Shuffling questions while preserving choice order protects accuracy. |
| Submission Gate | Explicit Submit Button | Prevents accidental tap/click misfires on mobile or laptop touchpads from locking in an unintended answer. |

---

## Skills to Load

Before starting this phase, load these skill files if available:
- `clean-code` — Single responsibility functions, early returns, clean state transitions.
- `cc-skill-frontend-patterns` — State management patterns in vanilla JavaScript.
- `emil-design-eng` — Tactile button selection micro-interactions and smooth progress bar transitions.

---

## Exit Criteria

Before moving to Phase 03, verify:

- [ ] Clicking "Start Quiz" transitions from Welcome to Quiz screen without errors.
- [ ] Toggling "Shuffle" randomizes question order via Fisher-Yates shuffle.
- [ ] API key entered on Welcome screen is saved to `localStorage` and pre-populated upon refresh.
- [ ] Question stem, topic badge, and four choices render accurately for the active question.
- [ ] Clicking choice A highlights it; clicking choice B moves selection to B and enables "Submit Answer".
- [ ] Header updates to reflect the current question number and animated progress bar width.

---

**Next Phase**: [Phase 03: Feedback System & Gemini AI Tutor](../phase_03_feedback_and_gemini_ai/00_PHASE_OVERVIEW.md)
