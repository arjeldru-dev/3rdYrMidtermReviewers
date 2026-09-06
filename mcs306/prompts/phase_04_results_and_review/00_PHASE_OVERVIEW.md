# Phase 04: Results & Topic Analytics

> **Objective**: Implement comprehensive quiz completion analytics, overall score calculation, university letter grade equivalence, 7-topic mastery breakdown bars, and an interactive review screen for missed questions utilizing cached AI explanations.  
> **Duration**: ~25 minutes (AI execution)  
> **Dependencies**: Phase 00 (Data), Phase 02 (State Machine), Phase 03 (Feedback & AI Cache)  

---

## Phase Goals

1. Compute final session metrics: overall score (`X / 50`), score percentage, and qualitative letter grade badge (e.g. "Excellent", "Very Good", "Needs Improvement").
2. Calculate per-topic performance across all 7 syllabus topics and render visual topic breakdown cards with colored progress bars.
3. Build the "Review Mistakes" screen displaying expandable cards for every question answered incorrectly, showing the student's choice, the correct answer, and the cached AI explanation.
4. Support clean quiz reset functionality to restart the session from the welcome screen.

---

## Prompt Files in This Phase

| # | Prompt | Purpose |
|---|--------|---------|
| 04.1 | [01_score_calculation_and_topic_analytics.md](01_score_calculation_and_topic_analytics.md) | Implement `js/results.js` computing total scores, academic letter grades, and 7-topic syllabus breakdown statistics |
| 04.2 | [02_missed_questions_review_module.md](02_missed_questions_review_module.md) | Implement `js/review.js` displaying expandable mistake cards with cached AI explanations and return-to-results routing |

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Topic Aggregation | Client-side In-Memory Computation | 50 questions is small enough to calculate instantaneously without database or server processing. |
| Review Cache | Direct Read from `session.explanations` | Eliminates duplicate network calls to Gemini when students review their mistakes, saving quota and ensuring zero wait time. |
| Grade Scale | Standard Philippine / BulSU Grading Equivalent | 90%+ = Excellent, 80–89% = Very Good, 70–79% = Good, 60–69% = Needs Improvement, <60% = Study More. |

---

## Skills to Load

Before starting this phase, load these skill files if available:
- `clean-code` — Clean data aggregation algorithms and formatted tables.
- `emil-design-eng` — Impactful score hero typography and polished progress bar indicators.

---

## Exit Criteria

Before moving to Phase 05, verify:

- [ ] Finishing question 50 automatically transitions to the Results screen.
- [ ] Overall score (e.g. `38 / 50`) and percentage display prominently.
- [ ] Letter grade badge displays correctly according to the score threshold.
- [ ] All 7 topics are displayed with their question counts, correct ratios, and animated mastery bars.
- [ ] Topics with < 60% mastery display an amber warning highlight.
- [ ] Clicking "Review Mistakes" opens the Review screen with only the missed questions.
- [ ] Each missed question card expands to reveal the question stem, student's answer, correct answer, and cached AI explanation.
- [ ] Clicking "Restart Quiz" resets session data and returns to the Welcome screen.

---

**Next Phase**: [Phase 05: Polish, Micro-Interactions & Hardening](../phase_05_polish_and_hardening/00_PHASE_OVERVIEW.md)
