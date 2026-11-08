import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { renderVendorAccountBar } from '../../components/vendor-card.js';
import { showToast } from '../../components/toast.js';

export const vendorPrepPage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    const menu = SapatStorage.getMenu();

    let vendorDishes = menu.filter(d => d.vendorId === state.currentVendorId);

    if (state.vendorPrepTab === 'urgent') {
      vendorDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) >= 0.70 || d.reservedServings >= d.dailyLimit);
    } else if (state.vendorPrepTab === 'safe') {
      vendorDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) < 0.70 && d.reservedServings < d.dailyLimit);
    }

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-prep">
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <div class="page-header">
          <h3>${currentVendor.stallNumber} Kitchen Prep & Batch Control</h3>
          <p>Real-time cooking targets based on locked student pre-orders</p>
        </div>

        <!-- Filter Tabs -->
        <div class="segmented-control" style="margin-bottom: 14px;">
          <button class="segment-btn ${state.vendorPrepTab === 'all' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="all">
            All Dishes
          </button>
          <button class="segment-btn ${state.vendorPrepTab === 'urgent' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="urgent">
            High Demand (70%+)
          </button>
          <button class="segment-btn ${state.vendorPrepTab === 'safe' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="safe">
            Safe Capacity
          </button>
        </div>

        <!-- Prep Matrix Cards -->
        <div class="vendor-prep-list-wrap" style="display: flex; flex-direction: column; gap: 12px;">
          ${vendorDishes.length === 0 ? `
            <div class="empty-state-wrap" style="padding: 30px 16px;">
              <p>No dishes match the selected filter.</p>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

            return `
              <div class="prep-matrix-card">
                <div class="prep-matrix-header">
                  <div>
                    <h4 style="font-size: 14.5px; font-weight: 700;">${dish.name}</h4>
                    <span style="font-size: 11px; color: var(--text-secondary);">${dish.categoryName} &bull; ₱${dish.price}</span>
                  </div>
                  <span class="order-status-pill ${isSoldOut ? 'status-cancelled' : (pct >= 70 ? 'status-preparing' : 'status-confirmed')}">
                    ${isSoldOut ? 'SOLD OUT' : `${pct}% RESERVED`}
                  </span>
                </div>

                <div class="gauge-bar-track" style="margin: 10px 0 6px;">
                  <div class="gauge-bar-fill ${isSoldOut ? 'soldout' : (pct >= 70 ? 'warning' : '')}" style="width: ${pct}%;"></div>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px;">
                  <span><strong>${dish.reservedServings}</strong> of ${dish.dailyLimit} cooked portions reserved</span>
                  <span style="font-weight: 700; color: ${isSoldOut ? 'var(--status-cancelled)' : 'var(--primary)'};">${remaining} left</span>
                </div>

                <!-- Batch Adjuster -->
                <div style="background: var(--surface-muted); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11.5px; font-weight: 600; color: var(--text-secondary);">Daily Prep Quota:</span>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-bump" data-action="adjust-batch" data-dish-id="${dish.id}" data-delta="-5" style="width: 26px; height: 26px; padding: 0;">-5</button>
                    <span style="font-size: 13px; font-weight: 800; min-width: 26px; text-align: center;">${dish.dailyLimit}</span>
                    <button class="btn-bump" data-action="adjust-batch" data-dish-id="${dish.id}" data-delta="5" style="width: 26px; height: 26px; padding: 0;">+5</button>
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
      // Filter tab
      const tabBtn = e.target.closest('[data-action="filter-prep-tab"]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        if (tab) {
          state.vendorPrepTab = tab;
          this.render(container);
        }
        return;
      }

      // Adjust batch quota
      const adjustBtn = e.target.closest('[data-action="adjust-batch"]');
      if (adjustBtn) {
        const dishId = adjustBtn.getAttribute('data-dish-id');
        const delta = parseInt(adjustBtn.getAttribute('data-delta'), 10) || 0;
        if (dishId && delta !== 0) {
          this.handleAdjustBatch(dishId, delta, container);
        }
        return;
      }
    });
  },

  handleAdjustBatch(dishId, delta, container) {
    const menu = SapatStorage.getMenu();
    const dish = menu.find(d => d.id === dishId);
    if (!dish) return;

    const newLimit = dish.dailyLimit + delta;
    if (newLimit < dish.reservedServings) {
      showToast(`Cannot lower limit below already reserved servings (${dish.reservedServings})!`, 'error');
      return;
    }

    dish.dailyLimit = newLimit;
    SapatStorage.saveMenu(menu);
    showToast(`Daily limit for ${dish.name} set to ${newLimit} portions.`, 'success');
    this.render(container);
  }
};
