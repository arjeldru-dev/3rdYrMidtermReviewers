# 04.1 Score Calculation and Topic Analytics

## Context

<context>
At the conclusion of the 50-question reviewer, students require a thorough diagnosis of their readiness for the midterm examination. Merely showing a raw number is insufficient; students need to see which specific AI topics they have mastered (e.g. Search Algorithms vs. Logic & Knowledge Representation). This step implements the scoring calculation, letter grade assignment, and topic breakdown analytics as defined in Feature F5 of the specification.
</context>

## Prerequisites

<prerequisites>
- `data/questions.js` with all 50 items categorized into 7 topics.
- `js/state.js` storing completed user answers.
- `#results-screen` DOM container scaffolded in `index.html`.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `js/results.js` to compute session statistics, letter grades, and syllabus topic mastery bars.

Think step by step:

1. **Calculate Overall Score and Grade**
   - Function `renderResultsScreen()`:
     - `const totalQuestions = session.questionOrder.length;` (50)
     - `const correctCount = session.score;`
     - `const percentage = Math.round((correctCount / totalQuestions) * 100);`
     - Update `#results-score` with: `${correctCount} / ${totalQuestions}`
     - Update `#results-percentage` with: `${percentage}%`
     - Determine letter grade & badge styling:
       - $\ge 90\%$: `"Excellent"` (class `.grade-excellent`, green)
       - $\ge 80\%$: `"Very Good"` (class `.grade-very-good`, teal)
       - $\ge 70\%$: `"Good"` (class `.grade-good`, blue)
       - $\ge 60\%$: `"Needs Improvement"` (class `.grade-warning`, amber)
       - $< 60\%$: `"Study More"` (class `.grade-danger`, red)
     - Inject grade label and motivational study tip.

2. **Compute 7-Topic Mastery Breakdown**
   - Identify the 7 syllabus topics:
     1. AI Foundations
     2. Agents & Environments
     3. Search Algorithms
     4. Informed Search & Heuristics
     5. Constraint Satisfaction
     6. Logic & Knowledge Representation
     7. Inference Methods
   - For each topic:
     - Find all question IDs belonging to this topic:
       `const topicQuestions = window.QUESTIONS.filter(q => q.topic === topicName);`
     - Count how many the student answered correctly:
       `const topicCorrect = topicQuestions.filter(q => session.answers[q.id]?.correct).length;`
     - Calculate percentage:
       `const topicPct = Math.round((topicCorrect / topicQuestions.length) * 100);`
     - Status color:
       - If `topicPct >= 80`: Green (`#2E7D52`)
       - If `topicPct >= 60`: Teal / Neutral (`#2D6A5A`)
       - If `topicPct < 60`: Amber warning (`#D4880F`)

3. **Render Topic Breakdown List (`#topic-breakdown-list`)**
   - Output template for each topic row:
     ```html
     <div class="topic-row ${topicPct < 60 ? 'topic-weak' : ''}">
       <div class="topic-info">
         <span class="topic-name">${topicName}</span>
         <span class="topic-fraction">${topicCorrect} / ${topicQuestions.length} (${topicPct}%)</span>
       </div>
       <div class="topic-bar-track">
         <div class="topic-bar-fill" style="width: ${topicPct}%; background-color: ${barColor};"></div>
       </div>
     </div>
     ```

4. **Action Buttons Binding**
   - Button `#btn-review-mistakes`:
     - If student got 50/50 (0 mistakes), disable or hide button and show celebration message.
     - Else, transitions to `STATES.REVIEW` and invokes `renderReviewScreen()`.
   - Button `#btn-restart-quiz`:
     - Resets session data and transitions to `STATES.WELCOME`.
</instructions>

<requirements>
### Functional Requirements
- Accurate percentage and letter grade categorization.
- All 7 curriculum topics represented with correct/total ratios summing to 50.
- Weak topics (< 60%) prominently flagged to guide active study sessions.
- Clean restart capability without requiring full browser page refresh.

### Technical Requirements
- Pure mathematical aggregation with zero floating point rounding errors.
- Smooth CSS transition for all 7 topic progress bars.

### File Naming Conventions
- Path: `js/results.js`
</requirements>

<output_files>
Generate the following file:

1. `js/results.js` - Score computation, qualitative grade assignment, and 7-topic analytics visualization.
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
│   ├── results.js   ← NEW
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Include `<script src="js/results.js"></script>` in `index.html`.
- [ ] Complete a test run (or mock `session.answers` in console) with 40/50 correct:
  - Header displays "40 / 50 (80%)".
  - Grade badge displays "Very Good".
  - 7 topic progress bars render with proportional percentage widths.
- [ ] Topics below 60% are highlighted with amber warning border.
- [ ] Clicking "Restart Quiz" resets session and returns to the Welcome screen.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Topic percentages show NaN% | Topic question count was zero due to typo in topic name string | Verify exact topic string spelling against `data/questions.js` |
| Restart doesn't clear choices | Previous answer cache still held in memory | Reset `session.answers = {}` and `session.score = 0` in `initSession()` |

---

**Previous**: [Phase 04 Overview](./00_PHASE_OVERVIEW.md) | **Next**: [02 Missed Questions Review](./02_missed_questions_review_module.md)
