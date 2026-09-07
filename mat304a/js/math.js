/**
 * MAT 304a Midterm Reviewer — Mathematical Typesetting & LaTeX Engine
 * 
 * Provides:
 * - High-fidelity KaTeX rendering for LaTeX display blocks ($$...$$) and inline math ($...$)
 * - Resilient offline fallback parser converting LaTeX macros and mathematical symbols
 *   to clean semantic HTML/Unicode so equations never display as raw unrendered code
 * - Formatting for AI Foundations, Search, Logic, CSP, and Utility evaluations
 */

(function (global) {
  'use strict';

  /**
   * Escape HTML entities to protect against XSS before math parsing.
   * @param {string} str 
   * @returns {string}
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
   * Checks if KaTeX library is loaded in the browser environment.
   * @returns {boolean}
   */
  function isKaTeXAvailable() {
    return typeof global.katex !== 'undefined' && typeof global.katex.renderToString === 'function';
  }

  /**
   * Render a LaTeX expression using KaTeX if available, or fallback gracefully.
   * @param {string} latex - Raw LaTeX math expression
   * @param {boolean} displayMode - True for standalone block equation, false for inline
   * @returns {string} Formatted HTML string
   */
  function renderLatex(latex, displayMode) {
    const trimmed = (latex || '').trim();
    if (!trimmed) return '';

    if (isKaTeXAvailable()) {
      try {
        return global.katex.renderToString(trimmed, {
          displayMode: Boolean(displayMode),
          throwOnError: false,
          output: 'htmlAndMathml'
        });
      } catch (err) {
        console.warn('[MathRenderer] KaTeX render error, using fallback:', err);
      }
    }

    // Resilient Offline Fallback: converts common LaTeX macros into readable Unicode/HTML
    return fallbackLatexToHtml(trimmed, displayMode);
  }

  /**
   * Converts LaTeX expressions to elegant Unicode + semantic HTML tags.
   * Ensures equations look clean and human-readable even when offline or if CDN is blocked.
   * @param {string} expr - LaTeX formula string
   * @param {boolean} displayMode 
   * @returns {string} Formatted HTML
   */
  function fallbackLatexToHtml(expr, displayMode) {
    let s = expr;

    // 1. Text environments: \text{...}, \mathrm{...}, \operatorname{...}
    s = s.replace(/\\(?:text|mathrm|operatorname)\{([^}]+)\}/g, '$1');

    // 2. Left / right delimiter sizing (must run before \le replacement)
    s = s.replace(/\\left\s*([(\[{|.])?/g, (_, c) => (!c || c === '.' ? '' : c));
    s = s.replace(/\\right\s*([)\]}|.])?/g, (_, c) => (!c || c === '.' ? '' : c));

    // 3. Common operators & functions with word boundaries
    s = s.replace(/\\arg\\max\b/g, 'argmax');
    s = s.replace(/\\max\b/g, 'max');
    s = s.replace(/\\min\b/g, 'min');
    s = s.replace(/\\mathbb\{E\}/g, '𝔼');
    s = s.replace(/\\mathbb\{R\}/g, 'ℝ');
    s = s.replace(/\\mathbb\{N\}/g, 'ℕ');
    s = s.replace(/\\mathcal\{([A-Za-z])\}/g, '$1');

    // 4. Greek letters & symbols
    s = s.replace(/\\alpha\b/g, 'α');
    s = s.replace(/\\beta\b/g, 'β');
    s = s.replace(/\\gamma\b/g, 'γ');
    s = s.replace(/\\delta\b/g, 'δ');
    s = s.replace(/\\epsilon\b/g, 'ε');
    s = s.replace(/\\theta\b/g, 'θ');
    s = s.replace(/\\pi\b/g, 'π');
    s = s.replace(/\\sigma\b/g, 'σ');
    s = s.replace(/\\infty\b/g, '∞');

    // 5. Logic & set operators
    s = s.replace(/\\(?:land|wedge)\b/g, '∧');
    s = s.replace(/\\(?:lor|vee)\b/g, '∨');
    s = s.replace(/\\(?:neg|lnot)\b/g, '¬');
    s = s.replace(/\\(?:rightarrow|to)\b/g, '→');
    s = s.replace(/\\models\b/g, '⊨');
    s = s.replace(/\\vdash\b/g, '⊢');
    s = s.replace(/\\in\b/g, '∈');
    s = s.replace(/\\notin\b/g, '∉');
    s = s.replace(/\\forall\b/g, '∀');
    s = s.replace(/\\exists\b/g, '∃');
    s = s.replace(/\\emptyset\b/g, '∅');
    s = s.replace(/\\subset\b/g, '⊂');
    s = s.replace(/\\subseteq\b/g, '⊆');

    // 6. Relations & delimiters
    s = s.replace(/\\leq\b|\\le\b/g, '≤');
    s = s.replace(/\\geq\b|\\ge\b/g, '≥');
    s = s.replace(/\\neq\b/g, '≠');
    s = s.replace(/\\times\b/g, '×');
    s = s.replace(/\\cdot\b/g, '·');
    s = s.replace(/\\mid\b/g, '|');

    // 7. Fractions: \frac{num}{den} -> (num / den)
    s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

    // 8. Superscripts & Subscripts, primes
    s = s.replace(/\^,/g, "'");
    s = s.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
    s = s.replace(/_([a-zA-Z0-9+\-*])/g, '<sub>$1</sub>');
    s = s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
    s = s.replace(/\^([a-zA-Z0-9+\-*])/g, '<sup>$1</sup>');

    // Clean remaining backslashes for unknown macros
    s = s.replace(/\\([a-zA-Z]+)/g, '$1');
    s = s.replace(/\s+/g, ' ').trim();

    if (displayMode) {
      return `<div class="katex-fallback-display"><span class="math-expr display-math">${s}</span></div>`;
    }
    return `<span class="math-expr inline-math">${s}</span>`;
  }

  /**
   * Stash-and-token replacement utility to prevent recursive replacements.
   */
  function createStash() {
    const tokens = [];
    return {
      stash(html) {
        tokens.push(html);
        return `\uFFF0${tokens.length - 1}\uFFF1`;
      },
      restore(str) {
        let prev;
        let out = str;
        do {
          prev = out;
          out = out.replace(/\uFFF0(\d+)\uFFF1/g, function (_, i) {
            return tokens[parseInt(i, 10)] || '';
          });
        } while (out !== prev && /\uFFF0\d+\uFFF1/.test(out));
        return out;
      }
    };
  }

  /**
   * Main entry point to parse and render math in text (used for question stems & choices).
   * Handles:
   * 1. LaTeX display blocks: $$...$$ or \[...\]
   * 2. LaTeX inline formulas: $...$ or \(...\)
   * 3. AI course heuristics, evaluations, logic propositions, and graph transitions
   * 
   * @param {string} input - Raw text string
   * @returns {string} HTML with rendered math
   */
  function render(input) {
    if (typeof input !== 'string') return '';
    let str = input.trim();
    if (!str) return '';

    const stasher = createStash();

    // 1. Process explicit LaTeX block math: $$...$$ and \[...\]
    str = str.replace(/\$\$([\s\S]*?)\$\$/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, true));
    });
    str = str.replace(/\\\[([\s\S]*?)\\\]/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, true));
    });

    // 2. Process explicit LaTeX inline math: $...$ and \(...\)
    // Avoid accidental currency matches by requiring non-whitespace right after opening $ and before closing $
    str = str.replace(/\$([^\$\n]+?)\$/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, false));
    });
    str = str.replace(/\\\(([\s\S]*?)\\\)/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, false));
    });

    // 3. Escape the remaining plain HTML text to protect against XSS
    let safe = escapeHtml(str);

    function stashMathSpan(text) {
      const clean = text.replace(/<\/?span[^>]*>/g, '').trim();
      if (!clean) return text;
      return stasher.stash(`<span class="math-expr">${clean}</span>`);
    }

    // 4. State-space graph transition paths: S -(3)→ A -(2)→ C -(6)→ G, S → A → G
    safe = safe.replace(/([A-Z]\s*-\([^)]+\)→\s*[A-Z](?:\s*-\([^)]+\)→\s*[A-Z])*)/g, stashMathSpan);
    safe = safe.replace(/([A-Z]\s*→\s*[A-Z](?:\s*→\s*[A-Z])*)/g, stashMathSpan);

    // 5. Quantified First-Order Logic sentences (e.g. ∃x (Prof(x) ∧ ...), ∀x ∀b ...)
    safe = safe.replace(/([∀∃][a-zA-Z0-9_]+\s*(?:[∀∃][a-zA-Z0-9_]+\s*)*(?:\([^)]*(?:\([^)]*\)[^)]*)*\)|[A-Za-z0-9_(),∧∨¬→\s]+))/g, function (match) {
      const trimmed = match.trim();
      if (/[∧∨¬→]/.test(trimmed)) {
        return stashMathSpan(trimmed);
      }
      return match;
    });

    // 6. Propositional logic connectives and entailments: KB ⊨ α, KB ⊢ α, (P ∨ Q) ∧ (¬R), P → R
    const logicConnectiveRegex = /(?:¬?[A-Za-z0-9_αβγδθπλσ]+(?:\([a-zA-Z0-9_,\s]*\))?|\([^)]+\))(?:\s*[∧∨→⊨⊢↔]\s*(?:¬?[A-Za-z0-9_αβγδθπλσ]+(?:\([a-zA-Z0-9_,\s]*\))?|\([^)]+\)))+/g;
    safe = safe.replace(logicConnectiveRegex, stashMathSpan);

    // 7. Standalone negated clauses/literals: ¬R, ¬Studies(Mia), ¬Student(x)
    safe = safe.replace(/(\b¬[A-Za-z0-9_αβγδθπλσ]+(?:\([a-zA-Z0-9_,\s]*\))?)/g, stashMathSpan);

    // 8. Inequality relations: X ≠ Y
    safe = safe.replace(/(\b[A-Za-z0-9_]+\s*≠\s*[A-Za-z0-9_]+\b)/g, stashMathSpan);

    // 9. Search Evaluation Equations: f(n) = g(n) + h(n), f = g + h, (g, h) = (5, 4), h*(n) = 9
    safe = safe.replace(/\b(f\s*=\s*g\s*\+\s*h)\b/g, stashMathSpan);
    safe = safe.replace(/(\(g,\s*h\)\s*=\s*\(\d+,\s*\d+\))/g, stashMathSpan);
    safe = safe.replace(/([fgh]\*?\([a-zA-Z0-9*]+\)\s*(?:=|≠|&lt;=|&gt;=|<=|>=|[+−\-])\s*[a-zA-Z0-9_*()+\-−/]+(?:\s*[+−\-]\s*[a-zA-Z0-9_*()]+)*)/g, stashMathSpan);
    safe = safe.replace(/\b([fgh]\([a-zA-Z0-9*]+\)|h\*\(n\)|h\*(n))\b/g, stashMathSpan);

    // 10. CSP Domains & Set notation: D_A = {R, G, B}, X ≠ Y
    safe = safe.replace(/(D_[A-Za-z](\s*=\s*D_[A-Za-z])*\s*=\s*\{[^}]+\})/g, stashMathSpan);
    safe = safe.replace(/(D_[A-Za-z]\s*=\s*\{[^}]+\})/g, stashMathSpan);
    safe = safe.replace(/\b(D_[A-Za-z])\b/g, stashMathSpan);
    safe = safe.replace(/(\{[a-zA-Z0-9_/,\s.\-]+\})/g, stashMathSpan);

    // 11. Arithmetic Expected Utility calculations: 0.6(70) + 0.4(20) = 50
    safe = safe.replace(/(\d+(\.\d+)?\(\d+\)\s*\+\s*\d+(\.\d+)?\(\d+\)\s*=\s*\d+)/g, stashMathSpan);

    // 12. Grid & Matrix dimensions: 9×9, 3×3
    safe = safe.replace(/(\b\d+×\d+\b)/g, stashMathSpan);

    // Restore stashed tokens
    return stasher.restore(safe);
  }

  /**
   * Specialized Markdown parser with full LaTeX block and inline math support.
   * Used for AI Explanations and Review screen explanations.
   * 
   * @param {string} markdownText 
   * @returns {string} Sanitized and fully rendered HTML
   */
  function renderMarkdownWithMath(markdownText) {
    if (typeof markdownText !== 'string') return '';

    let text = markdownText.replace(/\r\n/g, '\n').trim();
    if (!text) return '';

    const stasher = createStash();

    // 1. Stash fenced code blocks ```code```
    text = text.replace(/```([\s\S]*?)```/g, function (_, code) {
      const escaped = escapeHtml(code.trim());
      return stasher.stash(`<pre class="explanation-code-block"><code>${escaped}</code></pre>`);
    });

    // 2. Stash Display Math ($$...$$ and \[...\])
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, true));
    });
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, true));
    });

    // 3. Stash Inline Math ($...$ and \(...\))
    text = text.replace(/\$([^\$\n]+?)\$/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, false));
    });
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, function (_, latex) {
      return stasher.stash(renderLatex(latex, false));
    });

    // 4. Stash inline code tokens `code`
    text = text.replace(/`([^`]+)`/g, function (_, inlineCode) {
      return stasher.stash(`<code class="math-expr">${escapeHtml(inlineCode)}</code>`);
    });

    // Ensure headings have dedicated block boundaries
    text = text.replace(/(^|\n)(#{1,4}\s+[^\n]+)/g, '$1\n$2\n\n');

    // 5. Escape general HTML entities for XSS safety
    let safe = escapeHtml(text);

    // 6. Markdown typography: bold & italic (preserve bullet asterisks)
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^\s*])\*([^*\n]+)\*([^\s*]|$)/g, '$1<em>$2</em>$3');

    // 7. Block-level parsing (Headings, Lists, Paragraphs)
    const rawBlocks = safe.split(/\n{2,}/);
    const renderedBlocks = rawBlocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      // Check if block contains stashed pre or display-math block
      if (/^\uFFF0\d+\uFFF1$/.test(trimmed)) {
        return trimmed;
      }

      // Headings
      if (/^###\s+(.*)$/.test(trimmed)) {
        return `<h4>${trimmed.replace(/^###\s+/, '')}</h4>`;
      }
      if (/^##\s+(.*)$/.test(trimmed)) {
        return `<h3>${trimmed.replace(/^##\s+/, '')}</h3>`;
      }
      if (/^#\s+(.*)$/.test(trimmed)) {
        return `<h3>${trimmed.replace(/^#\s+/, '')}</h3>`;
      }

      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      // Bulleted list
      if (lines.every(l => /^[-*]\s+/.test(l))) {
        const items = lines.map(l => `<li>${l.replace(/^[-*]\s+/, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }

      // Numbered list
      if (lines.every(l => /^\d+\.\s+/.test(l))) {
        const items = lines.map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return `<ol>${items}</ol>`;
      }

      // Mixed list and paragraphs
      if (lines.some(l => /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l))) {
        let html = '';
        let inUl = false;
        let inOl = false;

        lines.forEach(line => {
          if (/^[-*]\s+/.test(line)) {
            if (inOl) { html += '</ol>'; inOl = false; }
            if (!inUl) { html += '<ul>'; inUl = true; }
            html += `<li>${line.replace(/^[-*]\s+/, '')}</li>`;
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

      // Standard paragraph
      return `<p>${lines.join('<br>')}</p>`;
    });

    const assembledHtml = renderedBlocks.filter(Boolean).join('');
    return stasher.restore(assembledHtml);
  }

  // Export to global window object
  const MathRenderer = {
    render,
    renderLatex,
    renderMarkdownWithMath,
    isKaTeXAvailable
  };

  global.MathRenderer = MathRenderer;
  global.formatMathAndLogic = render;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathRenderer;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
