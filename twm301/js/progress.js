/**
 * TWM 301 Midterm Reviewer — Progress Header & Live Score Tracker
 * Academic References: Higham (SIAM), Grätzer (Springer), Lamport (Addison-Wesley)
 * 
 * Manages:
 * - Real-time sticky header synchronization
 * - Smooth hardware-accelerated progress bar animation (0% to 100%)
 * - Dynamic question counter ("Question X of 50")
 * - Running score indicator with division-by-zero protection ("Score: Y / Z")
 * - Haptic/visual score pulse feedback on correct answers
 */

(function (global) {
  'use strict';

  let pulseTimer = null;

  // DOM Elements Cache
  function getElements() {
    return {
      header: document.getElementById('quiz-header'),
      track: document.querySelector('.progress-track'),
      bar: document.getElementById('quiz-progress-bar') || document.querySelector('.progress-fill'),
      counter: document.getElementById('header-counter'),
      score: document.getElementById('header-score')
    };
  }

  /**
   * Updates the progress bar, counter text, and score indicator.
   * @param {Object} [options] - Update options ({ pulseScore: boolean })
   */
  function updateProgressHeader(options = {}) {
    if (!global.AppState || !global.AppState.session) {
      return;
    }

    const { session } = global.AppState;
    const els = getElements();
    if (!els.header) return;

    const totalQuestions = (session.questionOrder && session.questionOrder.length) || 50;
    const currentIndex = typeof session.currentIndex === 'number' ? session.currentIndex : 0;
    const currentState = global.AppState.getCurrentState ? global.AppState.getCurrentState() : 'WELCOME';
    const isCompleted = currentState === 'RESULTS' || currentState === 'REVIEW';

    // 1. Calculate Progress Percentage
    let pct = 0;
    if (isCompleted) {
      pct = 100;
    } else if (totalQuestions > 0) {
      pct = Math.round((currentIndex / totalQuestions) * 100);
    }
    pct = Math.min(100, Math.max(0, pct));

    // Update Progress Bar
    if (els.bar) {
      els.bar.style.width = `${pct}%`;
    }
    if (els.track) {
      els.track.setAttribute('aria-valuenow', String(pct));
    }

    // 2. Update Question Counter
    if (els.counter) {
      if (isCompleted) {
        els.counter.textContent = `Completed ${totalQuestions} of ${totalQuestions}`;
      } else {
        els.counter.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
      }
    }

    // 3. Update Running Score (Only counts submitted answers)
    const answers = session.answers || {};
    const answeredCount = Object.keys(answers).length;
    const scoreVal = typeof session.score === 'number' ? session.score : 0;

    if (els.score) {
      if (answeredCount === 0) {
        els.score.textContent = 'Score: 0 / 0';
      } else {
        els.score.textContent = `Score: ${scoreVal} / ${answeredCount}`;
      }

      // 4. Score Increment Animation Pulse
      if (options.pulseScore) {
        triggerScorePulse(els.score);
      }
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

    scoreElement.classList.remove('score-pulse');
    // Force DOM reflow to allow immediate re-triggering of animation
    void scoreElement.offsetWidth;
    scoreElement.classList.add('score-pulse');

    pulseTimer = setTimeout(() => {
      scoreElement.classList.remove('score-pulse');
      pulseTimer = null;
    }, 650);
  }

  /**
   * Resets progress bar and stats to initial state.
   */
  function resetProgress() {
    const els = getElements();
    if (els.bar) els.bar.style.width = '0%';
    if (els.track) els.track.setAttribute('aria-valuenow', '0');
    if (els.counter) els.counter.textContent = 'Question 1 of 50';
    if (els.score) {
      els.score.textContent = 'Score: 0 / 0';
      els.score.classList.remove('score-pulse');
    }
  }

  // ==========================================================================
  // Event Bindings
  // ==========================================================================

  function initProgressListeners() {
    // When a question renders, update progress bar & counter
    document.addEventListener('questionRendered', () => {
      updateProgressHeader();
    });

    // When an answer is submitted, update score & optionally pulse on correct
    document.addEventListener('answerSubmitted', event => {
      const isCorrect = Boolean(event.detail && event.detail.record && event.detail.record.correct);
      updateProgressHeader({ pulseScore: isCorrect });
    });

    // When session is initialized, update starting baseline
    document.addEventListener('sessionInitialized', () => {
      resetProgress();
      updateProgressHeader();
    });

    // When state changes (e.g. to RESULTS or WELCOME)
    document.addEventListener('stateChange', event => {
      const state = event.detail ? event.detail.state : '';
      if (state === 'WELCOME') {
        resetProgress();
      } else if (state === 'RESULTS' || state === 'REVIEW') {
        updateProgressHeader();
      }
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initProgressListeners);
    } else {
      initProgressListeners();
    }
  }

  // Export
  const ProgressTracker = {
    updateProgressHeader,
    triggerScorePulse,
    resetProgress
  };

  if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
  }

})(typeof window !== 'undefined' ? window : globalThis);
