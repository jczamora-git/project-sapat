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
        
        <!-- Stall Account Selector Bar -->
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <div class="page-title-wrap">
          <h2 class="page-main-heading">${currentVendor.stallNumber} Batch Control</h2>
          <p class="page-main-sub">Live kitchen cooking quotas locked from student pre-orders</p>
        </div>

        <!-- Filter Segmented Control -->
        <div class="segmented-pill-control" style="margin-bottom: 14px;">
          <button class="seg-pill-btn ${state.vendorPrepTab === 'all' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="all">
            All Dishes
          </button>
          <button class="seg-pill-btn ${state.vendorPrepTab === 'urgent' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="urgent">
            High Demand (70%+)
          </button>
          <button class="seg-pill-btn ${state.vendorPrepTab === 'safe' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="safe">
            Safe Capacity
          </button>
        </div>

        <!-- Prep Matrix Cards Stack -->
        <div class="v-prep-matrix-stack">
          ${vendorDishes.length === 0 ? `
            <div class="empty-state-wrap">
              <p>No dishes match the selected capacity filter.</p>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

            return `
              <div class="v-prep-status-card">
                <div class="v-prep-status-head">
                  <div>
                    <h4 class="v-dish-name">${dish.name}</h4>
                    <span class="v-dish-meta">${dish.categoryName} &bull; ₱${dish.price}</span>
                  </div>
                  <span class="order-status-badge ${isSoldOut ? 'status-cancelled' : (pct >= 70 ? 'status-preparing' : 'status-confirmed')}">
                    ${isSoldOut ? 'SOLD OUT' : `${pct}% RESERVED`}
                  </span>
                </div>

                <div class="v-dish-quota-bar">
                  <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : (pct >= 70 ? 'warning' : '')}" style="width: ${pct}%;"></div>
                </div>

                <div class="v-dish-quota-footer">
                  <span><strong>${dish.reservedServings}</strong> of ${dish.dailyLimit} cooked portions reserved</span>
                  <span class="quota-left-pill ${isSoldOut ? 'soldout' : (pct >= 70 ? 'warning' : 'safe')}">${remaining} portions left</span>
                </div>

                <!-- Batch Adjuster Toolbar -->
                <div class="v-batch-adjust-row">
                  <span class="adjust-label">Daily Kitchen Limit:</span>
                  <div class="adjust-stepper">
                    <button class="btn-step-adjust" data-action="adjust-batch" data-dish-id="${dish.id}" data-delta="-5" title="Decrease batch by 5 portions">−5</button>
                    <span class="adjust-value">${dish.dailyLimit}</span>
                    <button class="btn-step-adjust" data-action="adjust-batch" data-dish-id="${dish.id}" data-delta="5" title="Increase batch by 5 portions">+5</button>
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
    if (newLimit < 5) {
      showToast('Daily preparation limit cannot be less than 5 portions.', 'warning');
      return;
    }

    const success = SapatStorage.updateDishDailyLimit(dishId, newLimit);
    if (success) {
      showToast(`Adjusted ${dish.name} batch target to ${newLimit} portions`, 'success');
      this.render(container);
    }
  }
};
