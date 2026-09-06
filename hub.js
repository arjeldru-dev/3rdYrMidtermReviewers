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
      showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} mode`);
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

  // --- Shared Gemini API Key Modal ---
  const modalBackdrop = document.getElementById('api-setup-modal');
  const btnOpenModal = document.getElementById('btn-open-api-modal');
  const btnCloseModal = document.getElementById('btn-close-api-modal');
  const apiKeyInput = document.getElementById('hub-api-key-input');
  const btnSaveKey = document.getElementById('btn-save-hub-key');

  const API_STORAGE_KEYS = ['MCS306_GEMINI_API_KEY', 'mcs306_gemini_api_key', 'gemini_api_key'];

  function loadSavedApiKey() {
    if (!apiKeyInput) return;
    try {
      const saved = localStorage.getItem('MCS306_GEMINI_API_KEY') || 
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
      showToast('API key cleared');
      closeModal();
      return;
    }

    if (!key.startsWith('AIza') || key.length < 25) {
      showToast('⚠️ Please verify your key (typically begins with AIza...)');
      return;
    }

    try {
      API_STORAGE_KEYS.forEach(k => localStorage.setItem(k, key));
      showToast('✓ Gemini API Key saved locally!');
      closeModal();
    } catch (e) {
      showToast('Error saving key to browser storage');
    }
  }

  function openModal() {
    if (modalBackdrop) {
      loadSavedApiKey();
      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnSaveKey) btnSaveKey.addEventListener('click', saveApiKey);

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

  // --- Toast Notification ---
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
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
