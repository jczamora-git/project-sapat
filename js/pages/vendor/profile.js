import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getCanteenBrandMark } from '../../components/vendor-card.js';
import { ForecastingService } from '../../services/forecasting.service.js';

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

    const taste = ForecastingService.getCustomerTasteAnalysis(state.currentVendorId);

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-profile">
        
        <!-- 1. Canteen Business Identity Card -->
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
                  ${currentVendor.isOpen ? 'Open for Orders' : 'Stall Closed'}
                </span>
              </div>
              <h2 class="v-profile-name">${currentVendor.name}</h2>
              <span class="v-profile-cuisine">${currentVendor.category} &bull; ${currentVendor.categoryDesc || 'Licensed Campus Canteen'}</span>
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

        <!-- 2. Account Management Section (Primary Account Switching Hub) -->
        <div class="v-profile-account-section">
          <div class="v-account-section-head">
            <span class="v-account-section-eyebrow">CURRENT STALL ACCOUNT</span>
            <span class="v-account-status-badge">Active Session</span>
          </div>

          <div class="v-account-current-box">
            <div class="v-account-current-meta">
              <strong class="v-account-stall-title">${currentVendor.name}</strong>
              <span class="v-account-stall-sub">${currentVendor.stallNumber} &bull; Licensed Canteen Operator</span>
            </div>
          </div>

          <div class="v-account-actions-row">
            <button class="btn-primary-action v-profile-switch-btn" data-action="open-role-modal" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
              <span>Switch Stall Account</span>
            </button>
            <button class="btn-secondary-action v-profile-switch-role-btn" data-action="open-role-modal" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Switch App Role</span>
            </button>
          </div>
        </div>

        <!-- 3. Kitchen Performance & Sustainability Metrics -->
        <div class="v-profile-metrics-deck">
          <div class="v-metric-card">
            <span class="v-metric-num">${currentVendor.efficiency || '96%'}</span>
            <span class="v-metric-title">Preparation Accuracy</span>
            <p class="v-metric-desc">Portion targets aligned directly with student pre-orders</p>
          </div>
          <div class="v-metric-card">
            <span class="v-metric-num text-primary">${currentVendor.wasteSaved || '14.8 kg'}</span>
            <span class="v-metric-title">Food Waste Prevented / Week</span>
            <p class="v-metric-desc">Avoided kitchen overproduction via locked demand</p>
          </div>
          <div class="v-metric-card">
            <span class="v-metric-num text-orange">${taste.sentimentScore}%</span>
            <span class="v-metric-title">Student Satisfaction</span>
            <p class="v-metric-desc">Verified feedback rating across ${taste.totalReviews} student reviews</p>
          </div>
        </div>

        <!-- 4. Operating Information & Canteen Operational Protocols -->
        <div class="profile-info-group">
          <h4 class="profile-group-heading">Canteen Operational Protocols</h4>
          <div class="profile-list-card">
            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10"></rect></svg>
              </div>
              <div class="list-row-content">
                <strong>Digital QR Pass Verification</strong>
                <p>Scan student passes at the express window before order handover to prevent line bottlenecks and verify meal claims.</p>
              </div>
            </div>

            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="list-row-content">
                <strong>Staggered 30-Minute Shift Windows</strong>
                <p>Lunch pre-orders are batched across 11:00 AM, 11:30 AM, and 12:15 PM shifts. Cook strictly within locked batch sizes.</p>
              </div>
            </div>

            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div class="list-row-content">
                <strong>Zero Waste Kitchen Commitment</strong>
                <p>SAPAT ensures campus food security and eliminates unsold food spoilage through real-time demand forecasting.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. System Reset (Demo) -->
        <div class="profile-actions-stack" style="margin-top: 16px;">
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
      // Switch stall / role
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
