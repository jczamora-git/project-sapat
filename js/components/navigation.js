import { state } from '../state.js';
import { SapatStorage } from '../storage.js';
import { router } from '../router.js';

export function initNavigation() {
  const nav = document.getElementById('app-bottom-nav');
  if (!nav) return;

  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item');
    if (!item) return;
    const targetRoute = item.getAttribute('data-route');
    if (targetRoute) {
      router.navigate(targetRoute);
    }
  });

  state.subscribe((event) => {
    if (event === 'role-changed' || event === 'cart-updated' || event === 'vendor-changed' || event === 'data-reset') {
      updateNavigation(router.getCurrentRoute());
    }
  });
}

export function updateNavigation(currentRoute = '') {
  const nav = document.getElementById('app-bottom-nav');
  if (!nav) return;

  if (state.role === 'student') {
    const cartCount = state.getCartCount();
    nav.innerHTML = `
      <button class="nav-item ${currentRoute.includes('/student/home') ? 'active' : ''}" data-route="#/student/home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>Home</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/student/menu') ? 'active' : ''}" data-route="#/student/menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
        <span>Menu</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/student/cart') ? 'active' : ''}" data-route="#/student/cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <span>Cart</span>
        ${cartCount > 0 ? `<span class="nav-badge">${cartCount}</span>` : ''}
      </button>
      <button class="nav-item ${currentRoute.includes('/student/orders') ? 'active' : ''}" data-route="#/student/orders">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        <span>Orders</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/student/profile') ? 'active' : ''}" data-route="#/student/profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Profile</span>
      </button>
    `;
  } else if (state.role === 'admin') {
    nav.innerHTML = `
      <button class="nav-item ${currentRoute.includes('/admin/dashboard') ? 'active' : ''}" data-route="#/admin/dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
        <span>Dashboard</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/admin/canteens') ? 'active' : ''}" data-route="#/admin/canteens">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
        <span>Stalls</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/admin/menu') ? 'active' : ''}" data-route="#/admin/menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        <span>Menu</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/admin/analytics') ? 'active' : ''}" data-route="#/admin/analytics">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        <span>Analytics</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/admin/settings') ? 'active' : ''}" data-route="#/admin/settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        <span>Settings</span>
      </button>
    `;
  } else {
    const orders = SapatStorage.getOrders();
    const currentVendorOrders = orders.filter(o => o.vendorId === state.currentVendorId);
    const pendingCount = currentVendorOrders.filter(o => o.status === 'Pending').length;

    nav.innerHTML = `
      <button class="nav-item ${currentRoute.includes('/vendor/dashboard') ? 'active' : ''}" data-route="#/vendor/dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
        <span>Dashboard</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/vendor/menu') ? 'active' : ''}" data-route="#/vendor/menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        <span>Menu</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/vendor/orders') ? 'active' : ''}" data-route="#/vendor/orders">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span>Orders</span>
        ${pendingCount > 0 ? `<span class="nav-badge">${pendingCount}</span>` : ''}
      </button>
      <button class="nav-item ${currentRoute.includes('/vendor/intelligence') ? 'active' : ''}" data-route="#/vendor/intelligence">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <span>Intelligence</span>
      </button>
      <button class="nav-item ${currentRoute.includes('/vendor/prep') ? 'active' : ''}" data-route="#/vendor/prep">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        <span>Kitchen Prep</span>
      </button>
    `;
  }
}

