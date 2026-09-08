/**
 * TWM 301 Midterm Reviewer — Google Gemini Flash REST Client
 * Academic References:
 * - Leslie Lamport, "LaTeX: A Document Preparation System" (Addison-Wesley)
 * - George Grätzer, "More Math Into LaTeX" (Springer)
 * - Nicholas J. Higham, "Handbook of Writing for the Mathematical Sciences" (SIAM)
 * 
 * Manages:
 * - Direct browser-to-Google Gemini API communication (gemini-2.0-flash / gemini-1.5-flash)
 * - Academic pedagogical system prompt (LaTeX typesetting, AMS-LaTeX, document engineering, BibTeX, and mathematical style principles)
 * - In-memory explanation caching to prevent redundant API calls
 * - Rate limit handling with 4-second exponential backoff and single retry
 * - 30-second AbortController request timeout and offline error categorization
 */

(function (global) {
  'use strict';

  const GEMINI_CONFIG = Object.freeze({
    PRIMARY_MODELS: [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash'
    ],
    TEMPERATURE: 0.2,
    MAX_OUTPUT_TOKENS: 8192,
    THINKING_BUDGET: 1024,
    TIMEOUT_MS: 60000,
    RETRY_DELAY_MS: 4000
  });

  let cachedDiscoveredModels = null;
  const NON_TEXT_MODEL_REGEX = /(-tts|-audio|-speech|-embed|embedding|imagen|realtime|robotics|vision-only)/i;

  /**
   * Queries Google's ModelService.ListModels endpoint to discover active models
   * that support generateContent for this user's specific API key.
   * Strictly filters out TTS/audio/embedding models to avoid parameter incompatibilities.
   * @param {string} apiKey
   * @returns {Promise<string[]|null>}
   */
  async function discoverAvailableModels(apiKey) {
    if (cachedDiscoveredModels && cachedDiscoveredModels.length > 0) {
      return cachedDiscoveredModels;
    }
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.models)) {
          // Strictly filter for text models supporting generateContent, excluding TTS, audio, and embeddings
          const supported = data.models
            .filter(m => 
              Array.isArray(m.supportedGenerationMethods) && 
              m.supportedGenerationMethods.includes('generateContent') &&
              !NON_TEXT_MODEL_REGEX.test(m.name)
            )
            .map(m => m.name.replace(/^models\//, ''));

          // Preferred priority order for standard chat/text generation
          const priority = [
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
            'gemini-3.5-flash-lite',
            'gemini-3.6-flash'
          ];

          supported.sort((a, b) => {
            const idxA = priority.indexOf(a);
            const idxB = priority.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;

            const aFlash = a.toLowerCase().includes('flash');
            const bFlash = b.toLowerCase().includes('flash');
            if (aFlash && !bFlash) return -1;
            if (!aFlash && bFlash) return 1;
            return a.localeCompare(b);
          });

          console.log('[GeminiAI] Discovered valid text generation models:', supported);
          cachedDiscoveredModels = supported;
          return supported;
        }
      }
    } catch (e) {
      console.warn('[GeminiAI] Model discovery query failed:', e);
    }
    return null;
  }

  function getModelEndpoint(modelName) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;
  }

  const SYSTEM_PROMPT = `You are an expert university professor teaching TWM 301 — Technical Writing in Mathematics Using LaTeX (aligned with authoritative academic treatises: Leslie Lamport's "LaTeX: A Document Preparation System" [Addison-Wesley], George Grätzer's "More Math Into LaTeX" [Springer], and Nicholas J. Higham's "Handbook of Writing for the Mathematical Sciences" [SIAM]) at a rigorous academic level. A student just answered a multiple-choice question.

You MUST provide a COMPLETE, fully finished explanation covering ALL THREE sections below without omitting, truncating, or skipping any section:

1. Conceptual Proof & Step-by-Step Mathematical/LaTeX Reasoning:
- Clearly explain WHY the correct answer is true (1-2 focused, academically rigorous paragraphs).
- Detail the underlying LaTeX and technical writing principles: document architecture, preamble declarations, amsmath environments (align, gather, multline), delimiter scaling (\\left, \\right), float positioning (h, t, b, p), booktabs tables, theorem environments (amsthm), cross-referencing (\\ref, \\eqref, \\autoref, \\cref), BibTeX syntax (@article, @book), or stylistic rules (clarity, precision, consistency, quantifier ordering, and displayed equation punctuation).

2. Distractor Analysis:
- Break down WHY each of the other three incorrect choices is wrong, suboptimal, syntactically invalid, or violates mathematical writing standards.
- Provide 1-2 concise, definitive sentences for each incorrect choice.

3. Key Takeaway:
- Provide 1-2 memorable sentences stating the core best practice, LaTeX rule, or editorial guideline that the student should remember for their midterm examination.

FORMATTING GUIDELINES:
- Format mathematical expressions using standard LaTeX: use $$...$$ for display equations and $...$ for inline symbols (e.g., $\\forall x \\in \\mathbb{R}$, $\\int_a^b f(x)\\,dx$, or $\\lim_{n \\to \\infty} a_n$).
- For raw LaTeX commands, code snippets, package names, or environment syntax, wrap them in backticks (e.g., \`\\documentclass{article}\`, \`\\usepackage{amsmath}\`, \`align*\`, or \`\\autoref\`).
- Ensure all explanations are pedagogically constructive, clear, and direct.

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
  /**
   * Constructs the JSON body for the Gemini API v1beta generateContent endpoint.
   * Dynamically tailors generationConfig based on model capability.
   * @param {Object} question
   * @param {string} selectedAnswer
   * @param {boolean} isCorrect
   * @param {string} [modelName='gemini-2.0-flash']
   * @returns {Object}
   */
  function buildRequestBody(question, selectedAnswer, isCorrect, modelName = GEMINI_CONFIG.PRIMARY_MODEL) {
    const userPayload = formatUserPayload(question, selectedAnswer, isCorrect);
    const genConfig = {
      temperature: GEMINI_CONFIG.TEMPERATURE,
      maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS
    };

    // Only apply thinkingConfig to models that explicitly feature 'thinking' in their model identifier
    if (modelName && modelName.toLowerCase().includes('thinking')) {
      genConfig.thinkingConfig = {
        thinkingBudget: GEMINI_CONFIG.THINKING_BUDGET
      };
    }

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
      generationConfig: genConfig
    };
  }

  /**
   * Fetches an AI explanation from Google Gemini with persistent caching,
   * multi-key rotation, and intelligent model failover (gemini-2.0-flash -> gemini-2.0-flash-lite -> gemini-3.5-flash-lite -> gemini-3.6-flash).
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

    // 1. Check persistent/session cache first (0 network calls, 0 quota used)
    if (global.AppState) {
      const cached = (typeof global.AppState.getExplanation === 'function')
        ? global.AppState.getExplanation(question.id)
        : (global.AppState.session && global.AppState.session.explanations && global.AppState.session.explanations[question.id]);
      if (cached) {
        return cached;
      }
    }

    // 2. Validate & parse API key pool
    const rawApiKey = (global.AppState && typeof global.AppState.getApiKey === 'function')
      ? global.AppState.getApiKey()
      : null;

    if (!rawApiKey || rawApiKey.trim() === '') {
      return {
        error: 'NO_KEY',
        message: 'Enter your Gemini API key on the welcome screen to enable AI explanations.'
      };
    }

    // Support comma or whitespace separated keys for automatic rotation
    const apiKeys = rawApiKey.split(/[,;\s]+/).map(k => k.trim()).filter(k => k.length > 0);
    if (apiKeys.length === 0) {
      return {
        error: 'NO_KEY',
        message: 'Enter your Gemini API key on the welcome screen to enable AI explanations.'
      };
    }

    // 3. Determine Model Failover Chain
    const preferredModel = (global.AppState && typeof global.AppState.getModelPreference === 'function')
      ? global.AppState.getModelPreference()
      : 'gemini-2.0-flash';

    // Build model chain starting with candidate models
    let modelChain = [...GEMINI_CONFIG.PRIMARY_MODELS];
    if (preferredModel && !modelChain.includes(preferredModel)) {
      modelChain.unshift(preferredModel);
    } else if (preferredModel && modelChain.indexOf(preferredModel) > 0) {
      modelChain.splice(modelChain.indexOf(preferredModel), 1);
      modelChain.unshift(preferredModel);
    }

    let failoverNoticeGiven = false;

    // Helper to execute single fetch with timeout and auth headers
    async function executeSingleFetch(requestUrl, body, apiKey) {
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
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(body)
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

    // 4. Multi-Model & Multi-Key Request Loop
    for (let mIdx = 0; mIdx < modelChain.length; mIdx++) {
      const currentModel = modelChain[mIdx];
      const requestBody = buildRequestBody(question, selectedAnswer, isCorrect, currentModel);

      for (let kIdx = 0; kIdx < apiKeys.length; kIdx++) {
        const currentKey = apiKeys[kIdx];
        const url = `${getModelEndpoint(currentModel)}?key=${encodeURIComponent(currentKey)}`;

        try {
          let response = await executeSingleFetch(url, requestBody, currentKey);

          // Handle 404 (Model not found for this API version/account)
          if (response.status === 404) {
            console.warn(`[GeminiAI] Model ${currentModel} returned 404 (not found). Dynamically inspecting live model list...`);
            
            if (!cachedDiscoveredModels) {
              const liveModels = await discoverAvailableModels(currentKey);
              if (liveModels && liveModels.length > 0) {
                for (const lm of liveModels) {
                  if (!modelChain.includes(lm)) {
                    modelChain.push(lm);
                  }
                }
              }
            }

            if (mIdx + 1 < modelChain.length) {
              failoverNoticeGiven = true;
              continue; // Automatically proceed to next model
            }
          }

          // Rate limit handling (HTTP 429)
          if (response.status === 429) {
            console.warn(`[GeminiAI] Quota limit (429) on ${currentModel} (key #${kIdx + 1}).`);

            const hasNextKey = (kIdx + 1 < apiKeys.length);
            const hasNextModel = (mIdx + 1 < modelChain.length);

            // If another key or fallback model is available, switch immediately!
            if (hasNextKey || hasNextModel) {
              failoverNoticeGiven = true;
              continue;
            }

            // Otherwise, perform standard backoff retry for burst limits
            await wait(GEMINI_CONFIG.RETRY_DELAY_MS);
            response = await executeSingleFetch(url, requestBody, currentKey);

            if (response.status === 429) {
              return {
                error: 'RATE_LIMIT',
                model: currentModel,
                message: `Gemini daily quota reached for ${currentModel}. Wait for quota reset or switch API keys.`
              };
            }
          }

          // Parameter or model mismatch errors (HTTP 400: e.g. unsupported parameter, rejection)
          if (response.status === 400) {
            const errorJson = await response.json().catch(() => null);
            const detailMsg = errorJson && errorJson.error && errorJson.error.message;
            console.warn(`[GeminiAI] Model ${currentModel} returned 400 (Bad Request):`, detailMsg);

            // Failover to next candidate model if available
            if (mIdx + 1 < modelChain.length) {
              failoverNoticeGiven = true;
              continue; // Try next candidate model
            }

            if (kIdx + 1 < apiKeys.length) {
              continue; // Try next key
            }

            return {
              error: 'HTTP_ERROR',
              status: 400,
              message: detailMsg || `Model ${currentModel} could not process the request configuration.`
            };
          }

          // Auth errors (401, 403)
          if (response.status === 401 || response.status === 403) {
            const errorJson = await response.json().catch(() => null);
            console.error(`[GeminiAI] Auth Error on ${currentModel}:`, response.status, errorJson);
            if (kIdx + 1 < apiKeys.length) {
              continue; // Try next key if available
            }
            const detailMsg = errorJson && errorJson.error && errorJson.error.message;
            return {
              error: 'AUTH_ERROR',
              status: response.status,
              message: detailMsg || 'Invalid or restricted API key. Please verify your key.'
            };
          }

          // Server errors
          if (!response.ok) {
            const errorJson = await response.json().catch(() => null);
            console.error(`[GeminiAI] Server Error on ${currentModel}:`, response.status, errorJson);
            if (mIdx + 1 < modelChain.length) {
              failoverNoticeGiven = true;
              continue; // Try next candidate model
            }
            const detailMsg = errorJson && errorJson.error && errorJson.error.message;
            return {
              error: 'HTTP_ERROR',
              status: response.status,
              message: detailMsg || `AI service returned error status ${response.status}.`
            };
          }

          // Successful response parsing
          const data = await response.json();
          const candidate = data.candidates && data.candidates[0];
          const parts = (candidate && candidate.content && Array.isArray(candidate.content.parts))
            ? candidate.content.parts
            : [];

          const explanationText = parts
            .filter(p => !p.thought && typeof p.text === 'string')
            .map(p => p.text)
            .join('')
            .trim();

          if (!explanationText) {
            if (mIdx + 1 < modelChain.length) {
              continue;
            }
            return {
              error: 'EMPTY_RESPONSE',
              message: 'Received empty response from AI tutor.'
            };
          }

          // Cache explanation in memory and persistent localStorage
          if (global.AppState) {
            if (typeof global.AppState.cacheExplanation === 'function') {
              global.AppState.cacheExplanation(question.id, explanationText);
            } else if (global.AppState.session && global.AppState.session.explanations) {
              global.AppState.session.explanations[question.id] = explanationText;
            }
          }

          // Inform user if an automatic failover occurred to preserve study uninterrupted
          if (failoverNoticeGiven && currentModel !== modelChain[0]) {
            showToast(`Auto-switched to ${currentModel} to preserve quota.`, 'info', 4000);
          }

          return explanationText;

        } catch (err) {
          if (err && err.name === 'AbortError') {
            return {
              error: 'TIMEOUT',
              message: 'AI response timed out after 60 seconds.'
            };
          }

          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return {
              error: 'OFFLINE',
              message: 'Internet connection unavailable.'
            };
          }
        }
      }
    }

    return {
      error: 'RATE_LIMIT',
      message: 'Gemini free-tier quota exhausted across all available models. Please retry later or update your API key.'
    };
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
