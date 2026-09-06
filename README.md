# 📚 3rd Year Midterm Reviewers & Active Recall Studios

A unified, multi-course academic study portal and active recall studio designed for 3rd-year university midterm examinations.

Includes full question banks, step-by-step solutions, KaTeX mathematical typesetting, and AI-assisted tutoring powered by Google Gemini Flash.

---

## 🏛️ Course Reviewers Directory

| Course Code | Course Name | Status | Question Bank | Features |
| :--- | :--- | :---: | :---: | :--- |
| **MCS 306** | **Introduction to Artificial Intelligence** | 🟢 **Live** | 50 Problems | Search, Heuristics, Alpha-Beta, CSP, Logic, KaTeX formulas, Gemini Flash AI |
| **MCS 305** | **Software Engineering** | 🟡 **In Curation** | Midterm Deck | Agile & Scrum, SDLC, Design Patterns, System Architecture, Testing Drills |
| **MAT 304a** | **Operations Research** | 🟡 **In Curation** | Midterm Deck | Linear Programming, Simplex Method, Duality Theory, Transportation Models |
| **MAT 301** | **Advanced Calculus 1** | 🟣 **Planned** | Midterm Deck | Real Analysis, Sequences & Series, Cauchy Convergence, Metric Spaces |
| **MAT 302** | **Modern Geometry** | 🟣 **Planned** | Midterm Deck | Axiomatic Systems, Non-Euclidean, Isometries, Hyperbolic Plane |
| **TWM 301** | **Technical Writing in Mathematics** | 🟣 **Planned** | Midterm Deck | LaTeX Typesetting, Proof Exposition, BibTeX, Scientific Reports |

---

## 🔑 How to Get Your Free Google Gemini AI Key

The portal features an interactive AI Tutor powered by Google Gemini 3.6 Flash. Access is **100% free with zero credit card required**:

1. **Sign in to Google AI Studio**: Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) using your standard Google account.
2. **Click "Create API key"**: In the top navigation bar, click the blue button.
3. **Generate Key**: Select a project and click "Create key".
4. **Save in StudyHub**: Click **Gemini AI Key** on the portal navigation bar and paste your key. It will be stored exclusively in your browser's local storage (`localStorage`) and shared across all course reviewers on this domain.

> **Free Tier Quota:** 15 requests per minute and 1,500 requests per day.

---

## 🚀 Deployment (Vercel)

This repository is optimized for one-click deployment to **[Vercel](https://vercel.com)**:

1. Import this repository in Vercel.
2. Select **Framework Preset: Other**.
3. Deploy!

### Clean URLs
Configured via [`vercel.json`](./vercel.json):
- **Portal Hub:** `https://<your-app>.vercel.app/`
- **MCS 306 Reviewer:** `https://<your-app>.vercel.app/mcs306`

---

## 🛠️ Adding a New Course Reviewer

1. Create a folder matching your course code (e.g. `mcs305/`).
2. Add the course application files:
   ```text
   mcs305/
   ├── index.html
   ├── css/
   ├── js/
   └── data/questions.js
   ```
3. Update the course card status in the root [`index.html`](./index.html).
4. Commit and push—Vercel will automatically deploy the new route at `/mcs305`!

---

## 📜 License
Educational use only. Built for university study groups and peers.
