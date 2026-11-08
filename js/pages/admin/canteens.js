import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { showToast } from '../../components/toast.js';

export const adminCanteensPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'role-changed' || event === 'data-reset' || event === 'vendor-changed') {
          const currentScreen = document.getElementById('screen-admin-canteens');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const openCount = vendors.filter(v => v.isOpen).length;

    container.innerHTML = `
      <section class="screen active admin-screen" id="screen-admin-canteens">
        
        <!-- Header -->
        <div class="admin-page-header">
          <div class="admin-header-left">
            <div class="admin-campus-pill">
              <span class="admin-live-dot"></span>
              <span>Canteen Facility &bull; Main Canteen Hall</span>
            </div>
            <h2 class="admin-main-title">Canteen Stall Management</h2>
            <p class="admin-main-sub">Control stall availability, express pickup windows, and preparation quotas</p>
          </div>
          <div class="admin-header-actions">
            <button class="btn-admin-action primary" data-route="#/admin/menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Campus Menu Catalog</span>
            </button>
          </div>
        </div>

        <!-- Quick Status Metrics Strip -->
        <div class="admin-metrics-row">
          <div class="admin-mini-metric">
            <span class="mini-label">Total Stalls</span>
            <strong class="mini-val">${vendors.length}</strong>
          </div>
          <div class="admin-mini-metric">
            <span class="mini-label">Active Pre-orders</span>
            <strong class="mini-val text-primary">${openCount} Open</strong>
          </div>
          <div class="admin-mini-metric">
            <span class="mini-label">Express Windows</span>
            <strong class="mini-val">${vendors.length} Active</strong>
          </div>
          <div class="admin-mini-metric">
            <span class="mini-label">Average Prep Target Accuracy</span>
            <strong class="mini-val text-orange">94.6%</strong>
          </div>
        </div>

        <!-- Canteen Stalls Grid -->
        <div class="admin-canteens-stack">
          ${vendors.map(v => {
            const vDishes = menu.filter(d => d.vendorId === v.id);
            const vLimit = vDishes.reduce((s, d) => s + d.dailyLimit, 0);
            const vReserved = vDishes.reduce((s, d) => s + d.reservedServings, 0);
            const vRemaining = Math.max(0, vLimit - vReserved);
            const vPct = vLimit > 0 ? Math.round((vReserved / vLimit) * 100) : 0;

            return `
              <div class="admin-canteen-card">
                <div class="canteen-card-media" style="background-image: url('${v.bannerImage}');">
                  <div class="canteen-card-media-scrim"></div>
                  <span class="canteen-stall-pill">${v.stallNumber}</span>
                  <span class="canteen-status-chip ${v.isOpen ? 'open' : 'closed'}">
                    ${v.isOpen ? 'Accepting Pre-orders' : 'Temporarily Closed'}
                  </span>
                </div>

                <div class="canteen-card-info">
                  <div class="canteen-header-block">
                    <div>
                      <h3 class="canteen-name">${v.name}</h3>
                      <span class="canteen-category">${v.category} &bull; ${v.categoryDesc}</span>
                    </div>
                    <label class="switch-toggle" title="Toggle Stall Status">
                      <input type="checkbox" data-action="toggle-stall-status" data-vendor-id="${v.id}" ${v.isOpen ? 'checked' : ''}>
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <p class="canteen-description">${v.description}</p>

                  <div class="canteen-meta-grid">
                    <div class="canteen-meta-box">
                      <span class="meta-box-label">Operating Hours</span>
                      <strong class="meta-box-val">${v.hours}</strong>
                    </div>
                    <div class="canteen-meta-box">
                      <span class="meta-box-label">Express Counter</span>
                      <strong class="meta-box-val">${v.expressWindow || 'Window #1'}</strong>
                    </div>
                    <div class="canteen-meta-box">
                      <span class="meta-box-label">Menu Items</span>
                      <strong class="meta-box-val">${vDishes.length} dishes</strong>
                    </div>
                    <div class="canteen-meta-box">
                      <span class="meta-box-label">Kitchen Capacity</span>
                      <strong class="meta-box-val">${vReserved} / ${vLimit} (${vRemaining} left)</strong>
                    </div>
                  </div>

                  <div class="canteen-quota-track">
                    <div class="canteen-quota-fill ${vPct >= 80 ? 'warning' : 'green'}" style="width: ${vPct}%;"></div>
                  </div>

                  <div class="canteen-actions-footer">
                    <span class="canteen-efficiency-text">Prep Accuracy: <strong>${v.efficiency || '95%'}</strong> &bull; Waste Saved: <strong>${v.wasteSaved || '12 kg'}</strong></span>
                    <div class="canteen-btn-group">
                      <button class="btn-canteen-switch" data-action="switch-to-vendor" data-vendor-id="${v.id}">
                        Open Stall Terminal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      // Switch to vendor terminal
      const switchBtn = e.target.closest('[data-action="switch-to-vendor"]');
      if (switchBtn) {
        const vendorId = switchBtn.getAttribute('data-vendor-id');
        if (vendorId) {
          state.setCurrentVendor(vendorId);
          state.setRole('vendor');
          router.navigate('#/vendor/dashboard');
          showToast(`Switched terminal to ${SapatStorage.getVendorById(vendorId)?.name}`, 'success');
        }
      }
    });

    // Toggle stall status
    container.addEventListener('change', (e) => {
      const toggle = e.target.closest('[data-action="toggle-stall-status"]');
      if (toggle) {
        const vendorId = toggle.getAttribute('data-vendor-id');
        const isOpen = toggle.checked;
        const success = SapatStorage.toggleVendorStatus(vendorId, isOpen);
        if (success) {
          const v = SapatStorage.getVendorById(vendorId);
          showToast(`${v?.name} is now ${isOpen ? 'Open for Pre-orders' : 'Closed'}`, isOpen ? 'success' : 'info');
          this.render(container);
        }
      }
    });
  }
};

