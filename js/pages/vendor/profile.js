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
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <div class="profile-card">
          <div class="profile-avatar" style="background: ${currentVendor.avatarColor};">${currentVendor.avatar}</div>
          <h3 class="profile-name">${currentVendor.name}</h3>
          <p class="profile-sub">${currentVendor.stallNumber} &bull; Main Canteen Hall</p>

          <div class="profile-stats-grid">
            <div class="p-stat-box">
              <div class="p-stat-val">${currentVendor.efficiency || '96%'}</div>
              <div class="p-stat-lbl">Kitchen Prep Accuracy</div>
            </div>
            <div class="p-stat-box">
              <div class="p-stat-val">${currentVendor.wasteSaved || '14.8 kg'}</div>
              <div class="p-stat-lbl">Waste Prevented This Wk</div>
            </div>
          </div>
        </div>

        <div class="info-box-card">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Canteen Operating Rules
          </h4>
          <p>
            <strong>Operating Hours:</strong> ${currentVendor.hours}<br>
            <strong>Prep Cutoff:</strong> 30 minutes before slot<br>
            <strong>Express Pickup Lane:</strong> ${currentVendor.expressWindow || 'Counter Window 2'}
          </p>
        </div>

        <div class="info-box-card">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Sapat Principle for Canteens
          </h4>
          <p>
            By locking in student pre-orders before mass cooking, school canteens eliminate the guess-work of food preparation, saving raw ingredient costs and preventing food spoilage.
          </p>
        </div>

        <button class="btn-secondary-action" style="width: 100%; height: 40px; margin-top: 10px;" data-action="open-role-modal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
          Switch Role / Canteen Stall
        </button>

        <button class="btn-secondary-action" style="width: 100%; height: 40px; margin-top: 10px;" data-action="reset-demo-data">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          Reset Demo Data
        </button>
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

