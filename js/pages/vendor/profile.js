import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getCanteenBrandMark } from '../../components/vendor-card.js';

export const vendorProfilePage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset') {
          const currentScreen = document.getElementById('screen-vendor-profile');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    if (!currentVendor) return;

    const menu = SapatStorage.getMenu().filter(d => d.vendorId === state.currentVendorId);
    const orders = SapatStorage.getOrders().filter(o => o.vendorId === state.currentVendorId);
    const totalServings = menu.reduce((s, d) => s + d.reservedServings, 0);

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-profile">
        
        <!-- Business Profile Header Card -->
        <div class="v-profile-business-card">
          <div class="v-profile-header-main">
            <div class="v-profile-logo-wrap">
              ${getCanteenBrandMark(currentVendor.id)}
            </div>
            <div class="v-profile-title-block">
              <div class="v-profile-tag-row">
                <span class="v-profile-stall-pill">${currentVendor.stallNumber}</span>
                <span class="v-profile-status-pill ${currentVendor.isOpen ? 'online' : 'offline'}">
                  <span class="canteen-status-dot ${currentVendor.isOpen ? 'online' : 'offline'}"></span>
                  ${currentVendor.isOpen ? 'Active Stall' : 'Closed'}
                </span>
              </div>
              <h2 class="v-profile-name">${currentVendor.name}</h2>
              <span class="v-profile-cuisine">${currentVendor.category} &bull; ${currentVendor.categoryDesc || 'Campus Canteen'}</span>
            </div>
          </div>

          <div class="v-profile-badges-strip">
            <div class="v-badge-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${currentVendor.hours}</span>
            </div>
            <div class="v-badge-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span>${currentVendor.expressWindow || 'Express Counter 2'}</span>
            </div>
          </div>
        </div>

        <!-- Account Management Switcher -->
        <div class="v-account-switch-banner">
          <div class="v-switch-banner-text">
            <span class="v-switch-banner-title">Canteen Stall Account Session</span>
            <strong class="v-switch-banner-stall">${currentVendor.stallNumber}: ${currentVendor.name}</strong>
          </div>
          <button class="btn-primary-action v-switch-role-cta" data-action="open-role-modal" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            <span>Switch Stall</span>
          </button>
        </div>

        <!-- Kitchen Performance & Sustainability Metrics -->
        <div class="v-profile-metrics-deck">
          <div class="v-metric-card">
            <span class="v-metric-num">${currentVendor.efficiency || '96%'}</span>
            <span class="v-metric-title">Preparation Accuracy</span>
            <p class="v-metric-desc">Portion quotas aligned to student pre-orders</p>
          </div>
          <div class="v-metric-card">
            <span class="v-metric-num">${currentVendor.wasteSaved || '14.8 kg'}</span>
            <span class="v-metric-title">Food Waste Prevented / Week</span>
            <p class="v-metric-desc">Zero leftover food spoiled</p>
          </div>
        </div>

        <!-- Operating Guidelines & Express Counter Rules -->
        <div class="profile-info-group">
          <h4 class="profile-group-heading">Canteen Operational Protocols</h4>
          <div class="profile-list-card">
            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10"></rect></svg>
              </div>
              <div class="list-row-content">
                <strong>QR Pass Verification</strong>
                <p>Verify the student's digital pickup pass via the QR Scanner before handing over packed meals. Prevents line bottlenecks.</p>
              </div>
            </div>

            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="list-row-content">
                <strong>30-Minute Kitchen Cutoff</strong>
                <p>Pre-orders for Lunch Shift 1 lock at 11:00 AM; Shift 2 locks at 11:45 AM. Cook strictly within locked batch sizes.</p>
              </div>
            </div>

            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div class="list-row-content">
                <strong>Campus Zero Waste Commitment</strong>
                <p>SAPAT guarantees zero unsold food overages by aligning raw cooking supply directly with recorded student reservations.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger / Demo Prototype Reset -->
        <div class="profile-actions-stack">
          <button class="btn-profile-danger" data-action="reset-demo-data" type="button">
            Reset Demo Prototype Data
          </button>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      // Switch stall
      const switchBtn = e.target.closest('[data-action="open-role-modal"]');
      if (switchBtn) {
        openRoleModal();
        return;
      }

      // Reset data
      const resetBtn = e.target.closest('[data-action="reset-demo-data"]');
      if (resetBtn) {
        if (confirm('Reset prototype database to initial demo values?')) {
          SapatStorage.resetData();
          showToast('Database reset to initial demo values', 'info');
          this.render(container);
        }
      }
    });
  }
};
