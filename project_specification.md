# Project Specification: MCS306 Quiz Reviewer

## 1. Executive Summary

- **Product:** MCS306 Quiz Reviewer — An AI-powered interactive quiz app for reviewing MCS 306 Midterm Examination (Introduction to Artificial Intelligence)
- **Problem:** Students at Bulacan State University preparing for their MCS 306 midterm need an active recall tool. The PDF reviewer is passive — reading it doesn't test understanding. Students can't self-assess which topics they're weak on, and they don't get explanations for *why* an answer is correct.
- **Solution:** A beautiful, single-page web quiz that presents the 50 sample questions one at a time, gives immediate feedback, and uses Google Gemini AI to generate contextual explanations for every answer — turning a static PDF into an interactive study session.
- **Platform:** Web (single HTML file, opens in any browser, no server needed)
- **Target Launch:** Same day (single build session)
- **Scope:** MVP — fully functional quiz with AI explanations

---

## 2. User Personas & Workflows

### **Sam the Student** — BulSU College of Science, MCS 306 student
  - **Primary goal:** Test understanding of AI concepts before the midterm exam and identify weak areas
  - **Key workflow:**
    1. Opens `index.html` in browser
    2. Enters Gemini API key (first time only — saved in localStorage)
    3. Optionally toggles "Shuffle Questions" on
    4. Clicks "Start Quiz"
    5. Reads question → selects answer → sees correct/incorrect feedback
    6. Reads AI-generated explanation to understand the reasoning
    7. Clicks "Next Question" → repeats for all 50 questions
    8. Views results screen: overall score, grade, topic breakdown
    9. Reviews missed questions with their explanations
    10. Restarts quiz to re-test weak areas
  - **Frequency:** Daily leading up to midterm week
  - **Pain points:** Can't tell if they truly understand a concept vs. just recognizing the answer; no explanations in the PDF answer key; hard to identify which topics need more study

---

## 3. Feature Specification

### MVP Features (Must Ship)

---

#### **F1: Welcome / Landing Screen**
- **Description:** Entry point with course info, instructions, settings, and start button
- **User story:** "As a student, I want to see clear instructions and configure my quiz settings before starting so I'm prepared."
- **Inputs:**
  - Gemini API key (text input, masked)
  - Shuffle toggle (checkbox, default: off)
- **Outputs:** Configured quiz session ready to begin
- **Business rules:**
  - API key is saved to `localStorage` on entry, persists across sessions
  - If an API key exists in localStorage, pre-fill the input
  - "Start Quiz" button is always enabled (quiz works without API key, just without AI explanations)
  - Display reviewer instructions from the PDF header
- **Edge cases:**
  - Invalid API key → quiz still works, AI explanations show an error message with retry option
  - localStorage unavailable (private browsing) → show a warning, API key must be re-entered each session
- **Dependencies:** None

---

#### **F2: Question Display Engine**
- **Description:** Shows one question at a time with its four answer choices as interactive cards
- **User story:** "As a student, I want to read each question clearly and select my answer without distractions."
- **Inputs:** User click/tap on one of four answer cards (a, b, c, d)
- **Outputs:** Selected answer registered, visual selection indicator
- **Business rules:**
  - Questions are rendered from a hardcoded JS array of 50 question objects
  - If shuffle is enabled, questions are randomized using Fisher-Yates shuffle at quiz start (answer positions within each question stay fixed — they're referenced by letter in the exam)
  - Mathematical notation rendered using Unicode characters (∀, ∃, ∧, ∨, ¬, →, ∈, etc.) — no LaTeX library needed
  - Only ONE answer can be selected at a time; clicking another deselects the previous
  - After selecting, a "Submit Answer" button appears (prevents accidental clicks from being final)
  - Progress indicator shows: question number, progress bar, percentage complete
- **Edge cases:**
  - Long question text → scrollable card area, answer choices always visible
  - Special characters in formulas → use HTML entities and Unicode
  - User tries to navigate away mid-quiz → no confirmation needed (state is in-memory only, this is a study tool not an exam)
- **Dependencies:** Question data array

---

#### **F3: Answer Feedback System**
- **Description:** After submitting an answer, immediately show whether it's correct or incorrect, highlight the right answer, and display an AI explanation
- **User story:** "As a student, I want to immediately know if I'm right or wrong and understand WHY, so I learn from each question."
- **Inputs:** Submitted answer (letter a-d)
- **Outputs:**
  - Correct/incorrect badge with animation
  - All four choices re-colored: correct = green highlight, incorrect selection = red highlight, others = dimmed
  - AI explanation panel below the choices
  - "Next Question" button
- **Business rules:**
  - If correct: show "✓ Correct!" badge with a subtle success animation (green pulse)
  - If incorrect: show "✗ Incorrect" badge with the text "The correct answer is (X)" and a gentle shake animation
  - After feedback is shown, answer choices become non-interactive (no re-selecting)
  - AI explanation automatically begins loading when answer is submitted
  - Explanation panel shows a typing/loading animation while the API call is in progress
  - Score counter increments in the header
- **Edge cases:**
  - API call fails → show fallback message: "AI explanation unavailable. The correct answer is (X). Check your API key in settings."
  - API call takes > 10 seconds → show a "Still thinking..." message, continue waiting up to 30s, then timeout with fallback
  - User clicks "Next" before explanation loads → that's fine, move on (explanation is supplementary)
- **Dependencies:** F2, Gemini API integration

---

#### **F4: AI Explanation Engine (Google Gemini)**
- **Description:** Calls the Gemini API to generate a contextual explanation for why the correct answer is right and why each wrong answer is wrong
- **User story:** "As a student, I want a smart tutor to explain the reasoning behind each answer so I deeply understand the concept, not just memorize."
- **Inputs:**
  - Question text
  - All four choices
  - Correct answer
  - Student's selected answer
- **Outputs:** Markdown-formatted explanation text (rendered as HTML)
- **Business rules:**
  - **API endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}`
  - **Model:** `gemini-2.0-flash` (free tier: 15 requests/minute, 1 million tokens/day — more than enough for 50 questions)
  - **System prompt:**
    ```
    You are a knowledgeable AI professor teaching MCS 306 — Introduction to Artificial Intelligence at a university level. A student just answered a quiz question. Your job:
    
    1. Explain WHY the correct answer is correct (2-3 sentences, conceptual)
    2. Briefly explain why each wrong option is wrong (1 sentence each)
    3. If the student got it wrong, add an encouraging note and a memory tip
    
    Keep your total response under 200 words. Use clear, simple language. Reference textbook concepts (Russell & Norvig's "Artificial Intelligence: A Modern Approach") when relevant.
    ```
  - **Request body format:**
    ```json
    {
      "contents": [{
        "parts": [{ "text": "<system prompt>\n\nQuestion: ...\nChoices: ...\nCorrect Answer: ...\nStudent's Answer: ..." }]
      }],
      "generationConfig": {
        "temperature": 0.3,
        "maxOutputTokens": 400
      }
    }
    ```
  - Low temperature (0.3) for factual, consistent explanations
  - Response text is parsed and rendered with basic markdown (bold, italic, line breaks)
- **Edge cases:**
  - 429 rate limit → wait 4 seconds and retry once, then show fallback
  - 401 unauthorized → show "Invalid API key" with a link to re-enter it
  - Network offline → show "You're offline. AI explanations require an internet connection."
  - Gemini returns safety-filtered response → show fallback explanation
- **Dependencies:** Valid Gemini API key (optional — app works without it)

---

#### **F5: Results & Analytics Screen**
- **Description:** After all 50 questions are answered, show a comprehensive results summary
- **User story:** "As a student, I want to see my overall score, which topics I'm weak on, and review my mistakes so I know what to study."
- **Inputs:** Completed quiz session data (all 50 answers + correctness)
- **Outputs:**
  - Overall score: `X / 50` with percentage
  - Letter grade equivalent (90%+ = Excellent, 80%+ = Very Good, 70%+ = Good, 60%+ = Needs Improvement, <60% = Study More)
  - Topic breakdown table: each topic with questions correct/total and a mini progress bar
  - List of missed questions (clickable to expand and see the question + correct answer + AI explanation)
  - "Restart Quiz" button, "Review All Mistakes" button
- **Business rules:**
  - Topics are pre-assigned to each question:
    - **AI Foundations** (Q1–Q4): AI approaches, rational agents, hybrid systems, expected utility
    - **Agents & Environments** (Q5–Q10): agent types, percept sequences, task environments, agent architectures
    - **Search Algorithms** (Q11–Q21): goal tests, search trees, BFS/DFS/UCS, path costs, formulations
    - **Informed Search & Heuristics** (Q22–Q28): A*, greedy best-first, admissibility, consistency, hill climbing
    - **Constraint Satisfaction** (Q29–Q37): CSP formulation, forward checking, arc consistency, MRV, LCV, backtracking
    - **Logic & Knowledge Representation** (Q38–Q47): propositional logic, FOL, entailment, unification, resolution, forward/backward chaining
    - **Inference Methods** (Q48–Q50): forward chaining, backward chaining, resolution refutation
  - Results are NOT persisted (in-memory only) — this is a lightweight study tool
  - The "Review Mistakes" section re-uses the cached AI explanations from the session (no re-fetching)
- **Edge cases:**
  - Perfect score → show a congratulatory message with a special animation
  - All wrong in a topic → highlight that topic in amber/warning color
  - User refreshes → results are lost, returns to welcome screen (acceptable for MVP)
- **Dependencies:** F3 (cached explanation data)

---

#### **F6: Progress Tracking (In-Session)**
- **Description:** Persistent header showing quiz progress during the session
- **User story:** "As a student, I want to see how far along I am and my running score."
- **Inputs:** Current question index, running score
- **Outputs:**
  - Progress bar (fills left-to-right as questions are answered)
  - "Question 12 of 50" label
  - Running score: "Score: 8/11" (only counts answered questions)
  - Subtle percentage badge
- **Business rules:**
  - Progress bar uses a smooth CSS transition (width animation)
  - Score updates with a brief counter animation on correct answers
  - Header stays fixed at the top during quiz, scrolls with content on welcome/results screens
- **Edge cases:** None significant
- **Dependencies:** F2

---

### V1.1 Features (Next Release)
- **Timed quiz mode** — Countdown timer per question (e.g., 90 seconds), auto-submit when time expires
- **Session history** — Store past quiz attempts in localStorage, show improvement over time
- **Dark mode toggle** — Switch between light editorial and dark study-night theme
- **Bookmark hard questions** — Star questions to create a "hard only" quiz subset
- **Export results** — Download results as PDF or share as image

### Future Considerations
- Multiple exam forms (Form A, Form B, etc.)
- Custom question bank upload (other courses)
- Spaced repetition algorithm (SM-2) for intelligent question scheduling
- Collaborative mode — share quiz sessions with classmates
- Mobile app wrapper (PWA with offline support)

### Anti-Features (Explicitly Out of Scope)
- **No user accounts / login** — This is a personal study tool, not a platform. No backend, no database, no auth.
- **No question editing** — Questions are hardcoded from the official PDF. Students shouldn't modify exam content.
- **No multiplayer / leaderboard** — Not a competition tool. Learning-first.
- **No proctoring / anti-cheat** — This is a reviewer, not a secure exam.
- **No analytics backend** — All data stays in the browser. No tracking, no telemetry.

---

## 4. Technical Architecture

### Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend | Vanilla HTML + JavaScript (ES6+) | Single file, no build step, opens directly in any browser. A framework is overkill for a single-page quiz. |
| Styling | Vanilla CSS with CSS custom properties | Full control over the editorial design language. No utility-class bloat for a focused UI. |
| Backend | None (client-side only) | No server needed. API calls go directly from browser to Gemini. |
| Database | `localStorage` | Only stores API key. No user data to persist beyond the session. |
| Auth | None | No user accounts. API key is a configuration setting, not authentication. |
| AI Service | Google Gemini API (`gemini-2.0-flash`) | Free tier (15 RPM, 1M TPD), best reasoning quality for CS/AI educational content, direct REST API. |
| Hosting | Local filesystem / any static host | Just open `index.html`. Can optionally deploy to GitHub Pages, Netlify, or Vercel. |
| CI/CD | None needed | Single file deployment. |

### System Architecture

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│                                                  │
│  ┌──────────────┐   ┌────────────────────────┐  │
│  │  index.html   │   │    Application State    │  │
│  │  (UI Layer)   │──▶│    (JS In-Memory)       │  │
│  │              │   │                        │  │
│  │  - Welcome   │   │  - currentQuestion: 0  │  │
│  │  - Quiz      │   │  - score: 0            │  │
│  │  - Feedback  │   │  - answers: []         │  │
│  │  - Results   │   │  - explanations: {}    │  │
│  └──────┬───────┘   │  - shuffledOrder: []   │  │
│         │           │  - settings: {}        │  │
│         │           └────────────────────────┘  │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐        ┌──────────────────┐   │
│  │  State Machine │──────▶│  localStorage     │   │
│  │  (App Flow)   │       │  (API Key only)   │   │
│  └──────┬───────┘        └──────────────────┘   │
│         │                                        │
└─────────┼────────────────────────────────────────┘
          │ HTTPS (fetch)
          ▼
┌─────────────────────────────┐
│  Google Gemini API           │
│  generativelanguage          │
│  .googleapis.com             │
│                              │
│  Model: gemini-2.0-flash     │
│  Endpoint: generateContent   │
└─────────────────────────────┘
```

### Logical App Structure — State Machine

The app operates as a **finite state machine** with five states:

```
  ┌─────────┐    Start     ┌──────────┐   Submit    ┌──────────┐
  │ WELCOME  │────────────▶│ QUESTION │────────────▶│ FEEDBACK │
  │          │             │          │             │          │
  └─────────┘             └──────────┘             └─────┬────┘
       ▲                       ▲                         │
       │                       │      Next (if < 50)     │
       │                       └─────────────────────────┘
       │                                                 │
       │                              Next (if == 50)    │
       │                                                 ▼
       │    Restart            ┌──────────┐
       └───────────────────────│ RESULTS  │
                               │          │
                               └─────┬────┘
                                     │ Review
                                     ▼
                               ┌──────────┐
                               │ REVIEW   │
                               │ (Missed) │
                               └──────────┘
```

**State transitions:**

| Current State | Event | Next State | Action |
|---|---|---|---|
| `WELCOME` | Click "Start Quiz" | `QUESTION` | Initialize session, shuffle if enabled, show Q1 |
| `QUESTION` | Click answer choice | `QUESTION` (visual only) | Highlight selected choice, show "Submit" button |
| `QUESTION` | Click "Submit Answer" | `FEEDBACK` | Lock choices, evaluate answer, call Gemini API, update score |
| `FEEDBACK` | Click "Next Question" (Q < 50) | `QUESTION` | Advance index, render next question |
| `FEEDBACK` | Click "Next Question" (Q = 50) | `RESULTS` | Calculate final stats, render results screen |
| `RESULTS` | Click "Review Mistakes" | `REVIEW` | Show list of wrong answers with cached explanations |
| `RESULTS` | Click "Restart Quiz" | `WELCOME` | Reset all session state |
| `REVIEW` | Click "Back to Results" | `RESULTS` | Return to results summary |

### Component Hierarchy (DOM Structure)

```
<body>
├── <header id="quiz-header">          // Fixed during quiz, hidden on welcome
│   ├── <div.progress-bar>
│   ├── <span.question-counter>        // "Question 12 of 50"
│   └── <span.score-display>           // "Score: 8/11"
│
├── <main id="app-container">
│   ├── <section id="welcome-screen">
│   │   ├── <div.university-badge>     // BulSU + College of Science
│   │   ├── <h1>                       // Course title
│   │   ├── <div.instructions>         // Reviewer instructions
│   │   ├── <div.settings-panel>
│   │   │   ├── <input.api-key>        // Gemini API key
│   │   │   └── <label.shuffle-toggle> // Shuffle checkbox
│   │   └── <button.start-btn>         // "Start Quiz"
│   │
│   ├── <section id="quiz-screen">
│   │   ├── <div.question-card>
│   │   │   ├── <span.question-number> // "Question 12"
│   │   │   ├── <p.question-text>      // Question body
│   │   │   └── <div.choices-grid>
│   │   │       ├── <button.choice-a>
│   │   │       ├── <button.choice-b>
│   │   │       ├── <button.choice-c>
│   │   │       └── <button.choice-d>
│   │   ├── <button.submit-btn>        // "Submit Answer" (hidden until choice selected)
│   │   └── <div.feedback-panel>       // (hidden until submitted)
│   │       ├── <div.result-badge>     // ✓ Correct! or ✗ Incorrect
│   │       ├── <div.explanation>      // AI explanation with loading state
│   │       └── <button.next-btn>      // "Next Question"
│   │
│   ├── <section id="results-screen">
│   │   ├── <div.score-hero>           // Big "38/50 — 76%"
│   │   ├── <div.grade-badge>          // "Very Good"
│   │   ├── <div.topic-breakdown>      // Table with per-topic scores
│   │   ├── <button.review-btn>        // "Review Mistakes"
│   │   └── <button.restart-btn>       // "Restart Quiz"
│   │
│   └── <section id="review-screen">
│       ├── <h2>                       // "Questions You Missed"
│       ├── <div.missed-list>          // Expandable question cards
│       └── <button.back-btn>          // "Back to Results"
│
└── <footer>                           // "MCS 306 — Bulacan State University"
```

### Data Model (Key Entities)

#### **Question**
```javascript
{
  id: Number,           // 1–50, matches PDF numbering
  question: String,     // Full question text, may include Unicode math symbols
  choices: {
    a: String,          // Choice (a) text
    b: String,          // Choice (b) text
    c: String,          // Choice (c) text
    d: String           // Choice (d) text
  },
  answer: String,       // Correct answer letter: "a", "b", "c", or "d"
  topic: String         // Topic category for results breakdown
}
```

#### **QuizSession** (in-memory only)
```javascript
{
  questionOrder: Number[],      // Array of question IDs (shuffled or sequential)
  currentIndex: Number,         // 0-based index into questionOrder
  answers: Map<Number, {        // Keyed by question ID
    selected: String,           // Letter the student chose
    correct: Boolean,           // Whether they got it right
    timestamp: Number           // When they answered (for future timed mode)
  }>,
  explanations: Map<Number, String>,  // Cached AI explanations by question ID
  score: Number,                // Running correct count
  startTime: Number,            // Quiz session start timestamp
  settings: {
    shuffled: Boolean,          // Whether questions were shuffled
    apiKey: String | null       // Gemini API key (also in localStorage)
  }
}
```

#### **TopicStats** (computed at results time)
```javascript
{
  name: String,         // e.g., "Search Algorithms"
  questionIds: Number[],// Which question IDs belong to this topic
  correct: Number,      // How many the student got right
  total: Number,        // Total questions in this topic
  percentage: Number    // correct / total * 100
}
```

### API Design Philosophy

No custom backend API. The only external API call is to Google Gemini:

- **Single endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}`
- **Error handling:** HTTP status codes mapped to user-friendly messages
  - `200` → Parse response, extract text
  - `400` → "Bad request — check API key"
  - `401/403` → "Invalid API key. Please update in settings."
  - `429` → "Rate limited. Waiting 4 seconds..." → auto-retry once
  - `500+` → "Gemini service error. Try again."
  - Network error → "No internet connection."
- **Timeout:** 30 seconds per request via `AbortController`
- **Caching:** Explanations are cached in the session's `explanations` map. If a question is revisited (in review mode), the cached version is shown instantly.

### Third-Party Integrations

| Service | Purpose | Tier/Cost |
|---|---|---|
| Google Gemini API | AI-generated answer explanations | Free (15 req/min, 1M tokens/day) |
| Google Fonts CDN | DM Serif Display + Source Sans 3 typography | Free |

---

## 5. Design Direction

- **Aesthetic:** Clean academic / warm editorial. Think of a well-designed university exam booklet meets a modern learning app. References: Notion's clean card layouts, Quizlet's question-answer flow, Stripe's editorial typography.
- **Color palette:**
  - **Background:** `#FAF8F5` (warm cream/parchment)
  - **Surface/Cards:** `#FFFFFF` with `rgba(0,0,0,0.04)` shadow
  - **Primary Text:** `#1A1A1A` (deep charcoal)
  - **Secondary Text:** `#6B6B6B` (warm gray)
  - **Accent (Primary):** `#2D6A5A` (deep teal — used for buttons, links, progress bar)
  - **Accent Hover:** `#245A4C`
  - **Correct/Success:** `#2E7D52` (forest green)
  - **Correct Background:** `#E8F5EC`
  - **Incorrect/Error:** `#C44D3E` (warm red)
  - **Incorrect Background:** `#FDECEA`
  - **Warning/Weak Topic:** `#D4880F` (amber)
  - **Border:** `#E5E1DC` (warm light gray)
- **Typography:**
  - **Headings:** `DM Serif Display` — elegant serif, academic feel without being stuffy
  - **Body/UI:** `Source Sans 3` — highly readable, professional, great for long question text
  - **Monospace (formulas):** `JetBrains Mono` or system monospace — for code-like expressions
  - **Scale:** 14px body, 18px question text, 28px section headings, 48px score display
- **Themes:** Light only (editorial academic — dark mode is V1.1)
- **Key screens:** Welcome → Quiz (question + feedback) → Results → Review Mistakes
- **Responsive strategy:** Desktop-first (students likely use laptops to study), responsive down to 375px mobile. Single breakpoint at 768px. Cards stack vertically on mobile, font sizes scale down slightly.

---

## 6. Security & Compliance

- **Security tier:** MVP (minimal — this is a local study tool)
- **Authentication:** None. No user accounts.
- **Authorization:** N/A
- **Data handling:**
  - API key stored in `localStorage` — accessible to any script on the same origin. Acceptable risk for a local HTML file.
  - No personal data collected or transmitted
  - Quiz answers are in-memory only, never persisted
  - The Gemini API key is sent directly from the browser to Google's servers over HTTPS — no intermediary
- **Rate limiting:** Gemini's built-in rate limiting (15 RPM). The app adds a 1-second delay between consecutive API calls to be a good citizen.
- **Audit logging:** None needed.

---

## 7. Infrastructure & DevOps

- **Environments:** Local filesystem only (open `index.html` in browser)
- **Deployment strategy:** Copy the file. Optionally upload to GitHub Pages or any static host.
- **Monitoring:** Browser console for debugging. No production monitoring needed.
- **Backup:** The file IS the backup. Version control optional.
- **Scaling considerations:** N/A — single user, client-side only.

---

## 8. Project Phases & Milestones

| Phase | Focus | Duration | Key Deliverables |
|---|---|---|---|
| 0 | Data extraction & structuring | 15 min | All 50 questions parsed from PDF into JS data array with topics assigned |
| 1 | Core HTML structure + CSS design system | 30 min | All screens scaffolded (welcome, quiz, feedback, results, review), typography, colors, layout |
| 2 | Quiz engine (state machine + question rendering) | 30 min | Question display, answer selection, submit, progress tracking, navigation between questions |
| 3 | Feedback system + Gemini integration | 20 min | Answer evaluation, correct/incorrect UI, API call to Gemini, explanation rendering, error handling |
| 4 | Results & review screens | 15 min | Score calculation, topic breakdown, missed questions review with cached explanations |
| 5 | Polish + animations + responsive | 10 min | Transitions, hover effects, mobile layout, final visual pass |

**Total estimated build time:** ~2 hours

---

## 9. Open Questions & Risks

### Open Questions
- **None remaining** — all design and technical decisions have been made.

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API free tier gets deprecated or rate-limited further | Low | Medium | App works without AI — add static fallback explanations. Easy to swap to another free API (Groq, Together). |
| PDF text extraction has formatting issues (some questions may be garbled) | Medium | High | Manually verify all 50 questions against the PDF during data entry. Each question is hand-reviewed. |
| Math notation doesn't render correctly in all browsers | Low | Medium | Using standard Unicode characters (∀, ∃, ∧, etc.) which have universal browser support. Fallback: ASCII representations. |
| Students share the API key publicly | Medium | Low | Each student uses their own free Gemini key. Clear instruction to keep it private. Even if shared, free tier limits are per-key. |
| CORS issues calling Gemini API from a `file://` origin | Medium | High | Gemini API allows CORS from all origins including `file://`. If issues arise, serve via `npx serve` or any local HTTP server. |

---

## 10. Success Metrics

For a personal study tool, success is qualitative:

- **Completion rate:** Student finishes all 50 questions in one sitting (vs. abandoning halfway)
- **Re-use:** Student opens the quiz more than once (saved API key indicates return visits)
- **Learning signal:** Student scores higher on subsequent attempts (not tracked in MVP, but observable by the student)
- **Subjective quality:** AI explanations feel helpful, not generic. The student learns something they didn't know from each explanation.
- **Performance:** Quiz loads instantly (<1s), explanations arrive within 3 seconds, no jank or layout shifts during transitions.

---

## 11. Recommended Skills

| Phase | Skills | Purpose |
|---|---|---|
| Phase 1: Design System | `design-taste-frontend`, `high-end-visual-design`, `emil-design-eng` | Editorial typography, warm academic color palette, anti-generic card design, subtle micro-animations |
| Phase 2: Frontend Build | `frontend-design`, `taste-skill` | Clean component architecture, semantic HTML, accessible interactive elements |
| Phase 3: AI Integration | None from library (direct API call) | Gemini REST API is simple enough — no framework-level AI skill needed |
| Phase 4: Polish | `gamified-app` (partial) | Progress bar aesthetics, score animations, result screen celebration states |
