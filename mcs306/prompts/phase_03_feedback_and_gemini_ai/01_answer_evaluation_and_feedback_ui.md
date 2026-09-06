# 03.1 Answer Evaluation and Feedback UI

## Context

<context>
After choosing an answer card and clicking "Submit Answer", the user requires immediate feedback on whether their choice was correct or incorrect before reading the detailed explanation. Choices must become immutable to preserve academic assessment integrity, the right answer must be highlighted, and the "Next Question" button must be displayed. This implements Feature F3 from Section 3 of the project specification.
</context>

## Prerequisites

<prerequisites>
- `js/state.js` and `js/quiz.js` implemented.
- Choice cards and feedback panel present in `index.html`.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `js/feedback.js` to manage answer submission evaluation, choice state styling, feedback panel display, and next-question navigation.

Think step by step:

1. **Answer Submission Handler**
   - Function `submitAnswer()`:
     - Retrieve current question: `const currentQ = getCurrentQuestion();`
     - Retrieve selected choice: `const selected = currentSelectedChoice;`
     - If no choice selected, return early.
     - Determine correctness: `const isCorrect = (selected.toLowerCase() === currentQ.answer.toLowerCase());`
     - Record in session:
       ```javascript
       session.answers[currentQ.id] = {
         selected: selected,
         correct: isCorrect,
         timestamp: Date.now()
       };
       if (isCorrect) {
         session.score++;
       }
       ```
     - Hide `#btn-submit-answer`.

2. **Choice Card Visual Lock & Highlights**
   - Query all choice cards:
     - Add class `.disabled` (remove pointer events, cursor `default`).
     - If choice matches `currentQ.answer`: add class `.correct` (forest green border and light green background).
     - If choice matches `selected` AND NOT `isCorrect`: add class `.incorrect` (warm red border and red background).
     - Other options receive class `.dimmed` (opacity 0.6).

3. **Feedback Panel Reveal**
   - Show `#feedback-panel` (`classList.remove('hidden')`).
   - Populate `#feedback-status`:
     - If `isCorrect`:
       HTML: `<div class="badge badge-success"><span class="badge-icon">✓</span> Correct!</div>`
     - If `!isCorrect`:
       HTML: `<div class="badge badge-danger"><span class="badge-icon">✗</span> Incorrect</div>`
   - Populate `#feedback-correct-answer`:
     - If incorrect, display: `"The correct answer is (" + currentQ.answer.toUpperCase() + ") " + currentQ.choices[currentQ.answer]`
   - Update label of `#btn-next-question`:
     - If `session.currentIndex + 1 < session.questionOrder.length`: `"Next Question →"`
     - If last question: `"View Final Results →"`

4. **Next Question / Results Transition**
   - Attach listener to `#btn-next-question`:
     - If `session.currentIndex + 1 < session.questionOrder.length`:
       - Increment `session.currentIndex++`.
       - Render next question: `renderCurrentQuestion()`.
       - Scroll smoothly to top of question card.
     - Else:
       - Trigger results calculation and transition to `STATES.RESULTS`.

5. **Trigger AI Explanation Pipeline**
   - Immediately call `fetchAndRenderExplanation(currentQ, selected, isCorrect)` (implemented in step 03.2).
</instructions>

<requirements>
### Functional Requirements
- Choices immediately freeze upon submission; no re-selecting permitted.
- Correct choice is always clearly identifiable in green.
- If incorrect, the student's erroneous selection is highlighted in red alongside the correct answer.
- Smooth transition to either the next question or the final results screen.

### Technical Requirements
- Dispatches `answerSubmitted` custom event to update the progress header running score.
- Keyboard binding: Pressing `Enter` when feedback panel is visible triggers the Next Question button.

### File Naming Conventions
- Path: `js/feedback.js`
</requirements>

<output_files>
Generate the following file:

1. `js/feedback.js` - Evaluates submissions, styles choices, manages feedback panel, and drives next-question routing.
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
│   ├── feedback.js  ← NEW
│   ├── progress.js
│   ├── quiz.js
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Include `<script src="js/feedback.js"></script>` in `index.html`.
- [ ] Submitting correct answer on Question 1 highlights Choice C in green and increments running score.
- [ ] Submitting incorrect answer (e.g. Choice A) turns Choice A red and Choice C green.
- [ ] All 4 choice cards become unclickable after submitting.
- [ ] Clicking "Next Question" displays Question 2 with fresh interactive choices and reset feedback panel.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| User can still click choices after submission | Event listener still firing on choice cards | Check if `session.answers[currentQ.id]` exists in choice click handler and exit early |
| Button says "Next Question" on Question 50 | Off-by-one check on array length | Check `session.currentIndex + 1 === session.questionOrder.length` for results CTA |

---

**Previous**: [Phase 03 Overview](./00_PHASE_OVERVIEW.md) | **Next**: [02 Gemini API Integration](./02_gemini_api_integration.md)
