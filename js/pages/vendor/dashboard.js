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
      smartPrepHTML = `High demand detected for <strong>Chicken Adobo (45 servings)</strong> and <strong>Pork Sinigang (35 servings)</strong>. Keep current batch limit to avoid overcooking.`;
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
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <!-- Vendor Canteen Header -->
        <div style="margin-bottom: 16px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-amber); text-transform: uppercase; letter-spacing: 0.5px;">${currentVendor.stallNumber} &bull; ${currentVendor.category}</span>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">${currentVendor.name}</h2>
          <p style="font-size: 12px; color: var(--text-secondary);">Today's Kitchen Production Target & Orders (${currentVendor.hours})</p>
        </div>

        <!-- 4 Core KPIs -->
        <div class="vendor-kpi-grid">
          <div class="vendor-kpi-card">
            <span class="kpi-title">Incoming Preorders</span>
            <span class="kpi-value">${totalOrdersCount}</span>
            <span class="kpi-subtext">Active today</span>
          </div>

          <div class="vendor-kpi-card">
            <span class="kpi-title">Reserved Servings</span>
            <span class="kpi-value">${totalReserved}</span>
            <span class="kpi-subtext">of ${totalDailyLimit} daily target</span>
          </div>

          <div class="vendor-kpi-card">
            <span class="kpi-title">Remaining to Reserve</span>
            <span class="kpi-value">${totalRemaining}</span>
            <span class="kpi-subtext alert">Available</span>
          </div>

          <div class="vendor-kpi-card">
            <span class="kpi-title">Projected Sales</span>
            <span class="kpi-value">₱${totalProjectedSales.toLocaleString()}</span>
            <span class="kpi-subtext">Preordered total</span>
          </div>
        </div>

        <!-- Smart Preparation Recommendation -->
        <div class="info-box-card" style="margin-top: 14px;">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            Smart Daily Prep Recommendation
          </h4>
          <p>${smartPrepHTML}</p>
        </div>

        <!-- Urgent Preparation Status Items for THIS vendor only -->
        <div class="section-header" style="margin-top: 18px;">
          <h3>Kitchen Prep Status (${currentVendor.stallNumber})</h3>
        </div>
        <div id="vendor-dashboard-urgent-dishes" style="display: flex; flex-direction: column; gap: 8px;">
          ${urgentDishes.length === 0 ? `
            <div style="background: white; border-radius: 12px; padding: 14px; text-align: center; color: var(--text-secondary); font-size: 12px; border: 1px solid var(--border-light);">
              <div style="display:inline-flex; align-items:center; gap:6px; color: var(--primary); font-weight: 500;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> All ${currentVendor.name} dishes are operating within safe preparation limits. No sold-out spikes yet.</div>
            </div>
          ` : urgentDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
            return `
              <div class="prep-matrix-card">
                <div class="prep-matrix-header">
                  <div>
                    <h4 style="font-size: 14px; font-weight: 700;">${dish.name}</h4>
                    <span style="font-size: 11px; color: var(--text-secondary);">${dish.categoryName} &bull; ₱${dish.price}</span>
                  </div>
                  <span class="order-status-pill ${isSoldOut ? 'status-cancelled' : 'status-preparing'}">
                    ${isSoldOut ? 'CAPACITY HIT' : '70%+ RESERVED'}
                  </span>
                </div>
                <div class="gauge-bar-track" style="margin: 8px 0 6px;">
                  <div class="gauge-bar-fill ${isSoldOut ? 'soldout' : 'warning'}" style="width: ${pct}%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11.5px;">
                  <span><strong>${dish.reservedServings}</strong> reserved of ${dish.dailyLimit} target</span>
                  <span style="font-weight: 700; color: ${isSoldOut ? 'var(--status-cancelled)' : 'var(--accent-amber)'};">${remaining} left</span>
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

