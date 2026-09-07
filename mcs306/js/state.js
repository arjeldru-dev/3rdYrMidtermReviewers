/**
 * MCS 306 Midterm Reviewer — State Machine & Session Management
 * 
 * Manages:
 * - Finite State Machine (STATES: WELCOME, QUESTION, FEEDBACK, RESULTS, REVIEW)
 * - Screen transition controller and sticky header visibility
 * - QuizSession model with Fisher-Yates randomized question shuffling
 * - Resilient localStorage persistence for Gemini API key & session preferences
 */

(function (global) {
  'use strict';

  // ==========================================================================
  // 1. State Machine Constants & Configuration
  // ==========================================================================

  const STATES = Object.freeze({
    WELCOME: 'WELCOME',
    QUESTION: 'QUESTION',
    FEEDBACK: 'FEEDBACK',
    RESULTS: 'RESULTS',
    REVIEW: 'REVIEW'
  });

  const STATE_SCREEN_MAP = Object.freeze({
    [STATES.WELCOME]: 'welcome-screen',
    [STATES.QUESTION]: 'quiz-screen',
    [STATES.FEEDBACK]: 'quiz-screen',
    [STATES.RESULTS]: 'results-screen',
    [STATES.REVIEW]: 'review-screen'
  });

  const STORAGE_KEYS = Object.freeze({
    API_KEY: 'MCS306_GEMINI_API_KEY',
    SHUFFLE_PREF: 'MCS306_SHUFFLE_PREF',
    DIFFICULTY_PREF: 'MCS306_DIFFICULTY_PREF',
    AI_ENABLED: 'MCS306_AI_ENABLED',
    AI_CACHE: 'MCS306_AI_EXPLANATIONS_CACHE',
    AI_MODEL: 'MCS306_AI_MODEL'
  });

  let currentState = STATES.WELCOME;

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

  // ==========================================================================
  // 2. Resilient Browser Storage (Handles Private Browsing & Quota Limits)
  // ==========================================================================

  const memoryStorage = new Map();
  let isPrivateMode = false;

  function notifyPrivateMode() {
    if (typeof document === 'undefined') return;
    const helper = document.getElementById('api-key-helper');
    if (helper && isPrivateMode) {
      helper.innerHTML = '<span style="color: var(--warning-amber); font-weight: 500;">Notice: Running in private mode. API key will only persist during this tab session.</span>';
    }
  }

  function isLocalStorageAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        isPrivateMode = true;
        notifyPrivateMode();
        return false;
      }
      const testKey = '__mcs306_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      isPrivateMode = true;
      notifyPrivateMode();
      return false;
    }
  }

  function safeGetItem(key) {
    try {
      if (isLocalStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      isPrivateMode = true;
      notifyPrivateMode();
      console.warn(`[AppState] localStorage read error for key "${key}", using memory fallback.`, e);
    }
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  }

  function safeSetItem(key, value) {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(key, String(value));
        return true;
      }
    } catch (e) {
      isPrivateMode = true;
      notifyPrivateMode();
      console.warn(`[AppState] localStorage write error for key "${key}", using memory fallback.`, e);
    }
    memoryStorage.set(key, String(value));
    return true;
  }

  function safeRemoveItem(key) {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      isPrivateMode = true;
      notifyPrivateMode();
      console.warn(`[AppState] localStorage remove error for key "${key}".`, e);
    }
    memoryStorage.delete(key);
    return true;
  }

  // Persistent Settings Accessors
  function saveApiKey(key) {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      safeRemoveItem(STORAGE_KEYS.API_KEY);
      if (session && session.settings) {
        session.settings.apiKey = null;
      }
      return null;
    }
    const sanitized = key.trim();
    safeSetItem(STORAGE_KEYS.API_KEY, sanitized);
    if (session && session.settings) {
      session.settings.apiKey = sanitized;
    }
    return sanitized;
  }

  function getApiKey() {
    const raw = safeGetItem(STORAGE_KEYS.API_KEY) || safeGetItem('gemini_api_key');
    return raw && raw.trim() !== '' ? raw.trim() : null;
  }

  function saveShufflePref(pref) {
    const boolVal = Boolean(pref);
    safeSetItem(STORAGE_KEYS.SHUFFLE_PREF, boolVal ? 'true' : 'false');
    if (session && session.settings) {
      session.settings.shuffled = boolVal;
    }
    return boolVal;
  }

  function getShufflePref() {
    const raw = safeGetItem(STORAGE_KEYS.SHUFFLE_PREF);
    return raw === 'true';
  }

  function saveDifficultyPref(diff) {
    const valid = (diff === 'medium' || diff === 'hard') ? diff : 'easy';
    safeSetItem(STORAGE_KEYS.DIFFICULTY_PREF, valid);
    if (session && session.settings) {
      session.settings.difficulty = valid;
      session.settings.shuffled = (valid !== 'easy');
    }
    return valid;
  }

  function getDifficultyPref() {
    const raw = safeGetItem(STORAGE_KEYS.DIFFICULTY_PREF);
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') {
      return raw;
    }
    // Backward compatibility: check legacy shuffle toggle
    const oldShuffle = safeGetItem(STORAGE_KEYS.SHUFFLE_PREF);
    if (oldShuffle === 'true') {
      return 'medium';
    }
    return 'easy';
  }

  function saveAiEnabled(enabled) {
    const boolVal = Boolean(enabled);
    safeSetItem(STORAGE_KEYS.AI_ENABLED, boolVal ? 'true' : 'false');
    if (session && session.settings) {
      session.settings.aiEnabled = boolVal;
    }
    updateAiUI(boolVal);
    dispatchAppEvent('aiToggleChange', { enabled: boolVal });
    return boolVal;
  }

  function isAiEnabled() {
    const raw = safeGetItem(STORAGE_KEYS.AI_ENABLED);
    if (raw !== null) {
      return raw === 'true';
    }
    // Fallback to global StudyHub setting if set
    const hubRaw = safeGetItem('studyhub_ai_enabled');
    if (hubRaw !== null) {
      return hubRaw === 'true';
    }
    return true; // Default enabled
  }

  function updateAiUI(enabled) {
    if (typeof document === 'undefined') return;
    const toggleInput = document.getElementById('ai-toggle-input');
    const statusBadge = document.getElementById('ai-setting-status-badge');
    const headerToggle = document.getElementById('btn-header-ai-toggle');
    const headerText = document.getElementById('header-ai-text');

    if (toggleInput) {
      toggleInput.checked = enabled;
    }
    if (statusBadge) {
      statusBadge.textContent = enabled ? 'Tokens Active' : 'Tokens Preserved';
      statusBadge.className = `badge-ai-status ${enabled ? 'active' : 'paused'}`;
    }
    if (headerToggle) {
      headerToggle.classList.toggle('active', enabled);
      headerToggle.classList.toggle('paused', !enabled);
      headerToggle.setAttribute('title', enabled ? 'AI Explanations: Active (Click to pause & save tokens)' : 'AI Explanations: Paused · 0 Tokens (Click to activate)');
    }
    if (headerText) {
      headerText.textContent = enabled ? 'AI: ON' : 'AI: OFF';
    }
  }

  // ==========================================================================
  // 3. Fisher-Yates Shuffle Algorithm (Unbiased, In-Place Array Permutation)
  // ==========================================================================

  function shuffleArray(array) {
    if (!Array.isArray(array)) return [];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ==========================================================================
  // 4. Session Model & Lifecycle
  // ==========================================================================

  const session = {
    questionOrder: [],
    currentIndex: 0,
    answers: {},
    explanations: {},
    score: 0,
    questionsMap: {},
    settings: {
      difficulty: 'easy',
      shuffled: false,
      choicesShuffled: false,
      apiKey: null,
      aiEnabled: true
    }
  };

  /**
   * Initializes a fresh quiz session.
   * @param {Object} [settings] - Configuration options ({ difficulty: string, shuffled: boolean, apiKey: string })
   * @returns {Object} Active session reference
   */
  function initSession(settings = {}) {
    // Determine base questions (1 to 50)
    const masterQuestions = (typeof window !== 'undefined' && Array.isArray(window.QUESTIONS) && window.QUESTIONS.length > 0)
      ? window.QUESTIONS
      : [];

    let questionIds = masterQuestions.length > 0
      ? masterQuestions.map(q => q.id)
      : Array.from({ length: 50 }, (_, i) => i + 1);

    // Resolve difficulty mode (Easy, Medium, Hard)
    let difficulty = 'easy';
    if (settings.difficulty && (settings.difficulty === 'easy' || settings.difficulty === 'medium' || settings.difficulty === 'hard')) {
      difficulty = settings.difficulty;
    } else if (settings.shuffled !== undefined) {
      difficulty = settings.shuffled ? 'medium' : 'easy';
    } else {
      difficulty = getDifficultyPref();
    }

    const isQuestionShuffled = (difficulty === 'medium' || difficulty === 'hard');
    const isChoicesShuffled = (difficulty === 'hard');

    // 1. Order of questions
    const order = [...questionIds];
    session.questionOrder = isQuestionShuffled ? shuffleArray(order) : order;

    // 2. Build session questions map (with scrambled choice letters on Hard)
    session.questionsMap = {};
    masterQuestions.forEach(origQ => {
      if (isChoicesShuffled) {
        // Deep clone choices and apply Fisher-Yates permutation to letters A-D
        const letters = ['a', 'b', 'c', 'd'];
        const origChoices = origQ.choices || {};
        const origAnswer = String(origQ.answer || '').toLowerCase();

        const choiceItems = letters.map(letter => ({
          origLetter: letter,
          text: origChoices[letter] || ''
        }));

        const scrambledItems = shuffleArray([...choiceItems]);

        const newChoices = {};
        let newAnswer = origAnswer;

        letters.forEach((letter, idx) => {
          newChoices[letter] = scrambledItems[idx].text;
          if (scrambledItems[idx].origLetter === origAnswer) {
            newAnswer = letter;
          }
        });

        session.questionsMap[origQ.id] = {
          ...origQ,
          choices: newChoices,
          answer: newAnswer,
          _isChoicesShuffled: true,
          _originalAnswer: origAnswer
        };
      } else {
        // Easy / Medium: Original question structure & original choices
        session.questionsMap[origQ.id] = {
          ...origQ,
          choices: { ...(origQ.choices || {}) },
          answer: String(origQ.answer || '').toLowerCase(),
          _isChoicesShuffled: false,
          _originalAnswer: String(origQ.answer || '').toLowerCase()
        };
      }
    });

    // Reset session pointers & accumulators
    session.currentIndex = 0;
    session.answers = {};
    session.explanations = {};
    session.score = 0;

    // Resolve API key
    const effectiveApiKey = settings.apiKey !== undefined ? settings.apiKey : getApiKey();
    session.settings = {
      difficulty,
      shuffled: isQuestionShuffled,
      choicesShuffled: isChoicesShuffled,
      apiKey: effectiveApiKey ? String(effectiveApiKey).trim() : null
    };

    // Update Difficulty indicator pills in header and results
    updateDifficultyUI(difficulty);

    // Dispatch lifecycle event
    dispatchAppEvent('sessionInitialized', { session });

    return session;
  }

  function getQuestion(id) {
    if (session && session.questionsMap && session.questionsMap[id]) {
      return session.questionsMap[id];
    }
    const questions = (typeof window !== 'undefined' && Array.isArray(window.QUESTIONS)) ? window.QUESTIONS : [];
    return questions.find(q => q.id === id) || null;
  }

  function updateDifficultyUI(diff) {
    if (typeof document === 'undefined') return;
    const difficulty = diff || (session && session.settings && session.settings.difficulty) || 'easy';

    // Header badge
    const headerBadge = document.getElementById('header-difficulty-badge');
    if (headerBadge) {
      headerBadge.textContent = difficulty.toUpperCase();
      headerBadge.className = `header-difficulty-pill diff-${difficulty}`;
    }

    // Results screen tag
    const resultsTag = document.getElementById('results-difficulty-tag');
    if (resultsTag) {
      let desc = 'Easy (Standard Baseline)';
      let iconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
      if (difficulty === 'medium') {
        desc = 'Medium (Shuffled Question Sequence)';
        iconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>';
      } else if (difficulty === 'hard') {
        desc = 'Hard (Shuffled Questions & Choice Letters)';
        iconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
      }
      resultsTag.innerHTML = `<span class="badge badge-difficulty diff-${difficulty}">${iconSvg} <span>Mode: ${desc}</span></span>`;
    }
  }

  function getCurrentQuestionId() {
    if (!session.questionOrder || session.questionOrder.length === 0) {
      return null;
    }
    return session.questionOrder[session.currentIndex] || null;
  }

  function recordAnswer(questionId, selectedChoice, isCorrect) {
    const record = {
      selected: selectedChoice,
      correct: Boolean(isCorrect),
      timestamp: Date.now()
    };

    session.answers[questionId] = record;
    if (record.correct) {
      session.score += 1;
    }

    dispatchAppEvent('answerSubmitted', {
      questionId,
      record,
      score: session.score,
      answeredCount: Object.keys(session.answers).length
    });

    return record;
  }

  function getPersistentCache() {
    try {
      const raw = safeGetItem(STORAGE_KEYS.AI_CACHE);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[AppState] Failed to parse persistent explanation cache:', e);
    }
    return {};
  }

  function saveToPersistentCache(questionId, explanationText) {
    try {
      const cache = getPersistentCache();
      cache[questionId] = explanationText;
      safeSetItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(cache));
    } catch (e) {
      console.warn('[AppState] Failed to write to persistent explanation cache:', e);
    }
  }

  function cacheExplanation(questionId, explanationText) {
    if (!questionId || !explanationText) return explanationText;
    session.explanations[questionId] = explanationText;
    saveToPersistentCache(questionId, explanationText);
    return explanationText;
  }

  function getAnswer(questionId) {
    return session.answers[questionId] || null;
  }

  function getExplanation(questionId) {
    if (session.explanations && session.explanations[questionId]) {
      return session.explanations[questionId];
    }
    const persistent = getPersistentCache();
    if (persistent && persistent[questionId]) {
      // Hydrate into current session memory
      session.explanations[questionId] = persistent[questionId];
      return persistent[questionId];
    }
    return null;
  }

  function saveModelPreference(model) {
    const valid = (model === 'gemini-3.6-flash') ? model : 'gemini-2.0-flash';
    safeSetItem(STORAGE_KEYS.AI_MODEL, valid);
    return valid;
  }

  function getModelPreference() {
    const raw = safeGetItem(STORAGE_KEYS.AI_MODEL);
    if (raw === 'gemini-1.5-flash') {
      // Auto-migrate legacy 1.5-flash setting to supported 2.0-flash
      safeSetItem(STORAGE_KEYS.AI_MODEL, 'gemini-2.0-flash');
      return 'gemini-2.0-flash';
    }
    if (raw === 'gemini-3.6-flash') {
      return raw;
    }
    return 'gemini-2.0-flash';
  }

  function nextQuestion() {
    if (session.currentIndex < session.questionOrder.length - 1) {
      session.currentIndex += 1;
      return true;
    }
    return false;
  }

  // ==========================================================================
  // 5. State Machine & View Transitions
  // ==========================================================================

  function getCurrentState() {
    return currentState;
  }

  /**
   * Transitions the application to the target view state.
   * Controls DOM screen visibility (.screen.active) and sticky header state.
   * @param {string} nextState - Member of STATES
   * @returns {boolean} True if transition succeeded
   */
  function transitionTo(nextState) {
    if (!Object.values(STATES).includes(nextState)) {
      console.error(`[AppState] Invalid state transition requested: "${nextState}". Allowed:`, Object.values(STATES));
      return false;
    }

    const previousState = currentState;
    currentState = nextState;

    if (typeof document !== 'undefined') {
      const targetScreenId = STATE_SCREEN_MAP[nextState];
      const targetScreen = targetScreenId ? document.getElementById(targetScreenId) : null;

      // Update screen visibility classes
      const allScreens = document.querySelectorAll('.screen');
      allScreens.forEach(screen => {
        if (screen !== targetScreen) {
          screen.classList.remove('active');
        }
      });

      if (targetScreen && !targetScreen.classList.contains('active')) {
        targetScreen.classList.add('active');
      }

      // Quiz header visibility: Hidden in WELCOME, visible in all other screens
      const quizHeader = document.getElementById('quiz-header');
      if (quizHeader) {
        if (nextState === STATES.WELCOME) {
          quizHeader.classList.add('hidden');
        } else {
          quizHeader.classList.remove('hidden');
        }
      }
    }

    // Dispatch stateChange event
    dispatchAppEvent('stateChange', { state: nextState, previousState });

    return true;
  }

  // ==========================================================================
  // 6. DOM Control Synchronization (Welcome Screen Initializer)
  // ==========================================================================

  function initWelcomeControls() {
    if (typeof document === 'undefined') return;

    const apiKeyInput = document.getElementById('api-key-input');
    const btnToggleApiKey = document.getElementById('btn-toggle-api-key');
    const btnStartQuiz = document.getElementById('btn-start-quiz');

    // Pre-populate saved settings
    if (apiKeyInput) {
      const savedKey = getApiKey();
      if (savedKey) {
        apiKeyInput.value = savedKey;
      }

      apiKeyInput.addEventListener('input', () => {
        saveApiKey(apiKeyInput.value);
      });
      apiKeyInput.addEventListener('change', () => {
        saveApiKey(apiKeyInput.value);
      });
    }

    if (btnToggleApiKey && apiKeyInput) {
      btnToggleApiKey.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        btnToggleApiKey.textContent = isPassword ? 'Hide' : 'Show';
        btnToggleApiKey.setAttribute('aria-label', isPassword ? 'Hide API Key' : 'Show API Key');
      });
    }

    // Difficulty Selection Radio Cards
    const diffRadios = document.querySelectorAll('input[name="difficulty-choice"]');
    const diffCards = document.querySelectorAll('.difficulty-card');
    const savedDifficulty = getDifficultyPref();

    function setDifficultyActive(val) {
      diffRadios.forEach(radio => {
        radio.checked = (radio.value === val);
      });
      diffCards.forEach(card => {
        const input = card.querySelector('input');
        if (input && input.value === val) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
      saveDifficultyPref(val);
      updateDifficultyUI(val);
    }

    // Set initial difficulty from saved preference
    setDifficultyActive(savedDifficulty);

    diffRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          setDifficultyActive(radio.value);
        }
      });
    });

    diffCards.forEach(card => {
      card.addEventListener('click', () => {
        const input = card.querySelector('input');
        if (input && !input.checked) {
          input.checked = true;
          setDifficultyActive(input.value);
        }
      });
    });

    // AI Explanations Toggle Controls
    const aiToggleInput = document.getElementById('ai-toggle-input');
    const btnHeaderAiToggle = document.getElementById('btn-header-ai-toggle');
    const currentAiState = isAiEnabled();
    updateAiUI(currentAiState);

    if (aiToggleInput) {
      aiToggleInput.addEventListener('change', () => {
        saveAiEnabled(aiToggleInput.checked);
      });
    }

    if (btnHeaderAiToggle) {
      btnHeaderAiToggle.addEventListener('click', () => {
        const nextState = !isAiEnabled();
        saveAiEnabled(nextState);
      });
    }

    // Google Gemini 3.6 API Key Guide Modal Handlers
    const guideModal = document.getElementById('api-key-guide-modal');
    const btnOpenGuide = document.getElementById('btn-open-api-guide');
    const btnOpenGuideText = document.getElementById('btn-open-api-guide-text');
    const btnCloseGuide = document.getElementById('btn-close-guide-modal');
    const btnDismissGuide = document.getElementById('btn-dismiss-guide-modal');

    function openGuideModal() {
      if (!guideModal) return;
      guideModal.classList.remove('hidden');
      guideModal.setAttribute('aria-hidden', 'false');
      // Set focus to close button for accessibility
      if (btnCloseGuide) {
        btnCloseGuide.focus();
      }
      document.body.style.overflow = 'hidden';
    }

    function closeGuideModal() {
      if (!guideModal) return;
      guideModal.classList.add('hidden');
      guideModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (btnOpenGuide) {
        btnOpenGuide.focus();
      }
    }

    if (btnOpenGuide) {
      btnOpenGuide.addEventListener('click', openGuideModal);
    }
    if (btnOpenGuideText) {
      btnOpenGuideText.addEventListener('click', openGuideModal);
    }
    if (btnCloseGuide) {
      btnCloseGuide.addEventListener('click', closeGuideModal);
    }
    if (btnDismissGuide) {
      btnDismissGuide.addEventListener('click', closeGuideModal);
    }

    // Close on backdrop click outside dialog
    if (guideModal) {
      guideModal.addEventListener('click', event => {
        if (event.target === guideModal) {
          closeGuideModal();
        }
      });
    }

    // Close on Escape key press
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && guideModal && !guideModal.classList.contains('hidden')) {
        closeGuideModal();
      }
    });

    // Start Quiz Action Button
    if (btnStartQuiz) {
      btnStartQuiz.addEventListener('click', () => {
        const keyVal = (apiKeyInput && typeof apiKeyInput.value === 'string') ? apiKeyInput.value.trim() : '';
        if (keyVal) {
          saveApiKey(keyVal);
        }
        
        let selectedDiff = 'easy';
        const checkedRadio = document.querySelector('input[name="difficulty-choice"]:checked');
        if (checkedRadio) {
          selectedDiff = checkedRadio.value;
        } else {
          selectedDiff = getDifficultyPref();
        }
        saveDifficultyPref(selectedDiff);

        initSession({
          difficulty: selectedDiff,
          apiKey: keyVal || null
        });

        transitionTo(STATES.QUESTION);
      });
    }

    // Check for private mode notice
    notifyPrivateMode();
  }

  // ==========================================================================
  // Visual Theme Management (Light / Dark Mode with Persistence)
  // ==========================================================================

  function getSavedTheme() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('mcs306_theme');
        if (saved === 'light' || saved === 'dark') return saved;
      }
    } catch (e) {}
    return 'dark';
  }

  function applyTheme(theme) {
    if (typeof document === 'undefined' || !document.documentElement) return;
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function toggleTheme() {
    if (typeof document === 'undefined' || !document.documentElement) return 'dark';
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mcs306_theme', nextTheme);
      }
    } catch (e) {}
    dispatchAppEvent('themeChanged', { theme: nextTheme });
    return nextTheme;
  }

  function initTheme() {
    const saved = getSavedTheme();
    applyTheme(saved);

    const btn = document.getElementById('btn-theme-toggle');
    if (btn && !(btn.dataset && btn.dataset.bound)) {
      if (btn.dataset) {
        btn.dataset.bound = 'true';
      }
      btn.addEventListener('click', toggleTheme);
    }
  }

  // Auto-bind controls and theme when DOM is ready
  if (typeof document !== 'undefined') {
    // Apply saved theme immediately to prevent flashing
    applyTheme(getSavedTheme());

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initWelcomeControls();
        initTheme();
      });
    } else {
      initWelcomeControls();
      initTheme();
    }
  }

  // ==========================================================================
  // 7. Public API Export
  // ==========================================================================

  const AppState = {
    STATES,
    STATE_SCREEN_MAP,
    STORAGE_KEYS,
    session,
    transitionTo,
    getCurrentState,
    initSession,
    getQuestion,
    updateDifficultyUI,
    shuffleArray,
    getCurrentQuestionId,
    recordAnswer,
    cacheExplanation,
    getAnswer,
    getExplanation,
    nextQuestion,
    saveApiKey,
    getApiKey,
    saveShufflePref,
    getShufflePref,
    saveDifficultyPref,
    getDifficultyPref,
    saveAiEnabled,
    isAiEnabled,
    updateAiUI,
    saveModelPreference,
    getModelPreference,
    getPersistentCache,
    initWelcomeControls,
    initTheme,
    toggleTheme,
    applyTheme,
    getSavedTheme,
    isPrivateMode: () => isPrivateMode
  };

  if (typeof window !== 'undefined') {
    window.AppState = AppState;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
  }

})(typeof window !== 'undefined' ? window : globalThis);
