# 📚 StudyHub — 3rd Year Midterm Reviewers & Active Recall Studios

A unified, multi-course academic study portal and active recall studio designed for 3rd-year university midterm examinations.

Features high-yield question banks, step-by-step canonical proofs, KaTeX mathematical typesetting, and AI-assisted tutoring powered by **Google Gemini 2.0 Flash** with automatic failover and persistent offline caching.

---

## 🏛️ Course Reviewers Directory

| Course Code | Course Name | Status | Question Bank | Coverage & Features |
| :--- | :--- | :---: | :---: | :--- |
| **MCS 306** | **Introduction to Artificial Intelligence** | 🟢 **Live** | **50 Problems** | Russell & Norvig: Rational Agents, Graph Search, A\*, Alpha-Beta Pruning, CSPs, Propositional & First-Order Logic, KaTeX formulas, Gemini 2.0 Flash AI Tutor |
| **MAT 304a** | **Operations Research I** | 🟢 **Live** | **70 Problems** | Hamdy A. Taha & Hillier-Lieberman: LP Formulations, Graphical Method, Simplex Tableau Mechanics ($c_j - z_j$), Big-M Penalty, Two-Phase Method, Sensitivity & Duality Analysis |
| **MCS 305** | **Software Engineering** | 🟡 **In Curation** | Midterm Deck | Agile & Scrum, SDLC, GoF Design Patterns, Clean Architecture, CI/CD, Automated Testing Drills |
| **MAT 301** | **Advanced Calculus 1** | 🟣 **Planned** | Midterm Deck | Real Analysis, Sequences & Series, Cauchy Convergence, Bolzano-Weierstrass, Metric Spaces |
| **MAT 302** | **Modern Geometry** | 🟣 **Planned** | Midterm Deck | Axiomatic Systems, Non-Euclidean Geometry, Isometries, Hyperbolic Plane |
| **TWM 301** | **Technical Writing in Mathematics** | 🟣 **Planned** | Midterm Deck | LaTeX Document Crafting, Proof Exposition, BibTeX References, Scientific Reports |

---

## 🤖 Google Gemini AI Architecture & Rate-Limit Hardening

The portal features an interactive AI Tutor providing rigorous, 3-section pedagogical explanations (Conceptual Proof, 3 Distractor Analyses, and Core Key Takeaway) with standard LaTeX math rendering.

### Rate Limit & Resilience Highlights

* **1,500 Requests Per Day (RPD):** Configured with **`gemini-2.0-flash`** as the primary endpoint — providing **75× more quota** than preview tiers (which are capped at only 20 RPD).
* **Automatic Multi-Model Failover:**
  $$\text{gemini-2.0-flash (1,500 RPD)} \longrightarrow \text{gemini-1.5-flash (1,500 RPD)}$$
  If a model ever encounters daily quota limits or temporary server load, the client seamlessly switches to the fallback model to keep your study session uninterrupted.
* **Persistent `localStorage` Caching:** Once an explanation is fetched, it is saved permanently in your browser storage. Retaking quizzes, revisiting questions, or refreshing the page uses **0 API calls and 0 tokens**.
* **Key Pool & Rotation:** Supports multiple API keys (comma- or space-separated). The engine automatically rotates to the next available key if quota exhaustion occurs.
* **Full Key Format Compatibility:** Fully supports both legacy Google keys (`AIza...`) and the new Google AI Studio authentication keys (`AQ...`).
* **On/Off Quota Control:** Includes a global navbar toggle and per-course switches to pause AI explanations and preserve quota, with an on-demand *"Explain This Question Only"* option.

---

## 🔑 How to Get Your Free Google Gemini API Key

Access is **100% free with zero credit card required**:

1. **Sign in to Google AI Studio**: Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) using any standard Google account.
2. **Click "Create API key"**: In the top navigation bar, click the blue button. Both standard (`AIza...`) and new auth keys (`AQ...`) are supported.
3. **Generate Key**: Select your project and click "Create key".
4. **Save in StudyHub**: Click **Gemini AI Key** on the portal navigation bar and paste your key. It will be stored directly in your browser's private `localStorage` and shared across all course reviewers on this domain. Zero server intermediary.

> **Free Tier Limits:** 15 Requests Per Minute (RPM), 1,500 Requests Per Day (RPD), 1,000,000 Tokens Per Minute (TPM).

---

## 🚀 Deployment (Vercel)

This repository is configured for instant zero-config deployment to **[Vercel](https://vercel.com)**:

1. Import this repository into Vercel.
2. Select **Framework Preset: Other**.
3. Deploy!

### Clean URLs
Configured via [`vercel.json`](./vercel.json):
* **Portal Hub:** `https://<your-app>.vercel.app/`
* **MCS 306 Reviewer:** `https://<your-app>.vercel.app/mcs306`
* **MAT 304a Reviewer:** `https://<your-app>.vercel.app/mat304a`

---

## 📁 Repository Structure

```text
306MIDTERM REVIEWER/
├── index.html               # Main StudyHub academic portal & course directory
├── hub.css                  # Design system tokens, hub navigation, responsive grid
├── hub.js                   # Course filtering, search, and global AI toggle synchronization
├── vercel.json              # Clean URLs and deployment routing configuration
├── README.md                # Project documentation & guides
├── mcs306/                  # Introduction to Artificial Intelligence (50 Qs)
│   ├── index.html           # Single-page active recall app (Welcome, Quiz, Results, Review)
│   ├── css/style.css        # Studio design system, LaTeX math layout, dark/light themes
│   ├── js/
│   │   ├── state.js         # State machine, persistent localStorage cache, difficulty modes
│   │   ├── ai.js            # Gemini 2.0 Flash client with 1.5 failover & backoff
│   │   ├── quiz.js          # Question presentation, keyboard shortcuts, KaTeX rendering
│   │   ├── feedback.js      # Immediate solution breakdown & hardened error recovery
│   │   └── review.js        # Post-exam review drawer & conceptual resolution
│   └── data/questions.js    # 50 verified multiple-choice questions aligned with Russell & Norvig
└── mat304a/                 # Operations Research I (70 Qs)
    ├── index.html           # Dedicated Operations Research active recall studio
    ├── css/style.css        # Math-tailored styling, simplex tableau formatting
    ├── js/                  # State, AI client, feedback, and review engines
    └── data/questions.js    # 70 verified LP & simplex optimization questions
```

---

## 📜 License & Academic Integrity

Educational use only. Designed for university students, study groups, and peer review.
All curriculum alignments reference standard university textbooks (Stuart Russell & Peter Norvig for AI, Hamdy A. Taha and Hillier & Lieberman for Operations Research).
