# 03.3 Explanation Rendering and Error Handling

## Context

<context>
The raw response from Google Gemini contains markdown formatting (bold headings, bulleted lists, code snippets). Rather than pulling in a heavy external markdown parser, a lightweight, secure sanitizer/parser converts markdown into semantic HTML. Simultaneously, the UI must display a soothing loading skeleton state while waiting for the API response, handle edge cases gracefully, and allow the student to proceed even if the network fails. This implements the presentation and resiliency requirements of Features F3 and F4.
</context>

## Prerequisites

<prerequisites>
- `js/ai.js` implemented with `fetchGeminiExplanation()`.
- `#ai-explanation-box` DOM element present in `index.html`.
</prerequisites>

## AI Implementation Prompt

<instructions>
Update or extend `js/feedback.js` (or add renderer utilities) to handle markdown formatting, loading shimmer states, and error fallbacks.

Think step by step:

1. **Loading State Presentation**
   - Function `showExplanationLoading()`:
     - Clear existing explanation content in `#ai-explanation-box`.
     - Inject loading skeleton shimmer:
       ```html
       <div class="ai-loading-skeleton">
         <div class="skeleton-header">
           <span class="ai-sparkle-icon">✨</span>
           <span class="loading-label">Gemini AI Tutor is thinking...</span>
         </div>
         <div class="skeleton-line line-full"></div>
         <div class="skeleton-line line-long"></div>
         <div class="skeleton-line line-medium"></div>
       </div>
       ```

2. **Lightweight Secure Markdown Parser**
   - Function `renderMarkdown(text)`:
     - Escapes dangerous HTML entities (`<` to `&lt;`, `>` to `&gt;`).
     - Converts bold text: `/\*\*(.*?)\*\*/g` $\rightarrow$ `<strong>$1</strong>`.
     - Converts italics: `/\*(.*?)\*/g` $\rightarrow$ `<em>$1</em>`.
     - Converts inline code: `/`([^`]+)`/g` $\rightarrow$ `<code>$1</code>`.
     - Converts bulleted lines: `/^\s*[-*]\s+(.*)$/gm` $\rightarrow$ `<li>$1</li>`, wrapped in `<ul>`.
     - Converts numbered lists: `/^\s*\d+\.\s+(.*)$/gm` $\rightarrow$ `<li>$1</li>`, wrapped in `<ol>`.
     - Converts double linebreaks into paragraph tags `<p>`.

3. **Render Explanation Results**
   - Function `fetchAndRenderExplanation(question, selected, isCorrect)`:
     - Call `showExplanationLoading()`.
     - Await `fetchGeminiExplanation(question, selected, isCorrect)`.
     - If response is successful text string:
       - Render parsed HTML into `#ai-explanation-box`.
       - Prepend an academic header badge:
         ```html
         <div class="explanation-badge">
           <span class="badge-icon">💡</span> Concept Explanation
         </div>
         ```
     - If response is an error object:
       - If `error === "NO_KEY"`:
         Render polite fallback: `"AI explanations are disabled. To activate automated tutoring, provide your Gemini API key in settings."`
       - If `error === "RATE_LIMIT"`:
         Render rate limit notice with a manual retry button:
         `<button class="btn btn-secondary btn-sm retry-btn">Retry AI Tutor</button>`
       - If other error (offline, timeout):
         Display fallback: `"AI explanation currently unavailable. Correct answer is (" + question.answer.toUpperCase() + ")."`
</instructions>

<requirements>
### Functional Requirements
- Loading skeleton immediately notifies the user that the tutor is generating reasoning.
- Explanations render cleanly formatted with bold emphasis, clean paragraphs, and distinct bullet points.
- The user can click "Next Question" at any time without being blocked by a slow or failed AI request.

### Technical Requirements
- Safe string parsing prevents XSS attacks without requiring heavy third-party sanitizers.
- Smooth CSS shimmer animation on skeleton elements.

### File Naming Conventions
- Path: `js/feedback.js` (integrated) or `js/markdown.js`
</requirements>

<output_files>
Generate or update the following file:

1. `js/feedback.js` - Integrated markdown parsing, loading skeleton rendering, and fallback error handling.
</output_files>

## Directory Structure

After completing this step, the project should have:

```
project-root/
├── css/
│   └── style.css  (with .ai-loading-skeleton and .skeleton-line styles)
├── data/
│   └── questions.js
├── js/
│   ├── ai.js
│   ├── feedback.js  ← UPDATED
│   ├── progress.js
│   ├── quiz.js
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Submit an answer: A pulsing skeleton state appears immediately inside `#ai-explanation-box`.
- [ ] Upon API return: Formatted markdown text replaces skeleton with bold tags and lists rendered properly.
- [ ] Test without API key: Clean informational message appears advising how to activate the key.
- [ ] User can click "Next Question" while the AI is still thinking without causing console errors or freezing.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Markdown raw asterisks `**text**` visible | Regex parser missed line breaks or spaces | Use robust multiline markdown regex or trim input tokens |
| Raw HTML injection vulnerability | Not escaping HTML entities before converting markdown | Always sanitize strings through HTML entity escape before running regex replacements |

---

**Previous**: [02 Gemini API Integration](./02_gemini_api_integration.md) | **Next**: [Phase 03 Checklist](./99_PHASE_CHECKLIST.md)
