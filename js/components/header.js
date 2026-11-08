import { state } from '../state.js';
import { SapatStorage } from '../storage.js';
import { router } from '../router.js';
import { openRoleModal } from './modals.js';

export function initHeader() {
  const brand = document.querySelector('.app-brand');
  const roleBadge = document.getElementById('current-role-badge');
  const cartBtn = document.getElementById('header-cart-btn');
  const roleIconBtn = document.getElementById('header-role-btn') || document.querySelector('button[title="Switch Role / Info"]');

  if (brand) {
    brand.addEventListener('click', () => {
      router.navigateHome();
    });
  }

  if (roleBadge) {
    roleBadge.addEventListener('click', () => {
      openRoleModal();
    });
  }

  if (roleIconBtn) {
    roleIconBtn.addEventListener('click', () => {
      openRoleModal();
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      router.navigate('#/student/cart');
    });
  }

  // Subscribe to state updates
  state.subscribe((event) => {
    if (event === 'role-changed' || event === 'vendor-changed' || event === 'cart-updated' || event === 'data-reset') {
      updateHeader();
    }
  });

  updateHeader();
}

export function updateHeader() {
  const roleBadge = document.getElementById('current-role-badge');
  const subtitle = document.getElementById('header-subtitle');
  const cartBtn = document.getElementById('header-cart-btn');
  const cartBadge = document.getElementById('cart-counter-badge');

  if (roleBadge) {
    if (state.role === 'student') {
      roleBadge.innerHTML = 'Student';
      roleBadge.className = 'header-role-badge student';
      roleBadge.title = 'Current Mode: Student. Tap to switch to Canteen Vendor or Admin.';
    } else if (state.role === 'admin') {
      roleBadge.innerHTML = '<span class="admin-live-pulse-dot"></span><span>Admin Portal</span>';
      roleBadge.className = 'header-role-badge admin';
      roleBadge.title = 'Current Mode: Campus Administrator. Tap to switch role.';
    } else {
      const v = SapatStorage.getVendorById(state.currentVendorId);
      const stall = v ? v.stallNumber : 'Vendor';
      roleBadge.innerHTML = `<span class="v-live-pulse-dot"></span><span>${stall}</span>`;
      roleBadge.className = 'header-role-badge vendor';
      roleBadge.title = v ? `Active Stall: ${v.name} (${v.stallNumber}). Tap to switch stall or role.` : 'Tap to switch stall';
    }
  }

  if (subtitle) {
    if (state.role === 'student') {
      subtitle.textContent = 'Exact portions. Zero waste.';
    } else if (state.role === 'admin') {
      subtitle.textContent = 'Executive Operations & Analytics';
    } else {
      const v = SapatStorage.getVendorById(state.currentVendorId);
      subtitle.textContent = v ? `${v.name} • ${v.stallNumber}` : 'Smart Daily Prep & Orders';
    }
  }

  const cartCount = state.getCartCount();
  if (cartBtn) {
    cartBtn.style.display = state.role === 'student' ? 'flex' : 'none';
  }

  if (cartBadge) {
    if (cartCount > 0 && state.role === 'student') {
      cartBadge.textContent = cartCount;
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.style.display = 'none';
    }
  }
}

