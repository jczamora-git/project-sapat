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

        <!-- 3. Simplified Kitchen Assistant: "Your Kitchen Insights" -->
        <div class="v-ai-intelligence-section">
          
          <div class="v-feed-header-row">
            <div class="v-feed-title-col">
              <div class="v-ai-badge">
                <span class="v-ai-badge-pulse"></span>
                <span>SAPAT Kitchen Assistant</span>
              </div>
              <h3 class="v-feed-main-title">Your Kitchen Insights</h3>
              <p class="v-feed-sub-title">Simple, daily meal preparation advice based on confirmed student pre-orders</p>
            </div>
            <button class="v-jump-intelligence-btn" data-route="#/vendor/intelligence" type="button" title="Open Deep Analytics & Forecasting">
              <span>View All Insights</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Feed Category Tabs (Vendor-Friendly Labels) -->
          <div class="v-ai-tab-strip">
            <button class="v-ai-tab-btn ${activeTab === 'prep' ? 'active' : ''}" data-ai-tab="prep" type="button">
              <span>Today's Preparation</span>
            </button>
            <button class="v-ai-tab-btn ${activeTab === 'taste' ? 'active' : ''}" data-ai-tab="taste" type="button">
              <span>Popular Meals</span>
              <span class="v-ai-tab-badge">${tasteAnalysis.sentimentScore}%</span>
            </button>
            <button class="v-ai-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}" data-ai-tab="wishlist" type="button">
              <span>Student Requests</span>
              <span class="v-ai-tab-badge">${requestedMeals.length}</span>
            </button>
            <button class="v-ai-tab-btn ${activeTab === 'simulation' ? 'active' : ''}" data-ai-tab="simulation" type="button">
              <span>Live Pitch Demo</span>
            </button>
          </div>

          <!-- TAB 1: TODAY'S PREPARATION (SIMPLIFIED MEAL RECOMMENDATION CARDS) -->
          ${activeTab === 'prep' ? `
            <div class="v-ai-recommendations-block">
              <div class="v-ai-block-heading">
                <span class="v-block-title">Recommended Portions to Prepare Today</span>
                <span class="v-block-sub">Clear recommendations for today's kitchen batch &bull; Tap "Why this recommendation?" for details</span>
              </div>

              <div class="v-assistant-cards-stack">
                ${forecast.dishes.map(d => {
                  const stateInfo = getRecommendationState(d);

                  return `
                    <div class="v-assistant-card ${stateInfo.cardClass}">
                      <!-- Meal Header -->
                      <div class="v-assistant-card-top">
                        <div class="v-assistant-thumb">
                          <img src="${d.image}" alt="${d.dishName}" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                        </div>
                        <div class="v-assistant-dish-meta">
                          <h4 class="v-assistant-dish-name">${d.dishName}</h4>
                          <span class="v-assistant-dish-sub">${d.category} &bull; ₱${d.price}</span>
                          <span class="v-assistant-status-pill ${stateInfo.badgeClass}">
                            ${stateInfo.badge}
                          </span>
                        </div>
                      </div>

                      <!-- Primary Quantities Display -->
                      <div class="v-assistant-quantities">
                        <div class="v-assistant-qty-box">
                          <span class="v-assistant-qty-lbl">Recommended Portions to Prepare</span>
                          <div class="v-assistant-qty-main">
                            <strong class="v-assistant-big-num ${d.additionalNeeded > 0 ? 'orange' : 'primary'}">${d.recommendedTarget}</strong>
                            <span class="v-assistant-unit">portions</span>
                            ${d.additionalNeeded > 0 ? `<span class="v-assistant-extra-pill">+${d.additionalNeeded} extra</span>` : ''}
                          </div>
                        </div>
                        <div class="v-assistant-qty-box">
                          <span class="v-assistant-qty-lbl">Confirmed Student Orders</span>
                          <div class="v-assistant-qty-main">
                            <strong class="v-assistant-big-num">${d.confirmedPreorders}</strong>
                            <span class="v-assistant-unit">paid of ${d.currentLimit} current limit</span>
                          </div>
                        </div>
                      </div>

                      <!-- Conversational Assistant Message -->
                      <div class="v-assistant-msg-box ${stateInfo.state === 'capacity-reached' ? 'capacity' : (d.additionalNeeded > 0 ? 'warning' : '')}">
                        <p class="v-assistant-msg">${stateInfo.message}</p>
                      </div>

                      <!-- One Clear Action Button -->
                      ${d.additionalNeeded > 0 ? `
                        <button class="v-assistant-cta-btn" type="button" data-action="apply-ai-target" data-dish-id="${d.dishId}" data-target="${d.recommendedTarget}">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Adjust Daily Target to ${d.recommendedTarget} Portions (+${d.additionalNeeded})</span>
                        </button>
                      ` : `
                        <div class="v-assistant-optimal-check">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Your current preparation of ${d.currentLimit} portions is sufficient. No change needed.</span>
                        </div>
                      `}

                      <!-- Secondary "Why this recommendation?" Expandable Details -->
                      <details class="v-assistant-details">
                        <summary class="v-assistant-details-summary">Why this recommendation? (Tap for details)</summary>
                        <div class="v-assistant-details-body">
                          <ul class="v-assistant-details-list">
                            <li><strong>Expected Orders Today:</strong> ${d.predictedDemand} portions students may need</li>
                            <li><strong>Confirmed Paid Orders:</strong> ${d.confirmedPreorders} orders locked</li>
                            <li><strong>Extra Portions Recommended:</strong> +${d.safetyBuffer} portions extra buffer</li>
                            <li><strong>Current Preparation Limit:</strong> ${d.currentLimit} portions active</li>
                          </ul>
                          <p class="v-assistant-details-notes">${d.explanation}</p>
                        </div>
                      </details>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Expected Orders by Pickup Time (Friendly Shift View) -->
            <div class="v-friendly-deck">
              <div class="v-friendly-deck-head">
                <span class="v-friendly-title">Expected Orders by Pickup Time</span>
                <p class="v-friendly-sub">When students plan to collect their meals today</p>
              </div>

              <div class="v-friendly-shifts-stack">
                ${forecast.pickupWindows.map(w => `
                  <div class="v-friendly-shift-card">
                    <div class="v-friendly-shift-top">
                      <span class="v-friendly-shift-name">${w.slot}</span>
                      <span class="v-friendly-shift-time">${w.time}</span>
                    </div>
                    <div class="v-friendly-shift-numbers">
                      <span>Confirmed: <strong>${w.confirmedPreorders} orders</strong></span>
                      <span>Extra Expected: <strong class="text-orange">+${w.predictedAdditional}</strong></span>
                      <span>Total: <strong>${w.totalExpectedDemand} meals</strong> (${w.pct}%)</span>
                    </div>
                    <div class="v-win-bar-track" style="height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden;">
                      <div class="v-win-bar-fill" style="width: ${w.pct}%; height: 100%; background: ${w.isPeak ? 'var(--accent-orange)' : 'var(--primary)'};"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="v-shift-reconcile-footer">
                <span><strong>Total Day Summary:</strong> ${forecast.summary.totalConfirmed} confirmed + ${forecast.summary.totalAdditionalNeeded || (forecast.summary.totalPredicted - forecast.summary.totalConfirmed)} expected walk-ins = <strong class="text-primary">${forecast.summary.totalPredicted} total meals</strong></span>
              </div>
            </div>

            <!-- How Reliable Is This Estimate? (Friendly Confidence Card) -->
            <div class="v-friendly-deck">
              <div class="v-friendly-deck-head" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <span class="v-friendly-title">How Reliable Is This Estimate?</span>
                  <p class="v-friendly-sub">Based on verified campus orders, schedules, and past records</p>
                </div>
                <span class="v-assistant-status-pill ${forecast.confidence.levelClass === 'conf-high' ? 'v-assistant-badge-optimal' : 'v-assistant-badge-increase'}">
                  ${forecast.confidence.level} Reliability
                </span>
              </div>

              <div class="v-friendly-factors-list">
                <div class="v-friendly-factor-row">
                  <span class="v-friendly-factor-dot"></span>
                  <span class="v-friendly-factor-text"><strong>Past Canteen Records:</strong> Based on ${forecast.confidence.logCount} days of verified kitchen logs.</span>
                </div>
                <div class="v-friendly-factor-row">
                  <span class="v-friendly-factor-dot"></span>
                  <span class="v-friendly-factor-text"><strong>Today's Bookings:</strong> ${forecast.summary.totalConfirmed} meals already ordered and paid for (${forecast.summary.bookingRatePct}% of limit locked).</span>
                </div>
                <div class="v-friendly-factor-row">
                  <span class="v-friendly-factor-dot"></span>
                  <span class="v-friendly-factor-text"><strong>Campus Schedule:</strong> Exam and lab schedules concentrate pickups in lunch shift 1.</span>
                </div>
                <div class="v-friendly-factor-row">
                  <span class="v-friendly-factor-dot"></span>
                  <span class="v-friendly-factor-text"><strong>Weather Condition:</strong> Rainy weather increases student demand for hot soups.</span>
                </div>
              </div>

              <p class="v-conf-disclaimer" style="margin-top: 10px;">${forecast.confidence.prototypeNotice}</p>
            </div>

            <!-- Kitchen Waste Prevented -->
            <div class="v-ai-sustainability-row">
              <div class="v-sust-card">
                <span class="v-sust-label">Food Waste Avoided</span>
                <strong class="v-sust-val text-primary">${forecast.sustainability.wastePreventedKg} kg</strong>
                <span class="v-sust-desc">By cooking to confirmed pre-orders</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-label">Preparation Accuracy</span>
                <strong class="v-sust-val">${forecast.sustainability.prepAccuracyPct !== null ? `${forecast.sustainability.prepAccuracyPct}%` : 'Pending'}</strong>
                <span class="v-sust-desc">${forecast.sustainability.prepAccuracyPct !== null ? 'Portions cooked vs claimed' : 'Awaiting completed shift'}</span>
              </div>
              <div class="v-sust-card">
                <span class="v-sust-label">Avoided Surplus</span>
                <strong class="v-sust-val text-orange">${forecast.sustainability.overproductionSavedMeals} meals</strong>
                <span class="v-sust-desc">Spared from going unsold</span>
              </div>
            </div>
          ` : ''}

          <!-- TAB 2: POPULAR MEALS (SIMPLIFIED STUDENT TASTE & FEEDBACK) -->
          ${activeTab === 'taste' ? `
            <div class="v-taste-section">
              <!-- Student Satisfaction Hero Card -->
              <div class="v-taste-hero-card">
                <div class="v-taste-hero-left">
                  <div class="v-taste-score-circle">
                    <strong class="v-taste-score-num">${tasteAnalysis.sentimentScore}%</strong>
                    <span class="v-taste-score-lbl">Satisfaction</span>
                  </div>
                </div>
                <div class="v-taste-hero-info">
                  <h4 class="v-taste-title">Student Favorite Meals & Feedback</h4>
                  <p class="v-taste-sub">Based on ${tasteAnalysis.totalReviews} verified student pre-order reviews.</p>
                </div>
              </div>

              <!-- Most Popular & Trending Meals Highlight -->
              <div class="v-friendly-deck">
                <div class="v-friendly-deck-head">
                  <span class="v-friendly-title">Popular Meals & Trends</span>
                  <p class="v-friendly-sub">Top student favorites and meals gaining popularity</p>
                </div>
                <div class="v-friendly-shifts-stack">
                  <div class="v-friendly-shift-card">
                    <div class="v-friendly-shift-top">
                      <strong class="v-friendly-shift-name">Most Loved Meal: Pork Sinigang</strong>
                      <span class="v-assistant-status-pill v-assistant-badge-optimal">Most Loved</span>
                    </div>
                    <p style="margin: 0; font-size: 11px; color: var(--text-secondary);">Students love the savory sour tamarind broth and garlic aroma of your Pork Sinigang. 98% positive student reviews.</p>
                  </div>
                  <div class="v-friendly-shift-card">
                    <div class="v-friendly-shift-top">
                      <strong class="v-friendly-shift-name">Becoming Popular: Crispy Lumpiang Shanghai</strong>
                      <span class="v-assistant-status-pill v-assistant-badge-increase">Becoming Popular</span>
                    </div>
                    <p style="margin: 0; font-size: 11px; color: var(--text-secondary);">More students are ordering Crispy Lumpiang Shanghai this week. High student demand as a lunch add-on.</p>
                  </div>
                  <div class="v-friendly-shift-card">
                    <div class="v-friendly-shift-top">
                      <strong class="v-friendly-shift-name">Consistently Ordered: Chicken Adobo</strong>
                      <span class="v-assistant-status-pill v-assistant-badge-optimal">Consistently Ordered</span>
                    </div>
                    <p style="margin: 0; font-size: 11px; color: var(--text-secondary);">Reliable student favorite with steady lunch demand. Students praise the tender chicken and rich garlic sauce balance.</p>
                  </div>
                </div>
              </div>

              <!-- Positive Notes vs Improvement Suggestions -->
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
                    <strong>Suggestions to Improve Your Meals</strong>
                  </div>
                  <ul class="v-insight-list">
                    ${tasteAnalysis.improvementsNeeded.map(i => `<li>${i}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Recent Verified Student Reviews -->
              <div class="v-recent-reviews-block">
                <span class="v-block-title" style="margin-bottom: 8px; display: block;">Student Feedback</span>
                <span class="v-block-sub" style="margin-bottom: 10px; display: block;">Verified reviews from students who claimed their pre-orders</span>
                <div class="v-reviews-list">
                  ${tasteAnalysis.recentReviews.map(r => `
                    <div class="v-review-card">
                      <div class="v-review-top">
                        <div class="v-review-author">
                          <span class="v-rev-avatar">${r.initials || (r.studentName ? r.studentName.charAt(0) : 'S')}</span>
                          <div>
                            <strong>${r.studentName}</strong>
                            <span class="v-rev-dept">${r.dept || r.department || 'Verified Student Pickup &bull; BSIT'}</span>
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

              <div class="v-feed-cta-footer">
                <button class="btn-secondary-action" data-route="#/vendor/intelligence" type="button">
                  Open Customer Taste Portal &rarr;
                </button>
              </div>
            </div>
          ` : ''}

          <!-- TAB 3: STUDENT REQUESTS (WISHLIST DISHES) -->
          ${activeTab === 'wishlist' ? `
            <div class="v-wishlist-section">
              <div class="v-ai-block-heading">
                <span class="v-block-title">Meals Students Want</span>
                <span class="v-block-sub">High-demand dishes students have voted for on campus</span>
              </div>

              <div class="v-assistant-cards-stack">
                ${requestedMeals.map((meal, idx) => `
                  <div class="v-assistant-card v-assistant-card-neutral">
                    <div class="v-assistant-card-top">
                      <div class="v-wishlist-rank" style="font-size: 15px; font-weight: 800; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--accent-orange-soft); color: var(--accent-orange-dark); border-radius: var(--radius-xs);">
                        #${idx + 1}
                      </div>
                      <div class="v-assistant-dish-meta">
                        <h4 class="v-assistant-dish-name">${meal.dishName}</h4>
                        <span class="v-assistant-dish-sub">${meal.category} &bull; Requested by ${meal.topDept}</span>
                      </div>
                    </div>

                    <!-- Conversational Advice -->
                    <div class="v-assistant-msg-box" style="margin: 4px 0 8px;">
                      <p class="v-assistant-msg">${meal.votes} students have requested this meal. It may be worth considering for your next menu.</p>
                    </div>

                    <div class="v-assistant-quantities">
                      <div class="v-assistant-qty-box">
                        <span class="v-assistant-qty-lbl">Student Demand</span>
                        <div class="v-assistant-qty-main">
                          <strong class="v-assistant-big-num orange">${meal.votes}</strong>
                          <span class="v-assistant-unit">Student Votes</span>
                        </div>
                      </div>
                      <div class="v-assistant-qty-box">
                        <span class="v-assistant-qty-lbl">Suggested Price</span>
                        <div class="v-assistant-qty-main">
                          <strong class="v-assistant-big-num">₱${meal.suggestedPrice}</strong>
                          <span class="v-assistant-unit">~${meal.projectedDailyDemand} meals/day (Est.)</span>
                        </div>
                      </div>
                    </div>

                    <p class="v-assistant-details-notes" style="margin: 6px 0 0; padding-top: 4px;">Student suggestion: "${meal.notes}"</p>

                    <button class="v-assistant-cta-btn" style="background: var(--bg-surface); color: var(--primary); border: 1.5px solid var(--primary);" type="button" data-route="#/vendor/intelligence">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>Pilot This Meal on Stall Menu</span>
                    </button>
                  </div>
                `).join('')}
              </div>

              <div class="v-feed-cta-footer">
                <button class="btn-secondary-action" data-route="#/vendor/intelligence" type="button">
                  View All Campus Student Requests &rarr;
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
