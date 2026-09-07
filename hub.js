/**
 * Academic Reviewer Hub — Client Engine
 * Theme persistence, live course search, category filters, and shared API key management.
 */

(function () {
  'use strict';

  // --- Theme Management ---
  const THEME_STORAGE_KEY = 'mcs306_theme';
  const themeToggleBtn = document.getElementById('btn-theme-toggle');

  function initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
      console.warn('localStorage theme read error:', e);
    }

    if (!savedTheme) {
      savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('localStorage theme save error:', e);
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} mode`, 'info');
    });
  }

  // --- Live Search & Category Filtering ---
  const searchInput = document.getElementById('hub-search-input');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const courseCards = document.querySelectorAll('.course-card[data-course-id]');
  const visibleCountEl = document.getElementById('visible-courses-count');

  let currentCategory = 'all';
  let currentSearchQuery = '';

  function filterCourses() {
    let visibleCount = 0;

    courseCards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const code = (card.getAttribute('data-code') || '').toLowerCase();
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      const category = card.getAttribute('data-category') || '';

      const matchesSearch = !currentSearchQuery || 
        title.includes(currentSearchQuery) || 
        code.includes(currentSearchQuery) || 
        tags.includes(currentSearchQuery);

      const matchesCategory = currentCategory === 'all' || category === currentCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCountEl) {
      visibleCountEl.textContent = `${visibleCount} available`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      filterCourses();
    });

    // Keyboard shortcut / to focus search
    document.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category') || 'all';
      filterCourses();
    });
  });

  // --- Shared Gemini API Key & AI Tutoring Settings Modal ---
  const modalBackdrop = document.getElementById('api-setup-modal');
  const btnOpenModal = document.getElementById('btn-open-api-modal');
  const btnCloseModal = document.getElementById('btn-close-api-modal');
  const apiKeyInput = document.getElementById('hub-api-key-input');
  const btnSaveKey = document.getElementById('btn-save-hub-key');

  const btnHeaderAiStatus = document.getElementById('btn-header-ai-status');
  const headerAiStatusText = document.getElementById('header-ai-status-text');
  const hubAiToggle = document.getElementById('hub-ai-toggle');
  const hubAiStatusPill = document.getElementById('hub-ai-status-pill');
  const courseAiCheckboxes = document.querySelectorAll('.course-ai-checkbox');

  const GLOBAL_AI_KEY = 'studyhub_ai_enabled';
  const COURSE_AI_KEYS = {
    mcs306: 'MCS306_AI_ENABLED',
    mat304a: 'MAT304a_AI_ENABLED'
  };

  const API_STORAGE_KEYS = [
    'MCS306_GEMINI_API_KEY',
    'mcs306_gemini_api_key',
    'MAT304a_GEMINI_API_KEY',
    'mat304a_gemini_api_key',
    'gemini_api_key'
  ];

  // --- AI Tutoring State Handlers ---
  function getGlobalAiState() {
    try {
      const val = localStorage.getItem(GLOBAL_AI_KEY);
      return val === null ? true : val === 'true';
    } catch (e) {
      return true;
    }
  }

  function getCourseAiState(courseId) {
    const key = COURSE_AI_KEYS[courseId];
    if (!key) return true;
    try {
      const val = localStorage.getItem(key);
      return val === null ? getGlobalAiState() : val === 'true';
    } catch (e) {
      return true;
    }
  }

  function updateAiUI(globalEnabled) {
    if (headerAiStatusText) {
      headerAiStatusText.textContent = globalEnabled ? 'AI: Active' : 'AI: Off';
    }
    if (btnHeaderAiStatus) {
      btnHeaderAiStatus.classList.toggle('ai-paused', !globalEnabled);
      btnHeaderAiStatus.classList.toggle('ai-active', globalEnabled);
      btnHeaderAiStatus.setAttribute('title', globalEnabled ? 'AI Tutoring Active (Click to manage quota)' : 'AI Tutoring Paused · Tokens Preserved');
    }
    if (hubAiToggle) {
      hubAiToggle.checked = globalEnabled;
    }
    if (hubAiStatusPill) {
      hubAiStatusPill.textContent = globalEnabled ? 'Active · Consuming Tokens' : 'Paused · Tokens Preserved';
      hubAiStatusPill.className = `ai-status-pill ${globalEnabled ? 'active' : 'paused'}`;
    }
  }

  function loadAiSettings() {
    const globalEnabled = getGlobalAiState();
    updateAiUI(globalEnabled);

    courseAiCheckboxes.forEach(cb => {
      const course = cb.getAttribute('data-course');
      cb.checked = getCourseAiState(course);
    });
  }

  function setGlobalAi(enabled) {
    try {
      localStorage.setItem(GLOBAL_AI_KEY, enabled ? 'true' : 'false');
      // Also update individual courses to match global state
      Object.values(COURSE_AI_KEYS).forEach(k => {
        localStorage.setItem(k, enabled ? 'true' : 'false');
      });
    } catch (e) {
      console.warn('Error saving global AI state:', e);
    }
    updateAiUI(enabled);
    courseAiCheckboxes.forEach(cb => {
      cb.checked = enabled;
    });
    showToast(enabled ? 'AI Explanations enabled across all courses' : 'AI Explanations disabled (Tokens preserved)', enabled ? 'success' : 'pause');
  }

  function setCourseAi(courseId, enabled) {
    const key = COURSE_AI_KEYS[courseId];
    if (!key) return;
    try {
      localStorage.setItem(key, enabled ? 'true' : 'false');
    } catch (e) {}

    // Check if all are off or any is on to update global indicator
    let anyEnabled = false;
    courseAiCheckboxes.forEach(cb => {
      if (cb.checked) anyEnabled = true;
    });

    try {
      localStorage.setItem(GLOBAL_AI_KEY, anyEnabled ? 'true' : 'false');
    } catch (e) {}

    updateAiUI(anyEnabled);
    const label = courseId.toUpperCase();
    showToast(enabled ? `${label} AI explanations enabled` : `${label} AI explanations disabled (Tokens saved)`, enabled ? 'success' : 'pause');
  }

  if (hubAiToggle) {
    hubAiToggle.addEventListener('change', (e) => {
      setGlobalAi(e.target.checked);
    });
  }

  courseAiCheckboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const course = cb.getAttribute('data-course');
      setCourseAi(course, e.target.checked);
    });
  });

  if (btnHeaderAiStatus) {
    btnHeaderAiStatus.addEventListener('click', () => {
      openModal();
      // Smoothly scroll modal to AI settings
      const aiSection = document.querySelector('.ai-toggle-section');
      if (aiSection) {
        setTimeout(() => {
          aiSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      }
    });
  }

  function loadSavedApiKey() {
    if (!apiKeyInput) return;
    try {
      const saved = localStorage.getItem('MCS306_GEMINI_API_KEY') || 
                    localStorage.getItem('MAT304a_GEMINI_API_KEY') ||
                    localStorage.getItem('mcs306_gemini_api_key') || 
                    localStorage.getItem('gemini_api_key') || '';
      if (saved) {
        apiKeyInput.value = saved;
      }
    } catch (e) {}
  }

  function saveApiKey() {
    const key = (apiKeyInput.value || '').trim();
    if (!key) {
      try {
        API_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
      showToast('API key cleared', 'info');
      closeModal();
      return;
    }

    if (key.length < 8) {
      showToast('Please enter a valid Gemini API key', 'warning');
      return;
    }

    try {
      API_STORAGE_KEYS.forEach(k => localStorage.setItem(k, key));
      showToast('Gemini API Key saved locally!', 'success');
      closeModal();
    } catch (e) {
      showToast('Error saving key to browser storage', 'warning');
    }
  }

  function openModal() {
    if (modalBackdrop) {
      loadSavedApiKey();
      loadAiSettings();
      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      if (apiKeyInput) {
        setTimeout(() => apiKeyInput.focus(), 50);
      }
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
  const btnOpenFromGuide = document.getElementById('btn-open-api-from-guide');
  if (btnOpenFromGuide) btnOpenFromGuide.addEventListener('click', openModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnSaveKey) btnSaveKey.addEventListener('click', saveApiKey);
  if (apiKeyInput) {
    apiKeyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveApiKey();
      }
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Initialize AI Settings on page load
  loadAiSettings();

  // --- Toast Notification with SVG Icons ---
  const TOAST_ICONS = {
    success: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    pause: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
    warning: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconSvg = TOAST_ICONS[type] || TOAST_ICONS.info;
    toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${iconSvg}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  // Initial Run
  initTheme();
  loadSavedApiKey();
})();
