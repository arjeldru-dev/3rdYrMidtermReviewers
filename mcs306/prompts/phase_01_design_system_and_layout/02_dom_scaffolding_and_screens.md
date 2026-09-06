# 01.2 DOM Scaffolding and Screens

## Context

<context>
The MCS306 Quiz Reviewer functions as a single-page state machine navigating between distinct application screens: Welcome/Settings, Active Quiz, Feedback Drawer/Panel, Results Analytics, and Mistake Review. To ensure instantaneous navigation without page reloads or layout flashes, the complete DOM structure is declared in `index.html` and toggled using display states. This implements the DOM hierarchy specified in Section 4 of the specification.
</context>

## Prerequisites

<prerequisites>
- `css/style.css` created in Step 01.1.
- `data/questions.js` created in Step 00.1.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `index.html` containing the semantic DOM structure for the entire application, linked to `css/style.css` and `data/questions.js`.

Think step by step:

1. **HTML Shell & Meta Tags**
   - Standard HTML5 doctype, `lang="en"`, UTF-8 charset, responsive viewport meta tag.
   - Title: `MCS 306 Midterm Reviewer — Introduction to Artificial Intelligence`.
   - Link `css/style.css`.
   - Include script tag for `data/questions.js`.

2. **Fixed Quiz Header (`#quiz-header`)**
   - Hidden on the welcome screen; fixed at the top during quiz and review modes.
   - Elements:
     - Course identifier badge (`MCS 306 · AI Midterm Reviewer`).
     - Live progress bar container (`.progress-track` and `.progress-fill`).
     - Question counter indicator (`#header-counter`, e.g., "Question 12 of 50").
     - Running score badge (`#header-score`, e.g., "Score: 8/11").

3. **Welcome Screen Section (`#welcome-screen.screen.active`)**
   - University badge (`Bulacan State University · College of Science`).
   - Main title (`MCS 306: Introduction to Artificial Intelligence`).
   - Reviewer briefing card with official exam instructions (active recall advice, intermediate scratch work recommendation).
   - Settings Panel (`#settings-panel`):
     - Gemini API Key input field (`type="password"`, with toggle to show/hide, placeholder `AIzaSy...`, helper note mentioning local storage only).
     - Shuffle toggle switch/checkbox (`#shuffle-toggle`).
   - Prominent primary CTA button: "Start Quiz" (`#btn-start-quiz`).

4. **Quiz Screen Section (`#quiz-screen.screen`)**
   - Question Card (`.question-card`):
     - Topic badge (`#quiz-topic-badge`).
     - Question stem (`#quiz-question-text`).
     - Choices container (`#quiz-choices-grid`): 4 interactive choice buttons with option keys (a, b, c, d) and text content.
     - Action bar with "Submit Answer" button (`#btn-submit-answer`, initially hidden until a choice is selected).
   - Feedback Panel (`#feedback-panel.hidden`):
     - Status indicator banner (`#feedback-status` with icon and text: "Correct!" or "Incorrect").
     - Correct answer callout (`#feedback-correct-answer`).
     - AI Explanation box (`#ai-explanation-box`) with loading spinner / pulsing skeleton state and markdown text container.
     - Next Question button (`#btn-next-question`).

5. **Results Screen Section (`#results-screen.screen`)**
   - Score Hero Card (`.score-hero`): Large score display (`#results-score`, e.g. "38 / 50"), percentage badge, and letter grade badge (`#results-grade`).
   - Performance message based on score percentage.
   - Topic Mastery Breakdown table/cards (`#topic-breakdown-list`): Each topic showing questions correct/total, percentage, and colored mini progress bar.
   - Action buttons: "Review Mistakes" (`#btn-review-mistakes`) and "Restart Quiz" (`#btn-restart-quiz`).

6. **Review Screen Section (`#review-screen.screen`)**
   - Header with summary: "Questions You Missed" (`#review-title`).
   - Expandable missed question list (`#missed-questions-list`).
   - "Back to Results" button (`#btn-back-to-results`).

7. **Footer**
   - Institutional footer: "Bulacan State University · College of Science · MCS 306 Midterm Reviewer".
</instructions>

<requirements>
### Functional Requirements
- Every interactive element must have a clear, descriptive `id` for JavaScript binding.
- Only `#welcome-screen` should have the `.active` class on initial load; all other screens hidden.
- Clean semantic HTML structure using `<header>`, `<main>`, `<section>`, and `<footer>`.

### Technical Requirements
- Accessible form controls: label associated with input via `for`/`id`.
- Responsive layout container with `max-width: 800px` centered horizontally.
- Zero broken asset links.

### File Naming Conventions
- Path: `index.html`
</requirements>

<output_files>
Generate the following file:

1. `index.html` - The complete semantic markup and DOM scaffolding for all screens and components.
</output_files>

## Directory Structure

After completing this step, the project should have:

```
project-root/
├── css/
│   └── style.css
├── data/
│   └── questions.js
└── index.html  ← NEW
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Double-clicking `index.html` in Chrome/Edge/Firefox opens the welcome screen cleanly.
- [ ] Header, question card, feedback panel, results screen, and review screen exist in DOM.
- [ ] Inspecting elements in developer tools confirms all required IDs exist (`#btn-start-quiz`, `#quiz-screen`, `#feedback-panel`, etc.).
- [ ] No console errors appear on initial page load.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| All screens show at the same time | `.screen` class missing CSS `display: none` rule in `style.css` | Ensure `.screen { display: none; }` and `.screen.active { display: block; }` are declared |
| Fonts look standard Arial / Times | Missing internet connection or typo in Google Fonts `<link>` | Check Google Fonts link href and font family declarations |

---

**Previous**: [01 Tokens & Typography](./01_tokens_and_typography.md) | **Next**: [Phase 01 Checklist](./99_PHASE_CHECKLIST.md)
