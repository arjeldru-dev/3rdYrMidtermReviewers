# Phase 03: Feedback System & Gemini AI Tutor

> **Objective**: Implement instantaneous answer evaluation, visual feedback states, Google Gemini 2.0 Flash REST integration, explanation caching, markdown rendering, and robust rate-limit/network error handling.  
> **Duration**: ~35 minutes (AI execution)  
> **Dependencies**: Phase 00 (Data), Phase 01 (Design), Phase 02 (Quiz Engine)  

---

## Phase Goals

1. Evaluate submitted answers, lock choices from further modification, highlight correct choice in green (`#2E7D52`), mark incorrect selection in red (`#C44D3E`), and dim remaining options.
2. Formulate academic system prompt and request payload for the Google Gemini API (`gemini-2.0-flash`).
3. Call the Gemini REST endpoint with `AbortController` timeout (30 seconds) and automatic 4-second exponential retry on HTTP 429 rate limits.
4. Render markdown explanations into structured HTML with conceptual clarification, option breakdown, and memory tips.
5. Cache explanations in session memory so subsequent review screens display answers instantly without repeat API calls.

---

## Prompt Files in This Phase

| # | Prompt | Purpose |
|---|--------|---------|
| 03.1 | [01_answer_evaluation_and_feedback_ui.md](01_answer_evaluation_and_feedback_ui.md) | Implement `js/feedback.js` for answer validation, visual badges, choice locking, and Next button workflow |
| 03.2 | [02_gemini_api_integration.md](02_gemini_api_integration.md) | Implement `js/ai.js` connecting directly to Gemini REST endpoint with temperature 0.3, formatting prompt, and 429 retry backoff |
| 03.3 | [03_explanation_rendering_and_error_handling.md](03_explanation_rendering_and_error_handling.md) | Implement parsing of AI markdown responses, loading skeleton state, fallback explanations, and offline recovery |

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Model | `gemini-2.0-flash` | Free tier (15 RPM, 1M tokens/day) provides rapid inference (<3s), strong university-level reasoning, and direct REST availability without API SDK overhead. |
| Call Timing | Automatic Upon Submission | Students receive immediate visual confirmation, and while reading the result, the AI explanation streams/loads seamlessly below without requiring an extra click. |
| Caching | In-Memory Session Map | Prevents redundant network requests, avoids hitting rate limits when reviewing mistakes, and keeps student data entirely private. |
| Fallback Strategy | Graceful Degradation | Quiz functions 100% reliably even with no API key, bad keys, or offline networks — student still gets the correct answer key. |

---

## Skills to Load

Before starting this phase, load these skill files if available:
- `clean-code` — Async/await patterns, error boundaries, early returns.
- `emil-design-eng` — Subtle loading skeleton animations and feedback badge transitions.

---

## Exit Criteria

Before moving to Phase 04, verify:

- [ ] Submitting an answer locks all choice cards and immediately reveals correct vs incorrect status.
- [ ] If correct: card turns green with subtle pulse; if incorrect: chosen card turns red, correct card turns green.
- [ ] Submitting triggers Gemini API call with proper system prompt and JSON payload.
- [ ] Explanation box displays a clean loading shimmer state while awaiting the API response.
- [ ] Successful response parses markdown (bold, lists, code) into clean HTML.
- [ ] HTTP 429, 401, or offline states show helpful contextual recovery messages.
- [ ] Clicking "Next Question" increments question index or transitions to Results when question 50 is finished.

---

**Next Phase**: [Phase 04: Results & Topic Analytics](../phase_04_results_and_review/00_PHASE_OVERVIEW.md)
