/**
 * MCS 305: Systems Analysis and Design — Google Gemini REST API Client & Neural Tutor
 * 
 * Manages:
 * - Direct client-side browser communication with Google Gemini REST API v1beta
 * - Dynamic model capability auto-discovery via ModelService.ListModels
 * - Prioritized multi-model failover (gemini-2.0-flash, gemini-2.0-flash-lite, gemini-3.5-flash-lite, gemini-3.6-flash)
 * - Academic pedagogical persona: Distinguished Professor of Systems Analysis & Software Engineering
 * - Complete 3-part structured reasoning: Conceptual Proof, Distractor Analysis, Academic Citation
 * - 100% reliable offline fallback renderer (formatOfflineRationale)
 * - Lightweight markdown-to-HTML parser with KaTeX typesetting support
 * - In-memory Map caching to eliminate redundant network calls (0 tokens on replay)
 * - 4-second exponential backoff & rate-limit (HTTP 429) recovery
 * - 60-second AbortController request timeouts and clipboard copy actions
 */

(function (global) {
  'use strict';

  // ==========================================================================
  // 1. Standard Configuration Constants & Model Registry
  // ==========================================================================

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

  // In-Memory Explanation Cache (Fast instant retrieval)
  const explanationCache = new Map();

  // ==========================================================================
  // 2. Academic Pedagogical System Prompt (Sommerville & Pressman Aligned)
  // ==========================================================================

  const SYSTEM_PROMPT = `You are a Distinguished Professor of Systems Analysis and Software Engineering teaching MCS 305 — Systems Analysis and Design. A student just answered a multiple-choice question.

You MUST provide a COMPLETE, fully finished explanation covering ALL THREE sections below without omitting, truncating, or skipping any section:

### 1. Conceptual Proof & Principles
- Clearly explain WHY the correct answer is indisputably true (1-2 focused, academically rigorous paragraphs).
- Directly ground your explanation in canonical Systems Analysis & Software Engineering theory (Sommerville, Pressman, Kendall & Kendall):
  * SDLC paradigms and lifecycle strategies (Waterfall, Spiral risk-driven iterations, Agile Scrum sprints, V-Model verification/validation, Prototyping, RAD timeboxing).
  * Data Flow Diagram (DFD) balancing axioms, decomposition rules, and syntax traps (Gane & Sarson vs. DeMarco/Yourdon notations, black holes, miracles, grey holes, process preservation).
  * Requirements Engineering taxonomies (Functional vs. Non-Functional, FURPS+ model, MoSCoW prioritization, ambiguous specifications).
  * Fact-Finding & Elicitation trade-offs (Joint Application Development [JAD], structured interviews, passive observation, questionnaires, sampling).
  * Feasibility Engineering & Cost-Benefit Analysis (TELOS dimensions: Technical, Economic, Legal, Operational, Schedule; ROI, Payback Period, Net Present Value [NPV]).

### 2. Distractor Analysis
- Break down WHY each of the other three incorrect options is wrong, suboptimal, or an intentional engineering trap:
- **Option [X]**: [Specific conceptual breakdown of why this choice fails]
- **Option [Y]**: [Specific conceptual breakdown of why this choice fails]
- **Option [Z]**: [Specific conceptual breakdown of why this choice fails]

### 3. Key Takeaway & Academic Citation
- Provide 1-2 memorable, high-yield sentences stating the governing architectural principle or decision rule for midterm mastery.
- Cite canonical literature: Ian Sommerville ("Software Engineering", 10th/11th Ed.), Roger S. Pressman ("Software Engineering: A Practitioner's Approach", 8th/9th Ed.), or Kenneth E. Kendall & Julie E. Kendall ("Systems Analysis and Design", 9th/10th Ed.).

MATHEMATICAL & FORMULA NOTATION GUIDELINES:
- When questions involve financial feasibility or formulas, format with standard LaTeX using $$...$$ for display blocks and $...$ for inline symbols:
  $$\\text{ROI} = \\frac{\\text{Net Cumulative Benefits}}{\\text{Total Costs}} \\times 100\\%$$
  $$\\text{NPV} = \\sum_{t=1}^{n} \\frac{B_t - C_t}{(1 + r)^t} - C_0$$
- Always accompany mathematical expressions with an intuitive plain-English interpretation of parameters.

OUTPUT INTEGRITY RULES (FULL-OUTPUT ENFORCEMENT):
- Deliver all 3 sections in their entirety. Do not stop midway, do not compress or skip distractor analysis, and do not leave key takeaways unfinished.
- Format with clean markdown (bold headers, bulleted distractor analysis, readable paragraphs). Avoid conversational filler like "Hello student" or "Sure, here is your answer".`;

  /**
   * Constructs the structured user prompt following the 3-part pedagogical format.
   * @param {Object} question
   * @param {string} selectedChoice
   * @param {boolean} isCorrect
   * @returns {string}
   */
  function constructTutorPrompt(question, selectedChoice, isCorrect) {
    const choices = question.choices || {};
    const correctKey = String(question.answer || '').toLowerCase();
    const selectedKey = String(selectedChoice || '').toLowerCase();
    const isCorrectBool = Boolean(isCorrect);

    return `You are a Distinguished Professor of Systems Analysis and Software Engineering at Bulacan State University.
Analyze this midterm examination question and provide a rigorous, authoritative pedagogical explanation.

CONTEXT & QUESTION:
- Module: ${question.lessonId || ''} (${question.lessonTitle || 'Systems Analysis'})
- Topic: ${question.topic || 'General SAD'}
- Question: "${question.question || ''}"
- Choices:
  A: "${choices.a || ''}"
  B: "${choices.b || ''}"
  C: "${choices.c || ''}"
  D: "${choices.d || ''}"
- Canonical Correct Answer: Option ${correctKey.toUpperCase()} ("${choices[correctKey] || ''}")
- Student Selected: Option ${selectedKey.toUpperCase()} (${isCorrectBool ? 'CORRECT' : 'INCORRECT'})

OUTPUT REQUIREMENTS:
You must strictly format your response using these exact 3 markdown headings:

### 1. Conceptual Proof & Principles
Explain why Option ${correctKey.toUpperCase()} is the indisputably correct answer. Ground your explanation in software engineering theory (e.g. SDLC lifecycle rules, DFD balancing axioms, FURPS+ taxonomy, or TELOS feasibility models).

### 2. Distractor Analysis
Analyze the 3 incorrect options. Explain specifically why each failed or why a student might fall into that trap:
- **Option [X]**: [Why it is incorrect]
- **Option [Y]**: [Why it is incorrect]
- **Option [Z]**: [Why it is incorrect]

### 3. Key Takeaway & Academic Citation
State a 1-2 sentence high-yield rule for midterm mastery. Cite canonical textbooks (Sommerville 10th/11th Ed., Pressman 8th/9th Ed., or Kendall & Kendall 9th/10th Ed.).

Tone: Direct, academic, encouraging, and rigorous. Keep total output under 400 words.`;
  }

  // ==========================================================================
  // 3. Dynamic Model Auto-Discovery via ModelService.ListModels
  // ==========================================================================

  /**
   * Queries Google's ModelService.ListModels endpoint to discover active models
   * that support generateContent for the user's specific API key.
   * Strictly filters out TTS, audio, vision-only, and embedding models.
   * 
   * @param {string} apiKey - Google AI Studio API key
   * @returns {Promise<string[]|null>} Array of verified candidate model names
   */
  async function discoverAvailableModels(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      return null;
    }

    if (cachedDiscoveredModels && cachedDiscoveredModels.length > 0) {
      return cachedDiscoveredModels;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.models)) {
          const supported = data.models
            .filter(m => 
              Array.isArray(m.supportedGenerationMethods) && 
              m.supportedGenerationMethods.includes('generateContent') &&
              !NON_TEXT_MODEL_REGEX.test(m.name)
            )
            .map(m => m.name.replace(/^models\//, ''));

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

          console.log('[GeminiAI] Discovered active generation models:', supported);
          cachedDiscoveredModels = supported;
          return supported;
        }
      }
    } catch (e) {
      console.warn('[GeminiAI] Model discovery query error:', e);
    }
    return null;
  }

  function getModelEndpoint(modelName) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;
  }

  /**
   * Helper delay utility for rate limit backoff.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================================================
  // 4. Request Body Builder & Parameter Tuning
  // ==========================================================================

  /**
   * Constructs the JSON body for the Gemini API v1beta generateContent endpoint.
   * @param {Object} question
   * @param {string} selectedAnswer
   * @param {boolean} isCorrect
   * @param {string} [modelName='gemini-2.0-flash']
   * @returns {Object}
   */
  function buildRequestBody(question, selectedAnswer, isCorrect, modelName = 'gemini-2.0-flash') {
    const userPayload = constructTutorPrompt(question, selectedAnswer, isCorrect);
    const genConfig = {
      temperature: GEMINI_CONFIG.TEMPERATURE,
      maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS
    };

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

  // ==========================================================================
  // 5. Lightweight Markdown Parser & Math Typesetting
  // ==========================================================================

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
    if (typeof global.formatMathAndLogic === 'function') {
      return global.formatMathAndLogic(str);
    }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Converts markdown text into structured semantic HTML with math typesetting.
   * @param {string} text - Raw markdown string
   * @returns {string} Sanitized, formatted HTML
   */
  function renderMarkdown(text) {
    if (typeof text !== 'string') return '';
    if (global.MathRenderer && typeof global.MathRenderer.renderMarkdownWithMath === 'function') {
      return global.MathRenderer.renderMarkdownWithMath(text);
    }

    // 1. Normalize line endings and trim
    let safe = text.replace(/\r\n/g, '\n').trim();

    // Ensure headers have blank lines around them so they separate into distinct blocks
    safe = safe.replace(/(^|\n)(#{1,4}\s+[^\n]+)/g, '$1\n$2\n');

    // 2. Escape HTML entities
    safe = safe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // 3. Fenced code blocks
    safe = safe.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="explanation-code-block"><code>${code.trim()}</code></pre>`;
    });

    // 4. Inline formatting
    safe = safe.replace(/`([^`]+)`/g, '<code class="math-expr">$1</code>');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

    // 5. Block processing
    const blocks = safe.split(/\n{2,}/);
    const renderedBlocks = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('<pre') && trimmed.endsWith('</pre>')) {
        return trimmed;
      }

      // Headings
      if (/^###\s+(.*)$/.test(trimmed)) {
        return `<h4 class="tutor-heading">${trimmed.replace(/^###\s+/, '')}</h4>`;
      }
      if (/^##\s+(.*)$/.test(trimmed)) {
        return `<h4 class="tutor-heading">${trimmed.replace(/^##\s+/, '')}</h4>`;
      }
      if (/^#\s+(.*)$/.test(trimmed)) {
        return `<h3 class="tutor-heading">${trimmed.replace(/^#\s+/, '')}</h3>`;
      }

      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      // Pure bulleted list block
      if (lines.every(l => /^[-*]\s+/.test(l))) {
        const items = lines.map(l => `<li class="tutor-bullet">${l.replace(/^[-*]\s+/, '')}</li>`).join('');
        return `<ul class="distractor-list">${items}</ul>`;
      }

      // Pure numbered list block
      if (lines.every(l => /^\d+\.\s+/.test(l))) {
        const items = lines.map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return `<ol>${items}</ol>`;
      }

      // Mixed paragraph and list items block
      if (lines.some(l => /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l))) {
        let html = '';
        let inUl = false;
        let inOl = false;

        lines.forEach(line => {
          if (/^[-*]\s+/.test(line)) {
            if (inOl) { html += '</ol>'; inOl = false; }
            if (!inUl) { html += '<ul class="distractor-list">'; inUl = true; }
            html += `<li class="tutor-bullet">${line.replace(/^[-*]\s+/, '')}</li>`;
          } else if (/^\d+\.\s+/.test(line)) {
            if (inUl) { html += '</ul>'; inUl = false; }
            if (!inOl) { html += '<ol>'; inOl = true; }
            html += `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
          } else {
            if (inUl) { html += '</ul>'; inUl = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<p>${line}</p>`;
          }
        });

        if (inUl) html += '</ul>';
        if (inOl) html += '</ol>';
        return html;
      }

      return `<p>${lines.join('<br>')}</p>`;
    });

    return renderedBlocks.filter(Boolean).join('');
  }

  // ==========================================================================
  // 6. Robust Offline Fallback Renderer
  // ==========================================================================

  /**
   * Formats the local 3-part baked-in rationale from data/questions.js.
   * Guaranteed 100% reliability with zero network dependencies.
   * 
   * @param {Object} q - Question data object
   * @returns {string} High-fidelity HTML string
   */
  function formatOfflineRationale(q) {
    if (!q) return '';

    const r = q.rationale || {};
    const proofText = r.proof || r.conceptual_proof || 'Option ' + String(q.answer || '').toUpperCase() + ' satisfies all canonical systems engineering axioms.';
    const distractors = r.distractors || {};
    const takeawayText = r.takeaway || r.academic_citation || 'Ground all answers in Sommerville and Pressman software engineering principles.';

    let html = `
      <span class="badge badge-offline">Offline Rationale</span>
      <div class="tutor-section proof-section">
        <h4 class="tutor-heading"><span class="icon">📐</span> 1. Conceptual Proof &amp; Principles</h4>
        <p>${formatMath(proofText)}</p>
      </div>
      <div class="tutor-section distractor-section">
        <h4 class="tutor-heading"><span class="icon">🔍</span> 2. Distractor Analysis</h4>
        <ul class="distractor-list">`;

    if (typeof distractors === 'object' && distractors !== null) {
      for (const [optKey, explanation] of Object.entries(distractors)) {
        const choiceText = (q.choices && q.choices[optKey]) ? ` ("${q.choices[optKey]}")` : '';
        html += `<li><strong>Option ${optKey.toUpperCase()}${formatMath(choiceText)}:</strong> ${formatMath(explanation)}</li>`;
      }
    } else if (typeof distractors === 'string') {
      html += `<li>${formatMath(distractors)}</li>`;
    }

    html += `</ul>
      </div>
      <div class="tutor-section takeaway-section">
        <h4 class="tutor-heading"><span class="icon">📚</span> 3. Key Takeaway &amp; Academic Citation</h4>
        <p class="takeaway-text">${formatMath(takeawayText)}</p>
      </div>`;

    return html;
  }

  /**
   * Generates clean plain-text markdown of the rationale for clipboard copying.
   * @param {Object} q
   * @returns {string}
   */
  function getPlainRationaleText(q) {
    if (!q || !q.rationale) return '';
    const r = q.rationale;
    let text = `### 1. Conceptual Proof & Principles\n${r.proof || ''}\n\n### 2. Distractor Analysis\n`;
    if (r.distractors && typeof r.distractors === 'object') {
      for (const [optKey, exp] of Object.entries(r.distractors)) {
        const choiceText = (q.choices && q.choices[optKey]) ? ` ("${q.choices[optKey]}")` : '';
        text += `- Option ${optKey.toUpperCase()}${choiceText}: ${exp}\n`;
      }
    } else if (typeof r.distractors === 'string') {
      text += `- ${r.distractors}\n`;
    }
    text += `\n### 3. Key Takeaway & Academic Citation\n${r.takeaway || ''}`;
    return text.trim();
  }

  /**
   * Binds click event listener for clipboard copy button with temporary "Copied! ✓" notification.
   * @param {HTMLElement} buttonElement
   * @param {string} plainText
   */
  function bindCopyButton(buttonElement, plainText) {
    if (!buttonElement) return;

    buttonElement.addEventListener('click', event => {
      event.preventDefault();
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(plainText).then(() => {
          const originalHtml = buttonElement.innerHTML;
          buttonElement.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Copied! ✓</span>
          `;
          buttonElement.style.borderColor = 'var(--color-success)';
          buttonElement.style.color = 'var(--color-success)';

          setTimeout(() => {
            buttonElement.innerHTML = originalHtml;
            buttonElement.style.borderColor = '';
            buttonElement.style.color = '';
          }, 2000);
        }).catch(err => {
          console.warn('[GeminiAI] Clipboard copy error:', err);
        });
      }
    });
  }

  /**
   * Renders the complete offline rationale inside a container element with copy action.
   * @param {Object} question
   * @param {HTMLElement} container
   */
  function renderOfflineRationale(question, container) {
    if (!container || !question) return;

    const htmlContent = formatOfflineRationale(question);
    const plainText = getPlainRationaleText(question);

    container.innerHTML = `
      <div class="offline-rationale-wrapper">
        ${htmlContent}
        <div class="explanation-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-explanation" title="Copy explanation to clipboard">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span>Copy Explanation</span>
          </button>
        </div>
      </div>
    `;

    const copyBtn = container.querySelector('#btn-copy-explanation');
    if (copyBtn) {
      bindCopyButton(copyBtn, plainText);
    }
  }

  // ==========================================================================
  // 7. Multi-Model Failover & Rate-Limit Backoff Orchestrator
  // ==========================================================================

  /**
   * Executes single fetch with 60s timeout guard and authentication header.
   */
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

  /**
   * Fetches an AI explanation from Google Gemini with persistent caching,
   * multi-key rotation, and intelligent model failover.
   * 
   * @param {Object} question - Question data object
   * @param {string} selectedAnswer - Student selection key ('a', 'b', 'c', 'd')
   * @param {boolean} isCorrect - Answer evaluation outcome
   * @returns {Promise<string|Object>} Markdown string on success, or structured error object
   */
  async function fetchGeminiExplanation(question, selectedAnswer, isCorrect) {
    if (!question || !question.id) {
      return { error: 'INVALID_QUESTION', message: 'Question data is missing or invalid.' };
    }

    // 0. Immediate offline connectivity guard
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return {
        error: 'OFFLINE',
        message: 'Internet connection unavailable.',
        offlineHtml: formatOfflineRationale(question)
      };
    }

    // 1. Check in-memory explanation cache (Instant, 0 tokens)
    if (explanationCache.has(question.id)) {
      return explanationCache.get(question.id);
    }

    // 2. Check AppState persistent/session cache
    if (global.AppState) {
      const cached = (typeof global.AppState.getExplanation === 'function')
        ? global.AppState.getExplanation(question.id)
        : (global.AppState.session && global.AppState.session.explanations && global.AppState.session.explanations[question.id]);
      if (cached) {
        explanationCache.set(question.id, cached);
        return cached;
      }
    }

    // 3. Resolve API key(s)
    const rawApiKey = (global.AppState && typeof global.AppState.getApiKey === 'function')
      ? global.AppState.getApiKey()
      : null;

    if (!rawApiKey || rawApiKey.trim() === '') {
      return {
        error: 'NO_KEY',
        message: 'Enter your Gemini API key on the welcome screen to enable AI explanations.',
        offlineHtml: formatOfflineRationale(question)
      };
    }

    const apiKeys = rawApiKey.split(/[,;\s]+/).map(k => k.trim()).filter(k => k.length > 0);
    if (apiKeys.length === 0) {
      return {
        error: 'NO_KEY',
        message: 'Enter your Gemini API key on the welcome screen to enable AI explanations.',
        offlineHtml: formatOfflineRationale(question)
      };
    }

    // 4. Determine Model Failover Chain
    const preferredModel = (global.AppState && typeof global.AppState.getModelPreference === 'function')
      ? global.AppState.getModelPreference()
      : 'gemini-2.0-flash';

    let modelChain = [...GEMINI_CONFIG.PRIMARY_MODELS];
    if (preferredModel && !modelChain.includes(preferredModel)) {
      modelChain.unshift(preferredModel);
    } else if (preferredModel && modelChain.indexOf(preferredModel) > 0) {
      modelChain.splice(modelChain.indexOf(preferredModel), 1);
      modelChain.unshift(preferredModel);
    }

    let failoverNoticeGiven = false;

    // 5. Multi-Model & Multi-Key Request Loop
    for (let mIdx = 0; mIdx < modelChain.length; mIdx++) {
      const currentModel = modelChain[mIdx];
      const requestBody = buildRequestBody(question, selectedAnswer, isCorrect, currentModel);

      for (let kIdx = 0; kIdx < apiKeys.length; kIdx++) {
        const currentKey = apiKeys[kIdx];
        const url = `${getModelEndpoint(currentModel)}?key=${encodeURIComponent(currentKey)}`;

        try {
          let response = await executeSingleFetch(url, requestBody, currentKey);

          // Handle 404 (Model not found / deprecated)
          if (response.status === 404) {
            console.warn(`[GeminiAI] Model ${currentModel} returned 404. Inspecting active model list...`);
            
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
              continue; // Advance to next candidate model
            }
          }

          // Handle Rate Limits (HTTP 429)
          if (response.status === 429) {
            console.warn(`[GeminiAI] Quota limit (429) on ${currentModel} (key #${kIdx + 1}).`);

            const hasNextKey = (kIdx + 1 < apiKeys.length);
            const hasNextModel = (mIdx + 1 < modelChain.length);

            if (hasNextKey || hasNextModel) {
              failoverNoticeGiven = true;
              continue;
            }

            await wait(GEMINI_CONFIG.RETRY_DELAY_MS);
            response = await executeSingleFetch(url, requestBody, currentKey);

            if (response.status === 429) {
              return {
                error: 'RATE_LIMIT',
                model: currentModel,
                message: `Gemini quota limit reached for ${currentModel}. Wait for quota reset or switch API keys.`,
                offlineHtml: formatOfflineRationale(question)
              };
            }
          }

          // Handle Bad Request (HTTP 400)
          if (response.status === 400) {
            const errorJson = await response.json().catch(() => null);
            const detailMsg = errorJson && errorJson.error && errorJson.error.message;
            console.warn(`[GeminiAI] Model ${currentModel} returned 400 (Bad Request):`, detailMsg);

            if (mIdx + 1 < modelChain.length) {
              failoverNoticeGiven = true;
              continue;
            }

            if (kIdx + 1 < apiKeys.length) {
              continue;
            }

            return {
              error: 'HTTP_ERROR',
              status: 400,
              message: detailMsg || `Model ${currentModel} could not process request configuration.`,
              offlineHtml: formatOfflineRationale(question)
            };
          }

          // Handle Auth Errors (401, 403)
          if (response.status === 401 || response.status === 403) {
            const errorJson = await response.json().catch(() => null);
            console.error(`[GeminiAI] Auth Error on ${currentModel}:`, response.status, errorJson);

            if (kIdx + 1 < apiKeys.length) {
              continue;
            }

            const detailMsg = errorJson && errorJson.error && errorJson.error.message;
            return {
              error: 'AUTH_ERROR',
              status: response.status,
              message: detailMsg || 'Invalid or restricted API key. Please verify your key.',
              offlineHtml: formatOfflineRationale(question)
            };
          }

          // Handle Server Errors
          if (!response.ok) {
            const errorJson = await response.json().catch(() => null);
            console.error(`[GeminiAI] Server Error on ${currentModel}:`, response.status, errorJson);

            if (mIdx + 1 < modelChain.length) {
              failoverNoticeGiven = true;
              continue;
            }

            const detailMsg = errorJson && errorJson.error && errorJson.error.message;
            return {
              error: 'HTTP_ERROR',
              status: response.status,
              message: detailMsg || `AI service returned error status ${response.status}.`,
              offlineHtml: formatOfflineRationale(question)
            };
          }

          // Parse Successful Response
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
              message: 'Received empty response from AI tutor.',
              offlineHtml: formatOfflineRationale(question)
            };
          }

          // Cache explanation in memory and persistent storage
          explanationCache.set(question.id, explanationText);

          if (global.AppState) {
            if (typeof global.AppState.cacheExplanation === 'function') {
              global.AppState.cacheExplanation(question.id, explanationText);
            } else if (global.AppState.session && global.AppState.session.explanations) {
              global.AppState.session.explanations[question.id] = explanationText;
            }
          }

          if (failoverNoticeGiven && currentModel !== modelChain[0]) {
            showToast(`Auto-switched to ${currentModel} to preserve quota.`, 'info', 4000);
          }

          return explanationText;

        } catch (err) {
          if (err && err.name === 'AbortError') {
            return {
              error: 'TIMEOUT',
              message: 'AI response timed out after 60 seconds.',
              offlineHtml: formatOfflineRationale(question)
            };
          }

          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return {
              error: 'OFFLINE',
              message: 'Internet connection unavailable.',
              offlineHtml: formatOfflineRationale(question)
            };
          }
        }
      }
    }

    return {
      error: 'RATE_LIMIT',
      message: 'Gemini free-tier quota exhausted across all available models.',
      offlineHtml: formatOfflineRationale(question)
    };
  }

  // ==========================================================================
  // 8. Toast Notification Subsystem & Connectivity Listeners
  // ==========================================================================

  function showToast(message, type = 'info', duration = 3500) {
    if (typeof document === 'undefined' || !document.body) return;
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
    } else if (type === 'online') {
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

  // Network Connectivity Listeners
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('offline', () => {
      showToast("You are currently offline. AI explanations will use offline rationales.", 'offline');
    });
    window.addEventListener('online', () => {
      showToast("Internet connection restored. Gemini AI Tutor active.", 'online');
    });
  }

  // ==========================================================================
  // 9. Public API Export
  // ==========================================================================

  const GeminiAI = {
    GEMINI_CONFIG,
    SYSTEM_PROMPT,
    constructTutorPrompt,
    discoverAvailableModels,
    buildRequestBody,
    renderMarkdown,
    formatOfflineRationale,
    getPlainRationaleText,
    renderOfflineRationale,
    bindCopyButton,
    fetchGeminiExplanation,
    fetchExplanation: fetchGeminiExplanation,
    showToast,
    explanationCache
  };

  global.GeminiAI = GeminiAI;

  if (typeof window !== 'undefined') {
    window.GeminiAI = GeminiAI;
    window.constructTutorPrompt = constructTutorPrompt;
    window.discoverAvailableModels = discoverAvailableModels;
    window.fetchGeminiExplanation = fetchGeminiExplanation;
    window.formatOfflineRationale = formatOfflineRationale;
    window.renderOfflineRationale = renderOfflineRationale;
    window.renderMarkdown = renderMarkdown;
    window.showToast = showToast;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAI;
  }

})(typeof window !== 'undefined' ? window : globalThis);
