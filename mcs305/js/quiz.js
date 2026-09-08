/**
 * MCS 305: Systems Analysis and Design — Question Rendering & Interactive Quiz Controller
 * 
 * Manages:
 * - Dynamic rendering of question stems, syllabus module badges, and difficulty indicators
 * - Rebuilding the 4-choice options grid with KaTeX mathematical formatting
 * - Answer selection, evaluation (Practice vs Exam mode), and feedback panel toggling
 * - Resilient keyboard shortcuts (1-4, A-D, Enter, Space, Arrows) with input protection
 * - State machine synchronizations and question navigation
 */

(function (global) {
  'use strict';

  let currentSelectedChoice = null;

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

  // DOM Elements Cache
  function getElements() {
    if (typeof document === 'undefined') return {};
    return {
      quizScreen: document.getElementById('quiz-screen'),
      quizCard: document.querySelector('.question-card'),
      topicBadge: document.getElementById('quiz-topic-badge'),
      difficultyBadge: document.getElementById('quiz-difficulty-badge'),
      questionIndexLabel: document.getElementById('quiz-question-index-label'),
      btnBookmark: document.getElementById('btn-bookmark-question'),
      questionText: document.getElementById('quiz-question-text'),
      choicesGrid: document.getElementById('quiz-choices-grid'),
      btnPrev: document.getElementById('btn-prev-question'),
      btnSubmit: document.getElementById('btn-submit-answer'),
      feedbackPanel: document.getElementById('feedback-panel'),
      feedbackStatus: document.getElementById('feedback-status'),
      feedbackCorrectAnswer: document.getElementById('feedback-correct-answer'),
      btnNext: document.getElementById('btn-next-question'),
      aiExplanationContent: document.getElementById('ai-explanation-content'),
      aiPausedBox: document.getElementById('ai-paused-box'),
      aiExplanationBox: document.getElementById('ai-explanation-box')
    };
  }

  /**
   * Retrieves the question object for the active session position.
   * @returns {Object|null}
   */
  function getCurrentQuestion() {
    if (!global.AppState) return null;
    if (typeof global.AppState.getCurrentQuestion === 'function') {
      return global.AppState.getCurrentQuestion();
    }
    const session = global.AppState.session;
    if (!session || !session.questionOrder || session.questionOrder.length === 0) {
      return null;
    }
    const curId = session.questionOrder[session.currentIndex];
    return global.AppState.getQuestion(curId);
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
   * Typesets mathematical equations, CBA metrics, and formulas using MathRenderer.
   * @param {string} str
   * @returns {string} Formatted HTML
   */
  function formatMath(str) {
    if (typeof str !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.render === 'function') {
      return global.MathRenderer.render(str);
    }
    return escapeHtml(str);
  }

  // Export to global scope
  global.formatMathAndLogic = formatMath;

  /**
   * Renders the current question onto the quiz screen.
   * Rebuilds choice cards, updates telemetry badges, and handles previously answered states.
   */
  function renderCurrentQuestion() {
    const question = getCurrentQuestion();
    if (!question) {
      console.warn('[Quiz] No question available for current session position.');
      return;
    }

    const els = getElements();
    const session = global.AppState ? global.AppState.session : null;
    const currentIndex = session ? session.currentIndex : 0;
    const totalQuestions = session && session.questionOrder ? session.questionOrder.length : 210;

    // 1. Topic Badge: Module ID + Title
    if (els.topicBadge) {
      const lesson = question.lessonTitle || question.lessonId || 'Systems Analysis';
      els.topicBadge.textContent = `${question.lessonId || ''}: ${lesson}`;
    }

    // 2. Difficulty Badge
    if (els.difficultyBadge) {
      const diff = (question.difficulty || 'easy').toLowerCase();
      els.difficultyBadge.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
      els.difficultyBadge.className = `badge badge-difficulty diff-${diff}`;
    }

    // 3. Question Index Label
    if (els.questionIndexLabel) {
      els.questionIndexLabel.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
    }

    // 4. Bookmark Button State
    if (els.btnBookmark && global.AppState) {
      const isBookmarked = global.AppState.isBookmarked(question.id);
      els.btnBookmark.classList.toggle('active', isBookmarked);
      els.btnBookmark.setAttribute('aria-pressed', isBookmarked ? 'true' : 'false');
      els.btnBookmark.setAttribute('title', isBookmarked ? 'Remove Bookmark' : 'Bookmark for Review');
    }

    // 5. Question Stem Text
    if (els.questionText) {
      els.questionText.innerHTML = formatMath(question.question);
    }

    // 6. Reset temporary selection pointer
    currentSelectedChoice = null;

    // 7. Check if already answered in this session
    const existingAnswer = session && session.answers ? session.answers[question.id] : null;
    const isAnswered = Boolean(existingAnswer);
    const mode = (session && session.settings && session.settings.mode) || 'practice';

    // 8. Build Choices Grid
    if (els.choicesGrid) {
      els.choicesGrid.innerHTML = '';
      const letters = ['a', 'b', 'c', 'd'];

      letters.forEach((letter, idx) => {
        const choiceText = question.choices && question.choices[letter] ? question.choices[letter] : '';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-card';
        button.dataset.choice = letter;
        button.setAttribute('role', 'radio');
        button.setAttribute('tabindex', '0');
        button.setAttribute('aria-label', `Option ${letter.toUpperCase()}: ${choiceText}`);

        // Shortcut & Letter indicator
        const letterSpan = document.createElement('span');
        letterSpan.className = 'choice-letter';
        letterSpan.textContent = letter.toUpperCase();

        // Choice text span with KaTeX formula support
        const textSpan = document.createElement('span');
        textSpan.className = 'choice-text';
        textSpan.innerHTML = formatMath(choiceText);

        button.appendChild(letterSpan);
        button.appendChild(textSpan);

        // If previously answered, render evaluated visual state
        if (isAnswered) {
          button.classList.add('disabled');
          button.setAttribute('disabled', 'true');

          const userSelected = String(existingAnswer.selected).toLowerCase();
          const correctAnswer = String(question.answer).toLowerCase();

          if (letter === userSelected) {
            button.classList.add('selected');
            button.setAttribute('aria-checked', 'true');
          } else {
            button.setAttribute('aria-checked', 'false');
          }

          if (mode === 'practice') {
            if (letter === correctAnswer) {
              button.classList.add('correct');
            } else if (letter === userSelected && !existingAnswer.isCorrect) {
              button.classList.add('incorrect');
            } else {
              button.classList.add('dimmed');
            }
          }
        } else {
          button.setAttribute('aria-checked', 'false');
        }

        els.choicesGrid.appendChild(button);
      });
    }

    // 9. Navigation Button States
    if (els.btnPrev) {
      if (currentIndex > 0) {
        els.btnPrev.classList.remove('hidden');
      } else {
        els.btnPrev.classList.add('hidden');
      }
    }

    if (els.btnSubmit) {
      els.btnSubmit.classList.add('hidden');
    }

    // 10. Feedback Panel Visibility
    if (els.feedbackPanel) {
      if (isAnswered && mode === 'practice') {
        els.feedbackPanel.classList.remove('hidden');
        renderFeedbackContent(question, existingAnswer);
      } else {
        els.feedbackPanel.classList.add('hidden');
      }
    }

    // Update Next Question button text on last item
    if (els.btnNext) {
      const isLastQuestion = currentIndex >= totalQuestions - 1;
      const nextText = isLastQuestion ? 'Complete Quiz & View Results →' : 'Advance to Next Problem →';
      const labelSpan = els.btnNext.querySelector('span');
      if (labelSpan) {
        labelSpan.textContent = nextText;
      }
    }

    // 11. Dispatch questionRendered custom event
    dispatchAppEvent('questionRendered', {
      question,
      currentIndex,
      totalQuestions,
      isAnswered
    });
    dispatchAppEvent('app:question-rendered', {
      question,
      currentIndex,
      totalQuestions
    });
  }

  /**
   * Helper to render feedback banner when question was answered.
   */
  function renderFeedbackContent(question, answerRecord) {
    const els = getElements();
    if (!els.feedbackPanel || !question || !answerRecord) return;

    const isCorrect = Boolean(answerRecord.isCorrect || answerRecord.correct);
    const correctAnswer = String(question.answer).toLowerCase();
    const correctText = question.choices && question.choices[correctAnswer] ? question.choices[correctAnswer] : '';

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

    if (els.feedbackCorrectAnswer) {
      if (!isCorrect) {
        els.feedbackCorrectAnswer.innerHTML = `
          <div class="correct-answer-callout">
            <span class="callout-label">Correct Solution:</span>
            <span class="callout-choice"><strong>Option ${correctAnswer.toUpperCase()}:</strong> ${formatMath(correctText)}</span>
          </div>
        `;
        els.feedbackCorrectAnswer.classList.remove('hidden');
      } else {
        els.feedbackCorrectAnswer.innerHTML = '';
        els.feedbackCorrectAnswer.classList.add('hidden');
      }
    }

    // Default canonical proof in feedback container if AI not currently executing
    if (els.aiExplanationContent) {
      // Check if explanation exists in AppState cache
      const cached = global.AppState ? global.AppState.getExplanation(question.id) : null;
      if (cached) {
        if (global.MathRenderer && typeof global.MathRenderer.renderMarkdownWithMath === 'function') {
          els.aiExplanationContent.innerHTML = global.MathRenderer.renderMarkdownWithMath(cached);
        } else {
          els.aiExplanationContent.innerHTML = `<p>${cached}</p>`;
        }
      } else if (question.rationale && question.rationale.proof) {
        // Display canonical textbook rationale
        let rationaleHtml = `<p><strong>Systems Proof:</strong> ${formatMath(question.rationale.proof)}</p>`;
        if (question.rationale.takeaway) {
          rationaleHtml += `<p style="margin-top: 8px;"><strong>Key Takeaway:</strong> ${formatMath(question.rationale.takeaway)}</p>`;
        }
        els.aiExplanationContent.innerHTML = rationaleHtml;
      }
    }
  }

  /**
   * Selects an answer choice by letter ('a', 'b', 'c', 'd').
   * @param {string} choiceLetter
   */
  function selectChoice(choiceLetter) {
    if (!choiceLetter) return;
    const normalized = String(choiceLetter).toLowerCase();

    const els = getElements();
    const question = getCurrentQuestion();
    if (!question) return;

    const session = global.AppState ? global.AppState.session : null;

    // If feedback panel is already shown or question already answered, ignore selection
    if (els.feedbackPanel && !els.feedbackPanel.classList.contains('hidden')) {
      return;
    }
    if (session && session.answers && session.answers[question.id]) {
      return;
    }

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

    if (targetCard || !els.choicesGrid) {
      currentSelectedChoice = normalized;

      const mode = (session && session.settings && session.settings.mode) || 'practice';

      if (mode === 'practice') {
        // Reveal Submit Answer Button in Practice mode
        if (els.btnSubmit) {
          els.btnSubmit.classList.remove('hidden');
        }
      } else {
        // In Exam Simulation mode, record answer silently without revealing feedback
        const isCorrect = (normalized === String(question.answer).toLowerCase());
        if (global.AppState) {
          global.AppState.recordAnswer(question.id, normalized, isCorrect);
        }
      }

      dispatchAppEvent('choiceSelected', { choice: normalized, questionId: question.id });
      dispatchAppEvent('app:choice-selected', { choice: normalized, questionId: question.id });
    }
  }

  /**
   * Evaluates the selected answer and executes transition into FEEDBACK state.
   */
  function submitAnswer() {
    if (!currentSelectedChoice) return;

    const question = getCurrentQuestion();
    if (!question) return;

    const session = global.AppState ? global.AppState.session : null;
    if (session && session.answers && session.answers[question.id]) {
      return; // Already submitted
    }

    if (global.FeedbackEngine && typeof global.FeedbackEngine.evaluateAnswer === 'function') {
      global.FeedbackEngine.evaluateAnswer(question, currentSelectedChoice);
      return;
    }

    const els = getElements();
    const isCorrect = (currentSelectedChoice === String(question.answer).toLowerCase());
    const correctAnswer = String(question.answer).toLowerCase();

    // 1. Record in AppState
    if (global.AppState) {
      global.AppState.recordAnswer(question.id, currentSelectedChoice, isCorrect);
    }

    // 2. Hide Submit button
    if (els.btnSubmit) {
      els.btnSubmit.classList.add('hidden');
    }

    // 3. Mark choice cards with evaluated styles
    if (els.choicesGrid) {
      const cards = els.choicesGrid.querySelectorAll('.choice-card');
      cards.forEach(card => {
        card.classList.add('disabled');
        card.setAttribute('disabled', 'true');
        const c = card.dataset.choice;
        if (c === correctAnswer) {
          card.classList.add('correct');
        } else if (c === currentSelectedChoice && !isCorrect) {
          card.classList.add('incorrect');
        } else {
          card.classList.add('dimmed');
        }
      });
    }

    // 4. Transition State Machine
    if (global.AppState) {
      global.AppState.transitionTo(global.AppState.STATES.FEEDBACK);
    }

    // 5. Reveal Feedback Panel
    if (els.feedbackPanel) {
      els.feedbackPanel.classList.remove('hidden');
      renderFeedbackContent(question, { selected: currentSelectedChoice, isCorrect });
    }

    // 6. Dispatch answer submitted event
    dispatchAppEvent('answerSubmitted', {
      questionId: question.id,
      selectedChoice: currentSelectedChoice,
      isCorrect,
      question
    });
    dispatchAppEvent('app:answer-submitted', {
      questionId: question.id,
      selectedChoice: currentSelectedChoice,
      isCorrect,
      question
    });
  }

  /**
   * Advances to next question or concludes the quiz session.
   */
  function handleNextQuestion() {
    if (!global.AppState || !global.AppState.session) return;
    const session = global.AppState.session;

    if (session.currentIndex < session.questionOrder.length - 1) {
      global.AppState.nextQuestion();
      global.AppState.transitionTo(global.AppState.STATES.QUESTION);
      renderCurrentQuestion();
    } else {
      // Quiz complete!
      session.endTime = Date.now();
      global.AppState.transitionTo(global.AppState.STATES.RESULTS);
    }
  }

  /**
   * Returns to previous question in session history.
   */
  function handlePrevQuestion() {
    if (!global.AppState || !global.AppState.session) return;
    const session = global.AppState.session;

    if (session.currentIndex > 0) {
      global.AppState.prevQuestion();
      global.AppState.transitionTo(global.AppState.STATES.QUESTION);
      renderCurrentQuestion();
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
    if (choicesContainer && !choicesContainer.dataset.bound) {
      choicesContainer.dataset.bound = 'true';
      choicesContainer.addEventListener('click', event => {
        const card = event.target.closest('.choice-card');
        if (card && card.dataset.choice) {
          selectChoice(card.dataset.choice);
        }
      });
    }

    // Submit Answer Button
    const btnSubmit = document.getElementById('btn-submit-answer');
    if (btnSubmit && !btnSubmit.dataset.bound) {
      btnSubmit.dataset.bound = 'true';
      btnSubmit.addEventListener('click', submitAnswer);
    }

    // Next Question Button
    const btnNext = document.getElementById('btn-next-question');
    if (btnNext && !btnNext.dataset.bound) {
      btnNext.dataset.bound = 'true';
      btnNext.addEventListener('click', handleNextQuestion);
    }

    // Previous Question Button
    const btnPrev = document.getElementById('btn-prev-question');
    if (btnPrev && !btnPrev.dataset.bound) {
      btnPrev.dataset.bound = 'true';
      btnPrev.addEventListener('click', handlePrevQuestion);
    }

    // Bookmark Button
    const btnBookmark = document.getElementById('btn-bookmark-question');
    if (btnBookmark && !btnBookmark.dataset.bound) {
      btnBookmark.dataset.bound = 'true';
      btnBookmark.addEventListener('click', () => {
        const q = getCurrentQuestion();
        if (q && global.AppState) {
          const isNowBookmarked = global.AppState.toggleBookmark(q.id);
          btnBookmark.classList.toggle('active', isNowBookmarked);
          btnBookmark.setAttribute('aria-pressed', isNowBookmarked ? 'true' : 'false');
        }
      });
    }
  }

  let keyboardInitialized = false;

  function initKeyboardAccessibility() {
    if (keyboardInitialized) return;
    keyboardInitialized = true;

    window.addEventListener('keydown', event => {
      // 1. Guard against keystrokes when typing into form fields
      if (event.target && event.target.matches && event.target.matches('input, textarea, select')) {
        return;
      }
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }

      // 2. State Guard: Only execute on QUESTION and FEEDBACK screens
      if (global.AppState) {
        const currentState = global.AppState.getCurrentState();
        if (currentState !== global.AppState.STATES.QUESTION && currentState !== global.AppState.STATES.FEEDBACK) {
          return;
        }
      }

      const key = event.key;
      const feedbackPanel = document.getElementById('feedback-panel');
      const feedbackVisible = feedbackPanel && !feedbackPanel.classList.contains('hidden');

      // 3. Option Selection Keys (1-4 and A-D)
      if (!feedbackVisible) {
        if (/^[a-dA-D]$/.test(key)) {
          event.preventDefault();
          selectChoice(key.toLowerCase());
          return;
        }

        const numMap = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };
        if (numMap[key]) {
          event.preventDefault();
          selectChoice(numMap[key]);
          return;
        }
      }

      // 4. Enter Key Handler
      if (key === 'Enter') {
        if (!feedbackVisible) {
          const btnSubmit = document.getElementById('btn-submit-answer');
          if (btnSubmit && !btnSubmit.classList.contains('hidden') && currentSelectedChoice) {
            event.preventDefault();
            submitAnswer();
          } else {
            const session = global.AppState ? global.AppState.session : null;
            const mode = session && session.settings ? session.settings.mode : 'practice';
            if (mode === 'exam' && currentSelectedChoice) {
              event.preventDefault();
              handleNextQuestion();
            }
          }
        } else {
          // If feedback panel is visible, Advance to Next Problem
          event.preventDefault();
          handleNextQuestion();
        }
        return;
      }

      // 5. Space and Arrow Right Handler: Advance to next question when feedback is open
      if (key === ' ' || key === 'ArrowRight') {
        if (feedbackVisible) {
          event.preventDefault();
          handleNextQuestion();
          return;
        }
      }

      // 6. Arrow Left: Previous question
      if (key === 'ArrowLeft') {
        const session = global.AppState ? global.AppState.session : null;
        if (session && session.currentIndex > 0) {
          event.preventDefault();
          handlePrevQuestion();
          return;
        }
      }
    });
  }

  // ==========================================================================
  // State Machine Event Listeners
  // ==========================================================================

  function initListeners() {
    // When state machine transitions to QUESTION, render active question
    document.addEventListener('stateChange', event => {
      if (event.detail && event.detail.state === 'QUESTION') {
        renderCurrentQuestion();
      }
    });

    document.addEventListener('app:state-changed', event => {
      if (event.detail && event.detail.to === 'QUESTION') {
        renderCurrentQuestion();
      }
    });

    document.addEventListener('sessionInitialized', () => {
      renderCurrentQuestion();
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

  // Public API Export
  const Quiz = {
    getCurrentQuestion,
    renderCurrentQuestion,
    renderQuestionCard: renderCurrentQuestion,
    selectChoice,
    submitAnswer,
    handleNextQuestion,
    handlePrevQuestion,
    getSelectedChoice,
    formatMath
  };

  global.Quiz = Quiz;

  if (typeof window !== 'undefined') {
    window.Quiz = Quiz;
  }
  if (typeof global !== 'undefined') {
    global.Quiz = Quiz;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Quiz;
  }

})(typeof window !== 'undefined' ? window : globalThis);
