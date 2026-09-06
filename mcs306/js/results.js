/**
 * MCS 306 Midterm Reviewer — Results & Syllabus Topic Analytics Engine
 * 
 * Manages:
 * - Overall score & percentage calculation
 * - Qualitative academic letter grade assessment (Excellent, Very Good, Good, Needs Improvement, Study More)
 * - 7-topic syllabus breakdown aggregation & visualization
 * - Weak topic (<60%) warning indicators
 * - Review Mistakes & Quiz Reset navigation routing
 */

(function (global) {
  'use strict';

  // 7 Syllabus Curriculum Topics in canonical course sequence
  const SYLLABUS_TOPICS = Object.freeze([
    'AI Foundations',
    'Agents & Environments',
    'Search Algorithms',
    'Informed Search & Heuristics',
    'Constraint Satisfaction',
    'Logic & Knowledge Representation',
    'Inference Methods'
  ]);

  // Qualitative Grade Scale Definition
  const GRADE_SCALE = Object.freeze([
    {
      minPct: 90,
      label: 'Excellent',
      className: 'grade-excellent',
      tip: 'Outstanding mastery! You have demonstrated deep command of core AI foundations, search algorithms, and knowledge representation. You are exceptionally well-prepared for exam day.'
    },
    {
      minPct: 80,
      label: 'Very Good',
      className: 'grade-very-good',
      tip: 'Strong performance! You have a firm grasp of the core syllabus with only minor concept gaps. Review your few missed items below for complete confidence.'
    },
    {
      minPct: 70,
      label: 'Good',
      className: 'grade-good',
      tip: 'Solid foundation! You understand the primary paradigms well. Focus your active recall on heuristic evaluations and logical inference to push into top-tier mastery.'
    },
    {
      minPct: 60,
      label: 'Needs Improvement',
      className: 'grade-warning',
      tip: 'Passing baseline achieved, but several critical concepts require reinforcement. Pay special attention to the amber-flagged weak topics below before taking the midterm.'
    },
    {
      minPct: 0,
      label: 'Study More',
      className: 'grade-danger',
      tip: 'Comprehensive review strongly recommended. Re-study uninformed search trees, constraint propagation, and propositional logic before retaking the reviewer.'
    }
  ]);

  // Color tokens for mastery bars (aligned with Cognitive AI Studio theme)
  const TOPIC_COLORS = Object.freeze({
    HIGH: '#10B981',     // Cyber Emerald (>= 80%)
    MEDIUM: '#06B6D4',   // Electric Cyan (>= 60%)
    LOW: '#F59E0B'       // Warning Amber (< 60%)
  });

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
      resultsScore: document.getElementById('results-score'),
      resultsPercentage: document.getElementById('results-percentage'),
      resultsGrade: document.getElementById('results-grade'),
      resultsMessage: document.getElementById('results-message'),
      topicBreakdownList: document.getElementById('topic-breakdown-list'),
      btnReviewMistakes: document.getElementById('btn-review-mistakes'),
      btnRestartQuiz: document.getElementById('btn-restart-quiz')
    };
  }

  /**
   * Evaluates score percentage to determine letter grade, CSS class, and study tip.
   * @param {number} percentage - Integer 0-100
   * @returns {Object} { label, className, tip }
   */
  function getGrade(percentage) {
    const pct = Math.max(0, Math.min(100, Math.round(percentage)));
    for (const tier of GRADE_SCALE) {
      if (pct >= tier.minPct) {
        return tier;
      }
    }
    return GRADE_SCALE[GRADE_SCALE.length - 1];
  }

  /**
   * Resolves the mastery bar fill color based on topic score percentage.
   * @param {number} topicPct - Integer 0-100
   * @returns {string} HEX color string
   */
  function getTopicBarColor(topicPct) {
    if (topicPct >= 80) return TOPIC_COLORS.HIGH;
    if (topicPct >= 60) return TOPIC_COLORS.MEDIUM;
    return TOPIC_COLORS.LOW;
  }

  /**
   * Computes topic breakdown metrics across all 7 syllabus topics.
   * @param {Object} session - Current session object
   * @param {Array} questions - Master questions array
   * @returns {Array<Object>} Topic performance records
   */
  function calculateTopicAnalytics(session, questions) {
    const qList = Array.isArray(questions) ? questions : (global.QUESTIONS || []);
    const sess = session || (global.AppState ? global.AppState.session : null);
    const answers = (sess && sess.answers) ? sess.answers : {};

    return SYLLABUS_TOPICS.map(topicName => {
      const topicQuestions = qList.filter(q => q.topic === topicName);
      const totalCount = topicQuestions.length;
      
      const correctCount = topicQuestions.filter(q => {
        const record = answers[q.id];
        return Boolean(record && record.correct);
      }).length;

      const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const isWeak = percentage < 60;
      const barColor = getTopicBarColor(percentage);

      return {
        topic: topicName,
        totalQuestions: totalCount,
        correctCount,
        percentage,
        isWeak,
        barColor,
        questionIds: topicQuestions.map(q => q.id)
      };
    });
  }

  /**
   * Escapes HTML entities for safe template injection.
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
   * Renders the Results & Analytics Screen.
   * Populates overall score, academic letter grade badge, and 7 syllabus topic progress rows.
   */
  function renderResultsScreen() {
    const sess = global.AppState ? global.AppState.session : null;
    if (!sess) {
      console.warn('[Results] No active session found to calculate results.');
      return;
    }

    const els = getElements();
    const questions = global.QUESTIONS || [];
    const totalQuestions = Array.isArray(sess.questionOrder) && sess.questionOrder.length > 0 
      ? sess.questionOrder.length 
      : 50;
    const correctCount = typeof sess.score === 'number' ? sess.score : 0;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const grade = getGrade(percentage);

    // 1. Overall Score Display
    if (els.resultsScore) {
      els.resultsScore.textContent = `${correctCount} / ${totalQuestions}`;
    }

    // 2. Score Percentage Display
    if (els.resultsPercentage) {
      els.resultsPercentage.textContent = `${percentage}% Correct`;
    }

    // 3. Letter Grade Badge
    if (els.resultsGrade) {
      els.resultsGrade.textContent = grade.label;
      // Reset all previous grade classes while preserving base badge classes
      els.resultsGrade.className = 'badge results-grade-badge';
      els.resultsGrade.classList.add(grade.className);
    }

    // 3.5. Difficulty Mode Badge
    const resultsDiffTag = document.getElementById('results-difficulty-tag');
    if (resultsDiffTag && sess.settings) {
      const diff = sess.settings.difficulty || 'easy';
      let diffLabel = 'Easy (Standard Baseline)';
      let diffIconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
      if (diff === 'medium') {
        diffLabel = 'Medium (Shuffled Question Sequence)';
        diffIconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>';
      } else if (diff === 'hard') {
        diffLabel = 'Hard (Shuffled Questions & Choice Letters)';
        diffIconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
      }
      resultsDiffTag.innerHTML = `<span class="badge badge-difficulty diff-${diff}">${diffIconSvg} <span>${diffLabel}</span></span>`;
    }

    // 4. Motivational Study Tip Message
    if (els.resultsMessage) {
      els.resultsMessage.textContent = grade.tip;
    }

    // 5. 7-Topic Mastery Breakdown Calculation & Rendering
    const topicStats = calculateTopicAnalytics(sess, questions);
    if (els.topicBreakdownList) {
      const rowsHtml = topicStats.map(stat => {
        const weakClass = stat.isWeak ? ' topic-weak' : '';
        const escapedName = escapeHtml(stat.topic);
        return `
          <div class="topic-row${weakClass}">
            <div class="topic-info">
              <span class="topic-name">${escapedName}</span>
              <span class="topic-fraction">${stat.correctCount} / ${stat.totalQuestions} (${stat.percentage}%)</span>
            </div>
            <div class="topic-bar-track" role="progressbar" aria-valuenow="${stat.percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapedName} mastery: ${stat.percentage}%">
              <div class="topic-bar-fill" style="width: ${stat.percentage}%; background-color: ${stat.barColor};"></div>
            </div>
          </div>
        `.trim();
      }).join('\n');

      els.topicBreakdownList.innerHTML = rowsHtml;
    }

    // 6. Action Button State Updates
    const missedQuestions = (sess.questionOrder || []).filter(qId => {
      const ans = sess.answers ? sess.answers[qId] : null;
      return !ans || !ans.correct;
    });
    const missedCount = missedQuestions.length;

    if (els.btnReviewMistakes) {
      if (missedCount === 0) {
        els.btnReviewMistakes.disabled = true;
        els.btnReviewMistakes.classList.add('disabled');
        els.btnReviewMistakes.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Flawless Evaluation! Zero Mistakes</span>
        `;
        els.btnReviewMistakes.title = 'You answered every question correctly!';
      } else {
        els.btnReviewMistakes.disabled = false;
        els.btnReviewMistakes.classList.remove('disabled');
        els.btnReviewMistakes.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Review Missed Questions (${missedCount})</span>
        `;
        els.btnReviewMistakes.title = `Review detailed explanations for the ${missedCount} question(s) you missed`;
      }
    }

    dispatchAppEvent('resultsRendered', {
      score: correctCount,
      total: totalQuestions,
      percentage,
      grade: grade.label,
      topicStats,
      missedCount
    });
  }

  /**
   * Initializes action button event bindings.
   */
  function initResultsControls() {
    const els = getElements();

    // Button: Review Missed Questions
    if (els.btnReviewMistakes) {
      els.btnReviewMistakes.addEventListener('click', () => {
        if (els.btnReviewMistakes.disabled) return;

        if (global.AppState && typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.REVIEW);
        }

        // Invoke Review Screen renderer if available
        if (global.Review && typeof global.Review.renderReviewScreen === 'function') {
          global.Review.renderReviewScreen();
        }

        dispatchAppEvent('reviewRequested', {
          session: global.AppState ? global.AppState.session : null
        });
      });
    }

    // Button: Restart Quiz
    if (els.btnRestartQuiz) {
      els.btnRestartQuiz.addEventListener('click', () => {
        if (!global.AppState) return;

        // Reset session while maintaining user preferences
        const currentPrefs = {
          difficulty: typeof global.AppState.getDifficultyPref === 'function' ? global.AppState.getDifficultyPref() : 'easy',
          apiKey: typeof global.AppState.getApiKey === 'function' ? global.AppState.getApiKey() : null
        };

        if (typeof global.AppState.initSession === 'function') {
          global.AppState.initSession(currentPrefs);
        }

        // Transition back to Welcome screen
        if (typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.WELCOME);
        }

        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // State Machine Event Listener: Render results whenever transitioning to RESULTS state
    if (typeof document !== 'undefined') {
      document.addEventListener('stateChange', event => {
        if (event.detail && event.detail.state === 'RESULTS') {
          renderResultsScreen();
        }
      });
    }
  }

  // Auto-initialize when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initResultsControls);
    } else {
      initResultsControls();
    }
  }

  // Public API Export
  const Results = {
    SYLLABUS_TOPICS,
    GRADE_SCALE,
    TOPIC_COLORS,
    getGrade,
    getTopicBarColor,
    calculateTopicAnalytics,
    renderResultsScreen,
    initResultsControls
  };

  if (typeof window !== 'undefined') {
    window.Results = Results;
    window.renderResultsScreen = renderResultsScreen;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Results;
  }

})(typeof window !== 'undefined' ? window : globalThis);
