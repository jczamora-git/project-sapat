import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';

export const adminAnalyticsPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'role-changed' || event === 'data-reset') {
          const currentScreen = document.getElementById('screen-admin-analytics');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders();

    const totalReserved = menu.reduce((s, d) => s + d.reservedServings, 0);
    const totalLimit = menu.reduce((s, d) => s + d.dailyLimit, 0);
    const wastePreventedKg = (totalReserved * 0.052).toFixed(1);

    // AI demand sample data for key campus dishes
    const aiPredictions = [
      { dish: 'Chicken Adobo', stall: "Ate Lita's Kitchen (Stall #3)", factors: 'Sunny & Hot (+8% ulam)', aiForecast: 48, actual: 42, variance: '+12.5%', confidence: '96.2%' },
      { dish: 'Beef Tapa Silog', stall: "Kuya Ben's Silog (Stall #1)", factors: 'Morning Exam (+15% silog)', aiForecast: 40, actual: 38, variance: '+5.0%', confidence: '97.5%' },
      { dish: 'Pork Sinigang', stall: "Ate Lita's Kitchen (Stall #3)", factors: 'Midday Lunch Shift 1', aiForecast: 35, actual: 30, variance: '+14.2%', confidence: '93.8%' },
      { dish: 'Pork Giniling', stall: "Nanay Cora's (Stall #2)", factors: 'Regular Schedule', aiForecast: 35, actual: 29, variance: '+17.1%', confidence: '91.4%' },
      { dish: 'Chicken Teriyaki Bowl', stall: "Green Bowl (Stall #4)", factors: 'High Gym & Athletics Day', aiForecast: 30, actual: 28, variance: '+6.6%', confidence: '95.0%' },
      { dish: 'Caramel Turon', stall: "Snack Shack (Stall #5)", factors: 'Recess Peak (3:00 PM)', aiForecast: 50, actual: 45, variance: '+10.0%', confidence: '94.1%' },
    ];

    container.innerHTML = `
      <section class="screen active admin-screen" id="screen-admin-analytics">
        
        <!-- Header -->
        <div class="admin-page-header">
          <div class="admin-header-left">
            <div class="admin-campus-pill">
              <span class="admin-live-dot"></span>
              <span>Predictive Intelligence &bull; Machine Learning Engine</span>
            </div>
            <h2 class="admin-main-title">AI Demand Forecasting & Waste Analytics</h2>
            <p class="admin-main-sub">Data-driven portion limits eliminating food overproduction across campus</p>
          </div>
          <div class="admin-header-actions">
            <button class="btn-admin-action primary" data-route="#/admin/dashboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              <span>Back to Overview</span>
            </button>
          </div>
        </div>

        <!-- 3 High Impact Visual Cards -->
        <div class="admin-kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Daily Waste Reduction</span>
              <span class="kpi-badge emerald">-96.2%</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${wastePreventedKg} kg</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              School kitchens eliminate food surplus by producing strictly to locked pre-order quotas.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">AI Forecast Accuracy</span>
              <span class="kpi-badge success">95.4%</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">&plusmn; 2.8</span>
              <span class="kpi-denom">servings variance</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Algorithms adjust for class rosters, weather, campus calendar, and historical orders.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Estimated Monthly Savings</span>
              <span class="kpi-badge blue">₱24,800</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">₱24.8k</span>
              <span class="kpi-denom">/ month</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Saved by stall operators in raw meat, produce, cooking gas, and unsold inventory.
            </p>
          </div>
        </div>

        <!-- Traditional vs Sapat Food Waste Comparison Chart -->
        <div class="admin-chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Food Waste Generation: Traditional Guesswork vs SAPAT Model</h3>
              <p class="chart-subtitle">Average daily discarded food volume (kg) per campus canteen facility</p>
            </div>
            <span class="chart-tag-badge">Empirical Comparison</span>
          </div>

          <div class="waste-comparison-wrap">
            <div class="comparison-bar-row">
              <div class="comparison-label-col">
                <strong>Traditional Guesswork Canteen</strong>
                <small>Cooks estimate volume arbitrarily &bull; 18-24% discarded daily</small>
              </div>
              <div class="comparison-track-col">
                <div class="comparison-bar-fill red" style="width: 100%;">
                  <span>24.5 kg / day</span>
                </div>
              </div>
            </div>

            <div class="comparison-bar-row">
              <div class="comparison-label-col">
                <strong>SAPAT Exact-Portion System</strong>
                <small>Cooks to verified pre-order quotas &bull; &lt;1.2% discarded daily</small>
              </div>
              <div class="comparison-track-col">
                <div class="comparison-bar-fill green" style="width: 4.8%;">
                  <span>0.8 kg</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="chart-summary-footer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span><strong>Impact Result:</strong> 23.7 kg of food waste eliminated daily, keeping 120+ kg of CO2 equivalent out of landfills every week.</span>
          </div>
        </div>

        <!-- AI Predictive Demand Modeling Table -->
        <div class="admin-section-header" style="margin-top: 24px;">
          <div>
            <h3 class="admin-section-title">AI Demand Forecasting vs Verified Pre-orders</h3>
            <span class="admin-section-subtitle">Real-time model accuracy across top high-volume menu items</span>
          </div>
          <span class="admin-feed-counter">Model v2.4 Active</span>
        </div>

        <div class="admin-table-card">
          <div class="admin-table-responsive">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Stall</th>
                  <th>Predictive Variables</th>
                  <th>AI Target</th>
                  <th>Actual Pre-orders</th>
                  <th>Variance</th>
                  <th>Model Confidence</th>
                </tr>
              </thead>
              <tbody>
                ${aiPredictions.map(item => `
                  <tr>
                    <td><strong class="dish-table-name">${item.dish}</strong></td>
                    <td><span class="table-stall-pill">${item.stall}</span></td>
                    <td><span class="table-factor-text">${item.factors}</span></td>
                    <td><strong class="table-quota-number">${item.aiForecast} portions</strong></td>
                    <td><strong class="table-actual-number">${item.actual} booked</strong></td>
                    <td><span class="table-variance-pill">${item.variance}</span></td>
                    <td><span class="table-confidence-badge">${item.confidence}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Peak Shifts Distribution -->
        <div class="admin-section-header" style="margin-top: 24px;">
          <div>
            <h3 class="admin-section-title">Pre-order Pickup Shift Distribution</h3>
            <span class="admin-section-subtitle">Staggered student arrival schedule eliminating cafeteria queue bottlenecks</span>
          </div>
        </div>

        <div class="shift-distribution-grid">
          <div class="shift-card">
            <div class="shift-card-head">
              <span class="shift-time">11:30 AM</span>
              <span class="shift-name">Lunch Shift 1</span>
            </div>
            <strong class="shift-percentage">52%</strong>
            <span class="shift-portions">204 portions reserved</span>
            <div class="shift-track"><div class="shift-fill" style="width: 52%;"></div></div>
            <small class="shift-sub">Fresh Batch Cooked 11:00 AM</small>
          </div>

          <div class="shift-card">
            <div class="shift-card-head">
              <span class="shift-time">12:15 PM</span>
              <span class="shift-name">Lunch Shift 2</span>
            </div>
            <strong class="shift-percentage">34%</strong>
            <span class="shift-portions">132 portions reserved</span>
            <div class="shift-track"><div class="shift-fill" style="width: 34%;"></div></div>
            <small class="shift-sub">Fresh Batch Cooked 11:45 AM</small>
          </div>

          <div class="shift-card">
            <div class="shift-card-head">
              <span class="shift-time">2:45 PM</span>
              <span class="shift-name">Afternoon Recess</span>
            </div>
            <strong class="shift-percentage">14%</strong>
            <span class="shift-portions">48 portions reserved</span>
            <div class="shift-track"><div class="shift-fill" style="width: 14%;"></div></div>
            <small class="shift-sub">Warm Snacks Cooked 2:15 PM</small>
          </div>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }
    });
  }
};

