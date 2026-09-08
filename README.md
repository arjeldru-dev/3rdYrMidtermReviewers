# StudyHub — 3rd Year Midterm Reviewers & Active Recall Studios

A unified, multi-course academic study portal and active recall studio designed for 3rd-year university midterm examinations.

Features high-yield question banks, step-by-step canonical proofs, KaTeX mathematical typesetting, and AI-assisted tutoring powered by **Google Gemini 2.0 Flash** with automatic failover and persistent offline caching.

---

## Course Reviewers Directory

| Course Code | Course Name | Status | Question Bank | Coverage & Features |
| :--- | :--- | :---: | :---: | :--- |
| **MCS 306** | **Introduction to Artificial Intelligence** | `Live` | **50 Problems** | Russell & Norvig: Rational Agents, Graph Search, A\*, Alpha-Beta Pruning, CSPs, Propositional & First-Order Logic, KaTeX formulas, Gemini Flash AI Tutor |
| **MAT 304a** | **Operations Research I** | `Live` | **70 Problems** | Hamdy A. Taha & Hillier-Lieberman: LP Formulations, Graphical Method, Simplex Tableau Mechanics ($c_j - z_j$), Big-M Penalty, Two-Phase Method, Sensitivity & Duality Analysis, KaTeX Tableaux, Gemini Flash AI Tutor |
| **MCS 305** | **Systems Analysis and Design** | `Live` | **210 Problems** | Kendall & Kendall, Dennis, Wixom & Roth, Sommerville, Pressman: Systems Concepts, SDLC Lifecycles (PADIM), Fact-Finding & Investigation, Process Models (Agile/Scrum, Waterfall, Prototyping, Spiral), TELOS Feasibility & Cost-Benefit Analysis (ROI, NPV, Payback), Requirements Engineering (FURPS+, IEEE 830), DFD Leveling & Balancing, KaTeX economic formulas, Gemini Flash AI Tutor, Topic Mastery Analytics |
| **MAT 301** | **Advanced Calculus 1** | `Planned` | Midterm Deck | Real Analysis, Sequences & Series, Cauchy Convergence, Bolzano-Weierstrass, Metric Spaces |
| **MAT 302** | **Modern Geometry** | `Planned` | Midterm Deck | Axiomatic Systems, Non-Euclidean Geometry, Isometries, Hyperbolic Plane |
| **TWM 301** | **Technical Writing in Mathematics** | `Planned` | Midterm Deck | LaTeX Document Crafting, Proof Exposition, BibTeX References, Scientific Reports |

---

## Google Gemini AI Architecture & Rate-Limit Hardening

The portal features an interactive AI Tutor providing rigorous, 3-section pedagogical explanations (Conceptual Proof, 3 Distractor Analyses, and Core Key Takeaway) with standard LaTeX math rendering.

### Supported Models & Auto-Failover Hierarchy

The client uses an adaptive multi-model failover engine with automatic discovery:

| Priority | Model Identifier | Tier & Characteristics | Primary Role |
| :---: | :--- | :--- | :--- |
| **1** | **`gemini-2.0-flash`** | Standard Production Flash · 1,500 RPD / 15 RPM Free Tier | **Primary Engine**: High-speed, high-quota academic proofs & explanations |
| **2** | **`gemini-2.0-flash-lite`** | Lightweight High-Capacity · Ultra-low latency | **First Fallback**: High-throughput tutoring when primary capacity fluctuates |
| **3** | **`gemini-3.5-flash-lite`** | High-Efficiency Lite · 500 RPD / 15 RPM / 250K TPM Free Tier | **Second Fallback**: Generous 500 RPD buffer before preview tier |
| **4** | **`gemini-3.6-flash`** | Frontier Preview Tier · Deepest reasoning (20 RPD free cap) | **Deep Reasoning Fallback**: High-complexity conceptual problems |

### Architecture & Resilience Highlights

* **Automatic Multi-Model Failover:**
  $$\text{gemini-2.0-flash} \longrightarrow \text{gemini-2.0-flash-lite} \longrightarrow \text{gemini-3.5-flash-lite} \longrightarrow \text{gemini-3.6-flash}$$
  If a model ever encounters daily quota limits (HTTP 429), bad request parameter mismatches (HTTP 400), or transient server load, the client seamlessly switches to the next available model in the sequence to keep your study session uninterrupted.
* **Self-Healing Text-Only `ListModels` Auto-Discovery:** If an account or regional endpoint returns an HTTP 404 or 400 for a specific model, the client queries Google's `ModelService.ListModels` API using your key, automatically filters for text-generation models (excluding TTS, audio, and embeddings), and dynamically injects them into the failover chain.
* **Full Key Compatibility (`AQ.` and `AIza...`):** Automatically injects the required `x-goog-api-key` HTTP header with every request. Fully authenticates both Google's new official `AQ.` Auth Keys and legacy `AIza...` keys.
* **Persistent `localStorage` Caching:** Once an explanation is fetched, it is saved permanently in your browser's private local storage. Retaking quizzes, revisiting questions, or refreshing the page consumes **0 API calls and 0 tokens**.
* **Key Pool & Auto-Rotation:** Supports multiple API keys (comma- or space-separated). The engine automatically rotates to the next available key if quota exhaustion occurs.
* **On/Off Quota Control:** Includes a global navbar toggle and per-course switches to pause AI explanations and preserve quota, with an on-demand *"Explain This Question Only"* option.

---

## How to Get Your Free Google Gemini API Key

Access is **100% free with zero credit card required**:

1. **Sign in to Google AI Studio**: Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) using any standard Google account.
2. **Click "Create API key"**: In the top navigation bar, click the blue button. Both standard (`AIza...`) and new auth keys (`AQ...`) are supported.
3. **Generate Key**: Select your project and click "Create key".
4. **Save in StudyHub**: Click **Gemini AI Key** on the portal navigation bar and paste your key. It will be stored directly in your browser's private `localStorage` and shared across all course reviewers on this domain. Zero server intermediary.

> **Free Tier Limits:** 15 Requests Per Minute (RPM), 1,500 Requests Per Day (RPD), 1,000,000 Tokens Per Minute (TPM).

---

## Deployment (Vercel)

This repository is configured for instant zero-config deployment to **[Vercel](https://vercel.com)**:

1. Import this repository into Vercel.
2. Select **Framework Preset: Other**.
3. Deploy!

### Clean URLs
Configured via [`vercel.json`](./vercel.json):
* **Portal Hub:** `https://<your-app>.vercel.app/`
* **MCS 306 Reviewer:** `https://<your-app>.vercel.app/mcs306`
* **MAT 304a Reviewer:** `https://<your-app>.vercel.app/mat304a`
* **MCS 305 Reviewer:** `https://<your-app>.vercel.app/mcs305`

---

## Repository Structure

```text
306MIDTERM REVIEWER/
├── index.html               # Main StudyHub academic portal & course directory
├── hub.css                  # Design system tokens, hub navigation, responsive grid
├── hub.js                   # Course filtering, search, and global AI toggle synchronization
├── vercel.json              # Clean URLs and deployment routing configuration
├── README.md                # Project documentation & guides
├── mcs306/                  # Introduction to Artificial Intelligence (50 Qs)
│   ├── index.html           # Single-page active recall studio (Welcome, Quiz, Results, Review)
│   ├── css/style.css        # Studio design system, LaTeX math layout, dark/light themes
│   ├── js/
│   │   ├── ai.js            # Gemini 2.0 Flash client with auto-failover & persistent caching
│   │   ├── feedback.js      # Immediate pedagogical breakdown (Proof, Distractors, Takeaway)
│   │   ├── math.js          # KaTeX typesetting engine for logic formulas and heuristics
│   │   ├── progress.js      # Live progress indicator, streak tracking, header metrics
│   │   ├── quiz.js          # Question presentation, keyboard shortcuts, option selection
│   │   ├── results.js       # Diagnostic score breakdown & performance analytics
│   │   ├── review.js        # Post-exam review drawer and mistakes filter
│   │   └── state.js         # Reactive state machine, exam modes, localStorage persistence
│   └── data/questions.js    # 50 verified multiple-choice questions (Russell & Norvig)
├── mat304a/                 # Operations Research I (70 Qs)
│   ├── index.html           # Single-page active recall studio (Welcome, Quiz, Results, Review)
│   ├── css/style.css        # Math-tailored styling, simplex tableau formatting, dark/light themes
│   ├── js/
│   │   ├── ai.js            # Gemini 2.0 Flash client with auto-failover & persistent caching
│   │   ├── feedback.js      # Immediate pedagogical breakdown (Proof, Distractors, Takeaway)
│   │   ├── math.js          # KaTeX typesetting engine for LP equations and simplex matrices
│   │   ├── progress.js      # Live progress indicator, streak tracking, header metrics
│   │   ├── quiz.js          # Question presentation, keyboard shortcuts, option selection
│   │   ├── results.js       # Diagnostic score breakdown & performance analytics
│   │   ├── review.js        # Post-exam review drawer and mistakes filter
│   │   └── state.js         # Reactive state machine, exam modes, localStorage persistence
│   └── data/questions.js    # 70 verified multiple-choice questions (Taha, Hillier & Lieberman)
└── mcs305/                  # Systems Analysis and Design (210 Qs across 7 Modules)
    ├── index.html           # Single-page active recall studio (Welcome, Quiz, Results, Review)
    ├── css/style.css        # Studio design system, responsive dark/light theme, KaTeX formulas
    ├── js/
    │   ├── ai.js            # Gemini 2.0 Flash client with auto-failover & persistent caching
    │   ├── feedback.js      # Immediate pedagogical breakdown (Proof, Distractors, Takeaway)
    │   ├── math.js          # KaTeX typesetting engine for CBA, ROI, and NPV equations
    │   ├── progress.js      # Live progress indicator, streak tracking, header metrics
    │   ├── quiz.js          # Question presentation, keyboard shortcuts, option selection
    │   ├── results.js       # Diagnostic score breakdown & 7-module topic mastery analytics
    │   ├── review.js        # Post-exam review drawer and mistakes filter
    │   └── state.js         # Reactive state machine, exam modes, localStorage persistence
    └── data/questions.js    # 210 verified questions across 7 modules (Kendall & Kendall, Dennis)
```

---

## License & Academic Integrity

Educational use only. Designed for university students, study groups, and peer review.
All curriculum alignments reference standard university textbooks:
* **MCS 306**: Stuart Russell & Peter Norvig, *Artificial Intelligence: A Modern Approach*.
* **MAT 304a**: Hamdy A. Taha, *Operations Research: An Introduction*; Frederick S. Hillier & Gerald J. Lieberman, *Introduction to Operations Research*.
* **MCS 305**: Kenneth E. Kendall & Julie E. Kendall, *Systems Analysis and Design*; Alan Dennis, Barbara Haley Wixom, & Roberta M. Roth, *Systems Analysis and Design*; Ian Sommerville, *Software Engineering*; Roger S. Pressman & Bruce R. Maxim, *Software Engineering: A Practitioner's Approach*.
