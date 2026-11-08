import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentProfilePage = {
  render(container) {
    const settings = SapatStorage.getSettings();
    const studentProf = settings.studentProfile || {
      name: 'Maria Santos',
      id: '2024-0891',
      grade: 'Grade 11 - STEM A',
      preordersCount: 16,
      wasteSavedKg: 5.4
    };

    container.innerHTML = `
      <section class="screen active" id="screen-student-profile">
        <div class="profile-card">
          <div class="profile-avatar">MS</div>
          <h3 class="profile-name">${studentProf.name}</h3>
          <p class="profile-sub">${studentProf.grade} &bull; ID #${studentProf.id}</p>

          <div class="profile-stats-grid">
            <div class="p-stat-box">
              <div class="p-stat-val">${studentProf.preordersCount}</div>
              <div class="p-stat-lbl">Pre-orders Placed</div>
            </div>
            <div class="p-stat-box">
              <div class="p-stat-val">${studentProf.wasteSavedKg} kg</div>
              <div class="p-stat-lbl">Food Waste Avoided</div>
            </div>
          </div>
        </div>

        <div class="info-box-card">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Pre-order Guidelines & Cut-off
          </h4>
          <p>
            &bull; Pre-orders ensure canteens prepare accurate servings and reduce leftover spoilage.<br>
            &bull; Cut-off time is 30 minutes before your selected pickup slot.<br>
            &bull; Ready meals can be claimed quickly at the designated stall express lane.<br>
            &bull; Cancellations release servings back to your fellow students instantly.
          </p>
        </div>

        <div class="info-box-card">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            About Sapat System
          </h4>
          <p>
            Sapat bridges school canteens and hungry students through exact-portion pre-ordering. Cooks produce what is guaranteed to be eaten, preventing school kitchen waste.
          </p>
        </div>

        <button class="btn-secondary-action" style="width: 100%; height: 40px; margin-top: 10px;" data-action="open-role-modal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
          Switch Role / Canteen
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

