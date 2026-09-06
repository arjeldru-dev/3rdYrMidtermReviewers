# 📚 3rd Year Midterm Reviewers & Active Recall Studios

A unified, multi-course academic study portal and active recall studio designed for 3rd-year university midterm examinations.

Includes full question banks, step-by-step solutions, KaTeX mathematical typesetting, and AI-assisted tutoring powered by Google Gemini Flash.

---

## 🏛️ Available Course Reviewers

| Course Code | Course Name | Status | Question Bank | Features |
| :--- | :--- | :---: | :---: | :--- |
| **MCS 306** | **Introduction to Artificial Intelligence** | 🟢 Live | 50 Problems | Search, Heuristics, Alpha-Beta, CSP, Logic, KaTeX formulas, Gemini Flash AI |
| **MCS 304** | Theory of Computation & Automata | 🟡 In Curation | — | State machines, Grammars, Turing decidability |
| **CS 301** | Software Engineering & Architecture | 🟡 In Curation | — | Design Patterns, Clean Architecture, UML |

---

## 🚀 Deployment (Vercel)

This repository is optimized for one-click deployment to **[Vercel](https://vercel.com)** with zero configuration:

1. Import this repository in Vercel.
2. Select **Framework Preset: Other**.
3. Deploy!

### Clean URLs
With [`vercel.json`](./vercel.json):
- **Portal Hub:** `https://<your-app>.vercel.app/`
- **MCS 306 Reviewer:** `https://<your-app>.vercel.app/mcs306`

---

## 🛠️ How to Add a New Course Reviewer

1. Create a dedicated directory for your course (e.g. `cs101/`).
2. Include:
   ```text
   cs101/
   ├── index.html
   ├── css/
   ├── js/
   └── data/questions.js
   ```
3. Add a course card in the root [`index.html`](./index.html).
4. Commit and push—Vercel will automatically redeploy with the new course route available at `/cs101`!

---

## 🔑 Google Gemini AI Tutor Setup (Optional)

1. Get a 100% free API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Click **Gemini AI Key** in the Hub navigation bar or inside any reviewer setup screen.
3. Paste your key. It is saved directly to your browser's `localStorage` and communicates client-side directly with Google's API. No credit card or third-party server required.

---

## 📜 License
Educational use only. Built for university study groups and peers.
