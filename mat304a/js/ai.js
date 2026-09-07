/**
 * MAT 304a Midterm Reviewer — Google Gemini 3.6 Flash REST Client
 * 
 * Manages:
 * - Direct browser-to-Google Gemini API communication (gemini-3.6-flash)
 * - Academic pedagogical system prompt (Russell & Norvig AI textbook alignment)
 * - In-memory explanation caching to prevent redundant API calls
 * - Rate limit handling with 4-second exponential backoff and single retry
 * - 30-second AbortController request timeout and offline error categorization
 */

(function (global) {
  'use strict';

  const GEMINI_CONFIG = Object.freeze({
    ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
    TEMPERATURE: 0.2,
    MAX_OUTPUT_TOKENS: 8192,
    THINKING_BUDGET: 1024,
    TIMEOUT_MS: 60000,
    RETRY_DELAY_MS: 4000
  });

  const SYSTEM_PROMPT = `You are an expert university professor teaching MAT 304a — Operations Research I (Linear Programming, Simplex Methods, Sensitivity Analysis). A student just answered a multiple-choice question.

You MUST provide a COMPLETE, fully finished explanation covering ALL THREE sections below without omitting, truncating, or skipping any section:

1. Conceptual Proof & Step-by-Step Mathematical Reasoning:
- Clearly explain WHY the correct answer is true (1-2 focused, mathematically rigorous paragraphs).
- Detail the underlying Operations Research principles, Linear Programming models, simplex tableau mechanics, pivoting operations, sensitivity analysis, Big-M penalties, or two-phase methods.

2. Distractor Analysis:
- Break down WHY each of the other three incorrect choices is wrong, suboptimal, or mathematically flawed.
- Provide 1-2 concise, definitive sentences for each incorrect choice.

3. Key Takeaway:
- Provide 1-2 memorable sentences stating the core principle, theorem, simplex criterion, or practical OR rule of thumb.

MATHEMATICAL & EQUATION GUIDELINES:
- Format mathematical expressions using standard LaTeX: use $$...$$ for display equations and $...$ for inline symbols (e.g., $c_j - z_j$, $\theta = \min \{ \frac{b_i}{a_{ik}} \}$, or $x_1 + 2x_2 \le 10$).
- PEDAGOGICAL CLARITY: Whenever you introduce a formal equation or operator, ALWAYS accompany it with an immediate, intuitive plain-English interpretation explaining what each variable and coefficient represents (for example: "Here, $c_j - z_j$ represents the net evaluation or profit contribution per unit increase in non-basic variable $x_j$").
- Never present dense mathematical formulas without an intuitive breakdown; ensure the math enlightens the student.

OUTPUT INTEGRITY RULES (FULL-OUTPUT ENFORCEMENT):
- Deliver all 3 sections in their entirety. Do not stop midway, do not compress or skip distractor analysis, and do not leave key takeaways unfinished.
- Format with clean markdown (bold headers, bulleted distractor analysis, readable paragraphs). Avoid filler conversational preambles.`;

  /**
   * Helper delay utility for rate limit backoff.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Formats the student context and question options into a structured payload.
   * @param {Object} question
   * @param {string} selectedAnswer
   * @param {boolean} isCorrect
   * @returns {string}
   */
  function formatUserPayload(question, selectedAnswer, isCorrect) {
    const qStem = question.question || '';
    const choices = question.choices || {};
    const correctLetter = String(question.answer || '').toLowerCase();
    const studentLetter = String(selectedAnswer || '').toLowerCase();
    const resultLabel = isCorrect ? 'Correct' : 'Incorrect';

    return `Question: ${qStem}
Options:
(a) ${choices.a || ''}
(b) ${choices.b || ''}
(c) ${choices.c || ''}
(d) ${choices.d || ''}
Correct Answer: (${correctLetter})
Student's Selected Answer: (${studentLetter})
Result: ${resultLabel}`;
  }

  /**
   * Constructs the JSON body for the Gemini API v1beta generateContent endpoint.
   * Utilizes systemInstruction, thinkingConfig budget, and 8192 token limit.
   * @param {Object} question
   * @param {string} selectedAnswer
   * @param {boolean} isCorrect
   * @returns {Object}
   */
  function buildRequestBody(question, selectedAnswer, isCorrect) {
    const userPayload = formatUserPayload(question, selectedAnswer, isCorrect);
    return {
      systemInstruction: {
        parts: [{
          text: SYSTEM_PROMPT
        }]
      },
      contents: [{
        parts: [{
          text: userPayload
        }]
      }],
      generationConfig: {
        temperature: GEMINI_CONFIG.TEMPERATURE,
        maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
        thinkingConfig: {
          thinkingBudget: GEMINI_CONFIG.THINKING_BUDGET
        }
      }
    };
  }

  /**
   * Fetches an AI explanation from Google Gemini with caching, timeout, and retry.
   * 
   * @param {Object} question - Question data object ({ id, question, choices, answer })
   * @param {string} selectedAnswer - Letter selected by student ('a', 'b', 'c', 'd')
   * @param {boolean} isCorrect - Evaluation boolean
   * @returns {Promise<string|Object>} String explanation on success, or { error, message } object
   */
  async function fetchGeminiExplanation(question, selectedAnswer, isCorrect) {
    if (!question || !question.id) {
      return { error: 'INVALID_QUESTION', message: 'Question data is missing or invalid.' };
    }

    // 0. Immediate offline connectivity guard
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return {
        error: 'OFFLINE',
        message: 'Internet connection unavailable. Please reconnect to request AI explanations.'
      };
    }

    // 1. Check in-memory session cache first
    if (global.AppState) {
      const cached = (typeof global.AppState.getExplanation === 'function')
        ? global.AppState.getExplanation(question.id)
        : (global.AppState.session && global.AppState.session.explanations && global.AppState.session.explanations[question.id]);
      if (cached) {
        return cached;
      }
    }

    // 2. Validate API key
    const apiKey = (global.AppState && typeof global.AppState.getApiKey === 'function')
      ? global.AppState.getApiKey()
      : null;

    if (!apiKey || apiKey.trim() === '') {
      return {
        error: 'NO_KEY',
        message: 'Enter your Gemini API key on the welcome screen to enable AI explanations.'
      };
    }

    const trimmedKey = apiKey.trim();
    const requestBody = buildRequestBody(question, selectedAnswer, isCorrect);
    const url = `${GEMINI_CONFIG.ENDPOINT}?key=${encodeURIComponent(trimmedKey)}`;

    /**
     * Internal fetch execution with 30s timeout controller
     */
    async function executeRequest(requestUrl = url) {
      const controller = (typeof AbortController === 'function') ? new AbortController() : null;
      let timeoutId = null;

      if (controller) {
        timeoutId = setTimeout(() => {
          controller.abort();
        }, GEMINI_CONFIG.TIMEOUT_MS);
      }

      try {
        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        };

        if (controller) {
          fetchOptions.signal = controller.signal;
        }

        const response = await fetch(requestUrl, fetchOptions);

        if (timeoutId) clearTimeout(timeoutId);

        return response;
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        throw err;
      }
    }

    // 3. Network Request with HTTP status handling & 429 retry
    try {
      let response = await executeRequest();

      // Handle HTTP 429 (Rate Limit): wait 4s and retry once
      if (response.status === 429) {
        console.warn('[GeminiAI] Free-tier rate limit (429) reached. Retrying in 4 seconds...');
        await wait(GEMINI_CONFIG.RETRY_DELAY_MS);
        response = await executeRequest();

        if (response.status === 429) {
          return {
            error: 'RATE_LIMIT',
            message: 'Gemini free-tier rate limit reached. Waiting for quota...'
          };
        }
      }

      // Handle HTTP 400 / 401 / 403 (Authentication / Key Errors)
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const errorJson = await response.json().catch(() => null);
        console.error('[GeminiAI] Auth/Client Error:', response.status, errorJson);
        const detailMsg = errorJson && errorJson.error && errorJson.error.message;
        return {
          error: 'AUTH_ERROR',
          status: response.status,
          message: detailMsg || 'Invalid or restricted API key. Please verify your key.'
        };
      }

      // Handle general server errors
      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        console.error('[GeminiAI] Server Error:', response.status, errorJson);
        const detailMsg = errorJson && errorJson.error && errorJson.error.message;
        return {
          error: 'HTTP_ERROR',
          status: response.status,
          message: detailMsg || `AI service returned error status ${response.status}.`
        };
      }

      // 4. Parse candidate response text (handling multi-part and thinking responses)
      const data = await response.json();
      const candidate = data.candidates && data.candidates[0];
      const finishReason = candidate && candidate.finishReason;
      if (finishReason === 'MAX_TOKENS') {
        console.warn('[GeminiAI] Response was truncated due to maxOutputTokens ceiling.');
      }

      // Concatenate all text parts while ignoring internal reasoning/thought objects
      const parts = (candidate && candidate.content && Array.isArray(candidate.content.parts))
        ? candidate.content.parts
        : [];

      const explanationText = parts
        .filter(p => !p.thought && typeof p.text === 'string')
        .map(p => p.text)
        .join('')
        .trim();

      if (!explanationText) {
        return {
          error: 'EMPTY_RESPONSE',
          message: 'Received empty response from AI tutor.'
        };
      }

      // 5. Cache response in session
      if (global.AppState) {
        if (typeof global.AppState.cacheExplanation === 'function') {
          global.AppState.cacheExplanation(question.id, explanationText);
        } else if (global.AppState.session && global.AppState.session.explanations) {
          global.AppState.session.explanations[question.id] = explanationText;
        }
      }

      return explanationText;

    } catch (err) {
      if (err && err.name === 'AbortError') {
        return {
          error: 'TIMEOUT',
          message: 'AI response timed out after 30 seconds.'
        };
      }

      // Offline or network unreachable
      return {
        error: 'OFFLINE',
        message: 'Internet connection unavailable.'
      };
    }
  }

  /**
   * Displays an unobtrusive toast notification.
   * @param {string} message
   * @param {'info'|'offline'|'online'} [type='info']
   * @param {number} [duration=3500]
   */
  function showToast(message, type = 'info', duration = 3500) {
    if (typeof document === 'undefined') return;
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'offline' ? 'toast-offline' : (type === 'online' ? 'toast-online' : '')}`;
    
    let iconHtml = '<svg class="toast-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type === 'offline') {
      iconHtml = '<svg class="toast-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    }
    if (type === 'online') {
      iconHtml = '<svg class="toast-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    }

    toast.innerHTML = `${iconHtml}<span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, duration);
  }

  // Network Connectivity Event Listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => {
      showToast("You are currently offline. AI explanations will be paused.", 'offline');
    });
    window.addEventListener('online', () => {
      showToast("Internet connection restored.", 'online');
    });
  }

  // Export
  const GeminiAI = {
    GEMINI_CONFIG,
    SYSTEM_PROMPT,
    formatUserPayload,
    buildRequestBody,
    fetchGeminiExplanation,
    showToast
  };

  if (typeof window !== 'undefined') {
    window.GeminiAI = GeminiAI;
    window.fetchGeminiExplanation = fetchGeminiExplanation;
    window.showToast = showToast;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAI;
  }

})(typeof window !== 'undefined' ? window : globalThis);
