# 04.2 Missed Questions Review Module

## Context

<context>
The core principle of active recall is reviewing mistakes to prevent repeating them on the actual midterm exam. When a student finishes the quiz, clicking "Review Mistakes" opens a dedicated review mode presenting all missed questions, showing what the student picked, what the correct answer was, and re-displaying the AI explanation cached from earlier in the session without issuing new network requests. This implements the review mode of Feature F5.
</context>

## Prerequisites

<prerequisites>
- `js/state.js` storing `session.answers` and `session.explanations`.
- `js/results.js` wired to the "Review Mistakes" button.
- `#review-screen` DOM container present in `index.html`.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `js/review.js` to render and interact with the missed questions review interface.

Think step by step:

1. **Filter Missed Questions**
   - Function `renderReviewScreen()`:
     - Query all question IDs from `session.questionOrder`.
     - Filter for questions where `session.answers[id]?.correct === false`.
     - Update `#review-title` with `"Questions You Missed (" + missedQuestions.length + " / " + session.questionOrder.length + ")"`.

2. **Render Expandable Review Cards**
   - For each missed question:
     - Retrieve question object from `window.QUESTIONS`.
     - Retrieve student's selection: `const studentChoice = session.answers[q.id].selected;`
     - Retrieve cached AI explanation: `const cachedExplanation = session.explanations[q.id] || "No AI explanation was generated for this question.";`
     - Output card markup:
       ```html
       <div class="missed-card" data-question-id="${q.id}">
         <div class="missed-card-header">
           <div class="missed-badges">
             <span class="badge badge-subtle">Q${q.id}</span>
             <span class="badge badge-topic">${q.topic}</span>
           </div>
           <button class="btn-toggle-expand" aria-expanded="true">
             <span class="toggle-icon">▼</span>
           </button>
         </div>
         <p class="missed-question-text">${q.question}</p>
         <div class="missed-answers-comparison">
           <div class="answer-row incorrect-row">
             <span class="answer-label">Your Answer:</span>
             <span class="answer-val">(${studentChoice.toUpperCase()}) ${q.choices[studentChoice]}</span>
           </div>
           <div class="answer-row correct-row">
             <span class="answer-label">Correct Answer:</span>
             <span class="answer-val">(${q.answer.toUpperCase()}) ${q.choices[q.answer]}</span>
           </div>
         </div>
         <div class="missed-explanation-drawer">
           <div class="explanation-title">
             <span class="sparkle">✨</span> Professor's Explanation
           </div>
           <div class="explanation-content">${cachedExplanation}</div>
         </div>
       </div>
       ```

3. **Card Expand / Collapse Interaction**
   - Attach click listener to `.btn-toggle-expand` or card header:
     - Toggles class `.collapsed` on `.missed-card`.
     - Updates `aria-expanded` and rotates toggle chevron.

4. **Return Navigation**
   - Attach click listener to `#btn-back-to-results`:
     - Transitions state back to `STATES.RESULTS`.
</instructions>

<requirements>
### Functional Requirements
- Only questions that were actually missed appear in the list.
- If the student answered all 50 correctly, display a celebratory empty state ("Outstanding! Zero missed questions").
- Explanation draws directly from `session.explanations` cache with zero additional network requests.
- Clicking "Back to Results" returns to the results summary without recalculating or resetting the session.

### Technical Requirements
- Accessible accordion controls with `aria-expanded` attributes.
- Smooth CSS height/opacity transitions on expand/collapse.

### File Naming Conventions
- Path: `js/review.js`
</requirements>

<output_files>
Generate the following file:

1. `js/review.js` - Dynamic rendering of missed question cards, cached explanation presentation, and accordion behavior.
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
│   ├── ai.js
│   ├── feedback.js
│   ├── progress.js
│   ├── quiz.js
│   ├── results.js
│   ├── review.js    ← NEW
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Include `<script src="js/review.js"></script>` in `index.html`.
- [ ] In a completed quiz session with 3 missed questions, clicking "Review Mistakes" opens the Review screen showing exactly 3 cards.
- [ ] Each card clearly shows the student's incorrect pick in red and the correct answer in green.
- [ ] Cached AI explanations appear immediately without network loading delay.
- [ ] Clicking "Back to Results" restores the Results screen.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Explanations show raw markdown or "[object Object]" | AI explanation was stored as JSON or not rendered via markdown parser | Ensure cached value in `session.explanations` is parsed HTML string or run through `renderMarkdown()` |
| Toggle icon stays upside down | CSS transform was hardcoded without toggling class | Toggle `.collapsed` class and use `.missed-card.collapsed .toggle-icon { transform: rotate(-90deg); }` |

---

**Previous**: [01 Score & Topic Analytics](./01_score_calculation_and_topic_analytics.md) | **Next**: [Phase 04 Checklist](./99_PHASE_CHECKLIST.md)
