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
        if (event === 'vendor-changed' || event === 'data-reset' || event === 'orders-updated' || event === 'menu-updated') {
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

    // AI Intelligence Package for this vendor
    const forecast = ForecastingService.getVendorForecast(state.currentVendorId);
    const tasteAnalysis = ForecastingService.getCustomerTasteAnalysis(state.currentVendorId);
    const requestedMeals = ForecastingService.getRequestedMeals(state.currentVendorId);
    const tomorrowForecast = ForecastingService.getTomorrowForecast(state.currentVendorId);

    const activeTab = this._activeAiTab || 'prep';

    // Personalized greeting
    const ownerMap = {
      'vendor-lita': 'Ate Lita',
      'vendor-ben': 'Kuya Ben',
      'vendor-cora': 'Nanay Cora',
      'vendor-green': 'Chef Marco',
      'vendor-tess': 'Aling Tess'
    };
    const ownerName = ownerMap[currentVendor.id] || currentVendor.name.split("'")[0] || 'Partner';
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : (hour < 17 ? 'Good afternoon' : 'Good evening');

    const highDemandDish = forecast.dishes.find(d => d.actionType === 'increase') || forecast.dishes[0];
    const surplusDish = forecast.dishes.find(d => d.actionType === 'decrease') || forecast.dishes[forecast.dishes.length - 1];
    const topWishlist = requestedMeals[0];

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-dashboard">
        
        <!-- 1. Personalized Welcome Card (No Switch Stall Button) -->
        <div class="vendor-identity-card v-home-welcome-card">
          <div class="v-welcome-main">
            <div class="v-welcome-brand-mark">
              ${getCanteenBrandMark(currentVendor.id)}
            </div>
            <div class="v-welcome-text-col">
              <div class="v-welcome-meta-pill-row">
                <span class="v-welcome-stall-pill">${currentVendor.stallNumber}</span>
                <span class="v-welcome-status-pill ${currentVendor.isOpen ? 'online' : 'offline'}">
                  <span class="canteen-status-dot ${currentVendor.isOpen ? 'online' : 'offline'}"></span>
                  ${currentVendor.isOpen ? 'Open for Orders' : 'Stall Closed'}
                </span>
                <span class="v-welcome-date-pill">Today &bull; Lunch Service</span>
              </div>
              <h2 class="v-welcome-greeting">${timeGreeting}, ${ownerName}.</h2>
              <p class="v-welcome-subtitle">Here's what your kitchen needs to know today &bull; ${currentVendor.name}</p>
            </div>
          </div>
        </div>

        <!-- 2. Compact Operational Summary Bar -->
        <div class="v-compact-ops-summary">
          <div class="v-ops-item">
            <span class="v-ops-lbl">Incoming Orders</span>
            <strong class="v-ops-val">${totalOrdersCount}</strong>
            <span class="v-ops-sub">Active pre-orders</span>
          </div>

          <div class="v-ops-item">
            <span class="v-ops-lbl">Reserved Portions</span>
            <strong class="v-ops-val">${totalReserved}<small class="v-ops-denom">/${totalDailyLimit}</small></strong>
            <span class="v-ops-sub">${Math.round((totalReserved / (totalDailyLimit || 1)) * 100)}% target booked</span>
          </div>

          <div class="v-ops-item">
            <span class="v-ops-lbl">Remaining Portions</span>
            <strong class="v-ops-val ${totalRemaining <= 10 ? 'alert-orange' : ''}">${totalRemaining}</strong>
            <span class="v-ops-sub">Portions available</span>
          </div>

          <div class="v-ops-item">
            <span class="v-ops-lbl">Projected Sales</span>
            <strong class="v-ops-val text-primary">₱${totalProjectedSales.toLocaleString()}</strong>
            <span class="v-ops-sub">Locked revenue</span>
          </div>
        </div>

        <!-- 3. AI Insights Feed: "Your Kitchen Insights" -->
        <div class="v-ai-intelligence-section">
          
          <div class="v-feed-header-row">
            <div class="v-feed-title-col">
              <div class="v-ai-badge">
                <span class="v-ai-badge-pulse"></span>
                <span>SAPAT Intelligence</span>
              </div>
              <h3 class="v-feed-main-title">Your Kitchen Insights</h3>
              <p class="v-feed-sub-title">Live recommendations tailored to active reservations, rush schedules, and student tastes</p>
            </div>
            <button class="v-jump-intelligence-btn" data-route="#/vendor/intelligence" type="button" title="Open Deep Analytics & Forecasting">
              <span>View All Insights</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Feed Category Tabs -->
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

          <!-- TAB 1: PREPARATION & DEMAND FORECAST FEED -->
          ${activeTab === 'prep' ? `
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
                    <div class="v-ai-dish-card ${d.actionType === 'increase' ? 'highlight-increase' : ''}">
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
                        <div class="v-ai-card-footer v-feed-action-split">
                          <button class="v-ai-apply-btn" type="button" data-action="apply-ai-target" data-dish-id="${d.dishId}" data-target="${d.suggestedTarget}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span>Adjust Daily Target to ${d.suggestedTarget}</span>
                          </button>
                          <button class="v-feed-secondary-link" data-route="#/vendor/prep" type="button">
                            Review Plan &rarr;
                          </button>
                        </div>
                      ` : `
                        <div class="v-ai-optimal-notice">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Preparation limit is optimal. Capacity covers reservations with zero surplus risk.</span>
                        </div>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Demand Distribution by Pickup Window -->
            <div class="v-ai-windows-block">
              <div class="v-ai-block-heading">
                <span class="v-block-title">Forecasted Demand by Pickup Shift</span>
                <span class="v-block-sub">Rush schedule distribution preventing counter bottlenecks</span>
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
                    <span class="v-window-stat">${w.servings} meals (${w.pct}%)</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Sustainability & Overproduction Metrics -->
            <div class="v-ai-sustainability-row">
              <div class="v-sust-card">
                <span class="v-sust-label">Food Waste Prevented</span>
                <strong class="v-sust-val text-primary">${forecast.sustainability.wastePreventedKg} kg</strong>
                <span class="v-sust-desc">Based on locked pre-orders</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-label">Preparation Accuracy</span>
                <strong class="v-sust-val">${forecast.sustainability.prepAccuracyPct}%</strong>
                <span class="v-sust-desc">Portion target precision</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-label">Avoided Overproduction</span>
                <strong class="v-sust-val text-orange">${forecast.sustainability.overproductionSavedMeals} meals</strong>
                <span class="v-sust-desc">Zero unwanted cooking</span>
              </div>
            </div>
          ` : ''}

          <!-- TAB 2: CUSTOMER TASTE & FEEDBACK AI -->
          ${activeTab === 'taste' ? `
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
                ${Object.entries(tasteAnalysis.flavorRatings).map(([key, val]) => `
                  <div class="v-flavor-card">
                    <div class="v-flavor-head">
                      <span class="v-flavor-name">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <strong class="v-flavor-score">${val}%</strong>
                    </div>
                    <div class="v-flavor-bar-track">
                      <div class="v-flavor-bar-fill" style="width: ${val}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Positive vs Actionable Feedback Breakdown -->
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
                    <strong>Actionable Recipe Recommendations</strong>
                  </div>
                  <ul class="v-insight-list">
                    ${tasteAnalysis.improvementsNeeded.map(i => `<li>${i}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Recent Verified Student Reviews -->
              <div class="v-recent-reviews-block">
                <span class="v-block-title" style="margin-bottom: 8px; display: block;">Recent Student Reviews</span>
                <div class="v-reviews-list">
                  ${tasteAnalysis.recentReviews.map(r => `
                    <div class="v-review-card">
                      <div class="v-review-top">
                        <div class="v-review-author">
                          <span class="v-rev-avatar">${r.studentName.charAt(0)}</span>
                          <div>
                            <strong>${r.studentName}</strong>
                            <span class="v-rev-dept">${r.department}</span>
                          </div>
                        </div>
                        <span class="v-rev-tag">${r.rating}/5 Stars</span>
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

              <div class="v-feed-cta-footer">
                <button class="btn-secondary-action" data-route="#/vendor/intelligence" type="button">
                  Open Deep Customer Taste Intelligence Portal &rarr;
                </button>
              </div>
            </div>
          ` : ''}

          <!-- TAB 3: REQUESTED MEALS WISHLIST -->
          ${activeTab === 'wishlist' ? `
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

              <div class="v-feed-cta-footer">
                <button class="btn-secondary-action" data-route="#/vendor/intelligence" type="button">
                  Analyze All Campus Unmet Demand &rarr;
                </button>
              </div>
            </div>
          ` : ''}

          <!-- TAB 4: LIVE PITCH DEMO CONTROLS -->
          ${activeTab === 'simulation' ? `
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

        <!-- 4. Active Kitchen Preparation Quotas Overview -->
        <div class="v-section-row-header">
          <div>
            <h3 class="section-heading">Active Kitchen Cooking Limits</h3>
            <span class="section-subtext">Cooking quotas aligned directly to student pre-orders</span>
          </div>
          <button class="section-see-all-btn" data-route="#/vendor/prep" type="button">Batch Control &rarr;</button>
        </div>

        <div class="v-prep-status-stack">
          ${vendorDishes.slice(0, 4).map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
            const isHighDemand = pct >= 70;

            return `
              <div class="v-prep-status-card">
                <div class="v-prep-card-main">
                  <div class="v-prep-thumb">
                    <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                  </div>
                  <div class="v-prep-card-details">
                    <div class="v-prep-status-head">
                      <strong class="v-dish-name">${dish.name}</strong>
                      <span class="v-quota-stat-pill ${isSoldOut ? 'soldout' : (isHighDemand ? 'warning' : '')}">
                        ${isSoldOut ? 'Capacity Reached' : `${pct}% Booked`}
                      </span>
                    </div>
                    <div class="v-dish-meta-row">
                      <span>${dish.reservedServings} of ${dish.dailyLimit} portions pre-ordered</span>
                      <span class="v-dish-remaining-tag">${remaining} left</span>
                    </div>
                    <div class="v-dish-quota-bar">
                      <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : (isHighDemand ? 'warning' : '')}" style="width: ${pct}%;"></div>
                    </div>
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
    container.addEventListener('click', (e) => {
      // Sub-tab switching for AI Intelligence
      const tabBtn = e.target.closest('[data-ai-tab]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-ai-tab');
        if (tab) {
          this._activeAiTab = tab;
          this.render(container);
        }
        return;
      }

      // Apply AI Suggested Target
      const applyBtn = e.target.closest('[data-action="apply-ai-target"]');
      if (applyBtn) {
        const dishId = applyBtn.getAttribute('data-dish-id');
        const target = parseInt(applyBtn.getAttribute('data-target'), 10);
        if (dishId && target) {
          const res = SapatStorage.updateDishDailyLimit(dishId, target);
          if (res.success) {
            showToast(`Target quota updated to ${target} portions for ${res.dish.name}!`, 'success');
            this.render(container);
          } else {
            showToast(res.message || 'Cannot adjust limit below reserved servings', 'error');
          }
        }
        return;
      }

      // Navigation links
      const navBtn = e.target.closest('[data-route]');
      if (navBtn) {
        const route = navBtn.getAttribute('data-route');
        if (route) {
          router.navigate(route);
        }
        return;
      }

      // Live Demo Pitch Simulation Actions
      const simRushBtn = e.target.closest('[data-action="sim-rush"]');
      if (simRushBtn) {
        ForecastingService.simulateRushOrders(state.currentVendorId, 5);
        showToast('Simulated +5 Rush Pre-orders! Live demand re-forecasted.', 'success');
        this.render(container);
        return;
      }

      const simReviewBtn = e.target.closest('[data-action="sim-review"]');
      if (simReviewBtn) {
        ForecastingService.simulateStudentReview(state.currentVendorId);
        showToast('Simulated verified student review! Customer Taste recalculated.', 'info');
        this.render(container);
        return;
      }

      const simVoteBtn = e.target.closest('[data-action="sim-vote"]');
      if (simVoteBtn) {
        ForecastingService.simulateWishlistVote(state.currentVendorId);
        showToast('Simulated student vote on wishlist dish! Demand tracking updated.', 'success');
        this.render(container);
        return;
      }

      const simResetBtn = e.target.closest('[data-action="sim-reset"]');
      if (simResetBtn) {
        ForecastingService.resetSimulation(state.currentVendorId);
        showToast('Simulation reset to clean baseline dataset.', 'info');
        this.render(container);
        return;
      }
    });
  }
};
