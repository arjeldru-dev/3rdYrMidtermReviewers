/**
 * MCS 305: Systems Analysis and Design — Feedback & Immediate Grading Engine
 * 
 * Manages:
 * - Immediate answer evaluation, visual styling (.correct, .incorrect, .dimmed, .disabled)
 * - Procedural audio synthesis via Web Audio API (Sine wave arpeggio & Triangle low tones)
 * - Tactile micro-animations (.animate-pulse, .animate-shake)
 * - Token Preservation AI Explanation Controller (0 Tokens Consumed card & on-demand trigger)
 * - Concurrency protection against async explanation race conditions
 * - Seamless fallback to canonical textbook rationales (SOMMERVILLE, PRESSMAN, KENDALL)
 */

(function (global) {
  'use strict';

  let activeExplanationQuestionId = null;
  let audioCtx = null;

  /**
   * Dispatches custom events to both document and window for unified inter-module messaging.
   * @param {string} eventName
   * @param {Object} [detail={}]
   */
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

  /**
   * Cached element references.
   */
  function getElements() {
    if (typeof document === 'undefined') return {};
    return {
      btnSubmit: document.getElementById('btn-submit-answer'),
      feedbackPanel: document.getElementById('feedback-panel'),
      feedbackStatus: document.getElementById('feedback-status'),
      feedbackCorrectAnswer: document.getElementById('feedback-correct-answer'),
      aiExplanationBox: document.getElementById('ai-explanation-box'),
      aiExplanationContent: document.getElementById('ai-explanation-content'),
      aiPausedBox: document.getElementById('ai-paused-box'),
      btnNext: document.getElementById('btn-next-question'),
      choicesGrid: document.getElementById('quiz-choices-grid') || document.getElementById('quiz-options') || document.querySelector('.choices-grid'),
      questionCard: document.querySelector('.question-card')
    };
  }

  /**
   * Safely formats and escapes plain text into HTML-safe string.
   * @param {string} str
   * @returns {string}
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
   * Typesets mathematical equations, CBA metrics, and formulas using MathRenderer.
   * @param {string} str
   * @returns {string}
   */
  function formatMath(str) {
    if (typeof str !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.render === 'function') {
      return global.MathRenderer.render(str);
    }
    if (typeof global.formatMathAndLogic === 'function') {
      return global.formatMathAndLogic(str);
    }
    return escapeHtml(str);
  }

  /**
   * Retrieves the current question from Quiz module or AppState.
   * @returns {Object|null}
   */
  function getCurrentQuestion() {
    if (global.Quiz && typeof global.Quiz.getCurrentQuestion === 'function') {
      return global.Quiz.getCurrentQuestion();
    }
    if (global.AppState && typeof global.AppState.getCurrentQuestion === 'function') {
      return global.AppState.getCurrentQuestion();
    }
    const session = global.AppState ? global.AppState.session : null;
    if (session && session.questionOrder && session.questionOrder.length > 0) {
      const curId = session.questionOrder[session.currentIndex];
      if (typeof global.AppState.getQuestion === 'function') {
        return global.AppState.getQuestion(curId);
      }
      if (session.questionsMap && session.questionsMap[curId]) {
        return session.questionsMap[curId];
      }
      const questions = global.QUESTIONS || (typeof window !== 'undefined' ? window.QUESTIONS : []);
      return (questions || []).find(q => q.id === curId) || null;
    }
    return null;
  }

  /**
   * Retrieves current choice selected by user.
   * @returns {string|null}
   */
  function getSelectedChoice() {
    if (global.Quiz && typeof global.Quiz.getSelectedChoice === 'function') {
      const c = global.Quiz.getSelectedChoice();
      if (c) return String(c).toLowerCase();
    }
    const selected = document.querySelector('#quiz-choices-grid .choice-card.selected, #quiz-choices-grid .choice-btn.selected, .choices-grid .choice-card.selected');
    return selected && selected.dataset.choice ? selected.dataset.choice.toLowerCase() : null;
  }

  // ==========================================================================
  // 1. Web Audio API Synthesizer (Zero External Audio Assets)
  // ==========================================================================

  /**
   * Lazily initializes AudioContext on the first user interaction to comply with autoplay policy.
   * @returns {AudioContext|null}
   */
  function getAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      try {
        audioCtx = new AudioContextClass();
      } catch (err) {
        console.warn('[FeedbackEngine] AudioContext creation suppressed:', err);
        return null;
      }
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  }

  /**
   * Checks whether procedural audio feedback is permitted.
   * @returns {boolean}
   */
  function isSoundEnabled() {
    if (global.AppState) {
      if (typeof global.AppState.isSoundEnabled === 'function') {
        return global.AppState.isSoundEnabled();
      }
      if (global.AppState.session && global.AppState.session.settings && global.AppState.session.settings.soundEnabled !== undefined) {
        return Boolean(global.AppState.session.settings.soundEnabled);
      }
      if (global.AppState.settings && global.AppState.settings.soundEnabled !== undefined) {
        return Boolean(global.AppState.settings.soundEnabled);
      }
    }
    try {
      const pref = localStorage.getItem('MCS305_SOUND_ENABLED');
      if (pref !== null) return pref === 'true';
    } catch (e) {}
    return true; // Default sound enabled
  }

  /**
   * Plays gentle ascending two-note arpeggio chime (C5 to G5, Sine wave, 120ms duration, volume gain 0.05).
   */
  function playCorrectSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Note 1: C5 (523.25 Hz), Sine wave, 120ms duration, 0.05 peak gain
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2: G5 (783.99 Hz), Sine wave, 120ms duration
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.09);
      gain2.gain.setValueAtTime(0.001, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.05, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.21);
    } catch (e) {
      console.warn('[FeedbackEngine] Sound synthesis error:', e);
    }
  }

  /**
   * Plays low descending double-tone chime (E3 to C3, Triangle wave, 150ms duration, volume gain 0.05).
   */
  function playIncorrectSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Note 1: E3 (164.81 Hz), Triangle wave, 150ms duration, 0.05 peak gain
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(164.81, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Note 2: C3 (130.81 Hz), Triangle wave, 150ms duration
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(130.81, now + 0.11);
      gain2.gain.setValueAtTime(0.001, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.05, now + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.11);
      osc2.stop(now + 0.26);
    } catch (e) {
      console.warn('[FeedbackEngine] Sound synthesis error:', e);
    }
  }

  // ==========================================================================
  // 2. High-Fidelity Markdown & Math Parser
  // ==========================================================================

  /**
   * High-fidelity, secure markdown parser for AI explanation text.
   * Supports LaTeX math ($$...$$ and $...$), headers, bold, italics, code, and lists.
   * @param {string} text
   * @returns {string} Safe HTML string
   */
  function renderMarkdown(text) {
    if (typeof text !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.renderMarkdownWithMath === 'function') {
      return global.MathRenderer.renderMarkdownWithMath(text);
    }

    // 1. Normalize line endings and trim
    let safe = text.replace(/\r\n/g, '\n').trim();

    // 2. Escape HTML entities
    safe = safe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // 3. Fenced code blocks
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

      return `<p>${lines.join('<br>')}</p>`;
    });

    return renderedBlocks.filter(Boolean).join('');
  }

  /**
   * Displays calming skeleton loading shimmer during AI thought generation.
   */
  function showExplanationLoading() {
    const els = getElements();
    if (!els.aiExplanationContent) return;

    els.aiExplanationContent.innerHTML = `
      <div class="ai-loading-skeleton">
        <div class="skeleton-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600;">
          <span class="ai-sparkle-icon" style="display: inline-flex; animation: scorePulse 1.2s infinite var(--ease-in-out);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </span>
          <span class="loading-label">Gemini AI Tutor synthesizing 3-part systems proof...</span>
        </div>
        <div class="skeleton-line w-80"></div>
        <div class="skeleton-line w-90"></div>
        <div class="skeleton-line w-60"></div>
      </div>
    `;
  }

  /**
   * Renders the canonical baked-in textbook rationale when offline or without API key.
   * @param {Object} question
   * @param {string} selectedChoiceKey
   * @param {boolean} isCorrect
   */
  function renderOfflineFallbackRationale(question, selectedChoiceKey, isCorrect) {
    const els = getElements();
    if (!els.aiExplanationContent || !question) return;

    if (global.GeminiAI && typeof global.GeminiAI.renderOfflineRationale === 'function') {
      global.GeminiAI.renderOfflineRationale(question, els.aiExplanationContent);
      return;
    }

    const r = question.rationale || {};
    const proofText = r.proof || r.conceptual_proof || 'Option ' + String(question.answer || '').toUpperCase() + ' satisfies all canonical systems engineering axioms.';
    const distractorsText = r.distractors || r.distractor_analysis || '';
    const takeawayText = r.takeaway || r.academic_citation || 'Ground all answers in Sommerville and Pressman software engineering principles.';

    els.aiExplanationContent.innerHTML = `
      <div class="explanation-badge" style="display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.74rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
        <span class="badge-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </span>
        <span>Systems Engineering Proof &amp; Canonical Analysis</span>
      </div>
      <div class="explanation-text">
        <div class="tutor-section">
          <div class="tutor-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <span>Conceptual Proof &amp; Principles</span>
          </div>
          <p>${formatMath(proofText)}</p>
        </div>
        ${distractorsText ? `
        <div class="tutor-section">
          <div class="tutor-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>Distractor Analysis</span>
          </div>
          <p>${formatMath(distractorsText)}</p>
        </div>` : ''}
        ${takeawayText ? `
        <div class="tutor-section">
          <div class="tutor-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
            <span>Key Takeaway &amp; Academic Citation</span>
          </div>
          <p>${formatMath(takeawayText)}</p>
        </div>` : ''}
      </div>
      <div class="explanation-actions" style="margin-top: 14px; display: flex; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-explanation" title="Copy explanation to clipboard">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Copy Proof</span>
        </button>
      </div>
    `;

    bindCopyButton(proofText + '\n\n' + distractorsText + '\n\n' + takeawayText);
  }

  /**
   * Binds click listener for copy explanation button.
   */
  function bindCopyButton(plainText) {
    const copyBtn = document.getElementById('btn-copy-explanation');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(plainText).then(() => {
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> <span>Copied!</span>';
          setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
        }).catch(() => {});
      }
    });
  }

  // ==========================================================================
  // 3. Token Preservation & AI Explanation Controller
  // ==========================================================================

  /**
   * Fetches the AI explanation and renders formatted markdown or handles fallbacks.
   * Concurrency-safe: ignores responses for questions user navigated away from.
   * 
   * @param {Object} question
   * @param {string} selectedChoiceKey
   * @param {boolean} isCorrect
   * @param {boolean} [force=false] - If true, bypasses disabled toggle to explain on demand
   */
  function fetchAndRenderExplanation(question, selectedChoiceKey, isCorrect, force = false) {
    const els = getElements();
    if (!els.aiExplanationContent || !question) return;

    const questionId = question.id;
    activeExplanationQuestionId = questionId;

    // Token Preservation Check: If AI disabled and not forced on-demand, do NOT call Gemini
    const isAiActive = (global.AppState && typeof global.AppState.isAiEnabled === 'function')
      ? global.AppState.isAiEnabled()
      : true;

    if (!isAiActive && !force) {
      // Check if session already cached an explanation for this question
      const cached = (global.AppState && typeof global.AppState.getExplanation === 'function')
        ? global.AppState.getExplanation(questionId)
        : null;

      if (cached) {
        const parsedHtml = renderMarkdown(cached);
        els.aiExplanationContent.innerHTML = `
          <div class="explanation-badge" style="display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.74rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 12px; text-transform: uppercase;">
            <span class="badge-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
            <span>Concept Resolution &amp; Reasoning (Cached)</span>
          </div>
          <div class="explanation-text">
            ${parsedHtml}
          </div>
          <div class="explanation-actions" style="margin-top: 14px; display: flex; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-explanation" title="Copy explanation to clipboard">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy Proof</span>
            </button>
          </div>
        `;
        bindCopyButton(cached);
        return;
      }

      // Render 0 Tokens Consumed card
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
            <p class="ai-paused-desc">
              Instant grading active. Click below to generate an AI explanation for this question. Correct answer is <strong>Option (${correctLetter}): ${escapeHtml(correctChoiceText)}</strong>.
            </p>
          </div>
          <div class="ai-paused-actions">
            <button type="button" id="btn-explain-on-demand" class="btn btn-outline btn-sm btn-explain-once">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span>✨ Explain with Gemini AI On-Demand</span>
            </button>
            <button type="button" id="btn-resume-ai-global" class="btn-resume-ai-link">
              Turn AI On
            </button>
          </div>
        </div>
      `;

      const btnDemand = document.getElementById('btn-explain-on-demand');
      if (btnDemand) {
        btnDemand.addEventListener('click', () => {
          fetchAndRenderExplanation(question, selectedChoiceKey, isCorrect, true);
        });
      }

      const btnResume = document.getElementById('btn-resume-ai-global');
      if (btnResume) {
        btnResume.addEventListener('click', () => {
          if (global.AppState && typeof global.AppState.saveAiEnabled === 'function') {
            global.AppState.saveAiEnabled(true);
          }
          fetchAndRenderExplanation(question, selectedChoiceKey, isCorrect, true);
        });
      }
      return;
    }

    // 1. Show loading skeleton shimmer
    showExplanationLoading();

    // 2. Check client module availability (js/ai.js)
    const clientFetch = global.fetchGeminiExplanation || (global.GeminiAI && global.GeminiAI.fetchExplanation);

    if (typeof clientFetch !== 'function') {
      // Step 04.2 / 04.3 not loaded yet or offline: gracefully render baked-in textbook rationale
      renderOfflineFallbackRationale(question, selectedChoiceKey, isCorrect);
      return;
    }

    // 3. Request explanation from Gemini client
    clientFetch(question, selectedChoiceKey, isCorrect)
      .then(result => {
        // Discard stale responses if user moved to another question
        if (activeExplanationQuestionId !== questionId) {
          return;
        }

        // Case A: Successful markdown string
        if (typeof result === 'string') {
          if (global.AppState && typeof global.AppState.cacheExplanation === 'function') {
            global.AppState.cacheExplanation(questionId, result);
          }
          const parsedHtml = renderMarkdown(result);
          els.aiExplanationContent.innerHTML = `
            <div class="explanation-badge" style="display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.74rem; font-weight: 600; color: var(--accent-primary); margin-bottom: 12px; text-transform: uppercase;">
              <span class="badge-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
              <span>Distinguished Professor · Systems Engineering Proof</span>
            </div>
            <div class="explanation-text">
              ${parsedHtml}
            </div>
            <div class="explanation-actions" style="margin-top: 14px; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-explanation" title="Copy explanation to clipboard">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>Copy Explanation</span>
              </button>
            </div>
          `;
          bindCopyButton(result);
          return;
        }

        // Case B: Structured error handling with fallback
        if (result && result.error) {
          if (result.error === 'NO_KEY') {
            renderOfflineFallbackRationale(question, selectedChoiceKey, isCorrect);
            return;
          }

          if (result.error === 'RATE_LIMIT') {
            const modelName = result.model || 'Gemini Flash';
            els.aiExplanationContent.innerHTML = `
              <div class="rate-limit-notice" style="margin-bottom: 12px; padding: 10px 12px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md);">
                <p class="text-secondary text-xs" style="margin-bottom: 8px;">
                  <strong style="color: var(--warning-amber);">Quota Limit Reached:</strong> Rate limit for ${escapeHtml(modelName)} reached. Displaying baked-in textbook rationale below:
                </p>
              </div>
            `;
            const container = document.createElement('div');
            els.aiExplanationContent.appendChild(container);
            renderOfflineFallbackRationale(question, selectedChoiceKey, isCorrect);
            return;
          }

          if (result.error === 'OFFLINE' || result.error === 'TIMEOUT' || result.error === 'AUTH_ERROR' || result.error === 'HTTP_ERROR') {
            renderOfflineFallbackRationale(question, selectedChoiceKey, isCorrect);
            return;
          }
        }

        // Default fallback
        renderOfflineFallbackRationale(question, selectedChoiceKey, isCorrect);
      })
      .catch(err => {
        if (activeExplanationQuestionId !== questionId) return;
        console.warn('[FeedbackEngine] Gemini tutor error, falling back to textbook rationale:', err);
        renderOfflineFallbackRationale(question, selectedChoiceKey, isCorrect);
      });
  }

  // ==========================================================================
  // 4. Immediate Grading & Answer Evaluation Logic
  // ==========================================================================

  /**
   * Evaluates the selected answer against canonical answer key, updates UI,
   * synthesizes audio tones, and transitions state machine.
   * 
   * @param {Object} question - Target question object
   * @param {string} selectedChoiceKey - Student selected choice key ('a', 'b', 'c', 'd')
   */
  function evaluateAnswer(question, selectedChoiceKey) {
    if (!question || !selectedChoiceKey) {
      console.warn('[FeedbackEngine] Cannot evaluate answer: missing question or choice.');
      return;
    }

    const normalizedSelected = String(selectedChoiceKey).toLowerCase();
    const normalizedCorrect = String(question.answer || '').toLowerCase();
    const isCorrect = (normalizedSelected === normalizedCorrect);

    // 1. Record in Session / AppState
    if (global.AppState) {
      if (global.AppState.session && typeof global.AppState.session.recordAnswer === 'function') {
        global.AppState.session.recordAnswer(question.id, normalizedSelected, isCorrect);
      } else if (typeof global.AppState.recordAnswer === 'function') {
        global.AppState.recordAnswer(question.id, normalizedSelected, isCorrect);
      }
    }

    // 2. Synthesize Procedural Web Audio Feedback
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    const els = getElements();

    // 3. Hide Submit Button
    if (els.btnSubmit) {
      els.btnSubmit.classList.add('hidden');
    }

    // 4. Update Option Visual States
    const choiceButtons = els.choicesGrid
      ? els.choicesGrid.querySelectorAll('.choice-card, .choice-btn, .option-btn')
      : [];

    choiceButtons.forEach(card => {
      // Lock cards from further interaction
      card.classList.add('disabled');
      card.setAttribute('disabled', 'true');
      card.setAttribute('aria-disabled', 'true');

      const cardLetter = (card.dataset.choice || '').toLowerCase();

      if (cardLetter === normalizedCorrect) {
        // Emerald green background, border, checkmark
        card.classList.add('correct');
        card.classList.remove('selected', 'dimmed');
      } else if (cardLetter === normalizedSelected && !isCorrect) {
        // Ruby red background, border
        card.classList.add('incorrect');
        card.classList.remove('selected', 'dimmed');
      } else {
        // Dim all unselected choices
        card.classList.add('dimmed');
        card.classList.remove('selected');
      }
    });

    // 5. Reveal Feedback Panel
    if (els.feedbackPanel) {
      els.feedbackPanel.classList.remove('hidden');
    }

    // 6. Populate Feedback Status Badge
    if (els.feedbackStatus) {
      if (isCorrect) {
        els.feedbackStatus.innerHTML = `
          <div class="feedback-badge-status correct">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Correct! Accurate Systems Analysis</span>
          </div>
        `;
      } else {
        els.feedbackStatus.innerHTML = `
          <div class="feedback-badge-status incorrect">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>Incorrect Decision</span>
          </div>
        `;
      }
    }

    // 7. Populate Correct Answer Callout (Shown when incorrect)
    if (els.feedbackCorrectAnswer) {
      if (!isCorrect) {
        const correctChoiceText = (question.choices && question.choices[normalizedCorrect]) ? question.choices[normalizedCorrect] : '';
        els.feedbackCorrectAnswer.innerHTML = `
          <div class="correct-answer-callout">
            <span class="callout-label">Correct Solution:</span>
            <span class="callout-choice"><strong>Option (${normalizedCorrect.toUpperCase()}):</strong> ${formatMath(correctChoiceText)}</span>
          </div>
        `;
        els.feedbackCorrectAnswer.classList.remove('hidden');
      } else {
        els.feedbackCorrectAnswer.innerHTML = '';
        els.feedbackCorrectAnswer.classList.add('hidden');
      }
    }

    // 8. Update Next Question Button Label
    if (els.btnNext && global.AppState && global.AppState.session) {
      const session = global.AppState.session;
      const isLastQuestion = session.questionOrder && (session.currentIndex + 1 >= session.questionOrder.length);
      if (isLastQuestion) {
        els.btnNext.innerHTML = `
          <span>Complete Quiz &amp; View Results &rarr;</span>
          <kbd style="background: rgba(0,0,0,0.25); border-color: rgba(0,0,0,0.3); color: #FFFFFF; margin-left: 4px;">Enter ↵</kbd>
        `;
      } else {
        els.btnNext.innerHTML = `
          <span>Advance to Next Problem &rarr;</span>
          <kbd style="background: rgba(0,0,0,0.25); border-color: rgba(0,0,0,0.3); color: #FFFFFF; margin-left: 4px;">Enter ↵</kbd>
        `;
      }
    }

    // 9. Dispatch Lifecycle Events
    dispatchAppEvent('app:answer-recorded', {
      questionId: question.id,
      isCorrect,
      selectedChoice: normalizedSelected
    });
    dispatchAppEvent('answerSubmitted', {
      questionId: question.id,
      selectedChoice: normalizedSelected,
      isCorrect,
      question
    });

    // 10. Transition State Machine to FEEDBACK
    if (global.AppState && typeof global.AppState.transitionTo === 'function') {
      const targetState = (global.AppState.STATES && global.AppState.STATES.FEEDBACK) ? global.AppState.STATES.FEEDBACK : 'FEEDBACK';
      global.AppState.transitionTo(targetState);
    }

    // 11. Coordinate AI Explanation Controller
    fetchAndRenderExplanation(question, normalizedSelected, isCorrect, false);
  }

  /**
   * Action trigger for submitting answer via user click or keypress.
   */
  function submitAnswer() {
    const question = getCurrentQuestion();
    if (!question) {
      console.warn('[FeedbackEngine] Cannot submit: no active question.');
      return;
    }

    const session = global.AppState ? global.AppState.session : null;
    if (session && session.answers && session.answers[question.id]) {
      return; // Already submitted
    }

    const selected = getSelectedChoice();
    if (!selected) {
      return; // No option chosen yet
    }

    evaluateAnswer(question, selected);
  }

  /**
   * Action trigger for advancing to next question.
   */
  function handleNextQuestion() {
    if (global.Quiz && typeof global.Quiz.handleNextQuestion === 'function') {
      global.Quiz.handleNextQuestion();
      return;
    }

    const session = global.AppState ? global.AppState.session : null;
    if (!session) return;

    if (session.currentIndex + 1 < session.questionOrder.length) {
      if (typeof global.AppState.nextQuestion === 'function') {
        global.AppState.nextQuestion();
      } else {
        session.currentIndex++;
      }

      if (typeof global.AppState.transitionTo === 'function') {
        const stateQ = (global.AppState.STATES && global.AppState.STATES.QUESTION) ? global.AppState.STATES.QUESTION : 'QUESTION';
        global.AppState.transitionTo(stateQ);
      }

      if (global.Quiz && typeof global.Quiz.renderCurrentQuestion === 'function') {
        global.Quiz.renderCurrentQuestion();
      }
    } else {
      if (typeof global.AppState.transitionTo === 'function') {
        const stateRes = (global.AppState.STATES && global.AppState.STATES.RESULTS) ? global.AppState.STATES.RESULTS : 'RESULTS';
        global.AppState.transitionTo(stateRes);
      }
    }
  }

  // ==========================================================================
  // 5. Dynamic Event Listeners & Auto-Initialization
  // ==========================================================================

  function initFeedbackEngine() {
    const els = getElements();

    // Submit Answer Button Click
    if (els.btnSubmit && !els.btnSubmit.dataset.feedbackBound) {
      els.btnSubmit.dataset.feedbackBound = 'true';
      els.btnSubmit.addEventListener('click', event => {
        event.preventDefault();
        submitAnswer();
      });
    }

    // Next Question Button Click
    if (els.btnNext && !els.btnNext.dataset.feedbackBound) {
      els.btnNext.dataset.feedbackBound = 'true';
      els.btnNext.addEventListener('click', event => {
        event.preventDefault();
        handleNextQuestion();
      });
    }

    // Dynamic AI Toggle Listener (Updates active feedback view without refresh)
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('aiToggleChange', event => {
        const isEnabled = event.detail && event.detail.enabled;
        if (global.AppState && typeof global.AppState.getCurrentState === 'function') {
          const state = global.AppState.getCurrentState();
          if (state === 'FEEDBACK' || (global.AppState.STATES && state === global.AppState.STATES.FEEDBACK)) {
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

  // ==========================================================================
  // 6. Public API Export
  // ==========================================================================

  const FeedbackEngine = {
    evaluateAnswer,
    fetchAndRenderExplanation,
    playCorrectSound,
    playIncorrectSound,
    showExplanationLoading,
    renderMarkdown
  };

  const Feedback = {
    submitAnswer,
    evaluateAnswer,
    handleNextQuestion,
    showExplanationLoading,
    renderMarkdown,
    fetchAndRenderExplanation,
    playCorrectSound,
    playIncorrectSound
  };

  global.FeedbackEngine = FeedbackEngine;
  global.Feedback = Feedback;

  if (typeof window !== 'undefined') {
    window.FeedbackEngine = FeedbackEngine;
    window.Feedback = Feedback;
    window.evaluateAnswer = evaluateAnswer;
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
