import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const adminSettingsPage = {
  render(container) {
    const currentContext = SapatStorage.getForecastContext('vendor-lita') || {
      academicSchedule: 'Regular Academic Schedule',
      weatherCondition: 'Rainy'
    };

    container.innerHTML = `
      <section class="screen active admin-screen" id="screen-admin-settings">
        
        <!-- Header -->
        <div class="admin-page-header">
          <div class="admin-header-left">
            <div class="admin-campus-pill">
              <span class="admin-live-dot"></span>
              <span>System & Campus Settings &bull; Configuration</span>
            </div>
            <h2 class="admin-main-title">Campus System Settings</h2>
            <p class="admin-main-sub">Operating policies, cutoff rules, and demo environment controls</p>
          </div>
        </div>

        <!-- Section 1: Operational Policies -->
        <div class="admin-settings-card">
          <div class="settings-card-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <h3 class="settings-card-title">Pre-order &amp; Cooking Cutoff Policies</h3>
          </div>
          
          <div class="settings-options-list">
            <div class="settings-option-row">
              <div class="option-info">
                <strong>Shift Cutoff Window</strong>
                <p>Locks pre-orders 30 mins before pickup so cooks prepare exact portions.</p>
              </div>
              <span class="settings-value-pill">30 Minutes</span>
            </div>

            <div class="settings-option-row">
              <div class="option-info">
                <strong>Strict Daily Limit Ceiling</strong>
                <p>Prevents student orders from exceeding verified cooking thresholds.</p>
              </div>
              <span class="settings-badge-active">Enabled (Strict)</span>
            </div>

            <div class="settings-option-row">
              <div class="option-info">
                <strong>Instant Portion Return</strong>
                <p>Cancelled pre-orders are restored immediately to canteen inventory.</p>
              </div>
              <span class="settings-badge-active">Active</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Payment Governance & Student Accountability -->
        <div class="admin-settings-card">
          <div class="settings-card-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h3 class="settings-card-title">Payment Governance &amp; OSAS Accountability Policies</h3>
          </div>
          
          <div class="settings-options-list">
            <div class="settings-option-row">
              <div class="option-info">
                <strong>Institution &amp; Student Affairs Office</strong>
                <p>Receiving office for uncollected meals and food waste infractions.</p>
              </div>
              <span class="settings-value-pill">MinSU &bull; OSAS</span>
            </div>

            <div class="settings-option-row">
              <div class="option-info">
                <strong>Direct Counter Payment Cutoff</strong>
                <p>Time allowed for in-person counter settlement before auto-release.</p>
              </div>
              <span class="settings-value-pill">20 Minutes</span>
            </div>

            <div class="settings-option-row">
              <div class="option-info">
                <strong>Pickup Shift Grace Period</strong>
                <p>Post-shift window before uncollected orders are logged as No-Show.</p>
              </div>
              <span class="settings-value-pill">15 Minutes</span>
            </div>

            <div class="settings-option-row">
              <div class="option-info">
                <strong>Disciplinary Review Threshold</strong>
                <p>Unexcused no-show incidents triggering mandatory OSAS referral.</p>
              </div>
              <span class="settings-badge-active" style="background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;">2 Incidents (Flagged)</span>
            </div>
          </div>
        </div>

        <!-- Section 3: Campus Pickup Windows -->
        <div class="admin-settings-card">
          <div class="settings-card-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <h3 class="settings-card-title">Configured Pickup Shift Windows</h3>
          </div>
          
          <div class="settings-options-list">
            <div class="settings-option-row">
              <div class="option-info">
                <strong>Lunch Shift 1 (Early Lunch)</strong>
                <p>Fresh batch pickup for Senior High &amp; morning sections.</p>
              </div>
              <span class="settings-value-pill">11:30 AM &ndash; 12:15 PM</span>
            </div>

            <div class="settings-option-row">
              <div class="option-info">
                <strong>Lunch Shift 2 (Peak Lunch)</strong>
                <p>Staggered wave for Junior High &amp; midday sections.</p>
              </div>
              <span class="settings-value-pill">12:15 PM &ndash; 1:00 PM</span>
            </div>

            <div class="settings-option-row">
              <div class="option-info">
                <strong>Afternoon Recess Shift</strong>
                <p>Fresh merienda &amp; snack pickup window.</p>
              </div>
              <span class="settings-value-pill">2:45 PM &ndash; 3:30 PM</span>
            </div>
          </div>
        </div>

        <!-- Section 4: Campus Academic & Event Schedule Context -->
        <div class="admin-settings-card">
          <div class="settings-card-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <h3 class="settings-card-title">Campus Events &amp; Academic Schedule (Slide 7 Oversight)</h3>
          </div>
          <p class="settings-lead-desc">
            Campus-wide calendar and event context. Aligns demand forecasting across all 5 canteen stall terminals.
          </p>
          
          <div class="settings-options-list">
            <div class="settings-option-row settings-select-row">
              <div class="option-info">
                <strong>Campus Academic Calendar Scenario</strong>
                <p>Adjusts expected walk-in volume based on class schedules.</p>
              </div>
              <select id="admin-setting-academic-schedule" class="sapat-form-select admin-select-control">
                <option value="Regular Academic Schedule" ${currentContext.academicSchedule === 'Regular Academic Schedule' ? 'selected' : ''}>Regular Academic Schedule (Baseline)</option>
                <option value="Examination Week" ${currentContext.academicSchedule === 'Examination Week' ? 'selected' : ''}>Examination Week (+25% Volume)</option>
                <option value="Campus Event" ${currentContext.academicSchedule === 'Campus Event' ? 'selected' : ''}>Campus Event (+25% Dwell & Merienda)</option>
                <option value="No Classes" ${currentContext.academicSchedule === 'No Classes' ? 'selected' : ''}>Holiday / No Classes (-50% Volume)</option>
              </select>
            </div>

            <div class="settings-option-row settings-select-row">
              <div class="option-info">
                <strong>Weather Simulation Context</strong>
                <p>Simulates hot soup vs cold beverage demand.</p>
              </div>
              <select id="admin-setting-weather" class="sapat-form-select admin-select-control">
                <option value="Rainy" ${currentContext.weatherCondition === 'Rainy' ? 'selected' : ''}>Rainy (+18% Soup / Warm Broth)</option>
                <option value="Sunny" ${currentContext.weatherCondition === 'Sunny' ? 'selected' : ''}>Sunny (Standard Baseline Traffic)</option>
                <option value="Cloudy" ${currentContext.weatherCondition === 'Cloudy' ? 'selected' : ''}>Cloudy / Overcast (Normal Velocity)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 3: Demo Role Navigation & Prototype Controls -->
        <div class="admin-settings-card">
          <div class="settings-card-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            <h3 class="settings-card-title">Prototype Role Navigation</h3>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
            Switch perspectives to evaluate the full SAPAT experience across all user roles:
          </p>

          <div class="admin-role-switch-grid">
            <button class="btn-role-tile student" data-action="switch-to-student">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              <div>
                <strong>Student Experience</strong>
                <small>Browse menu, reserve dishes & view pickup pass</small>
              </div>
            </button>

            <button class="btn-role-tile vendor" data-action="switch-to-vendor">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line></svg>
              <div>
                <strong>Canteen Vendor Terminal</strong>
                <small>Control cooking batch limits & incoming orders</small>
              </div>
            </button>
          </div>

          <div class="admin-reset-data-row">
            <div class="reset-data-info">
              <strong style="color: var(--error); font-size: 12.5px;">Reset Demo Prototype Data</strong>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Restores all 5 stalls, default dishes, pre-orders and inventory limits.</p>
            </div>
            <button class="btn-admin-danger" data-action="reset-app-data">
              Reset Data
            </button>
          </div>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    // Academic & Weather context settings
    const acadSelect = container.querySelector('#admin-setting-academic-schedule');
    if (acadSelect) {
      acadSelect.addEventListener('change', (e) => {
        SapatStorage.saveForecastContext('vendor-lita', { academicSchedule: e.target.value });
        showToast(`Campus schedule context updated: ${e.target.value}`, 'success');
      });
    }

    const weatherSelect = container.querySelector('#admin-setting-weather');
    if (weatherSelect) {
      weatherSelect.addEventListener('change', (e) => {
        SapatStorage.saveForecastContext('vendor-lita', { weatherCondition: e.target.value });
        showToast(`Campus weather simulation updated: ${e.target.value}`, 'success');
      });
    }

    container.addEventListener('click', (e) => {
      // Switch to Student
      const studentBtn = e.target.closest('[data-action="switch-to-student"]');
      if (studentBtn) {
        state.setRole('student');
        router.navigate('#/student/home');
        showToast('Switched to Student Experience', 'info');
        return;
      }

      // Switch to Vendor
      const vendorBtn = e.target.closest('[data-action="switch-to-vendor"]');
      if (vendorBtn) {
        state.setRole('vendor');
        router.navigate('#/vendor/dashboard');
        showToast('Switched to Canteen Vendor Terminal', 'info');
        return;
      }

      // Reset Demo Data
      const resetBtn = e.target.closest('[data-action="reset-app-data"]');
      if (resetBtn) {
        if (!confirm('Reset all prototype demo data to factory defaults?')) return;
        SapatStorage.resetData();
        showToast('Demo prototype data restored to defaults', 'success');
        this.render(container);
      }
    });
  }
};

