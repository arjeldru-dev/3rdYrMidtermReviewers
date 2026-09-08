/**
 * MCS 305: Systems Analysis and Design — Dedicated Review Studio & Mistakes Filter Engine
 * 
 * Manages:
 * - Dedicated full-screen review interface (#review-screen) mapped to FSM STATES.REVIEW
 * - Multi-criteria live filtering (All Questions, Missed Only, Starred Only, By Module M1-M7)
 * - Detailed question review cards comparing student choices against verified keys
 * - 4-choice visual review grid with emerald correct checks and ruby error marks
 * - Zero duplicate network calls: cached explanation and textbook rationale expanders
 * - Seamless return navigation back to Performance Summary (#results-screen)
 */

(function (global) {
  'use strict';

  // ==========================================================================
  // 1. Syllabus Modules Metadata
  // ==========================================================================

  const MODULE_TITLES = Object.freeze({
    M1: 'Module 1: System Concepts & Analyst Roles',
    M2: 'Module 2: SDLC Strategies & Lifecycles',
    M3: 'Module 3: Fact-Finding & Elicitation',
    M4: 'Module 4: Process Models & Methodologies',
    M5: 'Module 5: Project Planning & Feasibility',
    M6: 'Module 6: Requirements Engineering',
    M7: 'Module 7: Data Flow Diagrams (DFD)'
  });

  // ==========================================================================
  // 2. Utility Helpers & Markdown Parser
  // ==========================================================================

  function dispatchAppEvent(eventName, detail = {}) {
    if (typeof CustomEvent === 'function') {
      const evt = new CustomEvent(eventName, { detail, bubbles: true, cancelable: true });
      if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
        document.dispatchEvent(evt);
      }
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(evt);
      }
    }
  }

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
   * Safe markdown parser for AI explanation text.
   * Converts headings, bold, code tokens, lists, and paragraphs.
   * 
   * @param {string} text - Raw markdown text
   * @returns {string} Safe semantic HTML
   */
  function renderMarkdown(text) {
    if (typeof text !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.renderMarkdownWithMath === 'function') {
      return global.MathRenderer.renderMarkdownWithMath(text);
    }

    if (/<(p|div|ul|ol|li|strong|em|code|h3|h4)[\s>]/i.test(text)) {
      return text;
    }

    let safe = text.replace(/\r\n/g, '\n').trim();
    safe = escapeHtml(safe);

    // Fenced code blocks ```code```
    safe = safe.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="explanation-code-block"><code>${code.trim()}</code></pre>`;
    });

    // Inline formatting
    safe = safe.replace(/`([^`]+)`/g, '<code class="math-expr">$1</code>');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

    // Block processing
    const blocks = safe.split(/\n{2,}/);
    const renderedBlocks = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('<pre') && trimmed.endsWith('</pre>')) {
        return trimmed;
      }

      if (/^###\s+(.*)$/.test(trimmed)) {
        return `<h4 class="tutor-section-title">${trimmed.replace(/^###\s+/, '')}</h4>`;
      }
      if (/^##\s+(.*)$/.test(trimmed)) {
        return `<h3 class="tutor-section-title">${trimmed.replace(/^##\s+/, '')}</h3>`;
      }
      if (/^#\s+(.*)$/.test(trimmed)) {
        return `<h3 class="tutor-section-title">${trimmed.replace(/^#\s+/, '')}</h3>`;
      }

      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      if (lines.every(l => /^[-*•]\s+/.test(l))) {
        const items = lines.map(l => `<li>${l.replace(/^[-*•]\s+/, '')}</li>`).join('');
        return `<ul class="distractor-list">${items}</ul>`;
      }

      if (lines.every(l => /^\d+\.\s+/.test(l))) {
        const items = lines.map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return `<ol class="distractor-list">${items}</ol>`;
      }

      return `<p>${lines.join('<br>')}</p>`;
    });

    return renderedBlocks.filter(Boolean).join('');
  }

  function getElements() {
    return {
      reviewScreen: document.getElementById('review-screen'),
      reviewTitle: document.getElementById('review-title'),
      reviewFilterSelect: document.getElementById('review-filter-select'),
      reviewList: document.getElementById('review-list') || document.getElementById('review-questions-list') || document.getElementById('missed-questions-list'),
      btnBackToResults: document.getElementById('btn-back-to-results')
    };
  }

  // ==========================================================================
  // 3. Question Filtering & Dataset Resolution
  // ==========================================================================

  /**
   * Retrieves and filters session questions based on specified filter mode.
   * 
   * @param {string} mode - 'all' | 'missed' | 'starred' | 'M1'..'M7'
   * @returns {Array<Object>} List of evaluated question review records
   */
  function getFilteredQuestions(mode = 'all') {
    const sess = global.AppState ? global.AppState.session : null;
    if (!sess || !Array.isArray(sess.questionOrder)) {
      return [];
    }

    const masterQuestions = global.QUESTIONS || [];
    const answers = sess.answers || {};
    const explanations = sess.explanations || {};

    const evaluatedList = [];

    for (const qId of sess.questionOrder) {
      const record = answers[qId] || null;
      const qObj = (global.AppState && typeof global.AppState.getQuestion === 'function')
        ? global.AppState.getQuestion(qId)
        : ((sess.questionsMap && sess.questionsMap[qId]) || masterQuestions.find(q => q.id === qId));

      if (!qObj) continue;

      const isAnswered = record !== null;
      const studentChoice = record ? String(record.selected || '').toLowerCase() : null;
      const correctChoice = String(qObj.answer || '').toLowerCase();
      const isCorrect = record ? Boolean(record.correct || record.isCorrect) : false;
      const isStarred = global.AppState && typeof global.AppState.isBookmarked === 'function'
        ? global.AppState.isBookmarked(qId)
        : (sess.bookmarks instanceof Set ? sess.bookmarks.has(qId) : false);

      const cachedExplanation = (global.AppState && typeof global.AppState.getExplanation === 'function')
        ? global.AppState.getExplanation(qId)
        : (explanations[qId] || null);

      evaluatedList.push({
        question: qObj,
        questionId: qId,
        isAnswered,
        studentChoice,
        correctChoice,
        isCorrect,
        isStarred,
        cachedExplanation,
        record
      });
    }

    // Apply Filter Criteria
    if (mode === 'missed') {
      return evaluatedList.filter(item => item.isAnswered && !item.isCorrect);
    }
    if (mode === 'starred') {
      return evaluatedList.filter(item => item.isStarred);
    }
    if (['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].includes(mode)) {
      return evaluatedList.filter(item => item.question && item.question.lessonId === mode);
    }

    // Default 'all': Return all questions in this session
    return evaluatedList;
  }

  // ==========================================================================
  // 4. Baked-in Rationale Formatter (Zero Network Fallback)
  // ==========================================================================

  /**
   * Constructs formatted HTML for a question's baked-in canonical textbook rationale.
   * Completely avoids duplicate Gemini API calls.
   * 
   * @param {Object} question - Question definition object
   * @returns {string} Formatted HTML string
   */
  function formatBakedInRationale(question) {
    if (!question || !question.rationale) {
      return '<p class="text-secondary text-sm">No textbook rationale attached to this problem.</p>';
    }

    const rat = question.rationale;
    const formatFn = (global.MathRenderer && typeof global.MathRenderer.render === 'function')
      ? global.MathRenderer.render
      : escapeHtml;

    let html = '<div class="explanation-text">';

    // 1. Academic Proof Section
    if (rat.proof) {
      html += `
        <div class="tutor-section">
          <div class="tutor-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Canonical Textbook Proof</span>
          </div>
          <p>${formatFn(rat.proof)}</p>
        </div>
      `;
    }

    // 2. Distractor Refutations
    if (rat.distractors && typeof rat.distractors === 'object') {
      const keys = Object.keys(rat.distractors);
      if (keys.length > 0) {
        html += `
          <div class="tutor-section">
            <div class="tutor-section-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span>Distractor Analysis &amp; Refutations</span>
            </div>
            <ul class="distractor-list">
        `;
        keys.forEach(key => {
          html += `<li><strong>Option (${key.toUpperCase()}):</strong> ${formatFn(rat.distractors[key])}</li>`;
        });
        html += '</ul></div>';
      }
    }

    // 3. Core Takeaway & Citation
    if (rat.takeaway) {
      html += `
        <div class="tutor-section">
          <div class="tutor-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>Academic Takeaway &amp; Citation</span>
          </div>
          <p class="takeaway-text">${formatFn(rat.takeaway)}</p>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  // ==========================================================================
  // 5. Review Screen Renderer
  // ==========================================================================

  /**
   * Renders the complete Review Studio view filtered by mode.
   * 
   * @param {string} [mode='all'] - Filter mode ('all' | 'missed' | 'starred' | 'M1'..'M7')
   */
  function renderReviewScreen(mode = 'all') {
    const els = getElements();
    if (!els.reviewList) {
      console.warn('[ReviewEngine] #review-list container not found in DOM.');
      return;
    }

    const sess = global.AppState ? global.AppState.session : null;
    const totalSessionQuestions = (sess && Array.isArray(sess.questionOrder)) ? sess.questionOrder.length : 0;
    const totalAnswered = Object.keys((sess && sess.answers) || {}).length;

    // Synchronize Filter Dropdown Selection
    if (els.reviewFilterSelect && els.reviewFilterSelect.value !== mode) {
      els.reviewFilterSelect.value = mode;
    }

    const items = getFilteredQuestions(mode);
    const count = items.length;

    // 1. Update Header Title based on filter mode
    if (els.reviewTitle) {
      if (mode === 'missed') {
        els.reviewTitle.textContent = `Reviewing Missed Questions (${count} of ${totalAnswered} Answered)`;
      } else if (mode === 'starred') {
        els.reviewTitle.textContent = `Reviewing Bookmarked Questions (${count} Saved)`;
      } else if (mode.startsWith('M')) {
        const modTitle = MODULE_TITLES[mode] || `Module ${mode}`;
        els.reviewTitle.textContent = `${modTitle} (${count} Questions)`;
      } else {
        els.reviewTitle.textContent = `Comprehensive Session Review (${count} of ${totalSessionQuestions} Questions)`;
      }
    }

    // 2. Empty State Handling
    if (count === 0) {
      let emptyTitle = 'No Questions Match This Filter';
      let emptyDesc = 'Try selecting another filter from the dropdown above to review other parts of your session.';
      let emptyIconSvg = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';

      if (mode === 'missed') {
        emptyTitle = 'Flawless Mastery! Zero Missed Questions';
        emptyDesc = 'You answered every question in this session correctly. Outstanding systems analysis command!';
        emptyIconSvg = '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>';
      } else if (mode === 'starred') {
        emptyTitle = 'No Bookmarked Questions Yet';
        emptyDesc = 'Click the bookmark star button during your active review session to save challenging items here for dedicated study.';
        emptyIconSvg = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';
      }

      els.reviewList.innerHTML = `
        <div class="card missed-empty-state text-center" style="padding: var(--spacing-2xl) var(--spacing-lg);">
          <div class="empty-celebration-icon" style="color: var(--accent-primary); margin-bottom: 12px;" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${emptyIconSvg}</svg>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">${emptyTitle}</h3>
          <p class="text-secondary" style="max-width: 480px; margin: 0 auto; line-height: 1.55;">${emptyDesc}</p>
        </div>
      `;

      dispatchAppEvent('reviewRendered', { mode, count: 0 });
      return;
    }

    // 3. Render Question Review Cards
    const formatFn = (global.MathRenderer && typeof global.MathRenderer.render === 'function')
      ? global.MathRenderer.render
      : escapeHtml;

    const cardsHtml = items.map((item, index) => {
      const q = item.question;
      const qid = item.questionId;
      const studentChoice = item.studentChoice;
      const correctChoice = item.correctChoice;
      const choices = q.choices || {};

      const diff = q.difficulty || 'easy';
      let diffBadgeClass = 'diff-easy';
      if (diff === 'medium') diffBadgeClass = 'diff-medium';
      if (diff === 'hard') diffBadgeClass = 'diff-hard';

      const studentChoiceText = studentChoice && choices[studentChoice]
        ? formatFn(choices[studentChoice])
        : 'No response recorded';

      const correctChoiceText = choices[correctChoice]
        ? formatFn(choices[correctChoice])
        : '';

      // Prepare 4-choice items
      const letters = ['a', 'b', 'c', 'd'];
      const choicesListHtml = letters.map(letter => {
        if (!choices[letter]) return '';

        const isThisCorrect = letter === correctChoice;
        const isThisStudent = letter === studentChoice;

        let cardClass = 'review-choice-item';
        let badgeIconSvg = '';

        if (isThisCorrect) {
          cardClass += ' review-choice-correct';
          badgeIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        } else if (isThisStudent && !item.isCorrect) {
          cardClass += ' review-choice-incorrect';
          badgeIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        }

        return `
          <div class="${cardClass}">
            <div class="review-choice-letter-pill">
              <span>${letter.toUpperCase()}</span>
              ${badgeIconSvg}
            </div>
            <div class="review-choice-text">${formatFn(choices[letter])}</div>
          </div>
        `;
      }).join('');

      // Prepare Accordion Explanation Body (Zero duplicate API calls)
      let explanationContentHtml = '';
      if (item.cachedExplanation) {
        explanationContentHtml = renderMarkdown(item.cachedExplanation);
      } else if (q.rationale) {
        explanationContentHtml = formatBakedInRationale(q);
      } else {
        explanationContentHtml = `
          <div class="review-no-explanation">
            <p class="text-secondary text-sm" style="margin: 0;">
              No cached AI explanation available for this item.
            </p>
            <button type="button" class="btn-review-demand-ai" data-qid="${qid}" data-selected="${studentChoice || 'a'}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
              <span>Explain with AI</span>
            </button>
          </div>
        `;
      }

      // Comparison pill box classes
      const studentPillClass = item.isCorrect ? 'correct-answer' : 'your-answer';
      const studentPillLabel = item.isCorrect ? 'Your Selection (Correct)' : 'Your Selection (Incorrect)';

      return `
        <article class="card review-item-card missed-card" data-question-id="${qid}">
          <!-- Card Header Row -->
          <div class="missed-header">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="badge badge-subtle">Item #${index + 1} · Q${qid}</span>
              <span class="badge badge-topic">${escapeHtml(q.lessonId)} · ${escapeHtml(q.topic || q.lessonTitle)}</span>
              <span class="badge badge-difficulty ${diffBadgeClass}">${diff.toUpperCase()}</span>
              ${item.isCorrect ? '<span class="badge" style="background: var(--correct-bg); color: var(--correct-green); border: 1px solid var(--correct-border); font-size: 0.72rem; padding: 2px 8px;">Correct</span>' : '<span class="badge" style="background: var(--incorrect-bg); color: var(--incorrect-red); border: 1px solid var(--incorrect-border); font-size: 0.72rem; padding: 2px 8px;">Incorrect</span>'}
            </div>
            
            <button type="button" class="bookmark-btn btn-review-star ${item.isStarred ? 'active' : ''}" data-qid="${qid}" aria-label="Toggle bookmark for question ${qid}" title="${item.isStarred ? 'Remove bookmark' : 'Bookmark question'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
          </div>

          <!-- Question Stem -->
          <h4 class="missed-question-title">${formatFn(q.question)}</h4>

          <!-- Side-by-Side Pill Comparison -->
          <div class="missed-comparison">
            <div class="missed-pill-box ${studentPillClass}">
              <div class="missed-pill-label">${studentPillLabel}</div>
              <div>${studentChoice ? `<strong>(${studentChoice.toUpperCase()})</strong> ${studentChoiceText}` : '<em>No response recorded</em>'}</div>
            </div>
            <div class="missed-pill-box correct-answer">
              <div class="missed-pill-label">Verified Answer Key</div>
              <div><strong>(${correctChoice.toUpperCase()})</strong> ${correctChoiceText}</div>
            </div>
          </div>

          <!-- 4-Choice Option Review Grid -->
          <div class="review-choices-grid" style="margin-bottom: var(--spacing-md);">
            ${choicesListHtml}
          </div>

          <!-- Accordion Explanation Box -->
          <div class="review-accordion-card">
            <button type="button" class="review-accordion-toggle btn-toggle-expand" aria-expanded="true">
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                <span>Professor's Rationale &amp; Academic Proof</span>
              </div>
              <svg class="toggle-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="review-accordion-content explanation-content">
              ${explanationContentHtml}
            </div>
          </div>
        </article>
      `.trim();
    }).join('\n');

    els.reviewList.innerHTML = cardsHtml;

    dispatchAppEvent('reviewRendered', { mode, count });
  }

  // ==========================================================================
  // 6. Interactive Controls & Event Listeners
  // ==========================================================================

  function initReviewControls() {
    const els = getElements();

    // 1. Filter Dropdown Change Listener
    if (els.reviewFilterSelect) {
      els.reviewFilterSelect.addEventListener('change', () => {
        renderReviewScreen(els.reviewFilterSelect.value);
      });
    }

    // 2. Return Navigation: Back to Performance Summary
    if (els.btnBackToResults) {
      els.btnBackToResults.addEventListener('click', () => {
        if (global.AppState && typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.RESULTS);
        }
        if (global.ResultsEngine && typeof global.ResultsEngine.renderResultsScreen === 'function') {
          global.ResultsEngine.renderResultsScreen();
        } else if (global.renderResultsScreen === 'function') {
          global.renderResultsScreen();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 3. Event Delegation for Accordion Toggles, Bookmarks, and On-Demand AI
    if (els.reviewList) {
      els.reviewList.addEventListener('click', event => {
        // Toggle Accordion Expansion
        const accordionToggle = event.target.closest('.review-accordion-toggle') || event.target.closest('.btn-toggle-expand');
        if (accordionToggle) {
          const accordion = accordionToggle.closest('.review-accordion-card') || accordionToggle.closest('.missed-card');
          if (accordion) {
            const isCollapsed = accordion.classList.toggle('collapsed');
            accordionToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
          }
          return;
        }

        // Bookmark Toggle Click
        const starBtn = event.target.closest('.btn-review-star');
        if (starBtn) {
          const qid = Number(starBtn.getAttribute('data-qid'));
          if (qid && global.AppState && typeof global.AppState.toggleBookmark === 'function') {
            const isNowBookmarked = global.AppState.toggleBookmark(qid);
            starBtn.classList.toggle('active', isNowBookmarked);
            starBtn.setAttribute('title', isNowBookmarked ? 'Remove bookmark' : 'Bookmark question');
          }
          return;
        }

        // On-Demand AI Explanation Button
        const demandBtn = event.target.closest('.btn-review-demand-ai');
        if (demandBtn) {
          const qid = parseInt(demandBtn.getAttribute('data-qid'), 10);
          const studentChoice = demandBtn.getAttribute('data-selected') || 'a';
          const drawer = demandBtn.closest('.explanation-content');

          if (drawer && typeof global.fetchGeminiExplanation === 'function') {
            const qObj = (global.AppState && typeof global.AppState.getQuestion === 'function')
              ? global.AppState.getQuestion(qid)
              : null;

            if (qObj) {
              drawer.innerHTML = `
                <div class="skeleton-loader">
                  <div class="skeleton-line w-80"></div>
                  <div class="skeleton-line w-90"></div>
                  <div class="skeleton-line w-60"></div>
                </div>
              `;

              global.fetchGeminiExplanation(qObj, studentChoice, false)
                .then(res => {
                  if (typeof res === 'string') {
                    if (global.AppState && typeof global.AppState.cacheExplanation === 'function') {
                      global.AppState.cacheExplanation(qid, res);
                    }
                    drawer.innerHTML = renderMarkdown(res);
                  } else {
                    drawer.innerHTML = `<p class="text-secondary text-sm">Could not generate AI explanation. ${res && res.message ? res.message : 'Please check your API key.'}</p>`;
                  }
                })
                .catch(err => {
                  drawer.innerHTML = `<p class="text-secondary text-sm">Error generating explanation: ${err.message || 'Network error'}</p>`;
                });
            }
          }
        }
      });
    }

    // 4. State Machine Transition Event Listener
    if (typeof document !== 'undefined') {
      document.addEventListener('stateChange', event => {
        if (event.detail && event.detail.state === 'REVIEW') {
          const mode = (event.detail.payload && event.detail.payload.mode)
            ? event.detail.payload.mode
            : (els.reviewFilterSelect ? els.reviewFilterSelect.value : 'all');
          renderReviewScreen(mode);
        }
      });

      document.addEventListener('app:state-changed', event => {
        if (event.detail && event.detail.to === 'REVIEW') {
          const mode = (event.detail.payload && event.detail.payload.mode)
            ? event.detail.payload.mode
            : (els.reviewFilterSelect ? els.reviewFilterSelect.value : 'all');
          renderReviewScreen(mode);
        }
      });
    }
  }

  // Auto-initialize when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReviewControls);
    } else {
      initReviewControls();
    }
  }

  // ==========================================================================
  // 7. Public API Export
  // ==========================================================================

  const ReviewEngine = {
    renderReviewScreen,
    getFilteredQuestions,
    getMissedQuestions: () => getFilteredQuestions('missed'),
    formatBakedInRationale,
    renderMarkdown,
    initReviewControls
  };

  if (typeof window !== 'undefined') {
    window.Review = ReviewEngine;
    window.ReviewEngine = ReviewEngine;
    window.renderReviewScreen = renderReviewScreen;
  }

  if (typeof global !== 'undefined') {
    global.Review = ReviewEngine;
    global.ReviewEngine = ReviewEngine;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReviewEngine;
  }

})(typeof window !== 'undefined' ? window : globalThis);
