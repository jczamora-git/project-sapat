import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentProfilePage = {
  render(container) {
    const orders = SapatStorage.getOrders();
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const currentStudent = SapatStorage.getCurrentStudent();

    const initials = currentStudent && currentStudent.fullName
      ? currentStudent.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'G';

    container.innerHTML = `
      <section class="screen active" id="screen-student-profile">
        
        <!-- Profile Header -->
        ${currentStudent ? `
          <div class="profile-minimal-header">
            <div class="profile-avatar-circle">${initials}</div>
            <h2 class="profile-display-name">${currentStudent.fullName}</h2>
            <span class="profile-role-sub">Enrolled Student &bull; ID #${currentStudent.schoolId}</span>
            <span class="profile-campus-pill">${currentStudent.program} &bull; ${currentStudent.section || currentStudent.yearLevel}</span>
          </div>
        ` : `
          <div class="profile-minimal-header profile-guest-header">
            <div class="profile-avatar-circle guest">?</div>
            <h2 class="profile-display-name">Guest Dining Account</h2>
            <span class="profile-role-sub">Browsing mode &bull; No active student session</span>
            <div class="profile-guest-actions">
              <button class="btn-primary-action btn-sm" data-action="go-login">Sign In</button>
              <button class="btn-secondary-action btn-sm" data-action="go-register">Create Account</button>
            </div>
          </div>
        `}

        <!-- Student Metrics -->
        <div class="profile-stats-duo">
          <div class="profile-duo-card">
            <span class="duo-number">${completedOrders}</span>
            <span class="duo-label">Meals Pre-ordered</span>
          </div>
          <div class="profile-duo-card">
            <span class="duo-number">${(completedOrders * 0.3).toFixed(1)} kg</span>
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
          ${currentStudent ? `
            <button class="btn-profile-secondary" data-action="student-logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out (${currentStudent.fullName})
            </button>
          ` : `
            <button class="btn-primary-action" data-action="go-login">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
              Sign In to Your Account
            </button>
          `}

          <button class="btn-profile-secondary" data-action="open-role-modal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            Switch Role (Vendor / Admin Portal)
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
      const goLoginBtn = e.target.closest('[data-action="go-login"]');
      if (goLoginBtn) {
        router.navigate('#/auth/login');
        return;
      }

      const goRegisterBtn = e.target.closest('[data-action="go-register"]');
      if (goRegisterBtn) {
        router.navigate('#/auth/register');
        return;
      }

      const logoutBtn = e.target.closest('[data-action="student-logout"]');
      if (logoutBtn) {
        state.logoutStudent();
        showToast('Signed out of student account.', 'info');
        this.render(container);
        return;
      }

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
