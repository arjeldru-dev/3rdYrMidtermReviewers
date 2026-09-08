/**
 * MCS 305: Software Engineering — Results & 7-Module Mastery Analytics Engine
 * 
 * Manages:
 * - Deterministic score and accuracy percentage computation
 * - Academic letter grade assignment (A+, A, B+, B, C, F) with celebratory glow
 * - 7-Module Systems Architecture curriculum telemetry aggregation
 * - Animated score count-up with prefers-reduced-motion accessibility
 * - Session performance summary stat cards (Correct, Accuracy, Longest Streak, Time Elapsed)
 * - Tailored diagnostic textbook recommendations based on weakest syllabus domain
 * - Transition routing to Review Studio (#review-screen) and Quiz restart
 */

(function (global) {
  'use strict';

  // ==========================================================================
  // 1. 7 Syllabus Curriculum Modules & Metadata
  // ==========================================================================

  const MODULES = Object.freeze([
    {
      id: 'M1',
      title: 'System Concepts & Analyst Roles',
      fullName: 'M1: System Concepts & Analyst Roles',
      recommendation: 'Review General Systems Theory, Open vs. Closed Systems entropy, boundary permeability, and System Analyst interpersonal vs. technical skill domains.'
    },
    {
      id: 'M2',
      title: 'SDLC Strategies & Lifecycles',
      fullName: 'M2: SDLC Strategies & Lifecycles',
      recommendation: 'Review core SDLC phases (PADIM), formal project gate deliverables, and Structured Analysis vs. Object-Oriented Analysis distinctions.'
    },
    {
      id: 'M3',
      title: 'Fact-Finding & Elicitation',
      fullName: 'M3: Fact-Finding & Elicitation',
      recommendation: 'Reinforce elicitation trade-offs: JAD workshop facilitator dynamics, the Hawthorne Effect during direct observation, and stratified random sampling.'
    },
    {
      id: 'M4',
      title: 'Process Models & Methodologies',
      fullName: 'M4: Process Models & Methodologies',
      recommendation: 'Review Spiral Model risk-assessment quadrants, V-Model verification vs. validation testing phases, and Agile Scrum ceremonies.'
    },
    {
      id: 'M5',
      title: 'Project Planning & Feasibility',
      fullName: 'M5: Project Planning & Feasibility',
      recommendation: 'Focus on TELOS feasibility dimensions, Payback Period break-even calculations, Net Present Value (NPV) discounting, and Return on Investment (ROI) formulas.'
    },
    {
      id: 'M6',
      title: 'Requirements Engineering',
      fullName: 'M6: Requirements Engineering',
      recommendation: 'Review Functional vs. Non-Functional (FURPS+) classifications, IEEE 830 Software Requirements Specification standards, and Requirements Traceability Matrices (RTM).'
    },
    {
      id: 'M7',
      title: 'Data Flow Diagrams (DFD)',
      fullName: 'M7: Data Flow Diagrams (DFD)',
      recommendation: 'Reinforce DFD leveling & balancing rules, Gane & Sarson vs. Yourdon notations, and Black Hole, Gray Hole, and Miracle syntax traps.'
    }
  ]);

  // Backward compatibility alias for SYLLABUS_TOPICS
  const SYLLABUS_TOPICS = Object.freeze(MODULES.map(m => m.fullName));

  // ==========================================================================
  // 2. Academic Qualitative Grade Scale Definition
  // ==========================================================================

  const GRADE_SCALE = Object.freeze([
    {
      minPct: 95,
      letter: 'A+',
      label: 'A+ (Summa Cum Laude / Outstanding)',
      shortLabel: 'Summa Cum Laude',
      className: 'grade-excellent',
      tip: 'Phenomenal mastery! You demonstrated comprehensive command of all Software Engineering domains from General Systems Theory to DFD Leveling and Financial Feasibility.'
    },
    {
      minPct: 90,
      letter: 'A',
      label: 'A (Excellent)',
      shortLabel: 'Excellent',
      className: 'grade-excellent',
      tip: 'Outstanding performance! You have demonstrated deep command of core Software Engineering methodologies, SDLC phase deliverables, and requirements engineering.'
    },
    {
      minPct: 85,
      letter: 'B+',
      label: 'B+ (Very Good)',
      shortLabel: 'Very Good',
      className: 'grade-very-good',
      tip: 'Strong performance! You have a firm grasp of the core syllabus with only minor concept gaps. Review your missed items below for complete exam readiness.'
    },
    {
      minPct: 80,
      letter: 'B',
      label: 'B (Good)',
      shortLabel: 'Good',
      className: 'grade-good',
      tip: 'Solid foundation! You understand the primary paradigms well. Focus your active recall on process modeling and DFD syntax traps to push into top-tier mastery.'
    },
    {
      minPct: 75,
      letter: 'C',
      label: 'C (Passing)',
      shortLabel: 'Passing',
      className: 'grade-warning',
      tip: 'Passing baseline achieved, but several critical concepts require reinforcement. Pay special attention to the amber-flagged weak modules below before taking the midterm.'
    },
    {
      minPct: 0,
      letter: 'F',
      label: 'F (Needs Review)',
      shortLabel: 'Needs Review',
      className: 'grade-danger',
      tip: 'Comprehensive review strongly recommended. Re-study TELOS feasibility, SDLC lifecycle trade-offs, and DFD balancing before retaking the reviewer.'
    }
  ]);

  // Mastery Bar Theme Color Tokens
  const TOPIC_COLORS = Object.freeze({
    HIGH: '#10B981',       // Cyber Emerald (>= 80%)
    MEDIUM: '#06B6D4',     // Electric Cyan (60% - 79%)
    LOW: '#F59E0B',        // Warning Amber (< 60%)
    UNATTEMPTED: '#64748B' // Neutral Slate (0 questions)
  });

  // ==========================================================================
  // 3. Utility Helpers
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
   * Formats elapsed seconds into MM:SS or HH:MM:SS format.
   * @param {number} totalSeconds - Total elapsed seconds
   * @returns {string} Formatted string
   */
  function formatTime(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSeconds = sec % 60;

    const pad = num => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  function getElements() {
    return {
      resultsScreen: document.getElementById('results-screen'),
      resultsScore: document.getElementById('results-score'),
      resultsPercentage: document.getElementById('results-percentage'),
      resultsGradeCircle: document.getElementById('results-grade-circle'),
      resultsGrade: document.getElementById('results-grade'),
      resultsDifficultyTag: document.getElementById('results-difficulty-tag'),
      resultsMessage: document.getElementById('results-message'),
      statCorrect: document.getElementById('stat-correct'),
      statAccuracy: document.getElementById('stat-accuracy'),
      statStreak: document.getElementById('stat-streak'),
      statTime: document.getElementById('stat-time'),
      topicBreakdownList: document.getElementById('topic-breakdown-list'),
      btnReviewMistakes: document.getElementById('btn-review-mistakes') || document.getElementById('btn-review-missed'),
      btnReviewAll: document.getElementById('btn-review-all'),
      btnRestartQuiz: document.getElementById('btn-restart-quiz') || document.getElementById('btn-retake-quiz'),
      btnReturnHome: document.getElementById('btn-return-home') || document.getElementById('btn-return-hub')
    };
  }

  /**
   * Resolves academic letter grade record from accuracy percentage.
   * @param {number} percentage - Integer 0-100
   * @returns {Object} GRADE_SCALE entry
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
   * Resolves mastery fill bar color based on percentage and attempt status.
   * @param {number} pct - Integer 0-100
   * @param {number} totalCount - Total questions in module
   * @returns {string} HEX color string
   */
  function getTopicBarColor(pct, totalCount = 1) {
    if (totalCount === 0) return TOPIC_COLORS.UNATTEMPTED;
    if (pct >= 80) return TOPIC_COLORS.HIGH;
    if (pct >= 60) return TOPIC_COLORS.MEDIUM;
    return TOPIC_COLORS.LOW;
  }

  // ==========================================================================
  // 4. Module Mastery Analytics Aggregation
  // ==========================================================================

  /**
   * Computes per-module accuracy and mastery statistics across M1 through M7.
   * Handles division-by-zero safely when a module was unattempted or filtered out.
   * 
   * @param {Object} [session] - Active session reference
   * @param {Array<Object>} [questions] - Master questions array
   * @returns {Array<Object>} List of module telemetry objects
   */
  function calculateModuleAnalytics(session, questions) {
    const sess = session || (global.AppState ? global.AppState.session : null);
    const answers = (sess && sess.answers) ? sess.answers : {};
    
    // Resolve question pool: prefer questions present in this session, fallback to master QUESTIONS
    const sessionQuestions = (sess && Array.isArray(sess.questions) && sess.questions.length > 0)
      ? sess.questions
      : (Array.isArray(questions) ? questions : (global.QUESTIONS || []));

    const masterQuestions = Array.isArray(questions) ? questions : (global.QUESTIONS || []);

    return MODULES.map(mod => {
      // Questions in this module that were included in current session
      const modQuestionsInSession = sessionQuestions.filter(q => q.lessonId === mod.id);
      const totalInSession = modQuestionsInSession.length;

      // Also count master count for context if not in session
      const totalMasterCount = masterQuestions.filter(q => q.lessonId === mod.id).length || 30;

      // Count answered and correct questions in this module
      let answeredCount = 0;
      let correctCount = 0;

      const questionSet = totalInSession > 0 ? modQuestionsInSession : [];
      questionSet.forEach(q => {
        const record = answers[q.id];
        if (record) {
          answeredCount++;
          if (record.correct || record.isCorrect) {
            correctCount++;
          }
        }
      });

      const effectiveTotal = totalInSession > 0 ? totalInSession : totalMasterCount;
      const wasAttempted = answeredCount > 0;
      const percentage = wasAttempted 
        ? Math.round((correctCount / answeredCount) * 100)
        : 0;

      let status = 'Not Attempted';
      let statusClass = 'status-unattempted';
      let isWeak = false;

      if (wasAttempted) {
        if (percentage >= 80) {
          status = 'Mastered';
          statusClass = 'status-mastered';
        } else if (percentage >= 60) {
          status = 'Developing';
          statusClass = 'status-developing';
        } else {
          status = 'Critical Review';
          statusClass = 'status-critical';
          isWeak = true;
        }
      }

      const barColor = wasAttempted ? getTopicBarColor(percentage, 1) : TOPIC_COLORS.UNATTEMPTED;

      return {
        moduleId: mod.id,
        title: mod.title,
        fullName: mod.fullName,
        recommendation: mod.recommendation,
        totalInSession,
        totalMasterCount,
        answeredCount,
        correctCount,
        percentage,
        wasAttempted,
        isWeak,
        status,
        statusClass,
        barColor,
        questionIds: questionSet.map(q => q.id)
      };
    });
  }

  // ==========================================================================
  // 5. Accessible Number Count-Up Animation
  // ==========================================================================

  /**
   * Smoothly animates an integer value from 0 to target inside a DOM element.
   * Honors user's prefers-reduced-motion setting by completing instantly.
   * 
   * @param {HTMLElement} element - Target DOM element
   * @param {number} targetValue - Destination integer
   * @param {string} [suffix=''] - Suffix string (e.g. '%')
   * @param {number} [duration=900] - Duration in milliseconds
   */
  function animateCounter(element, targetValue, suffix = '', duration = 900) {
    if (!element) return;

    const prefersReducedMotion = typeof window !== 'undefined' 
      && window.matchMedia 
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || targetValue === 0) {
      element.textContent = `${targetValue}${suffix}`;
      return;
    }

    const startVal = 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetValue - startVal) * ease);

      element.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${targetValue}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  // ==========================================================================
  // 6. Primary Results Screen Renderer
  // ==========================================================================

  /**
   * Renders the Results & Analytics view.
   * Populates telemetry cards, letter grade circle, 7 module bars, and diagnostic advice.
   */
  function renderResultsScreen() {
    const sess = global.AppState ? global.AppState.session : null;
    if (!sess) {
      console.warn('[ResultsEngine] No active session found to evaluate results.');
      return;
    }

    // Seal session endTime if not already sealed
    if (!sess.endTime) {
      sess.endTime = Date.now();
    }

    const els = getElements();
    const masterQuestions = global.QUESTIONS || [];
    
    // Resolve questions count
    const totalQuestions = Array.isArray(sess.questionOrder) && sess.questionOrder.length > 0
      ? sess.questionOrder.length
      : (sess.questions ? sess.questions.length : 210);

    const correctCount = typeof sess.score === 'number' ? sess.score : 0;
    const answeredCount = Object.keys(sess.answers || {}).length;
    
    // Overall accuracy percentage
    const divisor = totalQuestions > 0 ? totalQuestions : 1;
    const percentage = Math.round((correctCount / divisor) * 100);
    const grade = getGrade(percentage);

    // Calculate elapsed time
    const startMs = sess.startTime || Date.now();
    const endMs = sess.endTime || Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));
    const timeFormatted = formatTime(elapsedSeconds);

    // 1. Overall Score Display
    if (els.resultsScore) {
      els.resultsScore.textContent = `${correctCount} / ${totalQuestions}`;
    }

    // 2. Score Percentage Display
    if (els.resultsPercentage) {
      els.resultsPercentage.textContent = `${percentage}% Accuracy`;
    }

    // 3. Grade Circle & Badge Pill
    if (els.resultsGradeCircle) {
      els.resultsGradeCircle.textContent = grade.letter;
      // Re-apply thematic border color matching the letter grade
      if (percentage >= 90) {
        els.resultsGradeCircle.style.borderColor = 'var(--correct-green, #10B981)';
        els.resultsGradeCircle.style.color = 'var(--correct-green, #10B981)';
        els.resultsGradeCircle.style.boxShadow = '0 0 28px rgba(16, 185, 129, 0.35)';
      } else if (percentage >= 80) {
        els.resultsGradeCircle.style.borderColor = 'var(--accent-cyan, #06B6D4)';
        els.resultsGradeCircle.style.color = 'var(--accent-cyan, #06B6D4)';
        els.resultsGradeCircle.style.boxShadow = '0 0 28px rgba(6, 182, 212, 0.35)';
      } else if (percentage >= 75) {
        els.resultsGradeCircle.style.borderColor = 'var(--warning-amber, #F59E0B)';
        els.resultsGradeCircle.style.color = 'var(--warning-amber, #F59E0B)';
        els.resultsGradeCircle.style.boxShadow = '0 0 28px rgba(245, 158, 11, 0.35)';
      } else {
        els.resultsGradeCircle.style.borderColor = 'var(--incorrect-red, #EF4444)';
        els.resultsGradeCircle.style.color = 'var(--incorrect-red, #EF4444)';
        els.resultsGradeCircle.style.boxShadow = '0 0 28px rgba(239, 68, 68, 0.35)';
      }
    }

    if (els.resultsGrade) {
      els.resultsGrade.textContent = grade.label;
      els.resultsGrade.className = 'badge results-grade-badge';
      els.resultsGrade.classList.add(grade.className);
    }

    // 4. Performance Summary Stat Cards
    if (els.statCorrect) {
      animateCounter(els.statCorrect, correctCount, '', 800);
    }
    if (els.statAccuracy) {
      animateCounter(els.statAccuracy, percentage, '%', 900);
    }
    if (els.statStreak) {
      animateCounter(els.statStreak, sess.maxStreak || 0, '', 700);
    }
    if (els.statTime) {
      els.statTime.textContent = timeFormatted;
    }

    // 5. Difficulty & Scope Telemetry Tag
    if (els.resultsDifficultyTag && sess.settings) {
      const diff = sess.settings.difficulty || 'all';
      const topic = sess.settings.selectedTopic || 'all';
      let scopeLabel = topic === 'all' ? 'Full Midterm Scope (All 7 Modules)' : `Focused: ${topic}`;
      let diffLabel = 'All Challenge Tiers';

      if (diff === 'easy') diffLabel = 'Tier 1: Core Fundamentals';
      else if (diff === 'medium') diffLabel = 'Tier 2: Applied Analysis';
      else if (diff === 'hard') diffLabel = 'Tier 3: Complex Scenarios';

      els.resultsDifficultyTag.innerHTML = `
        <span class="badge badge-difficulty diff-${diff}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          <span>Scope: ${scopeLabel} · ${diffLabel}</span>
        </span>
      `.trim();
    }

    // 6. 7-Module Systems Architecture Mastery Breakdown
    const moduleStats = calculateModuleAnalytics(sess, masterQuestions);
    
    if (els.topicBreakdownList) {
      const rowsHtml = moduleStats.map(stat => {
        const weakClass = stat.isWeak ? ' topic-weak' : '';
        const escapedTitle = escapeHtml(stat.fullName);
        const displayTotal = stat.totalInSession > 0 ? stat.totalInSession : stat.totalMasterCount;
        const fractionText = stat.wasAttempted
          ? `${stat.correctCount} / ${stat.totalInSession || stat.answeredCount} · ${stat.percentage}% (${stat.status})`
          : `0 / ${displayTotal} · Not Attempted`;

        return `
          <div class="topic-row${weakClass}" data-module="${stat.moduleId}">
            <div class="topic-info">
              <span class="topic-name">${escapedTitle}</span>
              <span class="topic-fraction">${fractionText}</span>
            </div>
            <div class="topic-bar-track mastery-bar-track" role="progressbar" aria-valuenow="${stat.percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapedTitle} mastery: ${stat.percentage}%">
              <div class="topic-bar-fill mastery-bar-fill" style="width: ${stat.percentage}%; background-color: ${stat.barColor};"></div>
            </div>
          </div>
        `.trim();
      }).join('\n');

      els.topicBreakdownList.innerHTML = rowsHtml;
    }

    // 7. Targeted Diagnostic Textbook Recommendation
    if (els.resultsMessage) {
      // Find lowest performing attempted module
      const attemptedModules = moduleStats.filter(m => m.wasAttempted);
      let diagnosticRecommendation = grade.tip;

      if (attemptedModules.length > 0) {
        // Sort ascending by percentage
        const sorted = [...attemptedModules].sort((a, b) => a.percentage - b.percentage);
        const weakest = sorted[0];

        if (weakest.percentage < 80) {
          diagnosticRecommendation = `
            <strong>Diagnostic Recommendation:</strong> You scored lowest in <strong>${escapeHtml(weakest.fullName)} (${weakest.percentage}% Mastery)</strong>. 
            ${escapeHtml(weakest.recommendation)}
          `.trim();
        } else if (percentage >= 95) {
          diagnosticRecommendation = `
            <strong>Outstanding Achievement:</strong> You demonstrated comprehensive mastery across all attempted syllabus modules! You are exceptionally well prepared for the MCS 305 Midterm Exam.
          `.trim();
        }
      }

      els.resultsMessage.innerHTML = diagnosticRecommendation;
    }

    // 8. Action Buttons Configuration
    const missedQuestions = (sess.questionOrder || []).filter(qId => {
      const ans = sess.answers ? sess.answers[qId] : null;
      return !ans || (!ans.correct && !ans.isCorrect);
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
          <span>Review Missed Problems (${missedCount})</span>
        `;
        els.btnReviewMistakes.title = `Review detailed explanations for the ${missedCount} question(s) you missed`;
      }
    }

    // Dispatch completion telemetry event
    dispatchAppEvent('resultsRendered', {
      score: correctCount,
      total: totalQuestions,
      answeredCount,
      percentage,
      grade: grade.letter,
      gradeLabel: grade.label,
      moduleStats,
      missedCount,
      elapsedSeconds,
      timeFormatted
    });
  }

  // ==========================================================================
  // 7. Results Screen Controls & Event Bindings
  // ==========================================================================

  function initResultsControls() {
    const els = getElements();

    // 1. Button: Review Missed Problems
    if (els.btnReviewMistakes) {
      els.btnReviewMistakes.addEventListener('click', () => {
        if (els.btnReviewMistakes.disabled) return;

        if (global.AppState && typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.REVIEW);
        }

        if (global.ReviewEngine && typeof global.ReviewEngine.renderReviewScreen === 'function') {
          global.ReviewEngine.renderReviewScreen('missed');
        } else if (global.Review && typeof global.Review.renderReviewScreen === 'function') {
          global.Review.renderReviewScreen('missed');
        }

        dispatchAppEvent('reviewRequested', {
          mode: 'missed',
          session: global.AppState ? global.AppState.session : null
        });
      });
    }

    // 2. Button: Review All Questions
    if (els.btnReviewAll) {
      els.btnReviewAll.addEventListener('click', () => {
        if (global.AppState && typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.REVIEW);
        }

        if (global.ReviewEngine && typeof global.ReviewEngine.renderReviewScreen === 'function') {
          global.ReviewEngine.renderReviewScreen('all');
        } else if (global.Review && typeof global.Review.renderReviewScreen === 'function') {
          global.Review.renderReviewScreen('all');
        }

        dispatchAppEvent('reviewRequested', {
          mode: 'all',
          session: global.AppState ? global.AppState.session : null
        });
      });
    }

    // 3. Button: Retake Entire Quiz
    if (els.btnRestartQuiz) {
      els.btnRestartQuiz.addEventListener('click', () => {
        if (!global.AppState) return;

        const currentSettings = (global.AppState.session && global.AppState.session.settings)
          ? { ...global.AppState.session.settings }
          : {
              selectedTopic: typeof global.AppState.getModulePref === 'function' ? global.AppState.getModulePref() : 'all',
              difficulty: typeof global.AppState.getDifficultyPref === 'function' ? global.AppState.getDifficultyPref() : 'all',
              mode: typeof global.AppState.getModePref === 'function' ? global.AppState.getModePref() : 'practice',
              apiKey: typeof global.AppState.getApiKey === 'function' ? global.AppState.getApiKey() : null
            };

        if (typeof global.AppState.initSession === 'function') {
          global.AppState.initSession(currentSettings);
        }

        if (typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.QUESTION);
        }

        if (global.Quiz && typeof global.Quiz.renderCurrentQuestion === 'function') {
          global.Quiz.renderCurrentQuestion();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 4. Button: Return to Setup / Hub
    if (els.btnReturnHome) {
      els.btnReturnHome.addEventListener('click', () => {
        if (global.AppState && typeof global.AppState.transitionTo === 'function') {
          global.AppState.transitionTo(global.AppState.STATES.WELCOME);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // State Machine Listeners
    if (typeof document !== 'undefined') {
      document.addEventListener('stateChange', event => {
        if (event.detail && event.detail.state === 'RESULTS') {
          renderResultsScreen();
        }
      });
      document.addEventListener('app:state-changed', event => {
        if (event.detail && event.detail.to === 'RESULTS') {
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

  // ==========================================================================
  // 8. Public API Export (Parity with global.Results & global.ResultsEngine)
  // ==========================================================================

  const ResultsEngine = {
    MODULES,
    SYLLABUS_TOPICS,
    GRADE_SCALE,
    TOPIC_COLORS,
    getGrade,
    getTopicBarColor,
    formatTime,
    calculateModuleAnalytics,
    calculateTopicAnalytics: calculateModuleAnalytics,
    renderResultsScreen,
    initResultsControls
  };

  if (typeof window !== 'undefined') {
    window.Results = ResultsEngine;
    window.ResultsEngine = ResultsEngine;
    window.renderResultsScreen = renderResultsScreen;
  }

  if (typeof global !== 'undefined') {
    global.Results = ResultsEngine;
    global.ResultsEngine = ResultsEngine;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultsEngine;
  }

})(typeof window !== 'undefined' ? window : globalThis);
