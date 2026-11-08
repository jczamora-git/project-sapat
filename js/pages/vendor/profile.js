import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { renderVendorAccountBar } from '../../components/vendor-card.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const vendorProfilePage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-profile">
        
        <!-- Stall Account Selector Bar -->
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <!-- Minimal Profile Header -->
        <div class="profile-minimal-header">
          <div class="profile-avatar-circle" style="background: ${currentVendor.avatarColor}; color: white; border: none;">${currentVendor.avatar}</div>
          <h2 class="profile-display-name">${currentVendor.name}</h2>
          <span class="profile-role-sub">${currentVendor.stallNumber} &bull; ${currentVendor.category}</span>
          <span class="profile-campus-pill">Main Canteen Hall &bull; Hours: ${currentVendor.hours}</span>
        </div>

        <!-- Metrics Duo -->
        <div class="profile-stats-duo">
          <div class="profile-duo-card">
            <span class="duo-number">${currentVendor.efficiency || '96%'}</span>
            <span class="duo-label">Prep Target Accuracy</span>
          </div>
          <div class="profile-duo-card">
            <span class="duo-number">${currentVendor.wasteSaved || '14.8 kg'}</span>
            <span class="duo-label">Waste Prevented / Week</span>
          </div>
        </div>

        <!-- Section: Stall Guidelines -->
        <div class="profile-info-group">
          <h4 class="profile-group-heading">Canteen Operating Rules</h4>
          <div class="profile-list-card">
            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="list-row-content">
                <strong>Prep Cutoff Window</strong>
                <p>Cutoff is 30 minutes before each student pickup slot. Lock batches before cooking.</p>
              </div>
            </div>

            <div class="profile-list-row">
              <div class="list-row-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <div class="list-row-content">
                <strong>Express Pickup Window</strong>
                <p>${currentVendor.expressWindow || 'Counter Window 2'} is dedicated for fast student pickup pass verification.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Sapat Principle -->
        <div class="profile-info-group">
          <h4 class="profile-group-heading">Sapat Kitchen Principles</h4>
          <div class="profile-list-card" style="padding: 12px 14px;">
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              By locking in student pre-orders before mass cooking, school canteens eliminate the guess-work of food preparation, saving raw ingredient costs and preventing food spoilage.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="profile-actions-stack">
          <button class="btn-profile-secondary" data-action="open-role-modal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            Switch Role or Stall Account
          </button>
          
          <button class="btn-profile-danger" data-action="reset-demo-data">
            Reset Demo Prototype Data
          </button>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    const select = container.querySelector('[data-action="switch-vendor-account"]');
    if (select) {
      select.addEventListener('change', (e) => {
        const vendorId = e.target.value;
        state.setCurrentVendor(vendorId);
        const v = SapatStorage.getVendorById(vendorId);
        showToast(`Switched account to ${v.name} (${v.stallNumber})`, 'success');
        this.render(container);
      });
    }

    container.addEventListener('click', (e) => {
      const roleBtn = e.target.closest('[data-action="open-role-modal"]');
      if (roleBtn) {
        openRoleModal();
        return;
      }

      const resetBtn = e.target.closest('[data-action="reset-demo-data"]');
      if (resetBtn) {
        if (!confirm('Reset Sapat prototype to factory seed data? This will restore original limits and 5-vendor mock data.')) return;
        state.resetAll();
        showToast('Prototype data reset to initial 5-vendor seed state!', 'success');
        this.render(container);
        return;
      }
    });
  }
};
