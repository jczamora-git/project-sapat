import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';

export const vendorDashboardPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset') {
          const currentScreen = document.getElementById('screen-vendor-dashboard');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    if (!currentVendor) return;

    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders();

    const vendorDishes = menu.filter(d => d.vendorId === state.currentVendorId);
    const vendorOrders = orders.filter(o => o.vendorId === state.currentVendorId);

    const totalOrdersCount = vendorOrders.filter(o => o.status !== 'Cancelled').length;
    const totalDailyLimit = vendorDishes.reduce((sum, d) => sum + d.dailyLimit, 0);
    const totalReserved = vendorDishes.reduce((sum, d) => sum + d.reservedServings, 0);
    const totalRemaining = Math.max(0, totalDailyLimit - totalReserved);
    const totalProjectedSales = vendorOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    let smartPrepHTML = '';
    if (currentVendor.id === 'vendor-lita') {
      smartPrepHTML = `High pre-orders detected for <strong>Chicken Adobo (45 servings)</strong>. Keep current batch limit to avoid overcooking.`;
    } else if (currentVendor.id === 'vendor-ben') {
      smartPrepHTML = `Morning rush peaks for <strong>Tapsilog (40 portions)</strong> and <strong>Longsilog (35 portions)</strong>. 12 portions remain available before cutoff.`;
    } else if (currentVendor.id === 'vendor-cora') {
      smartPrepHTML = `Steady midday demand for <strong>Pork Giniling (35 servings)</strong> and <strong>Ginisang Monggo (40 servings)</strong>. Preparation limits are on target.`;
    } else if (currentVendor.id === 'vendor-green') {
      smartPrepHTML = `Healthy bowls show rapid reservations for <strong>Chicken Teriyaki</strong> and <strong>Tuna Rice Bowls</strong>. Batch capacity safe at 57% reserved.`;
    } else {
      smartPrepHTML = `Snack peaks at 9:45 AM & 3:00 PM for <strong>Turon (50 servings)</strong> and <strong>Pancit Bihon (45 servings)</strong>. Fry fresh in 25-minute batches.`;
    }

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-dashboard">
        
        <!-- Vendor Stall Identity Card -->
        <div class="vendor-identity-card">
          <div class="v-identity-top">
            <span class="v-stall-tag">${currentVendor.stallNumber}</span>
            <span class="v-stall-category">${currentVendor.category}</span>
          </div>
          <h2 class="v-stall-name">${currentVendor.name}</h2>
          <div class="v-identity-footer">
            <span class="v-stall-hours">${currentVendor.hours} &bull; ${currentVendor.expressWindow || 'Express Window'}</span>
            <button class="v-switch-stall-btn" data-action="open-role-modal" title="Switch Canteen Stall Account">
              Switch Stall
            </button>
          </div>
        </div>

        <!-- 4 Core Operational KPIs (Compact Presentation) -->
        <div class="v-kpi-grid">
          <div class="v-kpi-card">
            <span class="v-kpi-title">Incoming Orders</span>
            <strong class="v-kpi-val">${totalOrdersCount}</strong>
            <span class="v-kpi-sub">Active today</span>
          </div>

          <div class="v-kpi-card">
            <span class="v-kpi-title">Reserved Servings</span>
            <strong class="v-kpi-val">${totalReserved}</strong>
            <span class="v-kpi-sub">of ${totalDailyLimit} target</span>
          </div>

          <div class="v-kpi-card">
            <span class="v-kpi-title">Remaining Quota</span>
            <strong class="v-kpi-val ${totalRemaining <= 10 ? 'alert-orange' : ''}">${totalRemaining}</strong>
            <span class="v-kpi-sub">Available portions</span>
          </div>

          <div class="v-kpi-card">
            <span class="v-kpi-title">Projected Sales</span>
            <strong class="v-kpi-val">₱${totalProjectedSales.toLocaleString()}</strong>
            <span class="v-kpi-sub">Pre-ordered revenue</span>
          </div>
        </div>

        <!-- Smart Preparation Recommendation Widget -->
        <div class="v-smart-prep-card">
          <div class="v-smart-prep-head">
            <svg class="v-smart-prep-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <strong>Smart Preparation Recommendation</strong>
          </div>
          <p class="v-smart-prep-body">${smartPrepHTML}</p>
        </div>

        <!-- Kitchen Preparation Status Section -->
        <div class="section-row-header" style="margin-top: 18px;">
          <div>
            <h3 class="section-heading">Kitchen Preparation Status</h3>
            <span class="section-subtext">Live cooking quotas & portion limits</span>
          </div>
          <button class="section-see-all-btn" data-route="#/vendor/prep">Batch Control</button>
        </div>

        <div class="v-prep-status-stack">
          ${vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
            const isHighDemand = pct >= 70;

            let tagClass = 'status-confirmed';
            let tagText = `${pct}% Reserved`;
            if (isSoldOut) {
              tagClass = 'status-cancelled';
              tagText = 'CAPACITY HIT';
            } else if (isHighDemand) {
              tagClass = 'status-preparing';
              tagText = 'APPROACHING LIMIT';
            }

            return `
              <div class="v-prep-status-card">
                <div class="v-prep-card-main">
                  <div class="v-prep-thumb">
                    <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                  </div>
                  <div class="v-prep-card-details">
                    <div class="v-prep-status-head">
                      <h4 class="v-dish-name">${dish.name}</h4>
                      <span class="order-status-badge ${tagClass}">
                        ${tagText}
                      </span>
                    </div>
                    <div class="v-dish-meta-row">
                      <span>${dish.categoryName || 'Ulam'} &bull; ₱${dish.price}</span>
                      <span class="v-quota-stat-pill ${isSoldOut ? 'soldout' : (isHighDemand ? 'warning' : '')}">
                        <strong>${remaining}</strong> left
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Progress Track -->
                <div class="v-dish-quota-bar">
                  <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : (isHighDemand ? 'warning' : '')}" style="width: ${pct}%;"></div>
                </div>

                <div class="v-dish-quota-footer">
                  <span><strong>${dish.reservedServings}</strong> of ${dish.dailyLimit} target reserved</span>
                  <span class="v-quota-pct-label">${pct}%</span>
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
    container.addEventListener('click', (e) => {
      // Direct navigation
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      // Switch stall
      const switchStallBtn = e.target.closest('[data-action="open-role-modal"]');
      if (switchStallBtn) {
        openRoleModal();
        return;
      }
    });
  }
};
