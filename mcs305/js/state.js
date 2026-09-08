/**
 * MCS 305: Software Engineering — State Machine & Session Management
 * 
 * Manages:
 * - Finite State Machine (STATES: WELCOME, QUESTION, FEEDBACK, RESULTS, REVIEW)
 * - Deterministic Screen Transition Controller & Sticky Header Visibility
 * - QuizSession Model with Filter Support (Module M1-M7, Difficulty Tiers, Modes)
 * - Unbiased Fisher-Yates Randomization (Question & Choice Letter Permutation)
 * - Resilient LocalStorage Helpers (In-Memory Fallback for Private Browsing & Quota Errors)
 * - Multi-Key Rotation Support for Gemini API Keys
 * - Bookmark / Starred Questions Persistence
 * - Theme Management (Dark / Light Mode with MCS305_THEME)
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
    API_KEY: 'MCS305_GEMINI_API_KEY',
    SHUFFLE_PREF: 'MCS305_SHUFFLE_PREF',
    DIFFICULTY_PREF: 'MCS305_DIFFICULTY_PREF',
    AI_ENABLED: 'MCS305_AI_ENABLED',
    AI_CACHE: 'MCS305_AI_EXPLANATIONS_CACHE',
    AI_MODEL: 'MCS305_AI_MODEL',
    BOOKMARKS: 'MCS305_BOOKMARKS',
    THEME: 'MCS305_THEME',
    MODE_PREF: 'MCS305_MODE_PREF',
    MODULE_PREF: 'MCS305_MODULE_PREF'
  });

  let currentState = STATES.WELCOME;

  /**
   * Dispatches custom events to both document and window for inter-module communication.
   * @param {string} eventName - Custom event identifier
   * @param {Object} [detail={}] - Event payload
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

  // ==========================================================================
  // 2. Resilient Browser Storage (Private Browsing & Quota Limit Fallback)
  // ==========================================================================

  const memoryStorage = new Map();
  let isPrivateMode = false;

  function notifyPrivateMode() {
    if (typeof document === 'undefined') return;
    const helper = document.getElementById('api-key-helper');
    if (helper && isPrivateMode) {
      helper.innerHTML = '<span style="color: var(--warning-amber, #F59E0B); font-weight: 500;">Notice: Local storage unavailable (private browsing). Settings persist for current tab session only.</span>';
    }
  }

  function isLocalStorageAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        isPrivateMode = true;
        notifyPrivateMode();
        return false;
      }
      const testKey = '__mcs305_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      isPrivateMode = true;
      notifyPrivateMode();
      return false;
    }
  }

  function safeGetItem(key, fallback = null) {
    try {
      if (isLocalStorageAvailable()) {
        const val = window.localStorage.getItem(key);
        return val !== null ? val : fallback;
      }
    } catch (e) {
      isPrivateMode = true;
      notifyPrivateMode();
      console.warn(`[AppState] localStorage read error for key "${key}", using memory fallback.`, e);
    }
    return memoryStorage.has(key) ? memoryStorage.get(key) : fallback;
  }

  function safeSetItem(key, value) {
    const stringVal = String(value);
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(key, stringVal);
        return true;
      }
    } catch (e) {
      isPrivateMode = true;
      notifyPrivateMode();
      console.warn(`[AppState] localStorage write error for key "${key}", using memory fallback.`, e);
    }
    memoryStorage.set(key, stringVal);
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

  // ==========================================================================
  // 3. Multi-Key Rotation & Persistent Settings Accessors
  // ==========================================================================

  let currentKeyIndex = 0;

  /**
   * Retrieves all parsed Gemini API keys.
   * Supports comma or newline-delimited keys for automatic rotation.
   * @returns {string[]} Array of non-empty API keys
   */
  function getAllApiKeys() {
    const raw = safeGetItem(STORAGE_KEYS.API_KEY) || safeGetItem('gemini_api_key') || '';
    if (!raw) return [];
    return raw
      .split(/[\n,;]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);
  }

  /**
   * Returns active API key from the multi-key pool.
   * @returns {string|null}
   */
  function getApiKey() {
    const keys = getAllApiKeys();
    if (keys.length === 0) return null;
    if (currentKeyIndex >= keys.length) {
      currentKeyIndex = 0;
    }
    return keys[currentKeyIndex];
  }

  /**
   * Rotates to the next available API key in the pool (e.g. on 429 quota exhaustion).
   * @returns {string|null} The next active key
   */
  function getNextApiKey() {
    const keys = getAllApiKeys();
    if (keys.length === 0) return null;
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    return keys[currentKeyIndex];
  }

  /**
   * Saves API key(s) to persistent storage.
   * @param {string} keyString - Comma-delimited or single key string
   * @returns {string|null} Sanitized key string
   */
  function saveApiKey(keyString) {
    if (!keyString || typeof keyString !== 'string' || keyString.trim() === '') {
      safeRemoveItem(STORAGE_KEYS.API_KEY);
      currentKeyIndex = 0;
      if (session && session.settings) {
        session.settings.apiKey = null;
      }
      return null;
    }
    const sanitized = keyString.trim();
    safeSetItem(STORAGE_KEYS.API_KEY, sanitized);
    currentKeyIndex = 0;
    if (session && session.settings) {
      session.settings.apiKey = sanitized;
    }
    return sanitized;
  }

  // Shuffle Preference
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

  // Difficulty Preference ('all', 'easy', 'medium', 'hard')
  function saveDifficultyPref(diff) {
    const valid = (diff === 'easy' || diff === 'medium' || diff === 'hard') ? diff : 'all';
    safeSetItem(STORAGE_KEYS.DIFFICULTY_PREF, valid);
    if (session && session.settings) {
      session.settings.difficulty = valid;
    }
    return valid;
  }

  function getDifficultyPref() {
    const raw = safeGetItem(STORAGE_KEYS.DIFFICULTY_PREF);
    if (raw === 'all' || raw === 'easy' || raw === 'medium' || raw === 'hard') {
      return raw;
    }
    return 'all';
  }

  // Operating Mode Preference ('practice' vs 'exam')
  function saveModePref(mode) {
    const valid = mode === 'exam' ? 'exam' : 'practice';
    safeSetItem(STORAGE_KEYS.MODE_PREF, valid);
    if (session && session.settings) {
      session.settings.mode = valid;
    }
    return valid;
  }

  function getModePref() {
    const raw = safeGetItem(STORAGE_KEYS.MODE_PREF);
    return raw === 'exam' ? 'exam' : 'practice';
  }

  // Target Syllabus Module ('all', 'M1'..'M7')
  function saveModulePref(mod) {
    const valid = ['all', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].includes(mod) ? mod : 'all';
    safeSetItem(STORAGE_KEYS.MODULE_PREF, valid);
    if (session && session.settings) {
      session.settings.selectedTopic = valid;
    }
    return valid;
  }

  function getModulePref() {
    const raw = safeGetItem(STORAGE_KEYS.MODULE_PREF);
    if (['all', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].includes(raw)) {
      return raw;
    }
    return 'all';
  }

  // AI Tutoring Enable / Disable Toggle
  function saveAiEnabled(enabled) {
    const boolVal = Boolean(enabled);
    safeSetItem(STORAGE_KEYS.AI_ENABLED, boolVal ? 'true' : 'false');
    if (session && session.settings) {
      session.settings.aiEnabled = boolVal;
    }
    updateAiUI(boolVal);
    dispatchAppEvent('aiToggleChange', { enabled: boolVal });
    dispatchAppEvent('app:ai-toggled', { enabled: boolVal });
    return boolVal;
  }

  function isAiEnabled() {
    const raw = safeGetItem(STORAGE_KEYS.AI_ENABLED);
    if (raw !== null) {
      return raw === 'true';
    }
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
      headerToggle.setAttribute(
        'title',
        enabled
          ? 'AI Explanations: Active (Click to pause & save tokens)'
          : 'AI Explanations: Paused · 0 Tokens (Click to activate)'
      );
    }
    if (headerText) {
      headerText.textContent = enabled ? 'AI: ON' : 'AI: OFF';
    }
  }

  // Model Selection Preference
  function saveModelPreference(model) {
    const validModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
    const valid = validModels.includes(model) ? model : 'gemini-2.0-flash';
    safeSetItem(STORAGE_KEYS.AI_MODEL, valid);
    return valid;
  }

  function getModelPreference() {
    const raw = safeGetItem(STORAGE_KEYS.AI_MODEL);
    if (raw && ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'].includes(raw)) {
      return raw;
    }
    return 'gemini-2.0-flash';
  }

  // ==========================================================================
  // 4. Bookmark / Starred Questions Management
  // ==========================================================================

  function getBookmarks() {
    try {
      const raw = safeGetItem(STORAGE_KEYS.BOOKMARKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('[AppState] Failed to parse bookmarks:', e);
    }
    return new Set();
  }

  function saveBookmarks(bookmarkSet) {
    try {
      const array = Array.from(bookmarkSet);
      safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(array));
      if (session) {
        session.bookmarks = new Set(array);
      }
      return true;
    } catch (e) {
      console.warn('[AppState] Failed to save bookmarks:', e);
      return false;
    }
  }

  function isBookmarked(questionId) {
    const id = Number(questionId);
    if (session && session.bookmarks instanceof Set) {
      return session.bookmarks.has(id);
    }
    const current = getBookmarks();
    return current.has(id);
  }

  function toggleBookmark(questionId) {
    const id = Number(questionId);
    const bookmarks = getBookmarks();
    const willBookmark = !bookmarks.has(id);

    if (willBookmark) {
      bookmarks.add(id);
    } else {
      bookmarks.delete(id);
    }

    saveBookmarks(bookmarks);

    // Update bookmark button state in DOM if currently viewing this question
    if (typeof document !== 'undefined') {
      const btn = document.getElementById('btn-bookmark-question');
      if (btn && session && getCurrentQuestionId() === id) {
        btn.classList.toggle('active', willBookmark);
        btn.setAttribute('aria-pressed', willBookmark ? 'true' : 'false');
      }
    }

    dispatchAppEvent('app:bookmark-toggled', { questionId: id, isBookmarked: willBookmark });
    return willBookmark;
  }

  // ==========================================================================
  // 5. Fisher-Yates Shuffle Algorithm (Unbiased Permutation)
  // ==========================================================================

  function shuffleArray(array) {
    if (!Array.isArray(array)) return [];
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ==========================================================================
  // 6. QuizSession Model & Lifecycle
  // ==========================================================================

  const session = {
    questions: [],
    questionOrder: [],
    currentIndex: 0,
    answers: {},
    explanations: {},
    bookmarks: new Set(),
    score: 0,
    streak: 0,
    maxStreak: 0,
    startTime: 0,
    endTime: 0,
    questionsMap: {},
    settings: {
      selectedTopic: 'all',
      difficulty: 'all',
      mode: 'practice',
      shuffled: true,
      choicesShuffled: false,
      apiKey: null,
      aiEnabled: true
    },
    recordAnswer: function(questionId, selectedChoice, isCorrect, timeSpent) {
      return recordAnswer(questionId, selectedChoice, isCorrect, timeSpent);
    }
  };

  /**
   * Initializes a fresh quiz session with filtering, shuffling, and option scrambling.
   * @param {Object} [options={}] - Configuration options
   * @returns {Object} Active session reference
   */
  function initSession(options = {}) {
    // 1. Resolve master dataset from options.questions, window.QUESTIONS, or global.QUESTIONS
    let masterQuestions = [];
    if (Array.isArray(options.questions) && options.questions.length > 0) {
      masterQuestions = options.questions;
    } else if (typeof window !== 'undefined' && Array.isArray(window.QUESTIONS) && window.QUESTIONS.length > 0) {
      masterQuestions = window.QUESTIONS;
    } else if (typeof global !== 'undefined' && Array.isArray(global.QUESTIONS) && global.QUESTIONS.length > 0) {
      masterQuestions = global.QUESTIONS;
    }

    // 2. Resolve settings
    const selectedTopic = options.topic || options.selectedTopic || getModulePref();
    const selectedDifficulty = options.difficulty || options.selectedDifficulty || getDifficultyPref();
    const mode = options.mode || getModePref();
    const isShuffleEnabled = options.shuffled !== undefined ? Boolean(options.shuffled) : true;

    // Filter by Syllabus Module (M1 to M7 or all)
    let filtered = [...masterQuestions];
    if (selectedTopic && selectedTopic !== 'all') {
      filtered = filtered.filter(q => q.lessonId === selectedTopic);
    }

    // Filter by Difficulty Tier (easy, medium, hard, or all)
    if (selectedDifficulty && selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Fallback if filters yield 0 results
    if (filtered.length === 0 && masterQuestions.length > 0) {
      console.warn('[AppState] Filters yielded 0 questions. Reverting to full bank.');
      filtered = [...masterQuestions];
    }

    // 3. Question Ordering
    let questionIds = filtered.map(q => q.id);
    if (isShuffleEnabled) {
      questionIds = shuffleArray(questionIds);
    }

    // 4. Choice letter scrambling on Hard difficulty or when explicitly enabled
    const isChoicesShuffled = (selectedDifficulty === 'hard') || Boolean(options.choicesShuffled);
    const questionsMap = {};

    filtered.forEach(origQ => {
      if (isChoicesShuffled) {
        const letters = ['a', 'b', 'c', 'd'];
        const origChoices = origQ.choices || {};
        const origAnswer = String(origQ.answer || '').toLowerCase();

        const choiceItems = letters.map(letter => ({
          origLetter: letter,
          text: origChoices[letter] || ''
        }));

        const scrambled = shuffleArray(choiceItems);
        const newChoices = {};
        let newAnswer = origAnswer;

        letters.forEach((letter, idx) => {
          newChoices[letter] = scrambled[idx].text;
          if (scrambled[idx].origLetter === origAnswer) {
            newAnswer = letter;
          }
        });

        questionsMap[origQ.id] = {
          ...origQ,
          choices: newChoices,
          answer: newAnswer,
          _isChoicesShuffled: true,
          _originalAnswer: origAnswer
        };
      } else {
        questionsMap[origQ.id] = {
          ...origQ,
          choices: { ...(origQ.choices || {}) },
          answer: String(origQ.answer || '').toLowerCase(),
          _isChoicesShuffled: false,
          _originalAnswer: String(origQ.answer || '').toLowerCase()
        };
      }
    });

    // 5. Populate Session State
    session.questions = filtered;
    session.questionOrder = questionIds;
    session.currentIndex = 0;
    session.answers = {};
    session.explanations = {};
    session.bookmarks = getBookmarks();
    session.score = 0;
    session.streak = 0;
    session.maxStreak = 0;
    session.startTime = Date.now();
    session.endTime = 0;
    session.questionsMap = questionsMap;

    // Resolve API key
    const effectiveApiKey = options.apiKey !== undefined ? options.apiKey : getApiKey();
    session.settings = {
      selectedTopic,
      difficulty: selectedDifficulty,
      mode,
      shuffled: isShuffleEnabled,
      choicesShuffled: isChoicesShuffled,
      apiKey: effectiveApiKey ? String(effectiveApiKey).trim() : null,
      aiEnabled: options.aiEnabled !== undefined ? Boolean(options.aiEnabled) : isAiEnabled()
    };

    // Update Difficulty indicator in header and telemetry badges
    updateDifficultyUI(selectedDifficulty);

    // Dispatch Lifecycle Events
    dispatchAppEvent('sessionInitialized', { session });
    dispatchAppEvent('app:session-started', { session });

    return session;
  }

  function getQuestion(id) {
    if (session && session.questionsMap && session.questionsMap[id]) {
      return session.questionsMap[id];
    }
    const questions = (typeof window !== 'undefined' && Array.isArray(window.QUESTIONS))
      ? window.QUESTIONS
      : ((typeof global !== 'undefined' && Array.isArray(global.QUESTIONS)) ? global.QUESTIONS : []);
    return questions.find(q => q.id === Number(id)) || null;
  }

  function getCurrentQuestionId() {
    if (!session.questionOrder || session.questionOrder.length === 0) {
      return null;
    }
    return session.questionOrder[session.currentIndex] || null;
  }

  function getCurrentQuestion() {
    const id = getCurrentQuestionId();
    if (id === null) return null;
    return getQuestion(id);
  }

  function isComplete() {
    if (!session.questionOrder || session.questionOrder.length === 0) return false;
    return Object.keys(session.answers).length >= session.questionOrder.length;
  }

  function recordAnswer(questionId, selectedChoice, isCorrect, timeSpent = 0) {
    const id = Number(questionId);
    const correctBool = Boolean(isCorrect);

    const record = {
      questionId: id,
      selected: String(selectedChoice).toLowerCase(),
      isCorrect: correctBool,
      correct: correctBool,
      timeSpent: Number(timeSpent) || 0,
      timestamp: Date.now()
    };

    session.answers[id] = record;

    if (correctBool) {
      session.score += 1;
      session.streak += 1;
      if (session.streak > session.maxStreak) {
        session.maxStreak = session.streak;
      }
    } else {
      session.streak = 0;
    }

    // Fire Parity Events
    dispatchAppEvent('answerSubmitted', {
      questionId: id,
      record,
      score: session.score,
      streak: session.streak,
      maxStreak: session.maxStreak,
      answeredCount: Object.keys(session.answers).length,
      totalCount: session.questionOrder.length
    });

    dispatchAppEvent('app:answer-recorded', {
      questionId: id,
      record,
      session
    });

    return record;
  }

  function getAnswer(questionId) {
    const id = Number(questionId);
    return session.answers[id] || null;
  }

  function nextQuestion() {
    if (session.currentIndex < session.questionOrder.length - 1) {
      session.currentIndex += 1;
      dispatchAppEvent('app:question-navigated', {
        index: session.currentIndex,
        questionId: getCurrentQuestionId()
      });
      return true;
    }
    return false;
  }

  function prevQuestion() {
    if (session.currentIndex > 0) {
      session.currentIndex -= 1;
      dispatchAppEvent('app:question-navigated', {
        index: session.currentIndex,
        questionId: getCurrentQuestionId()
      });
      return true;
    }
    return false;
  }

  function goToQuestion(index) {
    const idx = Number(index);
    if (idx >= 0 && idx < session.questionOrder.length) {
      session.currentIndex = idx;
      dispatchAppEvent('app:question-navigated', {
        index: idx,
        questionId: getCurrentQuestionId()
      });
      return true;
    }
    return false;
  }

  // ==========================================================================
  // 7. Persistent AI Explanation Cache
  // ==========================================================================

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
    const id = Number(questionId);
    session.explanations[id] = explanationText;
    saveToPersistentCache(id, explanationText);
    return explanationText;
  }

  function getExplanation(questionId) {
    const id = Number(questionId);
    if (session.explanations && session.explanations[id]) {
      return session.explanations[id];
    }
    const persistent = getPersistentCache();
    if (persistent && persistent[id]) {
      session.explanations[id] = persistent[id];
      return persistent[id];
    }
    return null;
  }

  // ==========================================================================
  // 8. State Machine & View Transitions
  // ==========================================================================

  function getCurrentState() {
    return currentState;
  }

  /**
   * Transitions the application to the target view state.
   * Controls DOM screen visibility (.screen.active / .hidden) and sticky header state.
   * @param {string} nextState - Member of STATES
   * @param {Object} [payload={}] - Additional transition data
   * @returns {boolean} True if transition succeeded
   */
  function transitionTo(nextState, payload = {}) {
    if (!Object.values(STATES).includes(nextState)) {
      console.error(`[AppState] Invalid state transition requested: "${nextState}". Allowed:`, Object.values(STATES));
      return false;
    }

    const previousState = currentState;
    currentState = nextState;

    if (typeof document !== 'undefined') {
      const targetScreenId = STATE_SCREEN_MAP[nextState];
      const targetScreen = targetScreenId ? document.getElementById(targetScreenId) : null;

      // Update all .screen elements
      const allScreens = document.querySelectorAll('.screen');
      allScreens.forEach(screen => {
        if (screen === targetScreen) {
          screen.classList.remove('hidden');
          screen.classList.add('active');
        } else {
          screen.classList.remove('active');
          screen.classList.add('hidden');
        }
      });

      // Sticky Header Visibility: Hidden on WELCOME, visible in all other states
      const quizHeader = document.getElementById('quiz-header');
      if (quizHeader) {
        if (nextState === STATES.WELCOME) {
          quizHeader.classList.add('hidden');
        } else {
          quizHeader.classList.remove('hidden');
        }
      }

      // Smooth scroll to top of screen on transition
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }

    // Dispatch State Transition Events
    dispatchAppEvent('stateChange', { state: nextState, previousState, payload });
    dispatchAppEvent('app:state-changed', { from: previousState, to: nextState, payload });

    return true;
  }

  // ==========================================================================
  // 9. Telemetry & UI Badge Helpers
  // ==========================================================================

  function updateDifficultyUI(diff) {
    if (typeof document === 'undefined') return;
    const difficulty = diff || (session && session.settings && session.settings.difficulty) || 'all';

    // Header badge
    const headerBadge = document.getElementById('header-difficulty-badge');
    if (headerBadge) {
      headerBadge.textContent = difficulty === 'all' ? 'All Tiers' : difficulty.toUpperCase();
      headerBadge.className = `header-difficulty-pill diff-${difficulty}`;
    }

    // Results screen tag
    const resultsTag = document.getElementById('results-difficulty-tag');
    if (resultsTag) {
      let desc = 'Balanced Scope (All Tiers)';
      let iconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
      if (difficulty === 'easy') {
        desc = 'Tier 1: Core Fundamentals';
        iconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>';
      } else if (difficulty === 'medium') {
        desc = 'Tier 2: Applied Analysis';
        iconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>';
      } else if (difficulty === 'hard') {
        desc = 'Tier 3: Complex Scenarios & Calculations';
        iconSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
      }
      resultsTag.innerHTML = `<span class="badge badge-difficulty diff-${difficulty}">${iconSvg} <span>Mode: ${desc}</span></span>`;
    }
  }

  // ==========================================================================
  // 10. DOM Synchronization & Welcome Controls Initializer
  // ==========================================================================

  function initWelcomeControls() {
    if (typeof document === 'undefined') return;

    const apiKeyInput = document.getElementById('api-key-input');
    const btnToggleApiKey = document.getElementById('btn-toggle-api-key');
    const btnStartQuiz = document.getElementById('btn-start-quiz');

    // Pre-populate saved API keys
    if (apiKeyInput) {
      const savedKey = safeGetItem(STORAGE_KEYS.API_KEY) || safeGetItem('gemini_api_key') || '';
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

    // 1. Target Syllabus Module Selection Grid (M1 to M7 or all)
    const topicCards = document.querySelectorAll('#module-selector-grid .topic-card');
    const savedModule = getModulePref();

    function setActiveModule(moduleVal) {
      topicCards.forEach(card => {
        const matches = card.getAttribute('data-module') === moduleVal;
        card.classList.toggle('active', matches);
        card.setAttribute('aria-checked', matches ? 'true' : 'false');
      });
      saveModulePref(moduleVal);
    }

    setActiveModule(savedModule);

    topicCards.forEach(card => {
      card.addEventListener('click', () => {
        const mod = card.getAttribute('data-module') || 'all';
        setActiveModule(mod);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const mod = card.getAttribute('data-module') || 'all';
          setActiveModule(mod);
        }
      });
    });

    // 2. Reviewer Operating Mode (Practice vs Exam Simulation)
    const modePractice = document.getElementById('mode-practice');
    const modeExam = document.getElementById('mode-exam');
    const savedMode = getModePref();

    function setActiveMode(modeVal) {
      if (modePractice) {
        modePractice.classList.toggle('active', modeVal === 'practice');
      }
      if (modeExam) {
        modeExam.classList.toggle('active', modeVal === 'exam');
      }
      saveModePref(modeVal);
    }

    setActiveMode(savedMode);

    if (modePractice) {
      modePractice.addEventListener('click', () => setActiveMode('practice'));
      modePractice.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveMode('practice');
        }
      });
    }

    if (modeExam) {
      modeExam.addEventListener('click', () => setActiveMode('exam'));
      modeExam.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveMode('exam');
        }
      });
    }

    // 3. Difficulty Selection Cards
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

    // 4. AI Explanations Toggle Controls
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

    // 5. Google Gemini API Key Guide Modal Handlers
    const guideModal = document.getElementById('api-key-guide-modal');
    const btnOpenGuide = document.getElementById('btn-open-api-guide');
    const btnOpenGuideText = document.getElementById('btn-open-api-guide-text');
    const btnCloseGuide = document.getElementById('btn-close-guide-modal');
    const btnDismissGuide = document.getElementById('btn-dismiss-guide-modal');

    function openGuideModal() {
      if (!guideModal) return;
      guideModal.classList.remove('hidden');
      guideModal.setAttribute('aria-hidden', 'false');
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

    if (guideModal) {
      guideModal.addEventListener('click', event => {
        if (event.target === guideModal) {
          closeGuideModal();
        }
      });
    }

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && guideModal && !guideModal.classList.contains('hidden')) {
        closeGuideModal();
      }
    });

    // 6. Start Quiz Action Button
    if (btnStartQuiz) {
      btnStartQuiz.addEventListener('click', () => {
        const keyVal = (apiKeyInput && typeof apiKeyInput.value === 'string') ? apiKeyInput.value.trim() : '';
        if (keyVal) {
          saveApiKey(keyVal);
        }

        const selectedModule = getModulePref();
        const selectedDiff = getDifficultyPref();
        const selectedMode = getModePref();

        initSession({
          topic: selectedModule,
          difficulty: selectedDiff,
          mode: selectedMode,
          apiKey: keyVal || null,
          aiEnabled: isAiEnabled()
        });

        transitionTo(STATES.QUESTION);
      });
    }

    notifyPrivateMode();
  }

  // ==========================================================================
  // 11. Visual Theme Management (Dark / Light Mode with MCS305_THEME)
  // ==========================================================================

  function getSavedTheme() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('mcs305_theme');
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
        localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
      }
    } catch (e) {}
    dispatchAppEvent('themeChanged', { theme: nextTheme });
    dispatchAppEvent('app:theme-changed', { theme: nextTheme });
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
  // 12. Public API Export (Parity with global.AppState)
  // ==========================================================================

  const AppState = {
    STATES,
    STATE_SCREEN_MAP,
    STORAGE_KEYS,
    session,
    transitionTo,
    getCurrentState,
    initSession,
    startNewSession: initSession,
    getQuestion,
    getCurrentQuestion,
    getCurrentQuestionId,
    recordAnswer,
    getAnswer,
    cacheExplanation,
    getExplanation,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    isComplete,
    toggleBookmark,
    isBookmarked,
    getBookmarks,
    shuffleArray,
    saveApiKey,
    getApiKey,
    getNextApiKey,
    getAllApiKeys,
    saveShufflePref,
    getShufflePref,
    saveDifficultyPref,
    getDifficultyPref,
    saveModePref,
    getModePref,
    saveModulePref,
    getModulePref,
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
    dispatchAppEvent,
    isPrivateMode: () => isPrivateMode
  };

  if (typeof window !== 'undefined') {
    window.AppState = AppState;
  }
  if (typeof global !== 'undefined') {
    global.AppState = AppState;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
  }

})(typeof window !== 'undefined' ? window : globalThis);
