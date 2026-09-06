/**
 * MCS 306 Midterm Reviewer — Missed Questions Review Module
 * 
 * Manages:
 * - Filtering and presentation of questions answered incorrectly
 * - Display of student's choice vs. verified answer key
 * - Cached AI explanation display with zero duplicate network requests
 * - Interactive accordion expand/collapse transitions
 * - Return navigation to results summary
 */

(function (global) {
  'use strict';

  function dispatchAppEvent(eventName, detail) {
    if (typeof CustomEvent === 'function') {
      const evt = new CustomEvent(eventName, { detail });
      if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
        document.dispatchEvent(evt);
      }
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(evt);
      }
    }
  }

  function getElements() {
    return {
      reviewScreen: document.getElementById('review-screen'),
      reviewTitle: document.getElementById('review-title'),
      missedList: document.getElementById('missed-questions-list'),
      btnBackToResults: document.getElementById('btn-back-to-results')
    };
  }

  /**
   * Safely formats and escapes plain text into HTML-safe string.
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Lightweight, secure markdown parser for AI explanation text.
   * Converts bold, italics, code tokens, bulleted lists, numbered lists, and paragraphs.
   * Performs HTML entity escaping first to prevent XSS.
   * 
   * @param {string} text - Raw markdown text
   * @returns {string} Safe semantic HTML
   */
  function renderMarkdown(text) {
    if (typeof text !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.renderMarkdownWithMath === 'function') {
      return global.MathRenderer.renderMarkdownWithMath(text);
    }

    // If string already appears to be structured HTML markup, return with basic safety
    if (/<(p|div|ul|ol|li|strong|em|code)[\s>]/i.test(text)) {
      return text;
    }

    // 1. Normalize line endings and trim
    let safe = text.replace(/\r\n/g, '\n').trim();

    // 2. Escape HTML entities to prevent XSS
    safe = safe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // 3. Fenced code blocks ```code```
    safe = safe.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="explanation-code-block"><code>${code.trim()}</code></pre>`;
    });

    // 4. Inline formatting
    safe = safe.replace(/`([^`]+)`/g, '<code class="math-expr">$1</code>');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

    // 5. Block processing (paragraphs, headings, and lists)
    const blocks = safe.split(/\n{2,}/);
    const renderedBlocks = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('<pre') && trimmed.endsWith('</pre>')) {
        return trimmed;
      }

      if (/^###\s+(.*)$/.test(trimmed)) {
        return `<h4>${trimmed.replace(/^###\s+/, '')}</h4>`;
      }
      if (/^##\s+(.*)$/.test(trimmed)) {
        return `<h3>${trimmed.replace(/^##\s+/, '')}</h3>`;
      }
      if (/^#\s+(.*)$/.test(trimmed)) {
        return `<h3>${trimmed.replace(/^#\s+/, '')}</h3>`;
      }

      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      // Pure bulleted list block
      if (lines.every(l => /^[-*]\s+/.test(l))) {
        const items = lines.map(l => `<li>${l.replace(/^[-*]\s+/, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }

      // Pure numbered list block
      if (lines.every(l => /^\d+\.\s+/.test(l))) {
        const items = lines.map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return `<ol>${items}</ol>`;
      }

      // Mixed paragraph and list items block
      if (lines.some(l => /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l))) {
        let html = '';
        let inUl = false;
        let inOl = false;

        lines.forEach(line => {
          if (/^[-*]\s+/.test(line)) {
            if (inOl) { html += '</ol>'; inOl = false; }
            if (!inUl) { html += '<ul>'; inUl = true; }
            html += `<li>${line.replace(/^[-*]\s+/, '')}</li>`;
          } else if (/^\d+\.\s+/.test(line)) {
            if (inUl) { html += '</ul>'; inUl = false; }
            if (!inOl) { html += '<ol>'; inOl = true; }
            html += `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
          } else {
            if (inUl) { html += '</ul>'; inUl = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<p>${line}</p>`;
          }
        });

        if (inUl) html += '</ul>';
        if (inOl) html += '</ol>';
        return html;
      }

      // Standard paragraph
      return `<p>${lines.join('<br>')}</p>`;
    });

    return renderedBlocks.filter(Boolean).join('');
  }

  /**
   * Retrieves all missed question objects and student responses from active session.
   * @returns {Array<Object>} List of { question, studentChoice, cachedExplanation }
   */
  function getMissedQuestions() {
    const session = global.AppState ? global.AppState.session : null;
    if (!session || !Array.isArray(session.questionOrder)) {
      return [];
    }

    const masterQuestions = global.QUESTIONS || [];
    const answers = session.answers || {};
    const explanations = session.explanations || {};

    const missed = [];
    for (const qId of session.questionOrder) {
      const record = answers[qId];
      // Only include questions that have been answered and were incorrect
      if (record && record.correct === false) {
        const qObj = (global.AppState && typeof global.AppState.getQuestion === 'function')
          ? global.AppState.getQuestion(qId)
          : (session.questionsMap && session.questionsMap[qId]) || masterQuestions.find(q => q.id === qId);
        if (qObj) {
          missed.push({
            question: qObj,
            studentChoice: String(record.selected || '').toLowerCase(),
            correctChoice: String(qObj.answer || '').toLowerCase(),
            cachedExplanation: explanations[qId] || null
          });
        }
      }
    }

    return missed;
  }

  /**
   * Renders the missed questions list onto the Review Screen.
   */
  function renderReviewScreen() {
    const session = global.AppState ? global.AppState.session : null;
    const els = getElements();
    if (!els.missedList) return;

    const totalQuestions = (session && Array.isArray(session.questionOrder)) ? session.questionOrder.length : 50;
    const missedData = getMissedQuestions();
    const missedCount = missedData.length;

    // 1. Update Review Screen Title
    if (els.reviewTitle) {
      els.reviewTitle.textContent = `Questions You Missed (${missedCount} / ${totalQuestions})`;
    }

    // 2. Empty State: Student answered all questions correctly
    if (missedCount === 0) {
      els.missedList.innerHTML = `
        <div class="card missed-empty-state text-center">
          <div class="empty-celebration-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
          <h3 class="empty-state-title">Outstanding! Zero Missed Questions</h3>
          <p class="text-secondary empty-state-desc">
            You achieved a flawless score on this reviewer session. You have demonstrated comprehensive command of all 7 AI syllabus topics and are thoroughly prepared for the examination.
          </p>
        </div>
      `;
      dispatchAppEvent('reviewRendered', { missedCount: 0, totalQuestions });
      return;
    }

    // 3. Render Expandable Review Cards
    const formatFn = (global.MathRenderer && typeof global.MathRenderer.render === 'function')
      ? global.MathRenderer.render
      : (global.formatMathAndLogic || escapeHtml);
    const cardsHtml = missedData.map(item => {
      const q = item.question;
      const studentChoice = item.studentChoice;
      const correctChoice = item.correctChoice;
      const choices = q.choices || {};

      const studentChoiceText = choices[studentChoice] ? formatFn(choices[studentChoice]) : 'No selection recorded';
      const correctChoiceText = choices[correctChoice] ? formatFn(choices[correctChoice]) : '';

      // Prepare explanation HTML
      let explanationHtml = '';
      if (item.cachedExplanation) {
        explanationHtml = renderMarkdown(item.cachedExplanation);
      } else {
        explanationHtml = `
          <p class="text-secondary text-sm">
            No AI explanation was generated for this question during your active session. 
            (To generate step-by-step reasoning, provide your Google Gemini API key on the welcome screen).
          </p>
        `;
      }

      return `
        <article class="missed-card" data-question-id="${q.id}">
          <div class="missed-card-header">
            <div class="missed-badges">
              <span class="badge badge-subtle">Q${q.id}</span>
              <span class="badge badge-topic">${escapeHtml(q.topic)}</span>
            </div>
            <button type="button" class="btn-toggle-expand" aria-expanded="true" aria-label="Toggle explanation for question ${q.id}">
              <svg class="toggle-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>

          <p class="missed-question-text">${formatFn(q.question)}</p>

          <div class="missed-answers-comparison">
            <div class="answer-row incorrect-row">
              <span class="answer-label">Your Answer:</span>
              <span class="answer-val"><strong>(${studentChoice.toUpperCase()})</strong> ${studentChoiceText}</span>
            </div>
            <div class="answer-row correct-row">
              <span class="answer-label">Correct Answer:</span>
              <span class="answer-val"><strong>(${correctChoice.toUpperCase()})</strong> ${correctChoiceText}</span>
            </div>
          </div>

          <div class="missed-explanation-drawer">
            <div class="explanation-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span>Professor's Explanation</span>
            </div>
            <div class="explanation-content">
              ${explanationHtml}
            </div>
          </div>
        </article>
      `.trim();
    }).join('\n');

    els.missedList.innerHTML = cardsHtml;

    dispatchAppEvent('reviewRendered', { missedCount, totalQuestions });
  }

  /**
   * Toggles the collapsed state of a missed question card.
   * @param {HTMLElement} card - The .missed-card container
   * @param {HTMLElement} [toggleBtn] - The .btn-toggle-expand button
   */
  function toggleCardExpansion(card, toggleBtn) {
    if (!card) return;

    const btn = toggleBtn || card.querySelector('.btn-toggle-expand');
    const isCurrentlyCollapsed = card.classList.contains('collapsed');

    if (isCurrentlyCollapsed) {
      card.classList.remove('collapsed');
      if (btn) {
        btn.setAttribute('aria-expanded', 'true');
      }
    } else {
      card.classList.add('collapsed');
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  /**
   * Initializes event listeners and event delegation for the review interface.
   */
  function initReviewControls() {
    const els = getElements();

    // 1. Event Delegation for Missed Cards Accordion Toggles
    if (els.missedList) {
      els.missedList.addEventListener('click', event => {
        // Find if toggle button or card header was clicked
        const toggleBtn = event.target.closest('.btn-toggle-expand');
        const cardHeader = event.target.closest('.missed-card-header');

        if (toggleBtn || cardHeader) {
          const card = event.target.closest('.missed-card');
          if (card) {
            const btn = card.querySelector('.btn-toggle-expand');
            toggleCardExpansion(card, btn);
          }
        }
      });
    }

    // 2. Return Navigation Button: Back to Results Summary
    if (els.btnBackToResults) {
      els.btnBackToResults.addEventListener('click', () => {
        if (global.AppState && typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.RESULTS);
        }

        // Scroll back to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 3. State Machine Event Listener: Auto-render when transitioning to REVIEW
    if (typeof document !== 'undefined') {
      document.addEventListener('stateChange', event => {
        if (event.detail && event.detail.state === 'REVIEW') {
          renderReviewScreen();
        }
      });
    }
  }

  // Auto-initialize controls on DOM load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReviewControls);
    } else {
      initReviewControls();
    }
  }

  // Public API Export
  const Review = {
    getMissedQuestions,
    renderReviewScreen,
    toggleCardExpansion,
    renderMarkdown,
    initReviewControls
  };

  if (typeof window !== 'undefined') {
    window.Review = Review;
    window.renderReviewScreen = renderReviewScreen;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Review;
  }

})(typeof window !== 'undefined' ? window : globalThis);
