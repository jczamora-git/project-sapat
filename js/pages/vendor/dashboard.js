import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';
import { getCanteenBrandMark } from '../../components/vendor-card.js';
import { ForecastingService } from '../../services/forecasting.service.js';

export const vendorDashboardPage = {
  _unsubscribe: null,
  _activeAiTab: 'prep',

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset' || event === 'orders-updated') {
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
    const vendorOrders = orders.filter(o => o.vendorId === state.currentVendorId && o.status !== 'Cancelled');

    const totalOrdersCount = vendorOrders.length;
    const totalDailyLimit = vendorDishes.reduce((sum, d) => sum + d.dailyLimit, 0);
    const totalReserved = vendorDishes.reduce((sum, d) => sum + d.reservedServings, 0);
    const totalRemaining = Math.max(0, totalDailyLimit - totalReserved);
    const totalProjectedSales = vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Generate AI intelligence package
    const forecast = ForecastingService.getVendorForecast(state.currentVendorId);
    const tasteAnalysis = ForecastingService.getCustomerTasteAnalysis(state.currentVendorId);
    const requestedMeals = ForecastingService.getRequestedMeals(state.currentVendorId);
    const tomorrowForecast = ForecastingService.getTomorrowForecast(state.currentVendorId);

    const activeTab = this._activeAiTab || 'prep';

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-dashboard">
        
        <!-- 1. Vendor Identity & Operating Status Header -->
        <div class="vendor-identity-card">
          <div class="v-identity-left">
            ${getCanteenBrandMark(currentVendor.id)}
            <div class="v-identity-info">
              <div class="v-identity-title-row">
                <h2 class="v-stall-name">${currentVendor.name}</h2>
                <span class="v-stall-tag">${currentVendor.stallNumber}</span>
              </div>
              <div class="v-identity-meta-row">
                <span class="v-status-dot-wrap">
                  <span class="canteen-status-dot ${currentVendor.isOpen ? 'online' : 'offline'}"></span>
                  ${currentVendor.isOpen ? 'Open for Orders' : 'Stall Closed'}
                </span>
                <span class="v-meta-bullet">&bull;</span>
                <span class="v-stall-hours">${currentVendor.hours}</span>
                <span class="v-meta-bullet">&bull;</span>
                <span>${currentVendor.expressWindow || 'Express Window'}</span>
              </div>
            </div>
          </div>
          <button class="v-switch-stall-btn" data-action="open-role-modal" type="button" title="Switch Canteen Stall Account">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            <span>Switch Stall</span>
          </button>
        </div>

        <!-- 2. Integrated Operational Overview KPIs -->
        <div class="v-kpi-integrated-strip">
          <div class="v-kpi-col">
            <span class="v-kpi-label">Incoming Orders</span>
            <div class="v-kpi-main">
              <strong class="v-kpi-val">${totalOrdersCount}</strong>
              <span class="v-kpi-subtag">Pre-orders active</span>
            </div>
          </div>

          <div class="v-kpi-col">
            <span class="v-kpi-label">Reserved Servings</span>
            <div class="v-kpi-main">
              <strong class="v-kpi-val">${totalReserved}</strong>
              <span class="v-kpi-subtag">of ${totalDailyLimit} target</span>
            </div>
          </div>

          <div class="v-kpi-col">
            <span class="v-kpi-label">Remaining Portions</span>
            <div class="v-kpi-main">
              <strong class="v-kpi-val ${totalRemaining <= 10 ? 'alert-orange' : ''}">${totalRemaining}</strong>
              <span class="v-kpi-subtag">Portions left</span>
            </div>
          </div>

          <div class="v-kpi-col">
            <span class="v-kpi-label">Projected Sales</span>
            <div class="v-kpi-main">
              <strong class="v-kpi-val">₱${totalProjectedSales.toLocaleString()}</strong>
              <span class="v-kpi-subtag">Locked revenue</span>
            </div>
          </div>
        </div>

        <!-- 3. SAPAT INTELLIGENCE — AI Preparation & Customer Insights -->
        <div class="v-ai-intelligence-section">
          <div class="v-ai-header">
            <div class="v-ai-brand-group">
              <span class="v-ai-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                SAPAT Intelligence
              </span>
              <span class="v-ai-prototype-pill">Prototype Preview &bull; Demo Forecast</span>
            </div>
            <p class="v-ai-subtitle">Smart insights for better food preparation and zero kitchen waste.</p>
          </div>

          <!-- Intelligence Sub-Navigation Tabs -->
          <div class="v-ai-tab-strip">
            <button class="v-ai-tab-btn ${activeTab === 'prep' ? 'active' : ''}" data-ai-tab="prep" type="button">
              <span>Preparation & Demand</span>
            </button>
            <button class="v-ai-tab-btn ${activeTab === 'taste' ? 'active' : ''}" data-ai-tab="taste" type="button">
              <span>Customer Taste AI</span>
              <span class="v-ai-tab-badge">${tasteAnalysis.sentimentScore}%</span>
            </button>
            <button class="v-ai-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}" data-ai-tab="wishlist" type="button">
              <span>Requested Meals</span>
              <span class="v-ai-tab-badge">${requestedMeals.length}</span>
            </button>
            <button class="v-ai-tab-btn ${activeTab === 'simulation' ? 'active' : ''}" data-ai-tab="simulation" type="button">
              <span>Live Pitch Demo</span>
            </button>
          </div>

          ${activeTab === 'prep' ? `
            <!-- TAB 1: PREPARATION & DEMAND FORECAST -->
            
            <!-- Smart Preparation Recommendations Deck -->
            <div class="v-ai-recommendations-block">
              <div class="v-ai-block-heading">
                <span class="v-block-title">Kitchen Preparation Adjustments</span>
                <span class="v-block-sub">AI demand suggestions vs active kitchen limits</span>
              </div>

              <div class="v-ai-cards-grid">
                ${forecast.dishes.map(d => {
                  let badgeClass = 'ai-rec-maintain';
                  let badgeLabel = 'Target Optimal';
                  if (d.actionType === 'increase') {
                    badgeClass = 'ai-rec-increase';
                    badgeLabel = `+${d.delta} Prep Needed`;
                  } else if (d.actionType === 'decrease') {
                    badgeClass = 'ai-rec-decrease';
                    badgeLabel = `-${d.delta} Safe Trim`;
                  }

                  return `
                    <div class="v-ai-dish-card">
                      <div class="v-ai-dish-top">
                        <div class="v-ai-dish-media">
                          <img src="${d.image}" alt="${d.dishName}" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                        </div>
                        <div class="v-ai-dish-info">
                          <div class="v-ai-dish-title-row">
                            <h4 class="v-ai-dish-name">${d.dishName}</h4>
                            <span class="v-ai-rec-pill ${badgeClass}">${badgeLabel}</span>
                          </div>
                          <div class="v-ai-dish-comparison">
                            <span class="v-cmp-metric">Current Limit: <strong>${d.dailyLimit}</strong></span>
                            <span class="v-cmp-divider">&bull;</span>
                            <span class="v-cmp-metric">AI Suggested: <strong class="v-highlight-target">${d.suggestedTarget}</strong></span>
                            <span class="v-cmp-divider">&bull;</span>
                            <span class="v-cmp-metric">Predicted: <strong>${d.predictedDemand}</strong></span>
                          </div>
                        </div>
                      </div>
                      <p class="v-ai-rationale">${d.explanation}</p>
                      ${d.actionType !== 'maintain' ? `
                        <div class="v-ai-card-footer">
                          <button class="v-ai-apply-btn" type="button" data-action="apply-ai-target" data-dish-id="${d.dishId}" data-target="${d.suggestedTarget}">
                            <span>Adjust Daily Target to ${d.suggestedTarget}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </button>
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Demand Distribution by Pickup Window -->
            <div class="v-ai-windows-block">
              <div class="v-ai-block-heading">
                <span class="v-block-title">Forecasted Demand by Pickup Shift</span>
                <span class="v-block-sub">Historical campus student rush distribution</span>
              </div>

              <div class="v-pickup-windows-list">
                ${forecast.pickupWindows.map(w => `
                  <div class="v-window-row">
                    <div class="v-window-time-meta">
                      <span class="v-win-name">${w.slot}</span>
                      <span class="v-win-hours">${w.time}</span>
                    </div>
                    <div class="v-window-bar-col">
                      <div class="v-win-bar-track">
                        <div class="v-win-bar-fill ${w.pct >= 40 ? 'peak' : ''}" style="width: ${w.pct}%;"></div>
                      </div>
                    </div>
                    <div class="v-window-stat">
                      <strong>${w.servings}</strong>
                      <span>(${w.pct}%)</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tomorrow's Demand Forecast -->
            <div class="v-ai-tomorrow-block">
              <div class="v-ai-block-heading">
                <span class="v-block-title">${tomorrowForecast.forecastDate}</span>
                <span class="v-block-sub">Predictive scenario based on weather and academic calendar</span>
              </div>

              <div class="v-scenario-banner">
                <div class="v-scenario-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>
                  <span><strong>${tomorrowForecast.weatherCondition}</strong> &mdash; ${tomorrowForecast.weatherImpact}</span>
                </div>
                <div class="v-scenario-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span><strong>${tomorrowForecast.campusSchedule}</strong> &mdash; ${tomorrowForecast.scheduleImpact}</span>
                </div>
              </div>

              <div class="v-tomorrow-dishes-grid">
                ${tomorrowForecast.dishes.map(td => `
                  <div class="v-tomorrow-dish-card">
                    <div class="v-tomorrow-dish-head">
                      <strong>${td.name}</strong>
                      <span class="v-tomorrow-rec-pill">${td.recommendation}</span>
                    </div>
                    <div class="v-tomorrow-dish-stats">
                      <span>Current: ${td.currentLimit}</span>
                      <span>&bull;</span>
                      <span>Projected: <strong>${td.projectedDemand}</strong></span>
                      <span>&bull;</span>
                      <span>Suggested: <strong class="v-highlight-target">${td.recommendedTarget}</strong></span>
                    </div>
                    <p class="v-tomorrow-rationale">${td.rationale}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Sustainability & Overproduction Metrics -->
            <div class="v-ai-sustainability-row">
              <div class="v-sust-card">
                <span class="v-sust-label">Food Waste Prevented</span>
                <strong class="v-sust-val">${forecast.sustainability.wastePreventedKg} kg</strong>
                <span class="v-sust-desc">Based on locked pre-orders</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-label">Preparation Accuracy</span>
                <strong class="v-sust-val">${forecast.sustainability.prepAccuracyPct}%</strong>
                <span class="v-sust-desc">Portion target precision</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-label">Avoided Overproduction</span>
                <strong class="v-sust-val">${forecast.sustainability.overproductionSavedMeals} meals</strong>
                <span class="v-sust-desc">Zero unwanted cooking</span>
              </div>
            </div>
          ` : ''}

          ${activeTab === 'taste' ? `
            <!-- TAB 2: CUSTOMER TASTE & FEEDBACK AI -->
            <div class="v-taste-section">
              <div class="v-taste-hero-card">
                <div class="v-taste-hero-left">
                  <div class="v-taste-score-circle">
                    <strong class="v-taste-score-num">${tasteAnalysis.sentimentScore}%</strong>
                    <span class="v-taste-score-lbl">Satisfaction</span>
                  </div>
                </div>
                <div class="v-taste-hero-info">
                  <h4 class="v-taste-title">Student Taste Profile & Feedback Summary</h4>
                  <p class="v-taste-sub">Synthesized from ${tasteAnalysis.totalReviews} verified student pre-order reviews.</p>
                </div>
              </div>

              <!-- Flavor Quality Attributes -->
              <div class="v-flavor-attributes-grid">
                ${Object.entries(tasteAnalysis.flavorRatings).map(([k, val]) => `
                  <div class="v-flavor-card">
                    <div class="v-flavor-head">
                      <span class="v-flavor-name">${k.charAt(0).toUpperCase() + k.slice(1)}</span>
                      <strong class="v-flavor-score">${val}%</strong>
                    </div>
                    <div class="v-flavor-bar-track">
                      <div class="v-flavor-bar-fill" style="width: ${val}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Actionable Insights Breakdown -->
              <div class="v-taste-breakdown-row">
                <div class="v-insight-box positive">
                  <div class="v-insight-head">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <strong>What Students Love</strong>
                  </div>
                  <ul class="v-insight-list">
                    ${tasteAnalysis.keyStrengths.map(s => `<li>${s}</li>`).join('')}
                  </ul>
                </div>

                <div class="v-insight-box constructive">
                  <div class="v-insight-head">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <strong>What Students Want Improved</strong>
                  </div>
                  <ul class="v-insight-list">
                    ${tasteAnalysis.improvementsNeeded.map(imp => `<li>${imp}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Recent Verified Reviews -->
              <div class="v-recent-reviews-block">
                <span class="v-block-title">Recent Student Reviews</span>
                <div class="v-reviews-list">
                  ${tasteAnalysis.recentReviews.map(r => `
                    <div class="v-review-card">
                      <div class="v-review-top">
                        <div class="v-review-author">
                          <span class="v-rev-avatar">${r.initials}</span>
                          <div>
                            <strong>${r.studentName}</strong>
                            <span class="v-rev-dept">${r.dept}</span>
                          </div>
                        </div>
                        <span class="v-rev-tag">${r.tag}</span>
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

          ${activeTab === 'wishlist' ? `
            <!-- TAB 3: REQUESTED MEALS WISHLIST -->
            <div class="v-wishlist-section">
              <div class="v-ai-block-heading">
                <span class="v-block-title">Student Wishlist & Requested Dishes</span>
                <span class="v-block-sub">Dishes students have voted to add to your stall menu</span>
              </div>

              <div class="v-wishlist-cards-stack">
                ${requestedMeals.map((meal, idx) => `
                  <div class="v-wishlist-card">
                    <div class="v-wishlist-head">
                      <div class="v-wishlist-rank">#${idx + 1}</div>
                      <div class="v-wishlist-info">
                        <h4 class="v-wishlist-dish-name">${meal.dishName}</h4>
                        <span class="v-wishlist-cat">${meal.category} &bull; ${meal.topDept}</span>
                      </div>
                      <div class="v-wishlist-votes-col">
                        <strong class="v-votes-num">${meal.votes}</strong>
                        <span class="v-votes-label">Student Votes</span>
                      </div>
                    </div>
                    <p class="v-wishlist-notes">${meal.notes}</p>
                    <div class="v-wishlist-stats-strip">
                      <div class="v-w-stat">
                        <span class="v-w-lbl">Target Price</span>
                        <strong class="v-w-val">₱${meal.suggestedPrice}</strong>
                      </div>
                      <div class="v-w-stat">
                        <span class="v-w-lbl">Projected Launch Demand</span>
                        <strong class="v-w-val">${meal.projectedDailyDemand} meals/day</strong>
                      </div>
                      <div class="v-w-stat">
                        <span class="v-w-lbl">Confidence</span>
                        <strong class="v-w-val text-primary">${meal.confidence}</strong>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${activeTab === 'simulation' ? `
            <!-- TAB 4: LIVE PITCH DEMO CONTROLS -->
            <div class="v-simulation-section">
              <div class="v-sim-hero-banner">
                <div class="v-sim-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div>
                  <strong class="v-sim-hero-title">Live Presentation Simulation Sandbox</strong>
                  <p class="v-sim-hero-desc">Trigger real-time scenarios to demonstrate how SAPAT Intelligence adapts dynamically.</p>
                </div>
              </div>

              <div class="v-sim-actions-grid">
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

        </div>

        <!-- 4. Active Kitchen Preparation Quotas -->
        <div class="v-section-row-header">
          <div>
            <h3 class="section-heading">Live Kitchen Quotas</h3>
            <span class="section-subtext">Active cooking limits and reservation capacity</span>
          </div>
          <button class="section-see-all-btn" data-route="#/vendor/prep" type="button">Batch Control</button>
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

      // Switch stall modal
      const switchStallBtn = e.target.closest('[data-action="open-role-modal"]');
      if (switchStallBtn) {
        openRoleModal();
        return;
      }

      // AI Tab Switching
      const aiTabBtn = e.target.closest('[data-ai-tab]');
      if (aiTabBtn) {
        const tab = aiTabBtn.getAttribute('data-ai-tab');
        if (tab && tab !== this._activeAiTab) {
          this._activeAiTab = tab;
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
          const menu = SapatStorage.getMenu();
          const dish = menu.find(d => d.id === dishId);
          if (dish) {
            dish.dailyLimit = target;
            SapatStorage.saveMenu(menu);
            showToast(`Daily target for ${dish.name} updated to ${target} portions.`, 'success');
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
          showToast(`Simulated +5 rush pre-orders on ${result.dishName}! AI recalculating target.`, 'success');
          this._activeAiTab = 'prep';
          this.render(container);
        }
        return;
      }

      const simReviewBtn = e.target.closest('[data-action="sim-review"]');
      if (simReviewBtn) {
        const newRev = ForecastingService.simulateStudentFeedback(state.currentVendorId);
        if (newRev) {
          showToast(`Simulated student review from ${newRev.studentName}!`, 'success');
          this._activeAiTab = 'taste';
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
          this._activeAiTab = 'wishlist';
          this.render(container);
        }
        return;
      }

      const simResetBtn = e.target.closest('[data-action="sim-reset"]');
      if (simResetBtn) {
        ForecastingService.resetSimulation(state.currentVendorId);
        showToast('Demo simulation reset to baseline dataset.', 'info');
        this._activeAiTab = 'prep';
        this.render(container);
        return;
      }
    });
  }
};
