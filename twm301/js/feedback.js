/**
 * TWM 301 Midterm Reviewer — Answer Evaluation & Feedback Engine
 * Academic References: Higham (SIAM), Grätzer (Springer), Lamport (Addison-Wesley)
 * 
 * Manages:
 * - Answer submission evaluation and validation against answer keys
 * - Visual choice locking (.disabled), correctness highlights (.correct / .incorrect / .dimmed)
 * - Feedback panel display (success/danger status badges, correct answer callout)
 * - Next question / Final results navigation flow
 * - Keyboard bindings (Enter key to proceed to next question)
 * - AI Explanation pipeline trigger & loading states
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

  // DOM Elements Cache
  function getElements() {
    return {
      btnSubmit: document.getElementById('btn-submit-answer'),
      feedbackPanel: document.getElementById('feedback-panel'),
      feedbackStatus: document.getElementById('feedback-status'),
      feedbackCorrectAnswer: document.getElementById('feedback-correct-answer'),
      aiExplanationBox: document.getElementById('ai-explanation-box'),
      aiExplanationContent: document.getElementById('ai-explanation-content'),
      btnNext: document.getElementById('btn-next-question'),
      choicesGrid: document.getElementById('quiz-choices-grid'),
      questionCard: document.querySelector('.question-card')
    };
  }

  /**
   * Retrieves the current question from Quiz module or AppState.
   * @returns {Object|null}
   */
  function getCurrentQuestion() {
    if (global.Quiz && typeof global.Quiz.getCurrentQuestion === 'function') {
      return global.Quiz.getCurrentQuestion();
    }
    if (global.AppState && global.AppState.session) {
      const session = global.AppState.session;
      const currentId = session.questionOrder ? session.questionOrder[session.currentIndex] : null;
      if (typeof global.AppState.getQuestion === 'function') {
        return global.AppState.getQuestion(currentId);
      }
      if (session.questionsMap && session.questionsMap[currentId]) {
        return session.questionsMap[currentId];
      }
      const questions = global.QUESTIONS || (typeof QUESTIONS !== 'undefined' ? QUESTIONS : []);
      return questions.find(q => q.id === currentId) || null;
    }
    return null;
  }

  /**
   * Retrieves the current choice selected by the user.
   * @returns {string|null}
   */
  function getSelectedChoice() {
    if (global.Quiz && typeof global.Quiz.getSelectedChoice === 'function') {
      return global.Quiz.getSelectedChoice();
    }
    const selected = document.querySelector('#quiz-choices-grid .choice-card.selected, #quiz-choices-grid .choice-btn.selected');
    return selected && selected.dataset.choice ? selected.dataset.choice.toLowerCase() : null;
  }

  /**
   * Evaluates the submitted choice, locks choices, displays feedback,
   * and dispatches score/session updates.
   */
  function submitAnswer() {
    const currentQ = getCurrentQuestion();
    if (!currentQ) {
      console.warn('[Feedback] Cannot submit: no active question.');
      return;
    }

    const session = global.AppState ? global.AppState.session : null;

    // Guard against duplicate submission
    if (session && session.answers && session.answers[currentQ.id]) {
      return;
    }

    const selected = getSelectedChoice();
    if (!selected) {
      // No option chosen yet
      return;
    }

    const normalizedSelected = selected.toLowerCase();
    const normalizedCorrect = String(currentQ.answer || '').toLowerCase();
    const isCorrect = (normalizedSelected === normalizedCorrect);

    // 1. Record in Session
    if (global.AppState && typeof global.AppState.recordAnswer === 'function') {
      global.AppState.recordAnswer(currentQ.id, normalizedSelected, isCorrect);
    } else if (session) {
      session.answers[currentQ.id] = {
        selected: normalizedSelected,
        correct: isCorrect,
        timestamp: Date.now()
      };
      if (isCorrect) {
        session.score = (session.score || 0) + 1;
      }
      dispatchAppEvent('answerSubmitted', {
        questionId: currentQ.id,
        record: session.answers[currentQ.id],
        score: session.score,
        answeredCount: Object.keys(session.answers).length
      });
    }

    const els = getElements();

    // 2. Hide Submit Button
    if (els.btnSubmit) {
      els.btnSubmit.classList.add('hidden');
    }

    // 3. Visual Lock & Highlights on Choice Cards
    const choiceCards = els.choicesGrid 
      ? els.choicesGrid.querySelectorAll('.choice-card, .choice-btn') 
      : [];

    choiceCards.forEach(card => {
      // Lock cards from further interaction
      card.classList.add('disabled');
      card.setAttribute('disabled', 'true');
      card.setAttribute('aria-disabled', 'true');

      const cardLetter = (card.dataset.choice || '').toLowerCase();

      if (cardLetter === normalizedCorrect) {
        // Correct answer is highlighted in green
        card.classList.add('correct');
        card.classList.remove('selected', 'dimmed');
      } else if (cardLetter === normalizedSelected && !isCorrect) {
        // Wrong choice selected by student is highlighted in red
        card.classList.add('incorrect');
        card.classList.remove('selected', 'dimmed');
      } else {
        // All other choices are dimmed
        card.classList.add('dimmed');
        card.classList.remove('selected');
      }
    });

    // 4. Reveal Feedback Panel
    if (els.feedbackPanel) {
      els.feedbackPanel.classList.remove('hidden');
    }

    // 5. Populate Feedback Status Badge
    if (els.feedbackStatus) {
      if (isCorrect) {
        els.feedbackStatus.innerHTML = '<div class="badge badge-success"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> <span>Correct!</span></div>';
      } else {
        els.feedbackStatus.innerHTML = '<div class="badge badge-danger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> <span>Incorrect</span></div>';
      }
    }

    // 6. Populate Correct Answer Callout (Shown when incorrect)
    if (els.feedbackCorrectAnswer) {
      if (!isCorrect) {
        const correctChoiceText = (currentQ.choices && currentQ.choices[normalizedCorrect]) ? currentQ.choices[normalizedCorrect] : '';
        const formattedChoice = (global.MathRenderer && typeof global.MathRenderer.render === 'function')
          ? global.MathRenderer.render(correctChoiceText)
          : correctChoiceText;
        els.feedbackCorrectAnswer.innerHTML = `The correct answer is <strong>(${normalizedCorrect.toUpperCase()})</strong> ${formattedChoice}`;
        els.feedbackCorrectAnswer.classList.remove('hidden');
      } else {
        els.feedbackCorrectAnswer.innerHTML = '';
        els.feedbackCorrectAnswer.classList.add('hidden');
      }
    }

    // 7. Update Next Question Button Label
    if (els.btnNext && session) {
      const isLastQuestion = (session.currentIndex + 1 >= session.questionOrder.length);
      if (isLastQuestion) {
        els.btnNext.innerHTML = `
          <span>View Final Results</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
      } else {
        els.btnNext.innerHTML = `
          <span>Next Question</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
      }
    }

    // 8. Transition State to FEEDBACK
    if (global.AppState && typeof global.AppState.transitionTo === 'function') {
      global.AppState.transitionTo(global.AppState.STATES.FEEDBACK);
    }

    // 9. Trigger AI Explanation Pipeline
    fetchAndRenderExplanation(currentQ, normalizedSelected, isCorrect);
  }

  /**
   * Handles navigation to the next question or completion transition to results.
   */
  function handleNextQuestion() {
    const session = global.AppState ? global.AppState.session : null;
    if (!session) return;

    const els = getElements();

    // Check if more questions remain
    if (session.currentIndex + 1 < session.questionOrder.length) {
      if (global.AppState && typeof global.AppState.nextQuestion === 'function') {
        global.AppState.nextQuestion();
      } else {
        session.currentIndex++;
      }

      // Transition state back to QUESTION
      if (global.AppState && typeof global.AppState.transitionTo === 'function') {
        global.AppState.transitionTo(global.AppState.STATES.QUESTION);
      }

      // Re-render question
      if (global.Quiz && typeof global.Quiz.renderCurrentQuestion === 'function') {
        global.Quiz.renderCurrentQuestion();
      }

      // Scroll smoothly to top of question card
      const targetCard = els.questionCard || document.getElementById('quiz-screen');
      if (targetCard && typeof targetCard.scrollIntoView === 'function') {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Last question finished: transition to RESULTS view
      if (global.AppState && typeof global.AppState.transitionTo === 'function') {
        global.AppState.transitionTo(global.AppState.STATES.RESULTS);
      }
    }
  }

  let activeExplanationQuestionId = null;

  /**
   * Shows the soothing skeleton shimmer animation while waiting for Gemini AI response.
   */
  function showExplanationLoading() {
    const els = getElements();
    if (!els.aiExplanationContent) return;

    els.aiExplanationContent.innerHTML = `
      <div class="ai-loading-skeleton">
        <div class="skeleton-header">
          <span class="ai-sparkle-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></span>
          <span class="loading-label">Gemini AI Tutor is thinking...</span>
        </div>
        <div class="skeleton-line line-full"></div>
        <div class="skeleton-line line-long"></div>
        <div class="skeleton-line line-medium"></div>
      </div>
    `;
  }

  /**
   * High-fidelity, secure markdown parser for AI explanation text.
   * Leverages MathRenderer for full LaTeX block ($$...$$) and inline math ($...$) parsing,
   * along with rich markdown elements (headings, bold, lists, and code blocks).
   * 
   * @param {string} text - Raw markdown text
   * @returns {string} Safe semantic HTML with rendered math
   */
  function renderMarkdown(text) {
    if (typeof text !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.renderMarkdownWithMath === 'function') {
      return global.MathRenderer.renderMarkdownWithMath(text);
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

    // 5. Block processing
    const blocks = safe.split(/\n{2,}/);
    const renderedBlocks = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      // Preserved pre blocks
      if (trimmed.startsWith('<pre') && trimmed.endsWith('</pre>')) {
        return trimmed;
      }

      // Headers: ###, ##, #
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
   * Fetches the AI explanation and renders formatted markdown or handles fallbacks.
   * Concurrency-safe: ignores responses for questions the user has already navigated away from.
   * 
   * @param {Object} question
   * @param {string} selected
   * @param {boolean} isCorrect
   * @param {boolean} [force=false] - If true, ignores disabled toggle to explain on demand
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fetchAndRenderExplanation(question, selected, isCorrect, force = false) {
    const els = getElements();
    if (!els.aiExplanationContent || !question) return;

    // Track active question to prevent stale async callbacks from overwriting new questions
    const questionId = question.id;
    activeExplanationQuestionId = questionId;

    // Token Preservation Check: If AI is disabled and not forced on-demand, DO NOT call Gemini
    const isAiActive = global.AppState && typeof global.AppState.isAiEnabled === 'function'
      ? global.AppState.isAiEnabled()
      : true;

    if (!isAiActive && !force) {
      // Check if session already has a cached explanation from earlier
      const cached = (global.AppState && typeof global.AppState.getExplanation === 'function')
        ? global.AppState.getExplanation(questionId)
        : null;

      if (cached) {
        const parsedHtml = renderMarkdown(cached);
        els.aiExplanationContent.innerHTML = `
          <div class="explanation-badge">
            <span class="badge-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
            <span>Concept Resolution &amp; Reasoning (Cached)</span>
          </div>
          <div class="explanation-text">
            ${parsedHtml}
          </div>
        `;
        return;
      }

      // Render token-saving state: Zero API calls, 0 tokens consumed
      const correctLetter = question.answer ? String(question.answer).toUpperCase() : '';
      const choices = question.choices || {};
      const correctChoiceText = choices[question.answer ? String(question.answer).toLowerCase() : ''] || '';

      els.aiExplanationContent.innerHTML = `
        <div class="ai-paused-container">
          <div class="ai-paused-main">
            <div class="ai-paused-badge">
              <span class="pulse-dot-amber" aria-hidden="true"></span>
              <span>AI Explanations Paused · 0 Tokens Consumed</span>
            </div>
            <div class="ai-paused-desc">
              ${question.explanation ? `
                <div class="explanation-badge" style="margin-bottom: 8px;">
                  <span class="badge-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
                  <span>Textbook Solution &amp; Key Rationale</span>
                </div>
                <div class="explanation-text" style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 12px;">
                  ${renderMarkdown(question.explanation)}
                </div>
              ` : `Automated explanations are turned off. Correct answer is <strong>(${correctLetter}) ${escapeHtml(correctChoiceText)}</strong>.`}
            </div>
          </div>
          <div class="ai-paused-actions">
            <button type="button" class="btn-explain-once" id="btn-explain-on-demand" title="Generate explanation for this question only">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span>Explain This Question Only</span>
            </button>
            <button type="button" class="btn-resume-ai-link" id="btn-enable-ai-global">
              Turn AI On
            </button>
          </div>
        </div>
      `;

      const btnDemand = document.getElementById('btn-explain-on-demand');
      if (btnDemand) {
        btnDemand.addEventListener('click', () => {
          fetchAndRenderExplanation(question, selected, isCorrect, true);
        });
      }

      const btnResume = document.getElementById('btn-enable-ai-global');
      if (btnResume) {
        btnResume.addEventListener('click', () => {
          if (global.AppState && typeof global.AppState.saveAiEnabled === 'function') {
            global.AppState.saveAiEnabled(true);
          }
          fetchAndRenderExplanation(question, selected, isCorrect, true);
        });
      }
      return;
    }

    // 1. Show loading skeleton shimmer
    showExplanationLoading();

    // 2. Verify availability of Gemini client module (js/ai.js)
    if (typeof global.fetchGeminiExplanation !== 'function') {
      const apiKey = global.AppState && typeof global.AppState.getApiKey === 'function' ? global.AppState.getApiKey() : null;
      if (!apiKey) {
        els.aiExplanationContent.innerHTML = `
          <p class="text-secondary text-sm">
            AI explanations are disabled. To activate automated tutoring, provide your Gemini API key in settings.
          </p>
        `;
      } else {
        els.aiExplanationContent.innerHTML = `
          <p class="text-secondary text-sm">
            AI explanation currently unavailable. Correct answer is (${question.answer ? question.answer.toUpperCase() : ''}).
          </p>
        `;
      }
      return;
    }

    // 3. Request explanation from Gemini client
    global.fetchGeminiExplanation(question, selected, isCorrect)
      .then(result => {
        // If user moved to another question while request was pending, discard result
        if (activeExplanationQuestionId !== questionId) {
          return;
        }

        // Case A: Successful markdown explanation string
        if (typeof result === 'string') {
          const parsedHtml = renderMarkdown(result);
          els.aiExplanationContent.innerHTML = `
            <div class="explanation-badge">
              <span class="badge-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
              <span>Concept Resolution & Reasoning</span>
            </div>
            <div class="explanation-text">
              ${parsedHtml}
            </div>
          `;
          return;
        }

        // Case B: Structured error handling
        if (result && result.error) {
          if (result.error === 'NO_KEY') {
            if (question.explanation) {
              els.aiExplanationContent.innerHTML = `
                <div class="explanation-badge">
                  <span class="badge-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
                  <span>Textbook Solution &amp; Key Rationale</span>
                </div>
                <div class="explanation-text">
                  ${renderMarkdown(question.explanation)}
                </div>
                <p class="text-secondary text-sm" style="margin-top: 10px; font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
                  💡 <em>Optional: Add your free Gemini API key in settings to enable interactive AI pedagogical coaching and distractor analysis.</em>
                </p>
              `;
            } else {
              els.aiExplanationContent.innerHTML = `
                <p class="text-secondary text-sm">
                  AI explanations are disabled. To activate automated tutoring, provide your Gemini API key in settings.
                </p>
              `;
            }
            return;
          }

          if (result.error === 'RATE_LIMIT') {
            const modelName = result.model || 'Gemini Flash';
            els.aiExplanationContent.innerHTML = `
              <div class="rate-limit-notice">
                <p class="text-secondary text-sm" style="margin-bottom: 8px;">
                  <strong style="color: var(--warning-amber, #f59e0b);">Quota Limit Reached:</strong> The free-tier quota for ${escapeHtml(modelName)} was reached. Standard models like Gemini 2.0 Flash offer 1,500 requests/day (75× more quota than preview tiers).
                </p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button type="button" class="btn btn-secondary btn-sm retry-btn" id="btn-retry-explanation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    <span>Retry with 2.0 Flash (1,500 RPD)</span>
                  </button>
                </div>
              </div>
            `;

            const btnRetry = document.getElementById('btn-retry-explanation');
            if (btnRetry) {
              btnRetry.addEventListener('click', () => {
                if (global.AppState && typeof global.AppState.saveModelPreference === 'function') {
                  global.AppState.saveModelPreference('gemini-2.0-flash');
                }
                fetchAndRenderExplanation(question, selected, isCorrect, true);
              });
            }
            return;
          }

          if (result.error === 'OFFLINE') {
            const correctLetter = question.answer ? question.answer.toUpperCase() : '';
            els.aiExplanationContent.innerHTML = `
              <div class="offline-explanation-notice">
                <p class="text-secondary text-sm" style="margin-bottom: 0;">
                  <strong>Offline Mode:</strong> Internet connection unavailable. AI explanations are paused. The correct answer is <strong>(${correctLetter})</strong>.
                </p>
              </div>
            `;
            return;
          }

          if (result.error === 'AUTH_ERROR') {
            const correctLetter = question.answer ? question.answer.toUpperCase() : '';
            els.aiExplanationContent.innerHTML = `
              <div class="auth-error-notice">
                <p class="text-sm error-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>API Key / Authentication Error</span>
                </p>
                <p class="text-secondary text-xs" style="margin-bottom: 0;">
                  ${result.message || 'Invalid or restricted API key. Please check your key on the welcome screen.'}
                </p>
              </div>
              <p class="text-secondary text-sm">
                AI explanation unavailable. Correct answer is <strong>(${correctLetter})</strong>.
              </p>
            `;
            return;
          }

          if (result.error === 'HTTP_ERROR') {
            const correctLetter = question.answer ? question.answer.toUpperCase() : '';
            els.aiExplanationContent.innerHTML = `
              <div class="http-error-notice">
                <p class="text-sm warning-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Gemini API Service Notice (${result.status || 'Error'})</span>
                </p>
                <p class="text-secondary text-xs" style="margin-bottom: 0;">
                  ${result.message || 'AI service returned an unexpected response. Check browser console for details.'}
                </p>
              </div>
              <p class="text-secondary text-sm">
                AI explanation unavailable. Correct answer is <strong>(${correctLetter})</strong>.
              </p>
            `;
            return;
          }

          if (result.error === 'TIMEOUT') {
            const correctLetter = question.answer ? question.answer.toUpperCase() : '';
            els.aiExplanationContent.innerHTML = `
              <div class="timeout-notice">
                <p class="text-sm warning-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>AI Response Timed Out</span>
                </p>
                <p class="text-secondary text-xs" style="margin-bottom: 8px;">
                  The model took longer than expected to complete. This can happen during peak API load.
                </p>
                <button type="button" class="btn btn-secondary btn-sm retry-btn" id="btn-retry-explanation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  <span>Retry AI Explanation</span>
                </button>
              </div>
              <p class="text-secondary text-sm">
                Correct answer is <strong>(${correctLetter})</strong>.
              </p>
            `;

            const btnRetry = document.getElementById('btn-retry-explanation');
            if (btnRetry) {
              btnRetry.addEventListener('click', () => {
                fetchAndRenderExplanation(question, selected, isCorrect);
              });
            }
            return;
          }

          // Other errors (EMPTY_RESPONSE, etc.)
          const correctLetter = question.answer ? question.answer.toUpperCase() : '';
          const detail = result.message || `AI explanation currently unavailable. Correct answer is (${correctLetter}).`;
          els.aiExplanationContent.innerHTML = `
            <p class="text-secondary text-sm">
              ${detail} Correct answer is <strong>(${correctLetter})</strong>.
            </p>
          `;
        }
      })
      .catch(err => {
        if (activeExplanationQuestionId !== questionId) return;
        console.error('[Feedback] AI explanation error:', err);
        const correctLetter = question.answer ? question.answer.toUpperCase() : '';
        els.aiExplanationContent.innerHTML = `
          <p class="text-secondary text-sm">
            AI explanation currently unavailable (${err && err.message ? err.message : 'Network error'}). Correct answer is <strong>(${correctLetter})</strong>.
          </p>
        `;
      });
  }

  // ==========================================================================
  // Event Listeners & Keyboard Bindings
  // ==========================================================================

  function initFeedbackEngine() {
    const els = getElements();

    // Submit Answer Button Click
    if (els.btnSubmit) {
      els.btnSubmit.addEventListener('click', event => {
        event.preventDefault();
        submitAnswer();
      });
    }

    // Next Question Button Click
    if (els.btnNext) {
      els.btnNext.addEventListener('click', event => {
        event.preventDefault();
        handleNextQuestion();
      });
    }

    // Dynamic AI Toggle Listener (Updates active feedback view without refresh)
    if (typeof window !== 'undefined') {
      window.addEventListener('aiToggleChange', (e) => {
        const isEnabled = e.detail && e.detail.enabled;
        if (global.AppState && typeof global.AppState.getCurrentState === 'function') {
          if (global.AppState.getCurrentState() === global.AppState.STATES.FEEDBACK) {
            const currentQ = getCurrentQuestion();
            if (currentQ) {
              const selected = getSelectedChoice();
              const isCorrect = selected && currentQ.answer && String(selected).toLowerCase() === String(currentQ.answer).toLowerCase();
              fetchAndRenderExplanation(currentQ, selected, isCorrect, isEnabled);
            }
          }
        }
      });
    }
  }

  // Auto-bind when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFeedbackEngine);
    } else {
      initFeedbackEngine();
    }
  }

  // Export
  const Feedback = {
    submitAnswer,
    handleNextQuestion,
    showExplanationLoading,
    renderMarkdown,
    fetchAndRenderExplanation
  };

  if (typeof window !== 'undefined') {
    window.Feedback = Feedback;
    // Export globally to allow direct console & prompt testing
    window.submitAnswer = submitAnswer;
    window.handleNextQuestion = handleNextQuestion;
    window.showExplanationLoading = showExplanationLoading;
    window.renderMarkdown = renderMarkdown;
    window.fetchAndRenderExplanation = fetchAndRenderExplanation;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feedback;
  }

})(typeof window !== 'undefined' ? window : globalThis);
