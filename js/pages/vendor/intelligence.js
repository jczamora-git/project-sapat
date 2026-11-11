import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';
import { getCanteenBrandMark } from '../../components/vendor-card.js';
import { ForecastingService } from '../../services/forecasting.service.js';

// Helper for simple, conversational kitchen recommendation states
function getRecommendationState(d) {
  if (d.confirmedPreorders >= d.currentLimit && d.currentLimit > 0) {
    return {
      state: 'capacity-reached',
      headline: 'All Portions Reserved',
      badge: 'Capacity Reached',
      badgeClass: 'v-assistant-badge-capacity',
      cardClass: 'v-assistant-card-capacity',
      message: 'All available portions have been reserved. Your current preparation limit has been reached.',
      hasAction: d.additionalNeeded > 0
    };
  }
  if (d.additionalNeeded > 0) {
    if (d.bookingRatePct >= 70) {
      return {
        state: 'increase',
        headline: `Increase Preparation by ${d.additionalNeeded}`,
        badge: `+${d.additionalNeeded} Extra Recommended`,
        badgeClass: 'v-assistant-badge-increase',
        cardClass: 'v-assistant-card-increase',
        message: `More students are ordering this meal. We recommend preparing ${d.additionalNeeded} additional portions.`,
        hasAction: true
      };
    }
    return {
      state: 'high-demand',
      headline: 'High Demand Expected',
      badge: `+${d.additionalNeeded} Extra Recommended`,
      badgeClass: 'v-assistant-badge-increase',
      cardClass: 'v-assistant-card-increase',
      message: 'This meal is almost fully reserved. Consider increasing your preparation limit.',
      hasAction: true
    };
  }
  if (d.bookingRatePct < 25 && d.currentLimit > 20) {
    return {
      state: 'low-demand',
      headline: 'Low Demand Today',
      badge: 'Low Demand',
      badgeClass: 'v-assistant-badge-neutral',
      cardClass: 'v-assistant-card-neutral',
      message: 'Fewer students are ordering this meal today. Avoid preparing too many portions.',
      hasAction: false
    };
  }
  return {
    state: 'enough',
    headline: 'Preparation is Enough',
    badge: 'Preparation is Enough',
    badgeClass: 'v-assistant-badge-optimal',
    cardClass: 'v-assistant-card-optimal',
    message: "Your current preparation should be enough for today's expected orders.",
    hasAction: false
  };
}

export const vendorIntelligencePage = {
  _unsubscribe: null,
  _activePillar: 'forecast',

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset' || event === 'orders-updated' || event === 'menu-updated') {
          const currentScreen = document.getElementById('screen-vendor-intelligence');
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
    const vendorOrders = orders.filter(o => o.vendorId === state.currentVendorId && o.status !== 'Cancelled');

    // Intelligence package specific to THIS stall
    const forecast = ForecastingService.getVendorForecast(state.currentVendorId);
    const taste = ForecastingService.getCustomerTasteAnalysis(state.currentVendorId);
    const requestedMeals = ForecastingService.getRequestedMeals(state.currentVendorId);
    const tomorrow = ForecastingService.getTomorrowForecast(state.currentVendorId);
    const historyLogs = ForecastingService.getHistoricalLogs(state.currentVendorId);
    const currentContext = SapatStorage.getForecastContext(state.currentVendorId);

    const activePillar = this._activePillar || 'forecast';

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-intelligence">
        
        <!-- 1. Full-Width Responsive Header Card -->
        <div class="v-ai-hub-header-card">
          <div class="v-hub-header-brand-row">
            <div class="v-hub-brand-badge">
              ${getCanteenBrandMark(currentVendor.id)}
            </div>
            <div class="v-hub-header-titles">
              <div class="v-hub-tag-row">
                <span class="v-hub-stall-tag">${currentVendor.stallNumber} &bull; ${currentVendor.name}</span>
                <span class="v-hub-model-pill">
                  <span class="v-ai-badge-pulse"></span>
                  Decision Copilot v2.4
                </span>
                <span class="v-hub-demo-pill">Prototype Preview &bull; Demo Data</span>
              </div>
              <h2 class="v-hub-page-title">SAPAT INTELLIGENCE</h2>
              <p class="v-hub-tagline">Your kitchen's preparation and customer insights.</p>
            </div>
          </div>

          <!-- Quick KPI Pill Strip (Synchronized from Single Source of Truth) -->
          <div class="v-hub-quick-kpis">
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">How Close Our Estimates Were</span>
              <strong class="v-chip-val">${forecast.sustainability.prepAccuracyPct !== null ? `${forecast.sustainability.prepAccuracyPct}%` : 'Pending Logs'}</strong>
              <span class="v-chip-sub">${forecast.sustainability.prepAccuracyPct !== null ? 'Historical Audit Precision' : 'Awaiting Completed Shifts'}</span>
            </div>
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">Estimated Food Waste Prevented</span>
              <strong class="v-chip-val text-primary">${forecast.sustainability.wastePreventedKg} kg</strong>
              <span class="v-chip-sub">Simulated Estimate &bull; 280g/meal</span>
            </div>
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">Student Meal Satisfaction</span>
              <strong class="v-chip-val">${taste.sentimentScore}%</strong>
              <span class="v-chip-sub">${taste.totalReviews} Verified Student Reviews</span>
            </div>
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">Meals Students Are Requesting</span>
              <strong class="v-chip-val text-orange">${requestedMeals.reduce((s, m) => s + m.votes, 0)}</strong>
              <span class="v-chip-sub">Campus Student Votes</span>
            </div>
          </div>
        </div>

        <!-- 2. The 6 Strategic Intelligence Pillars Navigation -->
        <div class="v-ai-pillar-nav">
          <button class="v-pillar-btn ${activePillar === 'forecast' ? 'active' : ''}" data-pillar="forecast" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>Demand & Tomorrow</span>
          </button>
          <button class="v-pillar-btn ${activePillar === 'prep' ? 'active' : ''}" data-pillar="prep" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>Smart Prep Targets</span>
          </button>
          <button class="v-pillar-btn ${activePillar === 'taste' ? 'active' : ''}" data-pillar="taste" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>What Students Like</span>
          </button>
          <button class="v-pillar-btn ${activePillar === 'wishlist' ? 'active' : ''}" data-pillar="wishlist" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>Meals Students Want</span>
          </button>
          <button class="v-pillar-btn ${activePillar === 'performance' ? 'active' : ''}" data-pillar="performance" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Waste & Performance</span>
          </button>
          <button class="v-pillar-btn ${activePillar === 'simulation' ? 'active' : ''}" data-pillar="simulation" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span>Live Pitch Sandbox</span>
          </button>
        </div>

        <!-- 3. Pillar Views -->

        ${activePillar === 'forecast' ? `
          <!-- PILLAR A: TOMORROW'S EXPECTED ORDERS & DEMAND -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Tomorrow's Expected Orders</h3>
                <span class="v-hub-block-subtitle">Predicting reservation volume before shifts begin with real-time continuous recalibration</span>
              </div>
              <span class="v-hub-badge-live">Live Recalibrating</span>
            </div>

            <!-- Environmental & Academic Schedule Simulation Selectors -->
            <div class="v-sim-controls-card" style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;">
              <div style="flex: 1; min-width: 220px;">
                <label for="select-academic-context" style="font-size: 11px; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Academic Schedule Context</label>
                <select id="select-academic-context" class="sapat-form-select" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 13px; font-weight: 600; background: var(--bg-main, #fff); color: var(--text-primary);">
                  <option value="Regular Academic Schedule" ${currentContext.academicSchedule === 'Regular Academic Schedule' ? 'selected' : ''}>Regular Academic Schedule (Baseline)</option>
                  <option value="Examination Week" ${currentContext.academicSchedule === 'Examination Week' ? 'selected' : ''}>Examination Week (+25% Fast Express Rush)</option>
                  <option value="Campus Event" ${currentContext.academicSchedule === 'Campus Event' ? 'selected' : ''}>Campus Event (+25% Dwell & Merienda)</option>
                  <option value="No Classes" ${currentContext.academicSchedule === 'No Classes' ? 'selected' : ''}>Holiday / No Classes (-50% Volume)</option>
                </select>
              </div>

              <div style="flex: 1; min-width: 200px;">
                <label for="select-weather-context" style="font-size: 11px; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Weather Simulation</label>
                <select id="select-weather-context" class="sapat-form-select" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 13px; font-weight: 600; background: var(--bg-main, #fff); color: var(--text-primary);">
                  <option value="Rainy" ${currentContext.weatherCondition === 'Rainy' ? 'selected' : ''}>Rainy (+18% Warm Broth & Comfort Soup)</option>
                  <option value="Sunny" ${currentContext.weatherCondition === 'Sunny' ? 'selected' : ''}>Sunny (Baseline Outdoor Traffic)</option>
                  <option value="Cloudy" ${currentContext.weatherCondition === 'Cloudy' ? 'selected' : ''}>Cloudy / Overcast (Normal Velocity)</option>
                </select>
              </div>
            </div>

            <!-- Why We Expect This Demand (Forecast Confidence & Evidence Drivers) -->
            <div class="v-confidence-container" style="margin-bottom: 16px;">
              <div class="v-conf-head-row">
                <div class="v-conf-title-wrap">
                  <span class="v-conf-main-title">Why We Expect This Demand</span>
                  <span class="v-conf-sub-title">Calculated from historical audit depth, reservation pace, and campus schedule</span>
                </div>
                <span class="v-conf-badge ${forecast.confidence.levelClass}">
                  <span class="v-ai-badge-pulse" style="background: currentColor;"></span>
                  ${forecast.confidence.level} Reliability (${forecast.confidence.score}%)
                </span>
              </div>

              <div class="v-conf-factors-grid">
                ${forecast.confidence.factors.map(f => `
                  <div class="v-conf-factor-item">
                    <span class="v-factor-dot ${f.status === 'verified' ? '' : 'neutral'}"></span>
                    <div class="v-factor-content">
                      <strong class="v-factor-name">${f.name}</strong>
                      <p class="v-factor-desc">${f.summary}</p>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="v-conf-disclaimer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>${forecast.confidence.prototypeNotice}</span>
              </div>
            </div>

            <!-- Tomorrow Predictive Weather & Schedule Correlation -->
            <div class="v-tomorrow-insight-card">
              <div class="v-tmr-top">
                <span class="v-tmr-date-badge">${tomorrow.forecastDate}</span>
                <span class="v-tmr-tag">Predictive Model Forecast</span>
              </div>
              <div class="v-tmr-influences">
                <div class="v-influence-item">
                  <div class="v-inf-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>
                  </div>
                  <div>
                    <strong>${tomorrow.weatherCondition}</strong>
                    <p>${tomorrow.weatherImpact}</p>
                  </div>
                </div>
                <div class="v-influence-item">
                  <div class="v-inf-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div>
                    <strong>${tomorrow.campusSchedule}</strong>
                    <p>${tomorrow.scheduleImpact}</p>
                  </div>
                </div>
              </div>

              <div class="v-tmr-dishes-deck">
                ${tomorrow.dishes.map(d => `
                  <div class="v-tmr-dish-line">
                    <div class="v-tmr-dish-name-col">
                      <strong>${d.name}</strong>
                      <small>${d.recommendation}</small>
                    </div>
                    <div class="v-tmr-metrics-col">
                      <span class="v-tmr-cur">Current Target: <strong>${d.currentLimit}</strong></span>
                      <span class="v-tmr-arrow">&rarr;</span>
                      <span class="v-tmr-suggested">AI Recommended Target: <strong class="text-primary">${d.recommendedTarget}</strong></span>
                    </div>
                  </div>
                  <p class="v-tmr-rationale-text">${d.rationale}</p>
                `).join('')}
              </div>
            </div>

            <!-- Expected Orders by Pickup Time (Unified Data Source) -->
            <div class="v-shift-forecast-deck" style="margin-top: 18px;">
              <div class="v-ai-block-heading">
                <span class="v-block-title">Expected Orders by Pickup Time</span>
                <span class="v-block-sub">Derived mathematically from confirmed order tickets and arrival velocity &bull; Zero double-counting</span>
              </div>

              <div class="v-shift-deck-list">
                ${forecast.pickupWindows.map(w => `
                  <div class="v-shift-item-card">
                    <div class="v-shift-item-head">
                      <div class="v-shift-title-box">
                        <strong class="v-shift-name">${w.slot}</strong>
                        <span class="v-shift-hours">${w.time}</span>
                      </div>
                      ${w.isPeak ? '<span class="v-shift-badge-peak">Peak Rush Shift</span>' : ''}
                    </div>

                    <!-- 4 Shift Metrics -->
                    <div class="v-shift-metrics-strip">
                      <div class="v-shift-metric-cell">
                        <span class="v-shift-metric-lbl">Confirmed Orders</span>
                        <strong class="v-shift-metric-val text-primary">${w.confirmedPreorders} meals</strong>
                      </div>
                      <div class="v-shift-metric-cell">
                        <span class="v-shift-metric-lbl">Predicted Additional Demand</span>
                        <strong class="v-shift-metric-val text-orange">+${w.predictedAdditional} meals</strong>
                      </div>
                      <div class="v-shift-metric-cell">
                        <span class="v-shift-metric-lbl">Total Expected Demand</span>
                        <strong class="v-shift-metric-val">${w.totalExpectedDemand} meals</strong>
                      </div>
                      <div class="v-shift-metric-cell">
                        <span class="v-shift-metric-lbl">Percentage of Expected Demand</span>
                        <strong class="v-shift-metric-val">${w.pct}%</strong>
                      </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="v-win-bar-track" style="height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden;">
                      <div class="v-win-bar-fill ${w.isPeak ? 'peak' : ''}" style="width: ${w.pct}%; height: 100%; background: ${w.isPeak ? 'var(--accent-orange)' : 'var(--primary)'};"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Reconciled Shift Total Footer -->
              <div class="v-shift-reconcile-footer">
                <span><strong>Shift Sum Reconciliation:</strong> Verified matching overall kitchen forecast</span>
                <span>Confirmed: <strong>${forecast.summary.totalConfirmed}</strong> &bull; Additional: <strong>+${forecast.summary.totalAdditionalNeeded || (forecast.summary.totalPredicted - forecast.summary.totalConfirmed)}</strong> &bull; Total Expected: <strong class="text-primary">${forecast.summary.totalPredicted} portions (100%)</strong></span>
              </div>
            </div>
          </div>
        ` : ''}

        ${activePillar === 'prep' ? `
          <!-- PILLAR B: SMART PREPARATION TARGETS -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Smart Preparation Targets</h3>
                <span class="v-hub-block-subtitle">Clear portion recommendations with evidence explanations & vendor explicit approval</span>
              </div>
              <span class="v-hub-badge-decision">Vendor Approval Required</span>
            </div>

            <div class="v-ai-cards-grid">
              ${forecast.dishes.map(d => {
                const stateInfo = getRecommendationState(d);

                return `
                  <div class="v-ai-dish-card ${stateInfo.cardClass}">
                    <div class="v-ai-dish-head">
                      <div class="v-ai-dish-media" style="width: 48px; height: 48px; min-width: 48px; border-radius: var(--radius-xs); overflow: hidden;">
                        <img src="${d.image}" alt="${d.dishName}" onerror="this.onerror=null; this.src='${getImgFallback()}';" style="width: 100%; height: 100%; object-fit: cover;">
                      </div>
                      <div class="v-ai-dish-info">
                        <span class="v-ai-dish-name">${d.dishName}</span>
                        <span class="v-ai-dish-cat">${d.category} &bull; ₱${d.price} &bull; ${d.bookingRatePct}% Booked</span>
                      </div>
                      <span class="v-assistant-status-pill ${stateInfo.badgeClass}">${stateInfo.badge}</span>
                    </div>

                    <!-- Recommendation Message Box -->
                    <div class="v-assistant-msg-box ${stateInfo.state === 'capacity-reached' ? 'capacity' : (d.additionalNeeded > 0 ? 'warning' : '')}" style="margin: 8px 0 12px;">
                      <p class="v-assistant-msg">${stateInfo.message}</p>
                    </div>

                    <!-- Clean 4 Primary Metrics Strip -->
                    <div class="v-calc-grid-6" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 10px;">
                      <div class="v-calc-cell">
                        <span class="v-calc-lbl">Current Preparation Target</span>
                        <strong class="v-calc-val">${d.currentLimit}</strong>
                      </div>
                      <div class="v-calc-cell">
                        <span class="v-calc-lbl">Confirmed Orders</span>
                        <strong class="v-calc-val text-primary">${d.confirmedPreorders}</strong>
                      </div>
                      <div class="v-calc-cell highlight-rec">
                        <span class="v-calc-lbl">Recommended Portions to Prepare</span>
                        <strong class="v-calc-val ${d.additionalNeeded > 0 ? 'text-orange' : 'text-primary'}">${d.recommendedTarget}</strong>
                      </div>
                      <div class="v-calc-cell highlight-add">
                        <span class="v-calc-lbl">Additional Portions Needed</span>
                        <strong class="v-calc-val ${d.additionalNeeded > 0 ? 'text-orange' : ''}">${d.additionalNeeded > 0 ? `+${d.additionalNeeded}` : '0'}</strong>
                      </div>
                    </div>

                    <!-- Secondary "Why is SAPAT recommending this?" Expandable Section -->
                    <details class="v-assistant-details" style="margin-bottom: 12px;">
                      <summary class="v-assistant-details-summary">Why is SAPAT recommending this? (Tap for math details)</summary>
                      <div class="v-assistant-details-body">
                        <div class="v-formula-explainer-card" style="margin: 0 0 10px; background: var(--bg-subtle);">
                          <span class="v-formula-math-line">${d.breakdown.formula} &rarr; ${d.breakdown.additionalFormula}</span>
                          <p class="v-formula-rationale-text" style="margin-top: 6px;">${d.explanation}</p>
                        </div>

                        <!-- Full 6 Calculation Metrics Grid -->
                        <div class="v-calc-grid-6" style="margin-top: 8px;">
                          <div class="v-calc-cell">
                            <span class="v-calc-lbl">Current Preparation Target</span>
                            <strong class="v-calc-val">${d.currentLimit}</strong>
                          </div>
                          <div class="v-calc-cell">
                            <span class="v-calc-lbl">Confirmed Orders</span>
                            <strong class="v-calc-val text-primary">${d.confirmedPreorders}</strong>
                          </div>
                          <div class="v-calc-cell highlight-pred">
                            <span class="v-calc-lbl">Expected Orders</span>
                            <strong class="v-calc-val">${d.predictedDemand}</strong>
                          </div>
                          <div class="v-calc-cell">
                            <span class="v-calc-lbl">Extra Portions for Unexpected Orders</span>
                            <strong class="v-calc-val">+${d.safetyBuffer}</strong>
                          </div>
                          <div class="v-calc-cell highlight-rec">
                            <span class="v-calc-lbl">Recommended Portions to Prepare</span>
                            <strong class="v-calc-val">${d.recommendedTarget}</strong>
                          </div>
                          <div class="v-calc-cell highlight-add">
                            <span class="v-calc-lbl">Additional Portions Needed</span>
                            <strong class="v-calc-val">${d.additionalNeeded > 0 ? `+${d.additionalNeeded}` : '0'}</strong>
                          </div>
                        </div>
                      </div>
                    </details>

                    ${d.additionalNeeded > 0 ? `
                      <div class="v-ai-action-footer">
                        <button class="v-ai-apply-btn" type="button" data-action="apply-ai-target" data-dish-id="${d.dishId}" data-target="${d.recommendedTarget}">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Adjust Daily Target to ${d.recommendedTarget} Portions (+${d.additionalNeeded})</span>
                        </button>
                      </div>
                    ` : `
                      <div class="v-ai-optimal-notice">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Current preparation target of ${d.currentLimit} portions is sufficient. No change needed.</span>
                      </div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${activePillar === 'taste' ? `
          <!-- PILLAR C: WHAT STUDENTS LIKE (CUSTOMER TASTE INTELLIGENCE) -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">What Students Like</h3>
                <span class="v-hub-block-subtitle">Student Meal Feedback & Preferences</span>
              </div>
              <span class="v-hub-badge-live">${taste.totalReviews} Verified Student Reviews</span>
            </div>

            <!-- Taste Score Hero Card -->
            <div class="v-taste-hero-card">
              <div class="v-taste-score-circle">
                <strong class="v-taste-score-num">${taste.sentimentScore}%</strong>
                <span class="v-taste-score-lbl">Satisfaction</span>
              </div>
              <div class="v-taste-hero-info">
                <h4 class="v-taste-title">Student Meal Satisfaction & Feedback</h4>
                <p class="v-taste-sub">Aggregated from verified digital pickup passes after students claim their meals.</p>
              </div>
            </div>

            <!-- Flavor Attributes Radar/Bars with Friendly Labels -->
            <div class="v-flavor-attributes-grid" style="margin: 14px 0;">
              <div class="v-flavor-card">
                <div class="v-flavor-head">
                  <span class="v-flavor-name">Preferred Crispiness</span>
                  <strong class="v-flavor-score">${taste.flavorRatings.crispiness || 94}%</strong>
                </div>
                <div class="v-flavor-bar-track">
                  <div class="v-flavor-bar-fill" style="width: ${taste.flavorRatings.crispiness || 94}%;"></div>
                </div>
              </div>
              <div class="v-flavor-card">
                <div class="v-flavor-head">
                  <span class="v-flavor-name">Garlic Flavor</span>
                  <strong class="v-flavor-score">${taste.flavorRatings.garlic || 91}%</strong>
                </div>
                <div class="v-flavor-bar-track">
                  <div class="v-flavor-bar-fill" style="width: ${taste.flavorRatings.garlic || 91}%;"></div>
                </div>
              </div>
              <div class="v-flavor-card">
                <div class="v-flavor-head">
                  <span class="v-flavor-name">Preferred Serving Size</span>
                  <strong class="v-flavor-score">${taste.flavorRatings.portion || 88}%</strong>
                </div>
                <div class="v-flavor-bar-track">
                  <div class="v-flavor-bar-fill" style="width: ${taste.flavorRatings.portion || 88}%;"></div>
                </div>
              </div>
            </div>

            <!-- Actionable Recipe Improvement Advice -->
            <div class="v-taste-breakdown-row">
              <div class="v-insight-box positive">
                <div class="v-insight-head">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <strong>What Students Love</strong>
                </div>
                <ul class="v-insight-list">
                  ${taste.keyStrengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>

              <div class="v-insight-box constructive">
                <div class="v-insight-head">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <strong>Suggestions to Improve Your Meals</strong>
                </div>
                <ul class="v-insight-list">
                  ${taste.improvementsNeeded.map(imp => `<li>${imp}</li>`).join('')}
                </ul>
              </div>
            </div>

            <!-- Recent Verified Student Reviews -->
            <div class="v-recent-reviews-block" style="margin-top: 14px;">
              <h4 class="v-hub-subhead-title">Student Feedback</h4>
              <span class="v-block-sub" style="margin-bottom: 10px; display: block;">Verified reviews from students who claimed their pre-orders</span>
              <div class="v-reviews-list">
                ${taste.recentReviews.map(r => `
                  <div class="v-review-card">
                    <div class="v-review-top">
                      <div class="v-review-author">
                        <span class="v-rev-avatar">${r.initials || (r.studentName ? r.studentName.charAt(0) : 'S')}</span>
                        <div>
                          <strong>${r.studentName}</strong>
                          <span class="v-rev-dept">${r.dept || 'Verified Student Pickup &bull; BSIT'}</span>
                        </div>
                      </div>
                      <span class="v-rev-tag">${r.tag || `${r.rating || 5}/5 Stars`}</span>
                    </div>
                    <p class="v-review-comment">"${r.comment}"</p>
                    <div class="v-review-foot">
                      <span class="v-review-dish">${r.dishName}</span>
                      <span class="v-review-time">${r.timestamp}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        ${activePillar === 'wishlist' ? `
          <!-- PILLAR D: MEALS STUDENTS WANT (CAMPUS WISHLIST) -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Meals Students Want</h3>
                <span class="v-hub-block-subtitle">High-demand dishes students have voted for that are not yet on your stall menu</span>
              </div>
              <span class="v-hub-badge-live">Campus Student Votes</span>
            </div>

            <div class="v-wishlist-cards-stack">
              ${requestedMeals.map((meal, idx) => `
                <div class="v-wishlist-card">
                  <div class="v-wishlist-head">
                    <div class="v-wishlist-rank">#${idx + 1}</div>
                    <div class="v-wishlist-info">
                      <h4 class="v-wishlist-dish-name">${meal.dishName}</h4>
                      <span class="v-wishlist-cat">${meal.category} &bull; Requested by ${meal.topDept}</span>
                    </div>
                    <div class="v-wishlist-votes-col">
                      <strong class="v-votes-num">${meal.votes}</strong>
                      <span class="v-votes-label">Student Votes</span>
                    </div>
                  </div>

                  <!-- Conversational Advice -->
                  <div class="v-assistant-msg-box" style="margin: 8px 0;">
                    <p class="v-assistant-msg">${meal.votes} students have requested this meal. Consider testing it as a special menu item.</p>
                  </div>

                  <p class="v-wishlist-notes" style="margin-bottom: 10px;">Student suggestion: "${meal.notes}"</p>

                  <div class="v-wishlist-stats-strip">
                    <div class="v-w-stat">
                      <span class="v-w-lbl">Suggested Selling Price</span>
                      <strong class="v-w-val">₱${meal.suggestedPrice} (Estimated)</strong>
                    </div>
                    <div class="v-w-stat">
                      <span class="v-w-lbl">Estimated Potential Demand</span>
                      <strong class="v-w-val">~${meal.projectedDailyDemand} meals/day</strong>
                    </div>
                    <div class="v-w-stat">
                      <span class="v-w-lbl">Reliability</span>
                      <strong class="v-w-val text-primary">${meal.confidence}</strong>
                    </div>
                  </div>

                  <div class="v-wishlist-action-row" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end;">
                    <button class="v-ai-apply-btn" style="width: auto; padding: 6px 14px;" type="button" data-action="test-dish-menu" data-dish-name="${meal.dishName}" data-price="${meal.suggestedPrice}" data-category="${meal.category}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>Pilot This Meal on Stall Menu</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${activePillar === 'performance' ? `
          <!-- PILLARS E & F: FOOD WASTE & KITCHEN PERFORMANCE -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Food Waste & Kitchen Performance</h3>
                <span class="v-hub-block-subtitle">Historical portion outcomes, sell-through rates, and food waste prevented</span>
              </div>
              <span class="v-hub-badge-decision">Audited Kitchen Logs</span>
            </div>

            <!-- Value callout explaining how SAPAT helped avoid preparing unsold portions -->
            <div class="v-sim-hero-banner" style="margin-bottom: 14px; background: #F0FDF4; border: 1px solid #A7F3D0;">
              <div class="v-sim-icon-box" style="background: var(--primary); color: #fff;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <strong class="v-sim-hero-title" style="color: var(--primary-dark);">How SAPAT Protects Kitchen Margins</strong>
                <p class="v-sim-hero-desc" style="color: var(--text-secondary);">SAPAT helped avoid preparing portions that were unlikely to be sold, keeping food fresh and kitchen costs low.</p>
              </div>
            </div>

            <!-- Top Sustainability Deck -->
            <div class="v-sust-cards-row" style="margin-bottom: 14px;">
              <div class="v-sust-card">
                <span class="v-sust-lbl">Estimated Food Waste Prevented</span>
                <strong class="v-sust-val">${forecast.sustainability.wastePreventedKg} kg</strong>
                <span class="v-sust-sub">Estimated &bull; 280g avoided waste per meal</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-lbl">How Close Our Preparation Was</span>
                <strong class="v-sust-val">${forecast.sustainability.prepAccuracyPct !== null ? `${forecast.sustainability.prepAccuracyPct}%` : 'Pending Logs'}</strong>
                <span class="v-sust-sub">${forecast.sustainability.prepAccuracyPct !== null ? 'Historical Audit Precision' : 'Insufficient Shift Logs'}</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-lbl">Extra Portions We Avoided Preparing</span>
                <strong class="v-sust-val">${forecast.sustainability.overproductionSavedMeals} meals</strong>
                <span class="v-sust-sub">Portions spared from surplus overproduction</span>
              </div>
            </div>

            <!-- Multi-week Actual vs Predicted Performance Tracking Table -->
            <div class="v-hub-block-head" style="margin-top: 18px;">
              <div>
                <h4 class="v-hub-subhead-title">Actual vs. Predicted Preparation Tracking</h4>
                <span class="v-hub-block-subtitle">Audited daily logs tracking predicted demand against actual prepared, claimed, and unsold portions</span>
              </div>
              ${forecast.historicalPerformance.hasData ? `
                <span class="table-confidence-badge" style="font-size: 11px; padding: 4px 10px;">
                  Avg Accuracy: <strong>${forecast.historicalPerformance.averageAccuracy}%</strong>
                </span>
              ` : ''}
            </div>

            <div class="admin-table-card" style="margin-top: 8px;">
              <div class="admin-table-responsive">
                ${forecast.historicalPerformance.hasData && forecast.historicalPerformance.logs.length > 0 ? `
                  <table class="admin-data-table">
                    <thead>
                      <tr>
                        <th>Date & Day</th>
                        <th>Predicted Demand</th>
                        <th>Actual Prepared</th>
                        <th>Sold / Claimed</th>
                        <th>Cancelled / No-show</th>
                        <th>Leftover Portions</th>
                        <th>Preparation Accuracy</th>
                        <th>Food Waste Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${forecast.historicalPerformance.logs.map(log => `
                        <tr>
                          <td><strong>${log.date}</strong> &bull; <small class="text-muted">${log.day}</small></td>
                          <td><strong>${log.predictedDemand}</strong></td>
                          <td><strong>${log.prepared}</strong></td>
                          <td><strong class="text-primary">${log.claimed}</strong></td>
                          <td><span class="${log.cancelledNoShow > 0 ? 'text-orange' : 'text-muted'}">${log.cancelledNoShow}</span></td>
                          <td><span class="${log.unsold <= 2 ? 'text-primary' : 'text-orange'}">${log.unsold} portions</span></td>
                          <td><span class="table-confidence-badge">${log.accuracy}%</span></td>
                          <td><strong class="text-primary">${log.wasteSavedKg} kg</strong></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : `
                  <div class="v-empty-table-state">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h4>No Historical Shift Data Recorded</h4>
                    <p>Preparation accuracy and avoided food waste are calculated dynamically from completed shifts. Accuracy will appear once service logs are recorded.</p>
                  </div>
                `}
              </div>
            </div>
          </div>
        ` : ''}

        ${activePillar === 'simulation' ? `
          <!-- INTERACTIVE LIVE DEMO SANDBOX -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Live Presentation Simulation Sandbox</h3>
                <span class="v-hub-block-subtitle">Demonstrate how SAPAT updates its recommendations when students order or leave feedback in real time</span>
              </div>
              <span class="v-hub-badge-decision">Pitch Interactive Mode</span>
            </div>

            <div class="v-sim-hero-banner">
              <div class="v-sim-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <div>
                <strong class="v-sim-hero-title">Interactive Canteen AI Simulation</strong>
                <p class="v-sim-hero-desc">Click any scenario below during the presentation to observe real-time recalculation of kitchen targets and student feedback.</p>
              </div>
            </div>

            <div class="v-sim-actions-grid" style="margin-top: 12px;">
              <button class="v-sim-action-card" type="button" data-action="sim-rush">
                <div class="v-sim-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div class="v-sim-card-content">
                  <strong>Simulate +5 Rush Pre-orders</strong>
                  <p>Increases live reservation velocity. Watch the AI detect stockout risk and recommend an expanded prep batch.</p>
                </div>
              </button>

              <button class="v-sim-action-card" type="button" data-action="sim-review">
                <div class="v-sim-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div class="v-sim-card-content">
                  <strong>Simulate Student Feedback</strong>
                  <p>Injects a new verified review and recalculates student sentiment and taste quality metrics instantly.</p>
                </div>
              </button>

              <button class="v-sim-action-card" type="button" data-action="sim-vote">
                <div class="v-sim-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line><circle cx="12" cy="12" r="5"></circle></svg>
                </div>
                <div class="v-sim-card-content">
                  <strong>Simulate Wishlist Vote</strong>
                  <p>Increments student request count on the #1 requested dish to show demand tracking.</p>
                </div>
              </button>

              <button class="v-sim-action-card reset-card" type="button" data-action="sim-reset">
                <div class="v-sim-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                </div>
                <div class="v-sim-card-content">
                  <strong>Reset Simulation to Baseline</strong>
                  <p>Clears simulated events and restores baseline demo dataset for a clean presentation rerun.</p>
                </div>
              </button>
            </div>
          </div>
        ` : ''}

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    // Context selectors
    const acadSelect = container.querySelector('#select-academic-context');
    if (acadSelect) {
      acadSelect.addEventListener('change', (e) => {
        SapatStorage.saveForecastContext(state.currentVendorId, { academicSchedule: e.target.value });
        showToast(`Forecasting schedule set to: ${e.target.value}`, 'info');
        this.render(container);
      });
    }

    const weatherSelect = container.querySelector('#select-weather-context');
    if (weatherSelect) {
      weatherSelect.addEventListener('change', (e) => {
        SapatStorage.saveForecastContext(state.currentVendorId, { weatherCondition: e.target.value });
        showToast(`Forecasting weather set to: ${e.target.value}`, 'info');
        this.render(container);
      });
    }

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

      // Switch stall modal
      const switchStallBtn = e.target.closest('[data-action="open-role-modal"]');
      if (switchStallBtn) {
        openRoleModal();
        return;
      }

      // Pillar Navigation
      const pillarBtn = e.target.closest('[data-pillar]');
      if (pillarBtn) {
        const pillar = pillarBtn.getAttribute('data-pillar');
        if (pillar && pillar !== this._activePillar) {
          this._activePillar = pillar;
          this.render(container);
          return;
        }
      }

      // Apply AI Target one-click
      const applyAiBtn = e.target.closest('[data-action="apply-ai-target"]');
      if (applyAiBtn) {
        const dishId = applyAiBtn.getAttribute('data-dish-id');
        const target = parseInt(applyAiBtn.getAttribute('data-target'), 10);
        if (dishId && !isNaN(target)) {
          const res = SapatStorage.updateDishDailyLimit(dishId, target);
          if (res.success) {
            showToast(`Target preparation limit updated to ${target} portions for ${res.dish.name}!`, 'success');
            this.render(container);
          } else {
            showToast(res.message || 'Cannot adjust limit below reserved portions', 'warning');
          }
        }
        return;
      }

      // Pilot Requested Dish on Menu
      const testDishBtn = e.target.closest('[data-action="test-dish-menu"]');
      if (testDishBtn) {
        const dishName = testDishBtn.getAttribute('data-dish-name');
        const price = parseInt(testDishBtn.getAttribute('data-price'), 10) || 75;
        const category = testDishBtn.getAttribute('data-category') || 'Special Rice Meal';
        if (dishName) {
          const menu = SapatStorage.getMenu();
          const existing = menu.find(d => d.vendorId === state.currentVendorId && d.name.toLowerCase() === dishName.toLowerCase());
          if (existing) {
            showToast(`${dishName} is already on your active menu.`, 'info');
          } else {
            const newDish = {
              id: `dish-pilot-${Date.now().toString(36)}`,
              name: dishName,
              vendorId: state.currentVendorId,
              vendorName: SapatStorage.getVendorById(state.currentVendorId)?.name || 'Canteen',
              price,
              category: 'rice-meals',
              categoryName: category,
              description: 'Student-requested special dish pilot.',
              image: 'assets/images/products/chicken-adobo.jpg',
              dailyLimit: 25,
              reservedServings: 0,
              isAvailable: true
            };
            menu.push(newDish);
            SapatStorage.saveMenu(menu);
            showToast(`Piloting ${dishName} on stall menu! Quota set to 25 portions.`, 'success');
            this.render(container);
          }
        }
        return;
      }

      // Live Demo Simulation Actions
      const simRushBtn = e.target.closest('[data-action="sim-rush"]');
      if (simRushBtn) {
        const result = ForecastingService.simulateRushOrders(state.currentVendorId, 5);
        if (result) {
          showToast(`Simulated +5 rush pre-orders on ${result.dishName}! AI recalculated target.`, 'success');
          this._activePillar = 'prep';
          this.render(container);
        }
        return;
      }

      const simReviewBtn = e.target.closest('[data-action="sim-review"]');
      if (simReviewBtn) {
        const newRev = ForecastingService.simulateStudentFeedback(state.currentVendorId);
        if (newRev) {
          showToast(`Simulated verified review from ${newRev.studentName}!`, 'success');
          this._activePillar = 'taste';
          this.render(container);
        }
        return;
      }

      const simVoteBtn = e.target.closest('[data-action="sim-vote"]');
      if (simVoteBtn) {
        const topWish = ForecastingService.getRequestedMeals(state.currentVendorId)[0];
        if (topWish) {
          ForecastingService.simulateDishRequest(state.currentVendorId, topWish.dishName);
          showToast(`Added +1 student vote to ${topWish.dishName}!`, 'success');
          this._activePillar = 'wishlist';
          this.render(container);
        }
        return;
      }

      const simResetBtn = e.target.closest('[data-action="sim-reset"]');
      if (simResetBtn) {
        ForecastingService.resetSimulation(state.currentVendorId);
        showToast('Simulation sandbox reset to baseline dataset.', 'info');
        this._activePillar = 'forecast';
        this.render(container);
        return;
      }
    });
  }
};
