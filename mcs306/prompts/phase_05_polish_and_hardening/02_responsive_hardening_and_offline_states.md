# 05.2 Responsive Hardening and Offline States

## Context

<context>
University students study across a wide spectrum of devices: laptops in the library, desktop computers in computer laboratories, and smartphones while commuting. The reviewer interface must adapt seamlessly from 375px mobile screens up to wide monitors, maintain 48px minimum touch targets, handle offline internet status gracefully, and protect against browser privacy restrictions. This implements the responsive strategy and risk mitigations from Sections 5 and 9 of the specification.
</context>

## Prerequisites

<prerequisites>
- All application features operational.
- `css/style.css` and `js/state.js` in place.
</prerequisites>

## AI Implementation Prompt

<instructions>
Harden `css/style.css` and `js/state.js` for mobile viewports, touch ergonomics, and edge-case network recovery.

Think step by step:

1. **Mobile Viewport Breakpoint Optimization (@media max-width: 768px)**
   - Header adjustments:
     - Reduce padding, shrink course badge to concise abbreviation ("MCS 306").
     - Stack or shrink counter and score display.
   - Question Card adjustments:
     - Reduce outer container margins.
     - Question text scales to 16px font size with comfortable 1.5 line height.
     - Choices grid stacks into a single vertical column.
     - Choice card minimum height set to `48px` with `padding: 12px 14px` for comfortable finger tap targets.
   - Results & Topic Breakdown:
     - Score hero displays compactly.
     - Topic rows wrap text neatly without truncation or horizontal overflow.
   - Ensure zero horizontal scrolling (`overflow-x: hidden` on body and wrapper).

2. **Touch Device Usability**
   - Apply `-webkit-tap-highlight-color: transparent` to all buttons and cards.
   - Ensure form inputs have `font-size: 16px` on iOS Safari to prevent disruptive automatic zoom on input focus.

3. **Offline & Connectivity Detection**
   - In `js/ai.js` or global script, listen to window events:
     ```javascript
     window.addEventListener('offline', () => {
       showToast("You are currently offline. AI explanations will be paused.");
     });
     window.addEventListener('online', () => {
       showToast("Internet connection restored.");
     });
     ```
   - If user attempts to fetch Gemini while `!navigator.onLine`, immediately return the offline fallback explanation without waiting for timeout.

4. **Defensive Storage Sandbox Protection**
   - If `localStorage` access throws due to incognito/private mode restrictions, catch the exception and fall back to an in-memory session object with an unobtrusive notice:
     `"Notice: Running in private mode. API key will only persist during this tab session."`
</instructions>

<requirements>
### Functional Requirements
- Flawless layout and touch ergonomics from 375px (iPhone SE) to 1440px+ widescreen.
- No accidental zoom on mobile form fields.
- Offline status triggers clear, respectful notification rather than cryptic network errors.
- App remains completely functional even if `localStorage` is disabled.

### Technical Requirements
- Single CSS breakpoint at 768px (`@media (max-width: 768px)`).
- Touch target sizes meet Apple Human Interface Guidelines (minimum 44x44 points).

### File Naming Conventions
- Modify: `css/style.css`, `js/state.js`, and `js/ai.js`
</requirements>

<output_files>
Update the following files:

1. `css/style.css` - Responsive media query rules, mobile touch target sizing, and typography scaling.
2. `js/state.js` - Storage fallback logic for private browsing environments.
3. `js/ai.js` - Offline navigator status check and graceful error fallback.
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
│   ├── ai.js        ← UPDATED
│   ├── feedback.js
│   ├── progress.js
│   ├── quiz.js
│   ├── results.js
│   ├── review.js
│   └── state.js     ← UPDATED
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] In browser DevTools device emulation mode, test screen widths 375px, 390px, 768px, and 1024px.
- [ ] No elements cause horizontal scrollbars or clipping.
- [ ] Choice cards have at least 48px height on mobile for easy tapping.
- [ ] Toggle offline mode in Network tab: submitting an answer shows offline banner and delivers correct answer fallback without freezing.
- [ ] Incognito mode test: opening app in private window functions smoothly without throwing uncaught exceptions.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| iPhone zooms into API key field | Font size of text input is below 16px | Set `input[type="password"], input[type="text"] { font-size: 16px; }` in CSS |
| Text cut off on narrow screens | Hardcoded `min-width` on container elements | Use `width: 100%; max-width: 800px;` with `box-sizing: border-box` |

---

**Previous**: [01 Micro-Interactions](./01_transitions_and_micro_interactions.md) | **Next**: [Phase 05 Checklist](./99_PHASE_CHECKLIST.md)
