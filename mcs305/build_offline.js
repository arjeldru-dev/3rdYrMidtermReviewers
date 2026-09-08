const fs = require('fs');
const path = require('path');

const mcs305Dir = __dirname;
const rootDir = path.resolve(mcs305Dir, '..');

console.log('[BuildOffline] Starting MCS 305 Standalone Offline Bundler...');

// Read base HTML
const indexPath = path.join(mcs305Dir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Read CSS
const cssPath = path.join(mcs305Dir, 'css', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Read question data and scripts
const scriptFiles = [
  { name: 'data/questions.js', path: path.join(mcs305Dir, 'data', 'questions.js'), label: '1. MCS 305 Canonical Question Bank (210 High-Yield Questions)' },
  { name: 'js/math.js', path: path.join(mcs305Dir, 'js', 'math.js'), label: '2. KaTeX Typesetting & Resilient Offline Math Fallback' },
  { name: 'js/state.js', path: path.join(mcs305Dir, 'js', 'state.js'), label: '3. Application State & Resilient Storage Engine' },
  { name: 'js/progress.js', path: path.join(mcs305Dir, 'js', 'progress.js'), label: '4. Progress & Mastery Analytics Tracker' },
  { name: 'js/quiz.js', path: path.join(mcs305Dir, 'js', 'quiz.js'), label: '5. Cognitive Active Recall Quiz Core' },
  { name: 'js/ai.js', path: path.join(mcs305Dir, 'js', 'ai.js'), label: '6. AI Neural Tutor & Offline Rationale Engine' },
  { name: 'js/feedback.js', path: path.join(mcs305Dir, 'js', 'feedback.js'), label: '7. Instant Feedback & Dynamic Audio Synthesis' },
  { name: 'js/results.js', path: path.join(mcs305Dir, 'js', 'results.js'), label: '8. Diagnostic Performance Breakdown & Score Engine' },
  { name: 'js/review.js', path: path.join(mcs305Dir, 'js', 'review.js'), label: '9. Question Review & Cognitive Misconception Inspector' }
];

// 1. Inline CSS
const cssTag = `<style>\n/* ==========================================================================\n   MCS 305 Software Engineering — Inlined Stylesheet for Offline Operation\n   ========================================================================== */\n${cssContent}\n</style>`;
html = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']css\/style\.css["']\s*\/?>/i, cssTag);

// 2. Safe FOUC / theme script (avoid window.location pathname redirect loop when opened as local file)
const safeThemeScript = `<script>
    (function() {
      try {
        var savedTheme = localStorage.getItem('MCS305_THEME') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
      } catch(e) {}
    })();
  </script>`;

html = html.replace(/<!-- Trailing Slash Normalization & FOUC Prevention Script -->[\s\S]*?<\/script>/i, `<!-- FOUC Prevention & Safe Theme Initializer -->\n  ${safeThemeScript}`);

// 3. Remove script tags at bottom and replace with inlined scripts
const scriptSectionRegex = /<!-- Standardized Script Loading Order \(Parity with StudyHub Architecture\) -->[\s\S]*?<\/body>/i;

let inlinedScripts = '<!-- Standalone Consolidated Application Scripts (100% Offline Capable) -->\n';
for (const file of scriptFiles) {
  console.log(`[BuildOffline] Inlining ${file.name}...`);
  const content = fs.readFileSync(file.path, 'utf8');
  inlinedScripts += `\n  <script>\n  /* ==========================================================================\n     ${file.label}\n     ========================================================================== */\n${content}\n  </script>\n`;
}
inlinedScripts += '\n</body>';

html = html.replace(scriptSectionRegex, inlinedScripts);

// 4. Update title and add offline badge
html = html.replace(
  '<title>MCS 305 · Software Engineering Midterm Reviewer | Cognitive Active Recall Studio</title>',
  '<title>MCS 305 · Software Engineering (Offline Standalone Edition)</title>'
);

// Add an Offline Badge beside the university badge
const universityBadgePattern = /(<span class="badge badge-university">[\s\S]*?<\/span>)/;
const offlineBadgeHtml = `$1\n        <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--accent-teal); border: 1px solid rgba(16, 185, 129, 0.4); display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">\n          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>\n          Offline Standalone Edition (Phone & Desktop)\n        </span>`;

html = html.replace(universityBadgePattern, offlineBadgeHtml);

// 5. Handle back-to-hub link gracefully if on file: protocol
html = html.replace(
  /<a href="\.\.\/" class="hub-back-btn"/g,
  '<a href="../" class="hub-back-btn" onclick="if(window.location.protocol === \'file:\'){ window.scrollTo({top:0, behavior:\'smooth\'}); return false; }"'
);
html = html.replace(
  /<a href="\.\.\/" class="header-hub-link"/g,
  '<a href="../" class="header-hub-link" onclick="if(window.location.protocol === \'file:\'){ window.scrollTo({top:0, behavior:\'smooth\'}); return false; }"'
);

// Save output files
const outPathMcs305 = path.join(mcs305Dir, 'mcs305_offline.html');
fs.writeFileSync(outPathMcs305, html, 'utf8');
console.log(`[BuildOffline] Generated ${outPathMcs305} (${(fs.statSync(outPathMcs305).size / 1024).toFixed(1)} KB)`);

// Also write to root directory so user can easily find it
const outPathRoot = path.join(rootDir, 'mcs305_offline.html');
fs.writeFileSync(outPathRoot, html, 'utf8');
console.log(`[BuildOffline] Also copied to ${outPathRoot}`);

console.log('[BuildOffline] Build complete! Standalone offline reviewer ready for mobile and desktop.');
