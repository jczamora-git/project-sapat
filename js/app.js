import { state } from './state.js';
import { SapatStorage } from './storage.js';
import { router } from './router.js';
import { initHeader } from './components/header.js';
import { initNavigation } from './components/navigation.js';
import { initModals, openRoleModal, openMealModal, openDishEditorModal } from './components/modals.js';
import { showToast } from './components/toast.js';

function initClock() {
  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.getElementById('live-phone-time');
    if (timeEl) {
      timeEl.textContent = `${hours}:${minutes}`;
    }
  };
  updateTime();
  setInterval(updateTime, 30000);
}

function initApp() {
  initClock();
  initHeader();
  initNavigation();
  initModals();

  const viewport = document.getElementById('screens-viewport');
  router.init(viewport);

  // If first visit without saved role, present the role selector modal
  if (!SapatStorage.getRole()) {
    openRoleModal();
  }
}

// Global debug API for compatibility
if (typeof window !== 'undefined') {
  window.SapatApp = {
    state,
    storage: SapatStorage,
    router,
    showToast,
    openRoleModal,
    openMealModal,
    openDishEditorModal
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
