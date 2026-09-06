# 02.2 Question Rendering and Selection

## Context

<context>
The core interaction of the reviewer is reading a question, inspecting the four possible options, and choosing an answer card. The choice interface must be clean, legible, and resilient against accidental double-taps. Selecting an option provides instantaneous visual feedback and reveals the "Submit Answer" button. This implements Feature F2 from Section 3 of the project specification.
</context>

## Prerequisites

<prerequisites>
- `data/questions.js` loaded and containing 50 questions.
- `js/state.js` created in Step 02.1.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `js/quiz.js` to handle question card rendering, answer choice selection, and submission trigger.

Think step by step:

1. **Current Question Retrieval**
   - Function `getCurrentQuestion()`:
     - Looks up the current question ID from `session.questionOrder[session.currentIndex]`.
     - Finds the corresponding question object from `window.QUESTIONS`.

2. **Render Active Question Card**
   - Function `renderCurrentQuestion()`:
     - Updates `#quiz-topic-badge` with `question.topic`.
     - Updates `#quiz-question-number` with `"Question " + (session.currentIndex + 1) + " of 50"`.
     - Sets `#quiz-question-text` with `question.question` (ensuring Unicode entities and line wraps render cleanly).
     - Renders four choice buttons inside `#quiz-choices-grid`:
       - Choice template:
         ```html
         <button class="choice-card" data-choice="a" role="radio" aria-checked="false">
           <span class="choice-letter">A</span>
           <span class="choice-text">Option text here...</span>
         </button>
         ```
     - Resets selection state: removes `.selected` class from all cards.
     - Hides `#btn-submit-answer` (`classList.add('hidden')`).
     - Hides `#feedback-panel` (`classList.add('hidden')`).

3. **Choice Selection Event Handler**
   - Attach click listener to choice buttons (or event delegation on `#quiz-choices-grid`):
     - If feedback is already showing (question answered), ignore clicks.
     - Remove `.selected` and `aria-checked="false"` from all choice cards.
     - Add `.selected` and `aria-checked="true"` to the clicked card.
     - Store temporarily selected letter: `currentSelectedChoice = choiceLetter`.
     - Reveal `#btn-submit-answer` (`classList.remove('hidden')`).

4. **Keyboard Accessibility**
   - Support keyboard hotkeys:
     - Pressing keys `1`, `2`, `3`, `4` or `A`, `B`, `C`, `D` selects choices A, B, C, D respectively.
     - Pressing `Enter` when a choice is selected triggers submission.
</instructions>

<requirements>
### Functional Requirements
- Only one choice can be selected at any time.
- Clicking another choice immediately transfers the active selection state.
- "Submit Answer" button only appears when an option has been actively chosen.
- Mathematical equations and logic symbols must display clearly without escaping artifacts.

### Technical Requirements
- Event delegation on the choice container for optimal performance and memory cleanliness.
- Full keyboard accessibility (`Tab`, `Space`, `Enter`, and number/letter shortcuts).

### File Naming Conventions
- Path: `js/quiz.js`
</requirements>

<output_files>
Generate the following file:

1. `js/quiz.js` - Dynamic DOM rendering for question card, choices grid, selection state, and keyboard bindings.
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
│   ├── quiz.js   ← NEW
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Include `<script src="js/quiz.js"></script>` in `index.html`.
- [ ] On quiz start, Question 1 renders its topic badge, stem text, and 4 distinct choice cards.
- [ ] Clicking choice 'B' highlights card B and displays the "Submit Answer" button.
- [ ] Clicking choice 'C' moves highlight to card C.
- [ ] Pressing keyboard key 'A' selects card A.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Submit button doesn't reveal | CSS `.hidden` has stronger specificity or missing display rule | Check `.hidden { display: none !important; }` in `css/style.css` |
| Choice letters rendered lowercase | Text styling | Use uppercase text in markup or CSS `text-transform: uppercase` on `.choice-letter` |

---

**Previous**: [01 State Machine](./01_state_machine_and_session.md) | **Next**: [03 Progress Header](./03_progress_header_and_counter.md)
