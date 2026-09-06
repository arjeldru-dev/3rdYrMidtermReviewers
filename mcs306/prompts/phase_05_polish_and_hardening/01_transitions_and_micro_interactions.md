# 05.1 Transitions and Micro-Interactions

## Context

<context>
The difference between a functional quiz and a delightful, memorable learning product lies in micro-interactions. Subtle hover elevations, smooth radio-selection checks, tactile click presses, celebratory pulses for correct answers, and subtle horizontal shakes for incorrect guesses transform the application into an engaging study companion. This step implements the micro-interaction polish specified in Section 5 of the project specification.
</context>

## Prerequisites

<prerequisites>
- Phases 00 through 04 complete.
- `css/style.css` and `js/quiz.js` functional.
</prerequisites>

## AI Implementation Prompt

<instructions>
Enhance `css/style.css` and `js/quiz.js` with micro-animations, tactile transitions, and keyboard accessibility shortcuts.

Think step by step:

1. **Choice Card Transitions & Tactile Feedback**
   - In `css/style.css`, apply transitions to `.choice-card`:
     ```css
     .choice-card {
       transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                   box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                   border-color 0.15s ease,
                   background-color 0.15s ease;
     }
     .choice-card:hover:not(.disabled) {
       transform: translateY(-2px);
       box-shadow: var(--shadow-md);
       border-color: var(--accent-teal);
     }
     .choice-card:active:not(.disabled) {
       transform: translateY(0);
       box-shadow: var(--shadow-sm);
     }
     .choice-card.selected {
       border-color: var(--accent-teal);
       background-color: var(--accent-teal-light);
       box-shadow: 0 0 0 2px var(--accent-teal);
     }
     ```

2. **Feedback Badges Keyframes**
   - Correct Answer Pulse:
     ```css
     @keyframes success-pulse {
       0% { transform: scale(0.96); box-shadow: 0 0 0 0 rgba(46, 125, 82, 0.4); }
       70% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(46, 125, 82, 0); }
       100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 125, 82, 0); }
     }
     .choice-card.correct {
       animation: success-pulse 0.4s ease-out;
     }
     ```
   - Incorrect Answer Gentle Shake:
     ```css
     @keyframes error-shake {
       0%, 100% { transform: translateX(0); }
       20%, 60% { transform: translateX(-4px); }
       40%, 80% { transform: translateX(4px); }
     }
     .choice-card.incorrect {
       animation: error-shake 0.35s ease-in-out;
     }
     ```

3. **Loading Shimmer Keyframes**
   - Ensure the AI skeleton line has a fluid moving gradient shimmer:
     ```css
     @keyframes shimmer {
       0% { background-position: -200% 0; }
       100% { background-position: 200% 0; }
     }
     .skeleton-line {
       background: linear-gradient(90deg, #EBE6E0 25%, #F5F1EC 50%, #EBE6E0 75%);
       background-size: 200% 100%;
       animation: shimmer 1.5s infinite linear;
     }
     ```

4. **Keyboard Accessibility Shortcuts**
   - In `js/quiz.js`, listen to `keydown` events:
     - Keys `1`, `2`, `3`, `4` or `a`, `b`, `c`, `d`: Select corresponding option card.
     - Key `Enter`:
       - If choice selected and submit button visible: trigger `submitAnswer()`.
       - If feedback panel visible: trigger Next Question button.
     - Ensure shortcuts are ignored if focus is currently inside the API key text input.

5. **Prefers-Reduced-Motion**
   - Wrap animations in media query:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, ::before, ::after {
         animation-duration: 0.01ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.01ms !important;
         scroll-behavior: auto !important;
       }
     }
     ```
</instructions>

<requirements>
### Functional Requirements
- Delightful, subtle micro-interactions that feel crisp and responsive without being distracting.
- Keyboard navigation allows completing an entire 50-question quiz without touching a mouse.
- Accessibility compliance for reduced motion preferences.

### Technical Requirements
- Hardware-accelerated transforms (`translateY`, `scale`, `translateX`) to maintain 60 FPS on lower-end devices.

### File Naming Conventions
- Modify: `css/style.css` and `js/quiz.js`
</requirements>

<output_files>
Update the following files:

1. `css/style.css` - Micro-animation keyframes, tactile hover effects, shimmer styling, and accessibility overrides.
2. `js/quiz.js` - Integrated keyboard shortcut listener and focus management.
</output_files>

## Directory Structure

After completing this step, the project should have:

```
project-root/
├── css/
│   └── style.css    ← UPDATED
├── data/
│   └── questions.js
├── js/
│   ├── ai.js
│   ├── feedback.js
│   ├── progress.js
│   ├── quiz.js      ← UPDATED
│   ├── results.js
│   ├── review.js
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Hovering over choice cards lifts them slightly with a soft shadow.
- [ ] Submitting correct answer produces a subtle green pulse effect.
- [ ] Submitting incorrect answer gives a clean 350ms gentle shake.
- [ ] Loading skeleton displays a smooth gradient shimmer.
- [ ] Navigating using keyboard keys `1` then `Enter` selects choice A and submits cleanly.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Typing API key triggers quiz shortcuts | Keydown listener is not checking `event.target.tagName` | Add `if (event.target.matches('input, textarea')) return;` at the start of key handler |
| Animations feel sluggish | Animating `top`, `left`, or `width` instead of `transform` | Use `transform: translateY()` and `transform: scale()` |

---

**Previous**: [Phase 05 Overview](./00_PHASE_OVERVIEW.md) | **Next**: [02 Responsive Hardening](./02_responsive_hardening_and_offline_states.md)
