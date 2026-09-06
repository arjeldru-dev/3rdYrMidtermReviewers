# 00.1 Question Bank Structuring

## Context

<context>
The core value proposition of the MCS306 Quiz Reviewer is converting a static 50-question midterm examination PDF into an active recall study tool. To power the quiz engine without requiring a server or external database, all 50 questions must be extracted, verified against the answer key, sanitized with readable Unicode characters, and structured into a clean JavaScript array. This step addresses Feature F2 and F5 from Section 3 of the project specification.
</context>

## Prerequisites

<prerequisites>
- `MCS306_Midterm_Reviewer.content.txt` or `MCS306_Midterm_Reviewer.json` must exist in the workspace root.
- Basic Node.js environment or manual inspection capability to parse text.
</prerequisites>

## AI Implementation Prompt

<instructions>
Extract and structure all 50 questions from the reviewer source files into a clean JavaScript file at `data/questions.js`.

Think step by step:

1. **Read Source Material & Answer Key**
   - Inspect `MCS306_Midterm_Reviewer.content.txt` to read the question stems, the four options (a, b, c, d) per question, and the Answer Key table located at the end of the document.
   - Cross-check each item ID (1 to 50) and its corresponding correct letter.

2. **Clean & Format Unicode Mathematical/Logic Symbols**
   - Clean up PDF extraction artifacts (e.g., words merged without spaces, hyphenated line wraps).
   - Ensure arrows and logic operators are converted to standardized Unicode characters:
     - Implication / Transitions: `→` (U+2192)
     - Universal quantifier: `∀` (U+2200)
     - Existential quantifier: `∃` (U+2203)
     - Logical AND / Conjunction: `∧` (U+2227)
     - Logical OR / Disjunction: `∨` (U+2228)
     - Logical NOT / Negation: `¬` (U+00AC)
     - Entailment: `⊨` (U+22A8)
     - Membership: `∈` (U+2208)

3. **Assign Topic Taxonomy**
   Assign each question to its designated curriculum topic as specified in the specification:
   - **AI Foundations**: Questions 1–4
   - **Agents & Environments**: Questions 5–10
   - **Search Algorithms**: Questions 11–21
   - **Informed Search & Heuristics**: Questions 22–28
   - **Constraint Satisfaction**: Questions 29–37
   - **Logic & Knowledge Representation**: Questions 38–47
   - **Inference Methods**: Questions 48–50

4. **Construct and Export the Data Array**
   - Export an array named `QUESTIONS` attached to `window.QUESTIONS` (for standalone browser loading via `<script src="data/questions.js">`) as well as an `export default QUESTIONS` (if module support is desired).
</instructions>

<requirements>
### Functional Requirements
- Array must contain exactly 50 question items with contiguous `id` values from 1 to 50.
- Each object must include:
  - `id`: number (1 to 50)
  - `question`: clean string text
  - `choices`: object containing exactly four string keys: `{ a: "...", b: "...", c: "...", d: "..." }`
  - `answer`: string matching `"a"`, `"b"`, `"c"`, or `"d"`
  - `topic`: string matching one of the 7 predefined topic categories

### Technical Requirements
- Single self-contained file with no external dependencies.
- Must execute safely in both standard browser script tags (`window.QUESTIONS`) and ES module environments.
- UTF-8 encoding without BOM.

### File Naming Conventions
- Path: `data/questions.js`
</requirements>

<output_files>
Generate the following file:

1. `data/questions.js` - Contains the full 50-item question dataset with topic mappings and validated answer keys.
</output_files>

## Directory Structure

After completing this step, the project should have:

```
project-root/
├── data/
│   └── questions.js  ← NEW
├── MCS306_Midterm_Reviewer.content.txt
├── MCS306_Midterm_Reviewer.json
└── project_specification.md
```

## Verification

<verification>
After completing this step, confirm:

- [ ] `data/questions.js` exists and contains exactly 50 question objects.
- [ ] Every question object contains `id`, `question`, `choices` (a, b, c, d), `answer`, and `topic`.
- [ ] Check question 13 and question 18: Step costs and transitions use clean arrows (`→`).
- [ ] Check questions 38 to 47: Logic symbols (`∀`, `∃`, `∧`, `∨`, `¬`) are rendered cleanly without garbled characters.
- [ ] Opening a browser console or running Node with `node -e "const q = require('./data/questions.js'); console.log(q.length);"` outputs `50`.
</verification>

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Text has missing spaces between words from PDF extract | PDF text flow lacked whitespace delimiters | Clean up word boundaries during extraction script or manual pass |
| Garbled Unicode characters (e.g., `â†’`) | File was saved with incorrect encoding (ANSI instead of UTF-8) | Save file explicitly with UTF-8 encoding |
| `choices` object has missing option | Parsing regex stopped early on long multi-line choice | Verify all 4 keys (a, b, c, d) exist on all 50 items |

---

**Previous**: None | **Next**: [Phase 00 Checklist](./99_PHASE_CHECKLIST.md)
