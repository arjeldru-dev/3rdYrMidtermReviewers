# MCS306 Quiz Reviewer — Implementation Guide

> **Generated from:** `project_specification.md`  
> **Total Phases:** 6 (Phases 00–05)  
> **Total Steps:** 13 prompt files  
> **Target Platform:** Client-side Web (Single `index.html` zero-server architecture)  
> **Estimated AI Execution Time:** ~2 hours

---

## Quick Start

1. Start with **Phase 00** and execute each prompt step in exact sequential order.
2. Each step file (`NN_step_name.md`) is a self-contained prompt designed to be fed into an AI coding agent (e.g., GPT-5.3-Codex, Claude Opus 4.6).
3. Complete and verify every assertion in `99_PHASE_CHECKLIST.md` before advancing to the subsequent phase.
4. If skills are available in the environment, load the designated skills noted in each phase's `00_PHASE_OVERVIEW.md` before execution.

---

## Phase Overview

| Phase | Directory | Steps | Focus |
|:---:|:---|:---:|:---|
| **00** | [Phase 00: Data Extraction & Structuring](./phase_00_data/00_PHASE_OVERVIEW.md) | 1 | Parsing & typing all 50 exam questions and mapping topic categories |
| **01** | [Phase 01: Design System & Layout](./phase_01_design_system_and_layout/00_PHASE_OVERVIEW.md) | 2 | Editorial CSS design tokens, typography, and DOM screen scaffolding |
| **02** | [Phase 02: Quiz Engine & State Machine](./phase_02_quiz_engine/00_PHASE_OVERVIEW.md) | 3 | FSM state machine, question card rendering, answer selection, and progress header |
| **03** | [Phase 03: Feedback & Gemini AI Tutor](./phase_03_feedback_and_gemini_ai/00_PHASE_OVERVIEW.md) | 3 | Immediate answer validation, Gemini 2.0 Flash integration, and explanation rendering |
| **04** | [Phase 04: Results & Topic Analytics](./phase_04_results_and_review/00_PHASE_OVERVIEW.md) | 2 | Score scoring engine, 7-topic syllabus breakdown, and review mode for mistakes |
| **05** | [Phase 05: Polish & Hardening](./phase_05_polish_and_hardening/00_PHASE_OVERVIEW.md) | 2 | Micro-interactions, animations, responsive polish (375px+), and fallback hardening |

---

## Dependency Graph

```
Phase 00 (Question Data Structuring)
    ↓
Phase 01 (Design Tokens & DOM Shell)
    ↓
Phase 02 (FSM State Engine & Question Card Display)
    ↓
Phase 03 (Feedback System & Gemini AI Integration)
    ↓
Phase 04 (Results Screen & Topic Analytics Breakdown)
    ↓
Phase 05 (Polish, Micro-Interactions & Offline Hardening)
```

---

## Master Directory & File Index

### Phase 00: Data Extraction & Structuring
- [00_PHASE_OVERVIEW.md](./phase_00_data/00_PHASE_OVERVIEW.md)
- [01_question_bank_structuring.md](./phase_00_data/01_question_bank_structuring.md)
- [99_PHASE_CHECKLIST.md](./phase_00_data/99_PHASE_CHECKLIST.md)

### Phase 01: Design System & Layout Scaffolding
- [00_PHASE_OVERVIEW.md](./phase_01_design_system_and_layout/00_PHASE_OVERVIEW.md)
- [01_tokens_and_typography.md](./phase_01_design_system_and_layout/01_tokens_and_typography.md)
- [02_dom_scaffolding_and_screens.md](./phase_01_design_system_and_layout/02_dom_scaffolding_and_screens.md)
- [99_PHASE_CHECKLIST.md](./phase_01_design_system_and_layout/99_PHASE_CHECKLIST.md)

### Phase 02: Quiz Engine & State Machine
- [00_PHASE_OVERVIEW.md](./phase_02_quiz_engine/00_PHASE_OVERVIEW.md)
- [01_state_machine_and_session.md](./phase_02_quiz_engine/01_state_machine_and_session.md)
- [02_question_rendering_and_selection.md](./phase_02_quiz_engine/02_question_rendering_and_selection.md)
- [03_progress_header_and_counter.md](./phase_02_quiz_engine/03_progress_header_and_counter.md)
- [99_PHASE_CHECKLIST.md](./phase_02_quiz_engine/99_PHASE_CHECKLIST.md)

### Phase 03: Feedback System & Gemini AI Tutor
- [00_PHASE_OVERVIEW.md](./phase_03_feedback_and_gemini_ai/00_PHASE_OVERVIEW.md)
- [01_answer_evaluation_and_feedback_ui.md](./phase_03_feedback_and_gemini_ai/01_answer_evaluation_and_feedback_ui.md)
- [02_gemini_api_integration.md](./phase_03_feedback_and_gemini_ai/02_gemini_api_integration.md)
- [03_explanation_rendering_and_error_handling.md](./phase_03_feedback_and_gemini_ai/03_explanation_rendering_and_error_handling.md)
- [99_PHASE_CHECKLIST.md](./phase_03_feedback_and_gemini_ai/99_PHASE_CHECKLIST.md)

### Phase 04: Results & Topic Analytics
- [00_PHASE_OVERVIEW.md](./phase_04_results_and_review/00_PHASE_OVERVIEW.md)
- [01_score_calculation_and_topic_analytics.md](./phase_04_results_and_review/01_score_calculation_and_topic_analytics.md)
- [02_missed_questions_review_module.md](./phase_04_results_and_review/02_missed_questions_review_module.md)
- [99_PHASE_CHECKLIST.md](./phase_04_results_and_review/99_PHASE_CHECKLIST.md)

### Phase 05: Polish, Micro-Interactions & Hardening
- [00_PHASE_OVERVIEW.md](./phase_05_polish_and_hardening/00_PHASE_OVERVIEW.md)
- [01_transitions_and_micro_interactions.md](./phase_05_polish_and_hardening/01_transitions_and_micro_interactions.md)
- [02_responsive_hardening_and_offline_states.md](./phase_05_polish_and_hardening/02_responsive_hardening_and_offline_states.md)
- [99_PHASE_CHECKLIST.md](./phase_05_polish_and_hardening/99_PHASE_CHECKLIST.md)

### Appendix Reference
- [A_DESIGN_SYSTEM.md](./appendix/A_DESIGN_SYSTEM.md)
- [B_GEMINI_API_SPEC.md](./appendix/B_GEMINI_API_SPEC.md)
- [C_QUESTION_TOPIC_TAXONOMY.md](./appendix/C_QUESTION_TOPIC_TAXONOMY.md)

---

## Post-Implementation Checklist

After completing all 6 phases:
- [ ] Quiz loads completely in under 1 second without external server runtime.
- [ ] All 50 questions display accurately with flawless Unicode math notation.
- [ ] API key persists safely in `localStorage` across page reloads.
- [ ] Submitting answers triggers immediate visual grading, followed by AI explanation loading.
- [ ] Results screen accurately calculates letter grades and 7 topic proficiency bars.
- [ ] Review mode displays all missed questions with cached explanations without redundant network requests.
- [ ] Responsive testing passes on mobile viewports down to 375px.
