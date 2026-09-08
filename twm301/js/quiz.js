/**
 * TWM 301 Midterm Reviewer — Question Rendering & Selection Engine
 * Academic References: Higham (SIAM), Grätzer (Springer), Lamport (Addison-Wesley)
 * 
 * Handles:
 * - Dynamic rendering of active question stems and multiple-choice cards
 * - Single-choice selection state and "Submit Answer" button visibility
 * - Keyboard shortcuts (1-4, A-D, Enter) with input-field protection
 * - Event delegation and state listener integrations
 */

(function (global) {
  'use strict';

  let currentSelectedChoice = null;

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
      topicBadge: document.getElementById('quiz-topic-badge'),
      questionNumber: document.getElementById('quiz-question-index-label') || document.getElementById('quiz-question-number'),
      questionText: document.getElementById('quiz-question-text'),
      choicesGrid: document.getElementById('quiz-choices-grid'),
      btnSubmit: document.getElementById('btn-submit-answer'),
      feedbackPanel: document.getElementById('feedback-panel')
    };
  }

  /**
   * Retrieves the question object for the active session position.
   * @returns {Object|null} Question data object or null
   */
  function getCurrentQuestion() {
    if (!global.AppState || !global.AppState.session) {
      return null;
    }

    const { session } = global.AppState;
    if (!session.questionOrder || session.questionOrder.length === 0) {
      return null;
    }

    const currentId = session.questionOrder[session.currentIndex];
    if (typeof global.AppState.getQuestion === 'function') {
      return global.AppState.getQuestion(currentId);
    }
    if (session.questionsMap && session.questionsMap[currentId]) {
      return session.questionsMap[currentId];
    }
    const questions = global.QUESTIONS || (typeof QUESTIONS !== 'undefined' ? QUESTIONS : []);
    
    return questions.find(q => q.id === currentId) || null;
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
   * Formats mathematical equations, logic propositions, LaTeX formulas, and state-space transitions.
   * Delegates directly to window.MathRenderer for high-precision typesetting.
   * @param {string} str
   * @returns {string} HTML with formatted math tokens
   */
  function formatMathAndLogic(str) {
    if (typeof str !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.render === 'function') {
      return global.MathRenderer.render(str);
    }
    return escapeHtml(str);
  }

  // Export to global for review module
  global.formatMathAndLogic = formatMathAndLogic;

  /**
   * Renders the current question onto the quiz screen.
   */
  function renderCurrentQuestion() {
    const question = getCurrentQuestion();
    if (!question) {
      console.warn('[Quiz] No question found for current session position.');
      return;
    }

    const els = getElements();
    const session = global.AppState.session;
    const currentNumber = session.currentIndex + 1;
    const totalQuestions = session.questionOrder.length || 50;

    // 1. Topic Badge
    if (els.topicBadge) {
      els.topicBadge.textContent = question.topic || 'General AI';
    }

    // 2. Question Index Label
    if (els.questionNumber) {
      els.questionNumber.textContent = `Question ${currentNumber} of ${totalQuestions}`;
    }

    // 3. Question Stem Text (with formula formatting)
    if (els.questionText) {
      els.questionText.innerHTML = formatMathAndLogic(question.question);
    }

    // 4. Reset temporary selection
    currentSelectedChoice = null;

    // 5. Build Choices Grid
    if (els.choicesGrid) {
      els.choicesGrid.innerHTML = '';

      const letters = ['a', 'b', 'c', 'd'];
      letters.forEach(letter => {
        const choiceText = question.choices && question.choices[letter] ? question.choices[letter] : '';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-card';
        button.dataset.choice = letter;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', 'false');

        const letterSpan = document.createElement('span');
        letterSpan.className = 'choice-letter';
        letterSpan.textContent = letter.toUpperCase();

        const textSpan = document.createElement('span');
        textSpan.className = 'choice-text';
        textSpan.innerHTML = formatMathAndLogic(choiceText);

        button.appendChild(letterSpan);
        button.appendChild(textSpan);
        els.choicesGrid.appendChild(button);
      });
    }

    // 6. Reset UI State: Hide submit button and feedback panel
    if (els.btnSubmit) {
      els.btnSubmit.classList.add('hidden');
    }

    if (els.feedbackPanel) {
      els.feedbackPanel.classList.add('hidden');
    }

    // 7. Dispatch questionRendered custom event for header / listeners
    dispatchAppEvent('questionRendered', {
      question,
      currentIndex: session.currentIndex,
      totalQuestions
    });
  }

  /**
   * Selects an answer choice by letter ('a', 'b', 'c', 'd').
   * @param {string} choiceLetter
   */
  function selectChoice(choiceLetter) {
    if (!choiceLetter) return;
    const normalized = choiceLetter.toLowerCase();

    const els = getElements();

    // If feedback is currently shown (already submitted), ignore selection
    if (els.feedbackPanel && !els.feedbackPanel.classList.contains('hidden')) {
      return;
    }

    // If answer already recorded for current question, exit early
    const currentQ = getCurrentQuestion();
    if (currentQ && global.AppState && global.AppState.session && global.AppState.session.answers && global.AppState.session.answers[currentQ.id]) {
      return;
    }

    // Remove selection from all choice cards
    const allCards = els.choicesGrid ? els.choicesGrid.querySelectorAll('.choice-card') : [];
    let targetCard = null;

    allCards.forEach(card => {
      if (card.dataset.choice === normalized) {
        targetCard = card;
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
      } else {
        card.classList.remove('selected');
        card.setAttribute('aria-checked', 'false');
      }
    });

    if (targetCard) {
      currentSelectedChoice = normalized;

      // Reveal Submit Answer button
      if (els.btnSubmit) {
        els.btnSubmit.classList.remove('hidden');
      }

      dispatchAppEvent('choiceSelected', { choice: normalized });
    }
  }

  /**
   * Retrieves the currently selected choice letter.
   * @returns {string|null}
   */
  function getSelectedChoice() {
    return currentSelectedChoice;
  }

  // ==========================================================================
  // Event Delegation & Setup
  // ==========================================================================

  function initChoiceDelegation() {
    const choicesContainer = document.getElementById('quiz-choices-grid');
    if (!choicesContainer) return;

    choicesContainer.addEventListener('click', event => {
      const card = event.target.closest('.choice-card');
      if (card && card.dataset.choice) {
        selectChoice(card.dataset.choice);
      }
    });
  }

  function initKeyboardAccessibility() {
    document.addEventListener('keydown', event => {
      // Don't intercept typing in inputs or textareas (e.g. Gemini API key input)
      if (event.target && event.target.matches && event.target.matches('input, textarea')) {
        return;
      }
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }

      // Check current app state: active during QUESTION and FEEDBACK
      if (global.AppState) {
        const currentState = global.AppState.getCurrentState();
        if (currentState !== global.AppState.STATES.QUESTION && currentState !== global.AppState.STATES.FEEDBACK) {
          return;
        }
      }

      const key = event.key;
      const feedbackPanel = document.getElementById('feedback-panel');
      const feedbackVisible = feedbackPanel && !feedbackPanel.classList.contains('hidden');

      // Choice selection shortcuts: active only when feedback is not visible
      if (!feedbackVisible) {
        // Letter shortcuts: a/A -> a, b/B -> b, c/C -> c, d/D -> d
        if (/^[a-dA-D]$/.test(key)) {
          event.preventDefault();
          selectChoice(key.toLowerCase());
          return;
        }

        // Number shortcuts: 1 -> a, 2 -> b, 3 -> c, 4 -> d
        const numMap = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };
        if (numMap[key]) {
          event.preventDefault();
          selectChoice(numMap[key]);
          return;
        }
      }

      // Enter key:
      if (key === 'Enter') {
        if (!feedbackVisible) {
          // If choice selected and submit button visible: trigger submitAnswer()
          const btnSubmit = document.getElementById('btn-submit-answer');
          if (btnSubmit && !btnSubmit.classList.contains('hidden') && currentSelectedChoice) {
            event.preventDefault();
            btnSubmit.click();
          }
        } else {
          // If feedback panel visible: trigger Next Question button
          const btnNext = document.getElementById('btn-next-question');
          if (btnNext && !btnNext.classList.contains('hidden')) {
            event.preventDefault();
            btnNext.click();
          }
        }
      }
    });
  }

  // ==========================================================================
  // State Machine Event Listeners
  // ==========================================================================

  function initListeners() {
    // When state transitions to QUESTION, render the active question
    document.addEventListener('stateChange', event => {
      if (event.detail && event.detail.state === 'QUESTION') {
        renderCurrentQuestion();
      }
    });
  }

  // Initializer
  function initQuizEngine() {
    initChoiceDelegation();
    initKeyboardAccessibility();
    initListeners();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initQuizEngine);
    } else {
      initQuizEngine();
    }
  }

  // Export
  const Quiz = {
    getCurrentQuestion,
    renderCurrentQuestion,
    selectChoice,
    getSelectedChoice
  };

  if (typeof window !== 'undefined') {
    window.Quiz = Quiz;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Quiz;
  }

})(typeof window !== 'undefined' ? window : globalThis);
