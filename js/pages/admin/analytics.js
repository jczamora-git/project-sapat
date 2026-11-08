import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { ForecastingService } from '../../services/forecasting.service.js';

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

    const campusAnalytics = ForecastingService.getCampusWideAnalytics();

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
              <span>Predictive Intelligence &bull; Campus-Wide Analytics</span>
            </div>
            <h2 class="admin-main-title">Campus Intelligence & Food Waste Analytics</h2>
            <p class="admin-main-sub">Macro oversight of food waste prevention, forecasting accuracy, and student satisfaction</p>
          </div>
          <div class="admin-header-actions">
            <button class="btn-admin-action primary" data-route="#/admin/dashboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              <span>Executive Dashboard</span>
            </button>
          </div>
        </div>

        <!-- Architectural Role Separation Callout -->
        <div class="v-prep-ai-callout" style="margin-bottom: 16px; background: #F0F8F4; border-color: #A7F3D0;">
          <div class="v-prep-ai-icon" style="color: var(--primary);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <div class="v-prep-ai-text">
            <strong>Campus Overview Mode:</strong> Administrators monitor macro trends and food waste reduction across all canteens. Dish-level recipe improvement, daily limit adjustments, and student feedback details are managed directly by each stall operator inside the <strong>Vendor SAPAT Intelligence</strong> portal.
          </div>
        </div>

        <!-- 4 Top-Tier Campus Intelligence KPIs -->
        <div class="admin-kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Campus Waste Avoided</span>
              <span class="kpi-badge emerald">-96.2% vs baseline</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.totalWastePreventedKg}</span>
              <span class="kpi-unit">kg</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Eliminates ${campusAnalytics.co2SavedKg} kg of CO2 equivalent emissions weekly.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Overall Student Satisfaction</span>
              <span class="kpi-badge success">${campusAnalytics.avgSatisfaction}% Approval</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.avgSatisfaction}%</span>
              <span class="kpi-denom">campus average</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Aggregated across all verified student pre-order feedback ratings.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Forecasting Accuracy</span>
              <span class="kpi-badge blue">${campusAnalytics.avgAccuracy}% Precise</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.avgAccuracy}%</span>
              <span class="kpi-denom">across 5 stalls</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Algorithms adjust for class rosters, weather, and historical demand.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Total Campus Pre-orders</span>
              <span class="kpi-badge success">${campusAnalytics.totalCampusReserved} Booked</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.totalCampusReserved}</span>
              <span class="kpi-denom">/ ${campusAnalytics.totalCampusTarget} portions</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              ${campusAnalytics.totalCampusRemaining} portions remaining for walk-in students.
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

        <!-- Multi-Canteen Performance Comparison Table -->
        <div class="admin-section-header" style="margin-top: 24px;">
          <div>
            <h3 class="admin-section-title">Canteen Stalls Operational Intelligence Matrix</h3>
            <span class="admin-section-subtitle">Stall performance comparisons, preparation precision, and waste prevention</span>
          </div>
          <span class="admin-feed-counter">5 Stalls Active</span>
        </div>

        <div class="admin-table-card">
          <div class="admin-table-responsive">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Stall Name</th>
                  <th>Location</th>
                  <th>Daily Target</th>
                  <th>Pre-ordered</th>
                  <th>Booking Rate</th>
                  <th>Accuracy</th>
                  <th>Waste Saved</th>
                  <th>Student Rating</th>
                </tr>
              </thead>
              <tbody>
                ${campusAnalytics.canteenComparisons.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td><span class="table-stall-pill">${c.stallNumber}</span></td>
                    <td><strong>${c.target}</strong> portions</td>
                    <td><strong class="text-primary">${c.reserved}</strong></td>
                    <td><span class="table-slot-text">${c.bookingRate}%</span></td>
                    <td><span class="table-confidence-badge">${c.accuracy}%</span></td>
                    <td><strong class="text-primary">${c.wasteSavedKg} kg</strong></td>
                    <td><strong style="color: var(--primary);">${c.satisfaction}%</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Most Requested Meals Across Campus -->
        <div class="admin-section-header" style="margin-top: 24px;">
          <div>
            <h3 class="admin-section-title">Most Requested Meals Across Campus</h3>
            <span class="admin-section-subtitle">Student wishlist dishes aggregated across all campus colleges</span>
          </div>
        </div>

        <div class="admin-table-card">
          <div class="admin-table-responsive">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Requested Dish</th>
                  <th>Associated Stall</th>
                  <th>Student Votes</th>
                  <th>Top Requesting College</th>
                  <th>Suggested Price</th>
                  <th>Demand Confidence</th>
                </tr>
              </thead>
              <tbody>
                ${campusAnalytics.topCampusRequested.map(r => `
                  <tr>
                    <td><strong>${r.dishName}</strong></td>
                    <td><span class="table-stall-pill">${r.stallName}</span></td>
                    <td><strong class="text-primary">${r.votes} votes</strong></td>
                    <td>${r.topDept}</td>
                    <td><strong>₱${r.suggestedPrice}</strong></td>
                    <td><span class="table-confidence-badge">${r.confidence}</span></td>
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
