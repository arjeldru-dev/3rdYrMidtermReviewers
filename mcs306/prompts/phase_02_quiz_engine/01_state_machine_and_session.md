# 02.1 State Machine and Session Management

## Context

<context>
The application operates as a finite state machine (FSM) transitioning across five primary view states: `WELCOME`, `QUESTION`, `FEEDBACK`, `RESULTS`, and `REVIEW`. In addition to screen transitions, the app maintains an in-memory `QuizSession` tracking question sequence (supporting randomized Fisher-Yates shuffle), current question index, user answers, running score, and `localStorage` caching for the user's Gemini API key. This implements Section 4 (Logical App Structure & Data Model) of the specification.
</context>

## Prerequisites

<prerequisites>
- `data/questions.js` loaded and containing 50 questions.
- `index.html` scaffolded with `.screen` elements.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `js/state.js` to manage application state transitions, session lifecycle, and persistent settings.

Think step by step:

1. **State Machine Constants & Transition Controller**
   - Define states: `STATES = { WELCOME: 'WELCOME', QUESTION: 'QUESTION', FEEDBACK: 'FEEDBACK', RESULTS: 'RESULTS', REVIEW: 'REVIEW' }`.
   - Function `transitionTo(nextState)`:
     - Hides all `.screen` elements by removing the `.active` class.
     - Adds `.active` class to the container corresponding to `nextState`.
     - Controls `#quiz-header` visibility (hidden in `WELCOME`, visible in `QUESTION`, `FEEDBACK`, `RESULTS`, `REVIEW`).
     - Dispatches custom event `stateChange` with detail `{ state: nextState }`.

2. **Session Model & Lifecycle**
   - Object `session`:
     - `questionOrder`: Array of question IDs (1 to 50).
     - `currentIndex`: Number (0-based pointer into `questionOrder`).
     - `answers`: Object/Map keyed by question ID `{ selected: 'a', correct: true, timestamp: Date.now() }`.
     - `explanations`: Object/Map caching question ID to AI explanation string.
     - `score`: Running count of correct answers.
     - `settings`: `{ shuffled: boolean, apiKey: string | null }`.
   - Function `initSession(settings)`:
     - Copies question IDs `[1, 2, ..., 50]`.
     - If `settings.shuffled` is true, applies Fisher-Yates shuffle algorithm to `questionOrder`.
     - Resets `currentIndex = 0`, `answers = {}`, `explanations = {}`, `score = 0`.

3. **Fisher-Yates Shuffle Algorithm**
   - Implement an unbiased, in-place Fisher-Yates array shuffle helper:
     ```javascript
     function shuffleArray(array) {
       for (let i = array.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [array[i], array[j]] = [array[j], array[i]];
       }
       return array;
     }
     ```

4. **Persistent Settings (`localStorage`)**
   - Keys: `MCS306_GEMINI_API_KEY`, `MCS306_SHUFFLE_PREF`.
   - Functions `saveApiKey(key)`, `getApiKey()`, `saveShufflePref(bool)`, `getShufflePref()`.
   - Safely catch `SecurityError` or `QuotaExceededError` when running in private browsing modes where `localStorage` is blocked.
</instructions>

<requirements>
### Functional Requirements
- Smooth screen transitions with zero visual flashing.
- Shuffle mode produces true permutations of question order without duplicating or omitting questions.
- API key persists across reloads via `localStorage`.

### Technical Requirements
- Modular ES6 JavaScript.
- Defensive error handling around browser storage APIs.
- Self-contained namespace attached to `window.AppState` or clean module exports.

### File Naming Conventions
- Path: `js/state.js`
</requirements>

<output_files>
Generate the following file:

1. `js/state.js` - FSM state router, session lifecycle management, and storage persistence.
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
│   └── state.js  ← NEW
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Include `<script src="js/state.js"></script>` in `index.html`.
- [ ] Calling `window.AppState.transitionTo('QUESTION')` in console activates `#quiz-screen` and reveals `#quiz-header`.
- [ ] Initializing session with `shuffled: true` creates a 50-element array containing all numbers 1 to 50 in randomized order.
- [ ] Saving an API key updates `localStorage.getItem('MCS306_GEMINI_API_KEY')`.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `localStorage` throws error | Browser is in private mode with third-party storage blocked | Wrap `localStorage` calls in `try...catch` and fall back to in-memory storage |
| Questions repeat or missing during shuffle | Flawed shuffle index bounds | Verify standard Fisher-Yates swap logic (`Math.floor(Math.random() * (i + 1))`) |

---

**Previous**: [Phase 02 Overview](./00_PHASE_OVERVIEW.md) | **Next**: [02 Question Rendering & Selection](./02_question_rendering_and_selection.md)
