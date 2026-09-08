/**
 * MCS 305: Software Engineering — Progress Header & Live Score Tracker
 * 
 * Manages:
 * - Real-time sticky header synchronization across all quiz and evaluation states
 * - Hardware-accelerated progress bar animation (0% to 100%)
 * - Dynamic question counter ("Question X of Y" or "Completed")
 * - Running score indicator with division-by-zero protection ("Score: X / Y")
 * - Tactile visual pulse feedback on correct answers (.header-score.pulse)
 * - Header visibility coordination (hidden on WELCOME, visible elsewhere)
 */

(function (global) {
  'use strict';

  let pulseTimer = null;

  // DOM Elements Cache
  function getElements() {
    if (typeof document === 'undefined') return {};
    return {
      header: document.getElementById('quiz-header'),
      track: document.querySelector('.progress-track'),
      bar: document.getElementById('quiz-progress-bar') || document.querySelector('.progress-fill'),
      counter: document.getElementById('header-counter'),
      score: document.getElementById('header-score'),
      difficultyBadge: document.getElementById('header-difficulty-badge')
    };
  }

  /**
   * Updates the progress bar, question counter text, running score, and difficulty badge.
   * @param {Object} [options={}] - Update options ({ pulseScore: boolean })
   */
  function updateProgressHeader(options = {}) {
    if (!global.AppState || !global.AppState.session) {
      return;
    }

    const { session } = global.AppState;
    const els = getElements();
    if (!els.header) return;

    const totalQuestions = (session.questionOrder && session.questionOrder.length) || 210;
    const currentIndex = typeof session.currentIndex === 'number' ? session.currentIndex : 0;
    const currentState = typeof global.AppState.getCurrentState === 'function'
      ? global.AppState.getCurrentState()
      : 'WELCOME';
    const isCompleted = currentState === 'RESULTS' || currentState === 'REVIEW';

    // 1. Header Visibility Control
    if (currentState === 'WELCOME') {
      els.header.classList.add('hidden');
    } else {
      els.header.classList.remove('hidden');
    }

    // 2. Calculate Progress Percentage with Zero Protection
    let pct = 0;
    if (isCompleted) {
      pct = 100;
    } else if (totalQuestions > 0) {
      pct = Math.round((currentIndex / totalQuestions) * 100);
    }
    pct = Math.min(100, Math.max(0, pct));

    // Update Progress Bar & ARIA attribute
    if (els.bar) {
      els.bar.style.width = `${pct}%`;
    }
    if (els.track) {
      els.track.setAttribute('aria-valuenow', String(pct));
    }

    // 3. Update Question Counter
    if (els.counter) {
      if (isCompleted) {
        els.counter.textContent = `Completed ${totalQuestions} of ${totalQuestions}`;
      } else {
        els.counter.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
      }
    }

    // 4. Update Running Score Indicator
    const answers = session.answers || {};
    const answeredCount = Object.keys(answers).length;
    const scoreVal = typeof session.score === 'number' ? session.score : 0;

    if (els.score) {
      if (answeredCount === 0) {
        els.score.textContent = 'Score: 0 / 0';
      } else {
        els.score.textContent = `Score: ${scoreVal} / ${answeredCount}`;
      }

      // 5. Trigger Score Pulse Animation on Correct Submission
      if (options.pulseScore) {
        triggerScorePulse(els.score);
      }
    }

    // 6. Synchronize Header Difficulty Pill
    if (els.difficultyBadge) {
      const diff = (session.settings && session.settings.difficulty) || 'all';
      els.difficultyBadge.textContent = diff === 'all' ? 'All Tiers' : diff.toUpperCase();
      els.difficultyBadge.className = `header-difficulty-pill diff-${diff}`;
    }
  }

  /**
   * Triggers a subtle tactile pulse animation on the score badge.
   * @param {HTMLElement} scoreElement
   */
  function triggerScorePulse(scoreElement) {
    if (!scoreElement) return;

    if (pulseTimer) {
      clearTimeout(pulseTimer);
      pulseTimer = null;
    }

    scoreElement.classList.remove('pulse', 'score-pulse');
    // Force DOM reflow to allow immediate re-triggering of animation
    void scoreElement.offsetWidth;
    scoreElement.classList.add('pulse', 'score-pulse');

    pulseTimer = setTimeout(() => {
      scoreElement.classList.remove('pulse', 'score-pulse');
      pulseTimer = null;
    }, 450);
  }

  /**
   * Resets progress bar and stats to default starting state.
   */
  function resetProgress() {
    const els = getElements();
    if (els.bar) els.bar.style.width = '0%';
    if (els.track) els.track.setAttribute('aria-valuenow', '0');
    if (els.counter) els.counter.textContent = 'Question 1 of 210';
    if (els.score) {
      els.score.textContent = 'Score: 0 / 0';
      els.score.classList.remove('pulse', 'score-pulse');
    }
  }

  // ==========================================================================
  // Event Bindings
  // ==========================================================================

  function initProgressListeners() {
    // 1. When a question renders or navigates
    document.addEventListener('questionRendered', () => {
      updateProgressHeader();
    });

    document.addEventListener('app:question-rendered', () => {
      updateProgressHeader();
    });

    document.addEventListener('app:question-navigated', () => {
      updateProgressHeader();
    });

    // 2. When an answer is submitted/recorded
    document.addEventListener('answerSubmitted', event => {
      const isCorrect = Boolean(
        (event.detail && event.detail.record && event.detail.record.correct) ||
        (event.detail && event.detail.isCorrect)
      );
      updateProgressHeader({ pulseScore: isCorrect });
    });

    document.addEventListener('app:answer-recorded', event => {
      const isCorrect = Boolean(
        (event.detail && event.detail.record && event.detail.record.correct) ||
        (event.detail && event.detail.isCorrect)
      );
      updateProgressHeader({ pulseScore: isCorrect });
    });

    // 3. When session is initialized
    document.addEventListener('sessionInitialized', () => {
      resetProgress();
      updateProgressHeader();
    });

    document.addEventListener('app:session-started', () => {
      resetProgress();
      updateProgressHeader();
    });

    // 4. When state machine transitions
    document.addEventListener('stateChange', event => {
      const state = event.detail ? event.detail.state : '';
      if (state === 'WELCOME') {
        resetProgress();
      }
      updateProgressHeader();
    });

    document.addEventListener('app:state-changed', event => {
      const state = event.detail ? event.detail.to : '';
      if (state === 'WELCOME') {
        resetProgress();
      }
      updateProgressHeader();
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initProgressListeners);
    } else {
      initProgressListeners();
    }
  }

  // Public API Export
  const ProgressTracker = {
    updateProgressHeader,
    triggerScorePulse,
    resetProgress,
    getElements
  };

  global.ProgressTracker = ProgressTracker;

  if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
  }
  if (typeof global !== 'undefined') {
    global.ProgressTracker = ProgressTracker;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
  }

})(typeof window !== 'undefined' ? window : globalThis);
