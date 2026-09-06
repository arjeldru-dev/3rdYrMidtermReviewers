# 03.2 Google Gemini API Integration

## Context

<context>
The defining feature separating this reviewer from a static answer key is the contextual AI tutor. Powered by Google Gemini (`gemini-2.0-flash`), the tutor explains *why* the correct answer is right and why the other three choices are incorrect, referencing university-level AI concepts (such as Russell & Norvig's *Artificial Intelligence: A Modern Approach*). This step implements the direct REST API client, system prompt, rate limiting, and timeout management as detailed in Feature F4 of the specification.
</context>

## Prerequisites

<prerequisites>
- `js/state.js` storing the user's Gemini API key.
- `js/feedback.js` triggering explanation fetches.
</prerequisites>

## AI Implementation Prompt

<instructions>
Create `js/ai.js` providing the Gemini REST API integration module with caching and resilience handling.

Think step by step:

1. **Endpoint & Configuration**
   - Base URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
   - Generation config:
     ```json
     {
       "temperature": 0.3,
       "maxOutputTokens": 400
     }
     ```

2. **System Prompt Formulation**
   - Construct an authoritative yet encouraging pedagogical prompt:
     ```text
     You are a knowledgeable AI professor teaching MCS 306 — Introduction to Artificial Intelligence at a university level. A student just answered a quiz question. Your job:
     
     1. Explain WHY the correct answer is correct (2-3 sentences, conceptual).
     2. Briefly explain why each wrong option is wrong (1 sentence each).
     3. If the student got it wrong, add an encouraging note and a memory tip.
     
     Keep your total response under 200 words. Use clear, simple language. Reference textbook concepts (Russell & Norvig's "Artificial Intelligence: A Modern Approach") when relevant.
     ```

3. **Request Payload Construction**
   - Format user payload:
     ```text
     Question: [question.question]
     Options:
     (a) [question.choices.a]
     (b) [question.choices.b]
     (c) [question.choices.c]
     (d) [question.choices.d]
     Correct Answer: ([question.answer])
     Student's Selected Answer: ([selectedAnswer])
     Result: [Correct / Incorrect]
     ```
   - Build request body:
     ```javascript
     const body = {
       contents: [{
         parts: [{ text: systemPrompt + "\n\n" + userPayload }]
       }],
       generationConfig: {
         temperature: 0.3,
         maxOutputTokens: 400
       }
     };
     ```

4. **Network Request with Timeout & Retry**
   - Function `fetchGeminiExplanation(question, selectedAnswer, isCorrect)`:
     - Check cache: if `session.explanations[question.id]` exists, return it immediately.
     - Check API key: `const apiKey = getApiKey();`
       - If no key, return `{ error: "NO_KEY", message: "Enter your Gemini API key on the welcome screen to enable AI explanations." }`.
     - Setup `AbortController` with a 30-second timeout.
     - Execute `fetch(url + "?key=" + apiKey, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal })`.
     - Handle HTTP Status:
       - `200 OK`: Extract text from `data.candidates[0].content.parts[0].text`. Cache in `session.explanations[question.id]` and return text.
       - `429 Too Many Requests`: Wait 4 seconds, retry once. If second attempt fails, return `{ error: "RATE_LIMIT", message: "Gemini free-tier rate limit reached. Waiting for quota..." }`.
       - `400 / 401 / 403`: Return `{ error: "AUTH_ERROR", message: "Invalid or restricted API key. Please verify your key." }`.
       - `AbortError`: Return `{ error: "TIMEOUT", message: "AI response timed out after 30 seconds." }`.
       - Network error (offline): Return `{ error: "OFFLINE", message: "Internet connection unavailable." }`.
</instructions>

<requirements>
### Functional Requirements
- High-quality, concise AI tutoring strictly under 200 words.
- Low temperature (0.3) to prevent hallucinations on technical AI facts.
- Automatic caching prevents duplicate network requests.
- Automatic retry on HTTP 429 rate limit.

### Technical Requirements
- Native `fetch` with `AbortController`.
- Direct browser-to-Google HTTPS communication; zero intermediary servers.
- No external heavy Google GenAI SDK script tags; pure lightweight REST.

### File Naming Conventions
- Path: `js/ai.js`
</requirements>

<output_files>
Generate the following file:

1. `js/ai.js` - REST client for Gemini 2.0 Flash API, prompt serialization, retry backoff, and caching.
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
│   ├── ai.js        ← NEW
│   ├── feedback.js
│   ├── progress.js
│   ├── quiz.js
│   └── state.js
└── index.html
```

## Verification

<verification>
After completing this step, confirm:

- [ ] Include `<script src="js/ai.js"></script>` in `index.html`.
- [ ] Inspecting network tab during submission with valid API key shows `POST` request to `generativelanguage.googleapis.com`.
- [ ] Response status is 200 and returns valid candidate text containing conceptual explanation.
- [ ] Calling the function a second time for the same question returns cached text without sending an HTTP request.
- [ ] Clearing API key returns friendly `NO_KEY` error message without throwing unhandled exceptions.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| CORS Error in console | Trying to pass auth headers or using incorrect method | Use query parameter `?key={API_KEY}` and standard `POST` method with `Content-Type: application/json` |
| 400 Bad Request | Payload format mismatch with Gemini v1beta schema | Ensure payload adheres strictly to `{ contents: [{ parts: [{ text: "..." }] }] }` |

---

**Previous**: [01 Answer Evaluation](./01_answer_evaluation_and_feedback_ui.md) | **Next**: [03 Explanation Rendering](./03_explanation_rendering_and_error_handling.md)
