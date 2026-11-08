import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentProfilePage = {
  render(container) {
    const orders = SapatStorage.getOrders();
    const completedOrders = orders.filter(o => o.status === 'Completed').length;

    container.innerHTML = `
      <section class="screen active" id="screen-student-profile">
        
        <!-- Minimal Profile Header -->
        <div class="profile-minimal-header">
          <div class="profile-avatar-circle">MS</div>
          <h2 class="profile-display-name">Maria Santos</h2>
          <span class="profile-role-sub">Student &bull; ID #2024-08192</span>
          <span class="profile-campus-pill">Main Campus &bull; BS Information Technology</span>
        </div>

        <!-- Student Metrics -->
        <div class="profile-stats-duo">
          <div class="profile-duo-card">
            <span class="duo-number">${completedOrders}</span>
            <span class="duo-label">Meals Pre-ordered</span>
          </div>
          <div class="profile-duo-card">
            <span class="duo-number">4.8 kg</span>
            <span class="duo-label">Kitchen Waste Prevented</span>
          </div>
        </div>

        <!-- Section: Guidelines -->
        <div class="profile-info-group">
          <h4 class="profile-group-heading">Pre-ordering Guidelines</h4>
          <div class="profile-list-card">
            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="list-row-content">
                <strong>Cutoff Time</strong>
                <p>Pre-orders lock 30 minutes before your selected lunch shift so cooks can prepare exact portions.</p>
              </div>
            </div>
            
            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
              </div>
              <div class="list-row-content">
                <strong>Express Pickup Pass</strong>
                <p>Present your digital QR Pickup Pass at your stall's express counter to claim your hot meal without lining up.</p>
              </div>
            </div>

            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              </div>
              <div class="list-row-content">
                <strong>Instant Portion Return</strong>
                <p>Cancellations release meal portions back to fellow students immediately.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Principle -->
        <div class="profile-info-group">
          <h4 class="profile-group-heading">About Sapat System</h4>
          <div class="profile-list-card" style="padding: 12px 14px;">
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              <strong>Sapat</strong> bridges school canteens and hungry students through exact-portion pre-ordering. Cooks produce what is guaranteed to be eaten, eliminating school kitchen food waste.
            </p>
          </div>
        </div>

        <!-- Role Switcher & Actions -->
        <div class="profile-actions-stack">
          <button class="btn-profile-secondary" data-action="open-role-modal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            Switch to Canteen Vendor Mode
          </button>
          
          <button class="btn-profile-danger" data-action="reset-app-data">
            Reset Demo Prototype Data
          </button>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      const roleBtn = e.target.closest('[data-action="open-role-modal"]');
      if (roleBtn) {
        openRoleModal();
        return;
      }

      const resetBtn = e.target.closest('[data-action="reset-app-data"]');
      if (resetBtn) {
        if (!confirm('Reset Sapat prototype to factory seed data? This will restore original limits and 5-vendor mock data.')) return;
        SapatStorage.resetToDefaults();
        state.clearCart();
        state.notify('data-reset');
        showToast('Sapat prototype reset to initial mock data.', 'info');
        router.navigate('#/student/home');
      }
    });
  }
};
