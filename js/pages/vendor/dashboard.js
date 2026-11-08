import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { renderVendorAccountBar } from '../../components/vendor-card.js';
import { showToast } from '../../components/toast.js';

export const vendorDashboardPage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
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

    const urgentDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) >= 0.70 || d.reservedServings >= d.dailyLimit);

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-dashboard">
        
        <!-- Stall Account Selector Bar -->
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <!-- Vendor Header Identity -->
        <div class="vendor-identity-card">
          <span class="v-stall-tag">${currentVendor.stallNumber} &bull; ${currentVendor.category}</span>
          <h2 class="v-stall-name">${currentVendor.name}</h2>
          <p class="v-stall-hours">Kitchen Target & Pre-order Status (${currentVendor.hours})</p>
        </div>

        <!-- 4 Core Operational KPIs -->
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
            <span class="v-kpi-sub">Available to book</span>
          </div>

          <div class="v-kpi-card">
            <span class="v-kpi-title">Projected Sales</span>
            <strong class="v-kpi-val">₱${totalProjectedSales.toLocaleString()}</strong>
            <span class="v-kpi-sub">Pre-ordered total</span>
          </div>
        </div>

        <!-- Smart Preparation Recommendation Widget -->
        <div class="v-smart-prep-card">
          <div class="v-smart-prep-head">
            <svg class="v-smart-prep-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <strong>Smart Batch Recommendation</strong>
          </div>
          <p class="v-smart-prep-body">${smartPrepHTML}</p>
        </div>

        <!-- Kitchen Prep Status Section -->
        <div class="section-row-header" style="margin-top: 18px;">
          <div>
            <h3 class="section-heading">Kitchen Prep Status</h3>
            <span class="section-subtext">Live batch capacity for ${currentVendor.stallNumber} dishes</span>
          </div>
        </div>

        <div class="v-prep-status-stack">
          ${urgentDishes.length === 0 ? `
            <div class="v-prep-safe-notice">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>All ${currentVendor.name} dishes are operating within safe preparation limits. No sold-out spikes yet.</span>
            </div>
          ` : urgentDishes.map(dish => {
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
                  <span class="order-status-badge ${isSoldOut ? 'status-cancelled' : 'status-preparing'}">
                    ${isSoldOut ? 'CAPACITY HIT' : '70%+ RESERVED'}
                  </span>
                </div>
                
                <div class="v-dish-quota-bar">
                  <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : 'warning'}" style="width: ${pct}%;"></div>
                </div>

                <div class="v-dish-quota-footer">
                  <span><strong>${dish.reservedServings}</strong> reserved of ${dish.dailyLimit} target</span>
                  <span class="quota-left-pill ${isSoldOut ? 'soldout' : 'warning'}">${remaining} portions left</span>
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
  }
};
