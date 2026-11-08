import { state } from './state.js';
import { updateHeader } from './components/header.js';
import { updateNavigation } from './components/navigation.js';
import { stopScannerCamera } from './components/modals.js';

import { studentHomePage } from './pages/student/home.js';
import { studentMenuPage } from './pages/student/menu.js';
import { studentCartPage } from './pages/student/cart.js';
import { studentOrdersPage } from './pages/student/orders.js';
import { studentProfilePage } from './pages/student/profile.js';

import { vendorDashboardPage } from './pages/vendor/dashboard.js';
import { vendorMenuPage } from './pages/vendor/menu.js';
import { vendorOrdersPage } from './pages/vendor/orders.js';
import { vendorPrepPage } from './pages/vendor/prep.js';
import { vendorProfilePage } from './pages/vendor/profile.js';
import { vendorIntelligencePage } from './pages/vendor/intelligence.js';

import { adminDashboardPage } from './pages/admin/dashboard.js';
import { adminCanteensPage } from './pages/admin/canteens.js';
import { adminMenuPage } from './pages/admin/menu.js';
import { adminAnalyticsPage } from './pages/admin/analytics.js';
import { adminSettingsPage } from './pages/admin/settings.js';

class AppRouter {
  constructor() {
    this.container = null;
    this.currentPath = '';
    this._routes = null;
  }

  get routes() {
    if (!this._routes) {
      this._routes = {
        '#/student/home': studentHomePage,
        '#/student/menu': studentMenuPage,
        '#/student/cart': studentCartPage,
        '#/student/orders': studentOrdersPage,
        '#/student/profile': studentProfilePage,

        '#/vendor/dashboard': vendorDashboardPage,
        '#/vendor/menu': vendorMenuPage,
        '#/vendor/orders': vendorOrdersPage,
        '#/vendor/intelligence': vendorIntelligencePage,
        '#/vendor/prep': vendorPrepPage,
        '#/vendor/profile': vendorProfilePage,

        '#/admin/dashboard': adminDashboardPage,
        '#/admin/canteens': adminCanteensPage,
        '#/admin/menu': adminMenuPage,
        '#/admin/analytics': adminAnalyticsPage,
        '#/admin/settings': adminSettingsPage,
      };
    }
    return this._routes;
  }

  init(containerElement) {
    this.container = containerElement;

    // Listen for hash changes (including browser back / forward buttons)
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // Listen for storage / role updates
    state.subscribe((event) => {
      if (event === 'role-changed') {
        const homeRoute = state.role === 'student' ? '#/student/home' : (state.role === 'admin' ? '#/admin/dashboard' : '#/vendor/dashboard');
        const rolePrefix = `#/` + state.role;
        if (!this.getCurrentRoute().startsWith(rolePrefix)) {
          this.navigate(homeRoute);
        } else {
          this.handleRoute();
        }
      }
    });

    // Handle initial route
    this.handleRoute();
  }

  getCurrentRoute() {
    return window.location.hash || '';
  }

  navigate(path) {
    if (!path.startsWith('#')) {
      path = `#${path}`;
    }
    if (window.location.hash === path) {
      this.handleRoute();
    } else {
      window.location.hash = path;
    }
  }

  navigateHome() {
    const target = state.role === 'student' ? '#/student/home' : (state.role === 'admin' ? '#/admin/dashboard' : '#/vendor/dashboard');
    this.navigate(target);
  }

  handleRoute() {
    let hash = window.location.hash.trim();

    // Default / Empty route handling
    if (!hash || hash === '#' || hash === '#/' || hash === '#/student' || hash === '#/vendor' || hash === '#/admin') {
      const defaultRoute = state.role === 'student' ? '#/student/home' : (state.role === 'admin' ? '#/admin/dashboard' : '#/vendor/dashboard');
      if (hash !== defaultRoute) {
        window.location.replace(defaultRoute);
        return;
      }
      hash = defaultRoute;
    }

    // Role synchronization: if route specifies role, sync state.role
    if (hash.startsWith('#/student') && state.role !== 'student') {
      state.setRole('student');
    } else if (hash.startsWith('#/vendor') && state.role !== 'vendor') {
      state.setRole('vendor');
    } else if (hash.startsWith('#/admin') && state.role !== 'admin') {
      state.setRole('admin');
    }

    this.currentPath = hash;
    // Release any active camera streams on route transition
    stopScannerCamera();

    const page = this.routes[hash];

    if (!this.container) {
      this.container = document.getElementById('screens-viewport');
    }

    if (page && typeof page.render === 'function') {
      page.render(this.container);
    } else {
      // 404 Fallback page
      this.renderNotFound(this.container, hash);
    }

    // Scroll viewport to top on route change
    if (this.container) {
      this.container.scrollTop = 0;
    }

    // Sync header & navigation with route
    updateHeader();
    updateNavigation(hash);
  }

  renderNotFound(container, requestedPath) {
    container.innerHTML = `
      <section class="screen active" style="padding: 40px 16px; text-align: center;">
        <div class="empty-state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 style="margin-top: 14px;">Page Not Found</h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin: 6px 0 18px;">
          The requested route <code>${requestedPath}</code> does not exist.
        </p>
        <button class="btn-primary-action" id="btn-fallback-home" style="max-width: 200px; margin: 0 auto;">
          Return to Home
        </button>
      </section>
    `;

    const homeBtn = container.querySelector('#btn-fallback-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        this.navigateHome();
      });
    }
  }
}

export const router = new AppRouter();

