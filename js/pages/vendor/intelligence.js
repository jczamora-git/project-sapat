import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';
import { getCanteenBrandMark } from '../../components/vendor-card.js';
import { ForecastingService } from '../../services/forecasting.service.js';

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

    const activePillar = this._activePillar || 'forecast';

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-intelligence">
        
        <!-- 1. Full-Width Responsive Header Card (No Competing Switch Button) -->
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

          <!-- Quick KPI Pill Strip -->
          <div class="v-hub-quick-kpis">
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">Forecast Accuracy</span>
              <strong class="v-chip-val">${forecast.sustainability.prepAccuracyPct}%</strong>
              <span class="v-chip-sub">Demo Model Precision</span>
            </div>
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">Food Waste Avoided</span>
              <strong class="v-chip-val text-primary">${forecast.sustainability.wastePreventedKg} kg</strong>
              <span class="v-chip-sub">Predicted Surplus Saved</span>
            </div>
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">Student Satisfaction</span>
              <strong class="v-chip-val">${taste.sentimentScore}%</strong>
              <span class="v-chip-sub">${taste.totalReviews} Verified Reviews</span>
            </div>
            <div class="v-hub-kpi-chip">
              <span class="v-chip-lbl">Unmet Meal Requests</span>
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
            <span>Customer Taste AI</span>
          </button>
          <button class="v-pillar-btn ${activePillar === 'wishlist' ? 'active' : ''}" data-pillar="wishlist" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>Requested Meals</span>
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
          <!-- PILLAR A: DEMAND FORECASTING (TODAY & TOMORROW) -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Adaptive Demand Forecasting</h3>
                <span class="v-hub-block-subtitle">Predicting reservation volume before shifts begin with real-time continuous recalibration</span>
              </div>
              <span class="v-hub-badge-live">Live Recalibrating</span>
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
                      <span class="v-tmr-cur">Limit: <strong>${d.currentLimit}</strong></span>
                      <span class="v-tmr-arrow">&rarr;</span>
                      <span class="v-tmr-suggested">AI Suggested: <strong class="text-primary">${d.recommendedTarget}</strong></span>
                    </div>
                  </div>
                  <p class="v-tmr-rationale-text">${d.rationale}</p>
                `).join('')}
              </div>
            </div>

            <!-- Demand Distribution by Pickup Window -->
            <div class="v-hub-block-head" style="margin-top: 18px;">
              <div>
                <h4 class="v-hub-subhead-title">Pickup Window Surge Distribution</h4>
                <span class="v-hub-block-subtitle">Staggered rush schedule preventing counter bottlenecks</span>
              </div>
            </div>

            <div class="v-pickup-windows-deck">
              ${forecast.pickupWindows.map(w => `
                <div class="v-window-item">
                  <span class="v-win-time">${w.time}</span>
                  <div class="v-win-bar-wrap">
                    <div class="v-win-bar ${w.pct >= 45 ? 'peak' : ''}" style="width: ${w.pct}%;"></div>
                  </div>
                  <span class="v-win-meta">${w.servings} meals (${w.pct}%)</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${activePillar === 'prep' ? `
          <!-- PILLAR B: SMART PREPARATION RECOMMENDATIONS -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Smart Preparation Recommendations</h3>
                <span class="v-hub-block-subtitle">Exact portion targets with evidence explanations & vendor one-click adoption</span>
              </div>
              <span class="v-hub-badge-decision">Vendor Consent Required</span>
            </div>

            <div class="v-ai-cards-grid">
              ${forecast.dishes.map(d => {
                let badgeClass = 'maintain';
                let badgeLabel = 'Target Optimal';
                if (d.actionType === 'increase') {
                  badgeClass = 'increase';
                  badgeLabel = `+${d.delta} Prep Needed`;
                } else if (d.actionType === 'decrease') {
                  badgeClass = 'reduce';
                  badgeLabel = `-${d.delta} Safe Trim`;
                }

                return `
                  <div class="v-ai-dish-card">
                    <div class="v-ai-dish-head">
                      <div class="v-ai-dish-info">
                        <span class="v-ai-dish-name">${d.dishName}</span>
                        <span class="v-ai-dish-cat">${d.category} &bull; ₱${d.price}</span>
                      </div>
                      <span class="v-ai-rec-pill ${badgeClass}">${badgeLabel}</span>
                    </div>

                    <div class="v-ai-stat-row">
                      <div class="v-ai-stat-cell">
                        <span class="v-ai-stat-lbl">Active Quota</span>
                        <strong class="v-ai-stat-val">${d.dailyLimit}</strong>
                      </div>
                      <div class="v-ai-stat-cell">
                        <span class="v-ai-stat-lbl">Pre-ordered</span>
                        <strong class="v-ai-stat-val text-primary">${d.reservedServings}</strong>
                      </div>
                      <div class="v-ai-stat-cell">
                        <span class="v-ai-stat-lbl">AI Suggested</span>
                        <strong class="v-ai-stat-val text-orange">${d.suggestedTarget}</strong>
                      </div>
                    </div>

                    <p class="v-ai-explanation">${d.explanation}</p>

                    ${d.actionType !== 'maintain' ? `
                      <div class="v-ai-action-footer">
                        <button class="v-ai-apply-btn" type="button" data-action="apply-ai-target" data-dish-id="${d.dishId}" data-target="${d.suggestedTarget}">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Accept & Set Target to ${d.suggestedTarget} Portions</span>
                        </button>
                      </div>
                    ` : `
                      <div class="v-ai-optimal-notice">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Current kitchen target aligns with booking rate & prevents waste.</span>
                      </div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${activePillar === 'taste' ? `
          <!-- PILLAR C: CUSTOMER TASTE INTELLIGENCE -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Customer Taste Intelligence</h3>
                <span class="v-hub-block-subtitle">Synthesized student taste preferences and actionable recipe improvements</span>
              </div>
              <span class="v-hub-badge-live">${taste.totalReviews} Student Reviews</span>
            </div>

            <!-- Taste Score Hero Card -->
            <div class="v-taste-hero-card">
              <div class="v-taste-score-circle">
                <strong class="v-taste-score-num">${taste.sentimentScore}%</strong>
                <span class="v-taste-score-lbl">Satisfaction</span>
              </div>
              <div class="v-taste-hero-info">
                <h4 class="v-taste-title">Student Taste Analysis & Satisfaction Profile</h4>
                <p class="v-taste-sub">Real-time student feedback analysis aggregated from verified digital pickup passes.</p>
              </div>
            </div>

            <!-- Flavor Attributes Radar/Bars -->
            <div class="v-flavor-attributes-grid" style="margin: 14px 0;">
              ${Object.entries(taste.flavorRatings).map(([attr, val]) => `
                <div class="v-flavor-card">
                  <div class="v-flavor-head">
                    <span class="v-flavor-name">${attr.charAt(0).toUpperCase() + attr.slice(1)}</span>
                    <strong class="v-flavor-score">${val}%</strong>
                  </div>
                  <div class="v-flavor-bar-track">
                    <div class="v-flavor-bar-fill" style="width: ${val}%;"></div>
                  </div>
                </div>
              `).join('')}
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
                  <strong>Actionable Recipe Recommendations</strong>
                </div>
                <ul class="v-insight-list">
                  ${taste.improvementsNeeded.map(imp => `<li>${imp}</li>`).join('')}
                </ul>
              </div>
            </div>

            <!-- Recent Verified Student Reviews -->
            <div class="v-recent-reviews-block" style="margin-top: 14px;">
              <h4 class="v-hub-subhead-title">Verified Student Reviews</h4>
              <div class="v-reviews-list">
                ${taste.recentReviews.map(r => `
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

        ${activePillar === 'wishlist' ? `
          <!-- PILLAR D: STUDENT MEAL REQUESTS (CAMPUS WISHLIST) -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Student Meal Requests & Wishlist</h3>
                <span class="v-hub-block-subtitle">High-demand dishes students have voted for that are not yet on your stall menu</span>
              </div>
              <span class="v-hub-badge-live">Campus Vote Tallies</span>
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
                      <span class="v-w-lbl">Suggested Price</span>
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

                  <div class="v-wishlist-action-row" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end;">
                    <button class="v-ai-apply-btn" style="width: auto; padding: 6px 14px;" type="button" data-action="test-dish-menu" data-dish-name="${meal.dishName}" data-price="${meal.suggestedPrice}" data-category="${meal.category}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>Pilot This Dish on Stall Menu</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${activePillar === 'performance' ? `
          <!-- PILLARS E & F: FOOD WASTE PREVENTION & VENDOR PERFORMANCE -->
          <div class="v-hub-section-block">
            <div class="v-hub-block-head">
              <div>
                <h3 class="v-hub-block-title">Waste Prevention & Kitchen Efficiency</h3>
                <span class="v-hub-block-subtitle">Historical portion outcomes, sell-through rates, and food waste prevented</span>
              </div>
              <span class="v-hub-badge-decision">Zero Leftover Policy</span>
            </div>

            <!-- Top Sustainability Deck -->
            <div class="v-sust-cards-row" style="margin-bottom: 14px;">
              <div class="v-sust-card">
                <span class="v-sust-lbl">Food Waste Avoided</span>
                <strong class="v-sust-val">${forecast.sustainability.wastePreventedKg} kg</strong>
                <span class="v-sust-sub">Cooking strictly to quotas</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-lbl">Preparation Accuracy</span>
                <strong class="v-sust-val">${forecast.sustainability.prepAccuracyPct}%</strong>
                <span class="v-sust-sub">Quota to claim match</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-lbl">Avoided Overages</span>
                <strong class="v-sust-val">${forecast.sustainability.overproductionSavedMeals} meals</strong>
                <span class="v-sust-sub">Portions spared</span>
              </div>
            </div>

            <!-- Multi-week Performance Log Table -->
            <div class="v-hub-block-head" style="margin-top: 18px;">
              <div>
                <h4 class="v-hub-subhead-title">Weekly Batch Verification History</h4>
                <span class="v-hub-block-subtitle">Daily audited kitchen preparation logs</span>
              </div>
            </div>

            <div class="admin-table-card" style="margin-top: 8px;">
              <div class="admin-table-responsive">
                <table class="admin-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Prepared Target</th>
                      <th>Pre-ordered</th>
                      <th>Claimed</th>
                      <th>Unsold Leftover</th>
                      <th>Accuracy</th>
                      <th>Waste Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${historyLogs.map(log => `
                      <tr>
                        <td><strong>${log.date}</strong></td>
                        <td>${log.day}</td>
                        <td><strong>${log.prepared}</strong></td>
                        <td>${log.preordered}</td>
                        <td><strong class="text-primary">${log.claimed}</strong></td>
                        <td><span class="${log.unsold <= 2 ? 'text-primary' : 'text-orange'}">${log.unsold} portions</span></td>
                        <td><span class="table-confidence-badge">${log.accuracy}%</span></td>
                        <td><strong class="text-primary">${log.wasteSavedKg} kg</strong></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
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
                <span class="v-hub-block-subtitle">Demonstrate how SAPAT Intelligence adapts dynamically when orders and reviews arrive</span>
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
          const menu = SapatStorage.getMenu();
          const dish = menu.find(d => d.id === dishId);
          if (dish) {
            dish.dailyLimit = target;
            SapatStorage.saveMenu(menu);
            showToast(`Daily target for ${dish.name} set to ${target} portions.`, 'success');
            this.render(container);
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
