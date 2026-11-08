let toastTimer = null;

export function showToast(message, type = 'info') {
  const toast = document.getElementById('sapat-toast');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  if (!toast) return;

  toast.className = `sapat-toast show ${type}`;
  if (toastMsg) toastMsg.textContent = message;

  if (toastIcon) {
    if (type === 'success') {
      toastIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      toastIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      toastIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
  }

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

