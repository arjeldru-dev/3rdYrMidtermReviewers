# 02.3 Progress Header and Counter

## Context

<context>
During a 50-question study session, students need continuous feedback on their pacing and cumulative score. A persistent sticky header provides reassurance and motivation through a smooth CSS-animated progress bar, question counter ("Question 12 of 50"), and live running score ("Score: 8/11"). This implements Feature F6 from Section 3 of the project specification.
</context>

## Prerequisites

<prerequisites>
- `js/state.js` and `js/quiz.js` implemented.
- Header DOM elements present in `index.html`.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `js/progress.js` to manage the sticky progress bar, question counter, and running score indicator.

Think step by step:

1. **Header Elements Cache**
   - Cache references to:
     - Header container: `#quiz-header`
     - Progress bar fill: `.progress-fill`
     - Counter label: `#header-counter`
     - Score label: `#header-score`

2. **Update Progress Visuals**
   - Function `updateProgressHeader()`:
     - Calculate progress percentage:
       `const pct = Math.round(((session.currentIndex) / session.questionOrder.length) * 100);`
     - Update progress bar style:
       `progressBarFill.style.width = pct + "%";`
       Set `aria-valuenow` to `pct`.
     - Update question counter:
       `headerCounter.textContent = "Question " + (session.currentIndex + 1) + " of " + session.questionOrder.length;`
     - Update running score:
       Count how many questions have been submitted:
       `const answeredCount = Object.keys(session.answers).length;`
       `headerScore.textContent = "Score: " + session.score + " / " + answeredCount;`

3. **Smooth Animations**
   - In CSS, ensure `.progress-fill` has `transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1)`.
   - When score increments, briefly apply `.score-pulse` class to `#header-score` for a subtle green glow animation before removing it.

4. **Event Binding**
   - Listen for custom events dispatched by the quiz engine:
     - `questionRendered` $\rightarrow$ call `updateProgressHeader()`.
     - `answerSubmitted` $\rightarrow$ call `updateProgressHeader()` with score pulse.
</instructions>

<requirements>
### Functional Requirements
- Progress bar accurately represents completed progress (0% at question 1, 100% on results).
- Running score only accounts for answered questions (`score / answeredCount`), avoiding false 0/50 early impressions.
- Sticky position at top of viewport during quiz mode.

### Technical Requirements
- Hardware-accelerated CSS transitions for progress bar animation.
- Clean ARIA attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`).

### File Naming Conventions
- Path: `js/progress.js`
</requirements>

<output_files>
Generate the following file:

1. `js/progress.js` - Dynamic progress calculation, bar animation, and score tracking updates.
</output_files>

## Directory Structure

After completing this step, the project should have:

```
project-root/
├── css/
│   └── style.css
├── data/
│   └── questions.js
├── js/
│   ├── progress.js  ← NEW
│   ├── quiz.js
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Include `<script src="js/progress.js"></script>` in `index.html`.
- [ ] On Question 1, counter reads "Question 1 of 50".
- [ ] On Question 25, progress bar width is ~50%.
- [ ] After answering 3 questions with 2 correct, score displays "Score: 2 / 3".
- [ ] Header stays pinned to the top when scrolling through long question stems on smaller screens.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Progress bar jumps abruptly without transition | Missing CSS transition declaration | Add `transition: width 0.3s ease-out;` to `.progress-fill` in `style.css` |
| Score shows NaN | Division by zero before any questions are answered | Guard `answeredCount === 0 ? "Score: 0 / 0" : ...` |

---

**Previous**: [02 Question Rendering](./02_question_rendering_and_selection.md) | **Next**: [Phase 02 Checklist](./99_PHASE_CHECKLIST.md)
