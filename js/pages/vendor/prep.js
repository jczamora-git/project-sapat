import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';
import { ForecastingService } from '../../services/forecasting.service.js';

export const vendorPrepPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset' || event === 'menu-updated') {
          const currentScreen = document.getElementById('screen-vendor-prep');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    if (!currentVendor) return;

    const menu = SapatStorage.getMenu();
    let vendorDishes = menu.filter(d => d.vendorId === state.currentVendorId);

    const activeFilter = state.vendorPrepTab || 'all';
    if (activeFilter === 'urgent') {
      vendorDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) >= 0.70 || d.reservedServings >= d.dailyLimit);
    } else if (activeFilter === 'safe') {
      vendorDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) < 0.70 && d.reservedServings < d.dailyLimit);
    }

    const forecast = ForecastingService.getVendorForecast(state.currentVendorId);
    const forecastMap = new Map((forecast.dishes || []).map(d => [d.dishId, d]));

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-prep">
        
        <!-- Page Title & Forecast Subtitle -->
        <div class="v-prep-header-row">
          <div>
            <h2 class="page-main-heading">${currentVendor.stallNumber} Kitchen Prep Control</h2>
            <p class="page-main-sub">Lock mass-cooking batches to exact pre-orders & adjust daily limits</p>
          </div>
          <span class="v-ai-preview-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            AI Forecast Active
          </span>
        </div>

        <!-- Filter Segmented Control -->
        <div class="v-prep-segment-control">
          <button class="v-prep-seg-btn ${activeFilter === 'all' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="all" type="button">
            All Dishes
          </button>
          <button class="v-prep-seg-btn ${activeFilter === 'urgent' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="urgent" type="button">
            High Demand (70%+)
          </button>
          <button class="v-prep-seg-btn ${activeFilter === 'safe' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="safe" type="button">
            Safe Capacity
          </button>
        </div>

        <!-- Dish Preparation Matrix Cards Stack -->
        <div class="v-prep-matrix-stack">
          ${vendorDishes.length === 0 ? `
            <div class="v-empty-prep-card">
              <p>No dishes match the selected capacity filter.</p>
              <button class="btn-filter-reset" style="margin-top: 10px;" data-action="filter-prep-tab" data-tab="all">Show All Dishes</button>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
            const isHighDemand = pct >= 70;
            const canDecrease = (dish.dailyLimit - 5) >= dish.reservedServings && (dish.dailyLimit - 5) >= 5;
            const dishForecast = forecastMap.get(dish.id);

            return `
              <div class="v-prep-card">
                <!-- Top Details Row -->
                <div class="v-prep-card-top">
                  <div class="v-prep-dish-media">
                    <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                  </div>
                  <div class="v-prep-dish-info">
                    <div class="v-prep-name-status-row">
                      <h4 class="v-dish-name">${dish.name}</h4>
                      <span class="order-status-badge ${isSoldOut ? 'status-cancelled' : (isHighDemand ? 'status-preparing' : 'status-confirmed')}">
                        ${isSoldOut ? 'CAPACITY HIT' : `${pct}% RESERVED`}
                      </span>
                    </div>
                    <span class="v-dish-meta">${dish.categoryName || 'Ulam'} &bull; ₱${dish.price}</span>
                  </div>
                </div>

                <!-- 4 Operational Metrics Row -->
                <div class="v-dish-stats-grid" style="margin: 10px 0 8px;">
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Daily Target</span>
                    <strong class="v-cell-val">${dish.dailyLimit}</strong>
                  </div>
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Reserved</span>
                    <strong class="v-cell-val">${dish.reservedServings}</strong>
                  </div>
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Remaining</span>
                    <strong class="v-cell-val ${isSoldOut ? 'soldout' : ''}">${remaining}</strong>
                  </div>
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Booking Rate</span>
                    <strong class="v-cell-val ${isHighDemand ? 'warning' : ''}">${pct}%</strong>
                  </div>
                </div>

                <!-- Progress Track -->
                <div class="v-dish-quota-bar">
                  <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : (isHighDemand ? 'warning' : '')}" style="width: ${pct}%;"></div>
                </div>

                <!-- SAPAT Intelligence Recommendation Callout -->
                ${dishForecast ? `
                  <div class="v-prep-ai-callout ${dishForecast.actionType === 'increase' ? 'warning' : ''}">
                    <div class="v-ai-callout-header">
                      <div class="v-ai-icon-title">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        <strong>AI Forecast: ~${dishForecast.predictedDemand} portions demand</strong>
                      </div>
                      <span class="v-ai-suggest-pill">Suggested Target: ${dishForecast.suggestedTarget}</span>
                    </div>
                    <p class="v-ai-callout-text">${dishForecast.explanation}</p>
                    ${dishForecast.actionType !== 'maintain' && dishForecast.suggestedTarget !== dish.dailyLimit ? `
                      <button class="v-prep-apply-ai-btn" data-action="set-dish-limit" data-dish-id="${dish.id}" data-target="${dishForecast.suggestedTarget}" type="button">
                        Apply Suggested Target (${dishForecast.suggestedTarget})
                      </button>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Manual Limit Adjust Controls -->
                <div class="v-prep-control-row">
                  <div class="v-prep-control-label">
                    <span>Manual Target Adjustment:</span>
                    <small>Safety protected (min. ${dish.reservedServings})</small>
                  </div>
                  <div class="v-prep-stepper">
                    <button class="v-step-btn ${!canDecrease ? 'disabled' : ''}" 
                      data-action="adjust-limit" 
                      data-dish-id="${dish.id}" 
                      data-delta="-5" 
                      ${!canDecrease ? 'disabled' : ''}
                      title="${!canDecrease ? 'Cannot decrease below already locked student pre-orders' : 'Decrease daily target by 5'}">
                      -5
                    </button>
                    <span class="v-step-current">${dish.dailyLimit}</span>
                    <button class="v-step-btn" 
                      data-action="adjust-limit" 
                      data-dish-id="${dish.id}" 
                      data-delta="5"
                      title="Increase daily target by 5 portions">
                      +5
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- Campus Shift Distribution Note -->
        <div class="v-prep-shifts-summary-card">
          <h4 class="v-shifts-title">Preparation Shift Windows</h4>
          <p class="v-shifts-desc">Pre-orders are locked 30 minutes before each student meal window to allow accurate batch cooking.</p>
          <div class="v-shifts-grid">
            <div class="v-shift-cell">
              <strong>Morning Recess</strong>
              <span>9:45 AM &bull; Snacks & Finger Foods</span>
            </div>
            <div class="v-shift-cell">
              <strong>Lunch Shift 1</strong>
              <span>11:30 AM &bull; Primary Rice Meals</span>
            </div>
            <div class="v-shift-cell">
              <strong>Lunch Shift 2</strong>
              <span>12:15 PM &bull; Secondary High School</span>
            </div>
          </div>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      // Filter tabs
      const filterBtn = e.target.closest('[data-action="filter-prep-tab"]');
      if (filterBtn) {
        const tab = filterBtn.getAttribute('data-tab');
        if (tab) {
          state.vendorPrepTab = tab;
          this.render(container);
        }
        return;
      }

      // Step adjust limit (+5 or -5)
      const stepBtn = e.target.closest('[data-action="adjust-limit"]');
      if (stepBtn) {
        const dishId = stepBtn.getAttribute('data-dish-id');
        const delta = parseInt(stepBtn.getAttribute('data-delta'), 10);
        if (dishId && !isNaN(delta)) {
          const menu = SapatStorage.getMenu();
          const dish = menu.find(d => d.id === dishId);
          if (dish) {
            const newLimit = dish.dailyLimit + delta;
            if (newLimit < dish.reservedServings) {
              showToast(`Cannot reduce limit below locked reservations (${dish.reservedServings})`, 'warning');
              return;
            }
            if (newLimit < 5) {
              showToast('Minimum daily target is 5 portions', 'warning');
              return;
            }
            dish.dailyLimit = newLimit;
            SapatStorage.saveMenu(menu);
            showToast(`${dish.name} daily limit updated to ${newLimit}`, 'success');
            this.render(container);
          }
        }
        return;
      }

      // Set target directly from AI suggestion
      const setLimitBtn = e.target.closest('[data-action="set-dish-limit"]');
      if (setLimitBtn) {
        const dishId = setLimitBtn.getAttribute('data-dish-id');
        const target = parseInt(setLimitBtn.getAttribute('data-target'), 10);
        if (dishId && !isNaN(target)) {
          const menu = SapatStorage.getMenu();
          const dish = menu.find(d => d.id === dishId);
          if (dish) {
            dish.dailyLimit = target;
            SapatStorage.saveMenu(menu);
            showToast(`Daily target for ${dish.name} set to ${target}`, 'success');
            this.render(container);
          }
        }
        return;
      }
    });
  }
};
