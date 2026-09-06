# Phase 00 Completion Checklist

## All Steps Completed

- [ ] 00.1 - [Question Bank Structuring](./01_question_bank_structuring.md)

## Verification Tests

Run these checks in terminal or node to confirm the dataset is valid:

```bash
node -e "const fs = require('fs'); const content = fs.readFileSync('data/questions.js', 'utf8'); console.log('File size:', content.length, 'bytes');"
```

In browser console or Node environment:
```javascript
// Validate dataset completeness
console.assert(window.QUESTIONS.length === 50, "Expected 50 questions, found " + window.QUESTIONS.length);
const topics = new Set(window.QUESTIONS.map(q => q.topic));
console.assert(topics.size === 7, "Expected 7 topics, found " + topics.size);
const invalidItems = window.QUESTIONS.filter(q => !q.choices.a || !q.choices.b || !q.choices.c || !q.choices.d || !q.answer);
console.assert(invalidItems.length === 0, "Found items with invalid choices or missing answer:", invalidItems);
```

## Code Quality Checks

- [ ] `data/questions.js` is valid JavaScript without syntax errors.
- [ ] No `null` or `undefined` properties inside question objects.
- [ ] Answer values are strictly lowercase `"a"`, `"b"`, `"c"`, or `"d"`.
- [ ] Math and logic formulas are human-readable with standardized Unicode.

## Manual Verification

- [ ] Sample Question 1: Check topic is "AI Foundations" and choices are clear.
- [ ] Sample Question 25: Check heuristic question formatting.
- [ ] Sample Question 42: Check first-order logic quantifier rendering.

## Rollback Plan

If `data/questions.js` is corrupted:
1. Re-run extraction directly from `MCS306_Midterm_Reviewer.content.txt`.
2. Inspect the PDF directly with a viewer to resolve any ambiguous character mappings.

---

**Proceed to**: [Phase 01: Design System & Layout Scaffolding](../phase_01_design_system_and_layout/00_PHASE_OVERVIEW.md)
