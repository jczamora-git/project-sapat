import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';
import { ForecastingService } from '../../services/forecasting.service.js';

export const vendorPrepPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset' || event === 'menu-updated') {
          const currentScreen = document.getElementById('screen-vendor-prep');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    if (!currentVendor) return;

    const menu = SapatStorage.getMenu();
    let vendorDishes = menu.filter(d => d.vendorId === state.currentVendorId);

    const activeFilter = state.vendorPrepTab || 'all';
    if (activeFilter === 'urgent') {
      vendorDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) >= 0.70 || d.reservedServings >= d.dailyLimit);
    } else if (activeFilter === 'safe') {
      vendorDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) < 0.70 && d.reservedServings < d.dailyLimit);
    }

    const forecast = ForecastingService.getVendorForecast(state.currentVendorId);
    const forecastMap = new Map((forecast.dishes || []).map(d => [d.dishId, d]));

    // Daily After-Sales Reconciliation Summary
    const afterSales = SapatStorage.getTodayAfterSalesSummary(state.currentVendorId);
    const existingRep = afterSales.existingReport;
    const defaultPrepared = existingRep ? existingRep.totalPrepared : (afterSales.claimedReservations + afterSales.walkInSold + 2);
    const defaultRemaining = existingRep ? existingRep.remainingPortions : 1;
    const defaultDiscarded = existingRep ? existingRep.discardedPortions : 1;

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-prep">
        
        <!-- Page Title & Forecast Subtitle -->
        <div class="v-prep-header-row">
          <div>
            <h2 class="page-main-heading">${currentVendor.name} Prep Control</h2>
            <p class="page-main-sub">${currentVendor.stallNumber} &bull; Lock cooking batches to confirmed pre-orders & adjust daily limits</p>
          </div>
          <span class="v-ai-preview-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            AI Forecast Active
          </span>
        </div>

        <!-- Filter Segmented Control -->
        <div class="v-prep-segment-control">
          <button class="v-prep-seg-btn ${activeFilter === 'all' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="all" type="button">
            All Dishes
          </button>
          <button class="v-prep-seg-btn ${activeFilter === 'urgent' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="urgent" type="button">
            High Demand (70%+)
          </button>
          <button class="v-prep-seg-btn ${activeFilter === 'safe' ? 'active' : ''}" data-action="filter-prep-tab" data-tab="safe" type="button">
            Safe Capacity
          </button>
        </div>

        <!-- Dish Preparation Matrix Cards Stack -->
        <div class="v-prep-matrix-stack">
          ${vendorDishes.length === 0 ? `
            <div class="v-empty-prep-card">
              <p>No dishes match the selected capacity filter.</p>
              <button class="btn-filter-reset" style="margin-top: 10px;" data-action="filter-prep-tab" data-tab="all">Show All Dishes</button>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = SapatStorage.getDishAvailablePortions(dish.id);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
            const isHighDemand = pct >= 70;
            const canDecrease = (dish.dailyLimit - 5) >= dish.reservedServings && (dish.dailyLimit - 5) >= 5;
            const dishForecast = forecastMap.get(dish.id);

            return `
              <div class="v-prep-card">
                <!-- Top Details Row -->
                <div class="v-prep-card-top">
                  <div class="v-prep-dish-media">
                    <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                  </div>
                  <div class="v-prep-dish-info">
                    <div class="v-prep-name-status-row">
                      <h4 class="v-dish-name">${dish.name}</h4>
                      <span class="order-status-badge ${isSoldOut ? 'status-cancelled' : (isHighDemand ? 'status-preparing' : 'status-confirmed')}">
                        ${isSoldOut ? 'CAPACITY HIT' : `${pct}% RESERVED`}
                      </span>
                    </div>
                    <span class="v-dish-meta">${dish.categoryName || 'Ulam'} &bull; ₱${dish.price}</span>
                  </div>
                </div>

                <!-- 4 Operational Metrics Row -->
                <div class="v-dish-stats-grid" style="margin: 10px 0 8px;">
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Daily Target</span>
                    <strong class="v-cell-val">${dish.dailyLimit}</strong>
                  </div>
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Reserved</span>
                    <strong class="v-cell-val">${dish.reservedServings}</strong>
                  </div>
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Remaining</span>
                    <strong class="v-cell-val ${isSoldOut ? 'soldout' : ''}">${remaining}</strong>
                  </div>
                  <div class="v-stat-cell">
                    <span class="v-cell-label">Booking Rate</span>
                    <strong class="v-cell-val ${isHighDemand ? 'warning' : ''}">${pct}%</strong>
                  </div>
                </div>

                <!-- Progress Track -->
                <div class="v-dish-quota-bar">
                  <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : (isHighDemand ? 'warning' : '')}" style="width: ${pct}%;"></div>
                </div>

                <!-- SAPAT Intelligence Recommendation Callout -->
                ${dishForecast ? `
                  <div class="v-prep-ai-callout ${dishForecast.additionalNeeded > 0 ? 'warning' : ''}">
                    <div class="v-ai-callout-header">
                      <div class="v-ai-icon-title">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        <strong>AI Forecast: ${dishForecast.predictedDemand} Demand + ${dishForecast.safetyBuffer} Buffer</strong>
                      </div>
                      <span class="v-ai-suggest-pill">Target: ${dishForecast.recommendedTarget}</span>
                    </div>
                    <p class="v-ai-callout-text">${dishForecast.explanation}</p>
                    ${dishForecast.additionalNeeded > 0 ? `
                      <button class="v-prep-apply-ai-btn" data-action="set-dish-limit" data-dish-id="${dish.id}" data-target="${dishForecast.recommendedTarget}" type="button">
                        Approve AI Target (${dishForecast.recommendedTarget} portions &bull; +${dishForecast.additionalNeeded} needed)
                      </button>
                    ` : `
                      <span style="font-size: 10px; color: var(--primary); font-weight: 600; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Target optimal. Capacity matches forecasted demand.
                      </span>
                    `}
                  </div>
                ` : ''}

                <!-- Manual Limit Adjust Controls -->
                <div class="v-prep-control-row">
                  <div class="v-prep-control-label">
                    <span>Manual Target Adjustment:</span>
                    <small>Safety protected (min. ${dish.reservedServings})</small>
                  </div>
                  <div class="v-prep-stepper">
                    <button class="v-step-btn ${!canDecrease ? 'disabled' : ''}" 
                      data-action="adjust-limit" 
                      data-dish-id="${dish.id}" 
                      data-delta="-5" 
                      ${!canDecrease ? 'disabled' : ''}
                      title="${!canDecrease ? 'Cannot decrease below already locked student pre-orders' : 'Decrease daily target by 5'}">
                      -5
                    </button>
                    <span class="v-step-current">${dish.dailyLimit}</span>
                    <button class="v-step-btn" 
                      data-action="adjust-limit" 
                      data-dish-id="${dish.id}" 
                      data-delta="5"
                      title="Increase daily target by 5 portions">
                      +5
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- Campus Shift Distribution Note -->
        <div class="v-prep-shifts-summary-card">
          <h4 class="v-shifts-title">Preparation Shift Windows</h4>
          <p class="v-shifts-desc">Pre-orders are locked 30 minutes before each student meal window to allow accurate batch cooking.</p>
          <div class="v-shifts-grid">
            <div class="v-shift-cell">
              <strong>Morning Recess</strong>
              <span>9:45 AM &bull; Snacks & Finger Foods</span>
            </div>
            <div class="v-shift-cell">
              <strong>Lunch Shift 1</strong>
              <span>11:30 AM &bull; Primary Rice Meals</span>
            </div>
            <div class="v-shift-cell">
              <strong>Lunch Shift 2</strong>
              <span>12:15 PM &bull; Secondary High School</span>
            </div>
          </div>
        </div>

        <!-- End-of-Day Kitchen Closing: Daily After-Sales & Portion Reconciliation -->
        <div class="kitchen-closing-card" id="kitchen-closing-section">
          ${this.renderKitchenClosing(state.currentVendorId, afterSales, existingRep)}
        </div>

      </section>
    `;

    this.attachEvents(container);
    this.updateReconciliationUI(container);
  },

  renderKitchenClosing(vendorId, afterSales, existingRep) {
    const isSubmittedView = Boolean(existingRep && !this._isEditingReport);
    const reports = SapatStorage.getAfterSalesReports(vendorId);
    const dishBreakdown = afterSales.dishBreakdown || [];

    if (isSubmittedView) {
      // 4. Submitted / Completed Operational State
      const totalSold = existingRep.claimedReservations + existingRep.walkInSold;
      return `
        <div class="closing-header-row">
          <div>
            <span class="closing-header-eyebrow">Kitchen Closing &bull; ${existingRep.reportDate}</span>
            <h3 class="closing-header-title">End-of-Day Kitchen Closing</h3>
            <p class="closing-header-sub">Daily closing report has been reconciled and officially submitted to campus administration.</p>
          </div>
          <span class="closing-state-pill state-submitted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Submitted &amp; Reconciled
          </span>
        </div>

        <!-- Submitted Hero Card -->
        <div class="closing-submitted-hero">
          <div class="closing-submitted-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4 class="closing-submitted-title">Daily Kitchen Closing Completed</h4>
          <p class="closing-submitted-date">Submitted on ${existingRep.reportDate} &bull; All ${existingRep.totalPrepared} prepared portions fully reconciled</p>
          <button type="button" class="btn-secondary-action" data-action="edit-closing-report" style="margin-top: 10px; font-size: 12px; padding: 6px 14px; border-radius: 8px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit / Update Closing Report
          </button>
        </div>

        <!-- Section A: Daily Operations Summary -->
        <div class="closing-section-block">
          <div class="closing-section-heading">
            <span class="closing-section-label">Section A &bull; Daily Operations Summary</span>
            <span class="closing-section-tag">Auto-Retrieved System Records</span>
          </div>
          <div class="closing-ops-grid">
            <div class="closing-op-cell">
              <span class="closing-op-label">Claimed Pre-orders</span>
              <strong class="closing-op-value">${existingRep.claimedReservations} portions</strong>
              <span class="closing-op-sub">Completed student pickups</span>
            </div>
            <div class="closing-op-cell">
              <span class="closing-op-label">Walk-in Sold</span>
              <strong class="closing-op-value" style="color: var(--primary);">${existingRep.walkInSold} portions</strong>
              <span class="closing-op-sub">Direct counter sales</span>
            </div>
            <div class="closing-op-cell">
              <span class="closing-op-label">Total Walk-in Revenue</span>
              <strong class="closing-op-value" style="color: var(--primary);">₱${Number(existingRep.walkInRevenue || afterSales.walkInRevenue).toFixed(2)}</strong>
              <span class="closing-op-sub">Counter cash &amp; digital payments</span>
            </div>
            <div class="closing-op-cell">
              <span class="closing-op-label">Unclaimed Pre-orders</span>
              <strong class="closing-op-value" style="color: var(--text-secondary);">${existingRep.unclaimedReservations} portions</strong>
              <span class="closing-op-sub">Paid no-shows (separate accountability)</span>
            </div>
          </div>
        </div>

        <!-- Reconciled Portion Summary Breakdown -->
        <div class="closing-section-block">
          <div class="closing-section-heading">
            <span class="closing-section-label">Reconciled Portions Breakdown</span>
            <span class="closing-section-tag" style="background: rgba(0,91,54,0.1); color: var(--primary); font-weight: 700;">Balanced (0 discrepancy)</span>
          </div>
          <table class="closing-review-table">
            <tbody>
              <tr>
                <td>Total Actual Prepared</td>
                <td><strong>${existingRep.totalPrepared} portions</strong></td>
              </tr>
              <tr>
                <td>Total Portions Sold (Claimed + Walk-in)</td>
                <td><strong style="color: var(--primary);">${totalSold} portions</strong></td>
              </tr>
              <tr>
                <td>Remaining Edible Food (Leftover)</td>
                <td><strong>${existingRep.remainingPortions} portions</strong></td>
              </tr>
              <tr>
                <td>Discarded Waste (Spoiled / Contaminated)</td>
                <td><strong style="color: ${existingRep.discardedPortions > 0 ? '#b45309' : 'inherit'};">${existingRep.discardedPortions} portions</strong></td>
              </tr>
              <tr>
                <td>Unclaimed Reservations (Accountability)</td>
                <td>${existingRep.unclaimedReservations} portions</td>
              </tr>
              <tr class="review-highlight">
                <td>Portion Balance Verification</td>
                <td>&check; Prepared (${existingRep.totalPrepared}) = Accounted (${totalSold + existingRep.remainingPortions + existingRep.discardedPortions})</td>
              </tr>
            </tbody>
          </table>

          ${existingRep.notes ? `
            <div style="background: var(--bg-main, #f9fafb); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; margin-top: 10px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 2px;">Kitchen Closing Remarks:</span>
              <p style="font-size: 12px; margin: 0; color: var(--text-primary);">${existingRep.notes}</p>
            </div>
          ` : ''}

          ${(existingRep.dishBreakdown && existingRep.dishBreakdown.length > 0) ? `
            <div style="margin-top: 14px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 6px;">Submitted Per-Dish Accounting</span>
              <div class="closing-dishes-list">
                ${existingRep.dishBreakdown.map(d => `
                  <div class="closing-history-item" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${d.name}</strong>
                      <span style="display: block; font-size: 11px; color: var(--text-secondary);">Target: ${d.dailyLimit} | Sold: ${(d.claimed || 0) + (d.walkInSold || 0)}</span>
                    </div>
                    <div style="text-align: right; font-size: 11px;">
                      <div>Prepared: <strong>${d.prepared}</strong></div>
                      <span style="color: var(--text-secondary);">Leftover: ${d.remaining} &bull; Waste: ${d.discarded}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Section E: Report History -->
        ${this.renderClosingHistory(reports)}
      `;
    }

    // Active Closing Workflow Form (States 1, 2, or 3)
    const defaultTotalPrep = existingRep ? existingRep.totalPrepared : (afterSales.claimedReservations + afterSales.walkInSold);
    const defaultTotalRem = existingRep ? existingRep.remainingPortions : 0;
    const defaultTotalDisc = existingRep ? existingRep.discardedPortions : 0;

    return `
      <div class="closing-header-row">
        <div>
          <span class="closing-header-eyebrow">Kitchen Closing &bull; ${afterSales.reportDate}</span>
          <h3 class="closing-header-title">End-of-Day Kitchen Closing</h3>
          <p class="closing-header-sub">Review today's sales, account for remaining food, and submit your daily kitchen report.</p>
        </div>
        <span id="closing-state-badge" class="closing-state-pill ${existingRep ? 'state-ready' : 'state-in-progress'}">
          ${existingRep ? '&check; Ready to Submit' : '&bull; In Progress'}
        </span>
      </div>

      ${this._isEditingReport ? `
        <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: #92400e; font-weight: 600;">
            <strong>Editing Submitted Report:</strong> Adjust closing portions below and update your report.
          </div>
          <button type="button" class="btn-secondary-action" data-action="cancel-edit-closing" style="font-size: 11px; padding: 4px 8px;">Cancel</button>
        </div>
      ` : ''}

      <form id="form-after-sales-report" onsubmit="return false;">
        <!-- Hidden/Synced Legacy Inputs for Resilient Verification Compatibility -->
        <input type="hidden" id="rep-prepared-input" value="${defaultTotalPrep}">
        <input type="hidden" id="rep-remaining-input" value="${defaultTotalRem}">
        <input type="hidden" id="rep-discarded-input" value="${defaultTotalDisc}">

        <!-- SECTION A: Daily Operations Summary (Auto-Derived) -->
        <div class="closing-section-block">
          <div class="closing-section-heading">
            <span class="closing-section-label">Section A &bull; Daily Operations Summary</span>
            <span class="closing-section-tag">Auto-Retrieved Records</span>
          </div>
          <p style="font-size: 11.5px; color: var(--text-secondary); margin: 0 0 10px; line-height: 1.35;">
            Calculated automatically from today's completed reservations and direct counter walk-in sales. These numbers cannot be edited manually.
          </p>

          <div class="closing-ops-grid">
            <div class="closing-op-cell">
              <span class="closing-op-label">Claimed Pre-orders</span>
              <strong id="rep-claimed-val" class="closing-op-value">${afterSales.claimedReservations} portions</strong>
              <span class="closing-op-sub">Actual student pickups completed</span>
            </div>
            <div class="closing-op-cell">
              <span class="closing-op-label">Walk-in Portions Sold</span>
              <strong id="rep-walkin-val" class="closing-op-value" style="color: var(--primary);">${afterSales.walkInSold} portions</strong>
              <span class="closing-op-sub">Direct counter walk-in sales</span>
            </div>
            <div class="closing-op-cell">
              <span class="closing-op-label">Total Walk-in Revenue</span>
              <strong class="closing-op-value" style="color: var(--primary);">₱${afterSales.walkInRevenue.toFixed(2)}</strong>
              <span class="closing-op-sub">Cash and GCash collected at counter</span>
            </div>
            <div class="closing-op-cell">
              <span class="closing-op-label">Unclaimed Pre-orders</span>
              <strong id="rep-unclaimed-val" class="closing-op-value" style="color: var(--text-secondary);">${afterSales.unclaimedReservations} portions</strong>
              <span class="closing-op-sub">Paid no-shows (tracked for accountability)</span>
            </div>
          </div>
        </div>

        <!-- SECTION B: Actual Preparation Record (Per-Dish Breakdown) -->
        <div class="closing-section-block">
          <div class="closing-section-heading">
            <span class="closing-section-label">Section B &bull; Actual Preparation Record</span>
            <span class="closing-section-tag">Per-Dish Breakdown</span>
          </div>
          <p style="font-size: 11.5px; color: var(--text-secondary); margin: 0 0 12px; line-height: 1.35;">
            Enter the actual portions cooked, edible leftovers, and discarded food waste for each menu item.
          </p>

          <div class="closing-dishes-list" id="closing-dishes-container">
            ${dishBreakdown.map(dish => {
              const dishSold = dish.claimed + dish.walkInSold;
              const dishPrepared = dish.prepared != null ? dish.prepared : (dishSold || dish.dailyLimit);
              const dishRemaining = dish.remaining != null ? dish.remaining : 0;
              const dishDiscarded = dish.discarded != null ? dish.discarded : 0;

              return `
                <div class="closing-dish-card" data-dish-id="${dish.dishId}">
                  <div class="closing-dish-top">
                    <div>
                      <span class="closing-dish-cat">${dish.category}</span>
                      <h4 class="closing-dish-title">${dish.name}</h4>
                      <span class="closing-dish-target">Approved Target: <strong>${dish.dailyLimit} portions</strong></span>
                    </div>
                    <div class="closing-dish-sales-pill">
                      Sold: <strong>${dishSold}</strong>
                      <span style="display: block; font-size: 9.5px; color: var(--text-secondary);">(${dish.claimed} claimed + ${dish.walkInSold} walk-in)</span>
                    </div>
                  </div>

                  <div class="closing-dish-inputs-row">
                    <div class="closing-dish-input-box">
                      <label for="prep-${dish.dishId}">Prepared *</label>
                      <input type="number" id="prep-${dish.dishId}" class="dish-input dish-prep-input" data-dish-id="${dish.dishId}" min="0" value="${dishPrepared}" required>
                      <span class="input-sub">Target: ${dish.dailyLimit}</span>
                    </div>
                    <div class="closing-dish-input-box">
                      <label for="rem-${dish.dishId}">Leftover *</label>
                      <input type="number" id="rem-${dish.dishId}" class="dish-input dish-rem-input" data-dish-id="${dish.dishId}" min="0" value="${dishRemaining}" required>
                      <span class="input-sub">Edible portions</span>
                    </div>
                    <div class="closing-dish-input-box">
                      <label for="disc-${dish.dishId}">Waste *</label>
                      <input type="number" id="disc-${dish.dishId}" class="dish-input dish-disc-input" data-dish-id="${dish.dishId}" min="0" value="${dishDiscarded}" required>
                      <span class="input-sub">Discarded</span>
                    </div>
                  </div>

                  <div class="closing-dish-foot" id="dish-status-${dish.dishId}">
                    <!-- Live dish reconciliation pill via JS -->
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- SECTION C: Automatic Portion Reconciliation -->
        <div class="closing-section-block">
          <div class="closing-section-heading">
            <span class="closing-section-label">Section C &bull; Automatic Portion Reconciliation</span>
            <span class="closing-section-tag" style="background: rgba(0, 91, 54, 0.08); color: var(--primary);">Live Formula Verification</span>
          </div>

          <div id="rep-reconciliation-alert" class="portion-recon-banner recon-balanced">
            <!-- Dynamic real-time calculation populated by updateReconciliationUI -->
          </div>
        </div>

        <!-- SECTION D: Review Closing Summary -->
        <div class="closing-section-block">
          <div class="closing-section-heading">
            <span class="closing-section-label">Section D &bull; Review Closing Summary</span>
            <span class="closing-section-tag">Final Check</span>
          </div>

          <table class="closing-review-table">
            <tbody>
              <tr>
                <td>Total Portions Prepared</td>
                <td id="rev-total-prepared">${defaultTotalPrep} portions</td>
              </tr>
              <tr>
                <td>Total Claimed Pre-orders</td>
                <td id="rev-total-claimed">${afterSales.claimedReservations} portions</td>
              </tr>
              <tr>
                <td>Total Walk-in Sold</td>
                <td id="rev-total-walkin">${afterSales.walkInSold} portions</td>
              </tr>
              <tr>
                <td>Total Walk-in Revenue</td>
                <td id="rev-total-walkin-rev">₱${afterSales.walkInRevenue.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Leftover (Remaining Edible)</td>
                <td id="rev-total-remaining">${defaultTotalRem} portions</td>
              </tr>
              <tr>
                <td>Total Food Waste (Discarded)</td>
                <td id="rev-total-discarded">${defaultTotalDisc} portions</td>
              </tr>
              <tr>
                <td>Unclaimed Reservations (Accountability)</td>
                <td>${afterSales.unclaimedReservations} portions</td>
              </tr>
              <tr class="review-highlight">
                <td>Portion Balance Status</td>
                <td id="rev-total-status" style="color: var(--primary);">&check; Balanced (0 discrepancy)</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-bottom: 12px;">
            <label for="rep-notes-input" style="font-size: 11px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">
              Closing Kitchen Remarks (Optional)
            </label>
            <textarea id="rep-notes-input" class="closing-notes-field" rows="2" maxlength="300" placeholder="e.g. Heavy rain reduced 12:15 PM crowd; excess adobo broth chilled and reserved for tomorrow's batch...">${existingRep ? (existingRep.notes || '') : ''}</textarea>
          </div>

          <button type="submit" id="btn-save-after-sales" class="btn-primary-action btn-submit-closing" style="width: 100%; justify-content: center; padding: 12px; font-size: 14px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span id="btn-submit-text">${existingRep ? 'Update Daily Closing Report' : 'Submit Daily Closing Report'}</span>
          </button>
          <span id="closing-submit-hint" class="closing-submit-hint" style="display: none;">Reconcile portions before submitting.</span>
        </div>
      </form>

      <!-- SECTION E: Report History -->
      ${this.renderClosingHistory(reports)}
    `;
  },

  renderClosingHistory(reports = []) {
    return `
      <div class="closing-section-block" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle, #e5e7eb);">
        <div class="closing-section-heading">
          <span class="closing-section-label">Section E &bull; Recent Closing Reports</span>
          <span class="closing-section-tag">History</span>
        </div>

        ${reports && reports.length > 0 ? `
          <div class="closing-history-list">
            ${reports.slice(0, 5).map(r => {
              const sold = (Number(r.claimedReservations) || 0) + (Number(r.walkInSold) || 0);
              return `
                <div class="closing-history-item">
                  <div>
                    <strong>${r.reportDate}</strong>
                    <span style="display: block; font-size: 10.5px; color: var(--text-secondary);">
                      Prepared: ${r.totalPrepared} &bull; Sold: ${sold} (${r.claimedReservations} claimed, ${r.walkInSold} walk-in)
                    </span>
                  </div>
                  <div style="text-align: right;">
                    <span class="closing-state-pill state-ready" style="font-size: 10px; padding: 2px 7px;">
                      &check; Reconciled
                    </span>
                    <span style="display: block; font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
                      Leftover: ${r.remainingPortions} &bull; Waste: ${r.discardedPortions}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 18px 12px; background: var(--bg-main, #f9fafb); border-radius: 10px; border: 1px dashed var(--border-color);">
            <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">No previous closing reports found. Today's report will appear here once submitted.</p>
          </div>
        `}
      </div>
    `;
  },

  updateReconciliationUI(container) {
    const alertBox = container.querySelector('#rep-reconciliation-alert');
    const saveBtn = container.querySelector('#btn-save-after-sales');
    const submitHint = container.querySelector('#closing-submit-hint');
    const stateBadge = container.querySelector('#closing-state-badge');
    if (!alertBox) return;

    const afterSales = SapatStorage.getTodayAfterSalesSummary(state.currentVendorId);
    const dishCards = container.querySelectorAll('.closing-dish-card');

    let totalPrepared = 0;
    let totalRemaining = 0;
    let totalDiscarded = 0;
    let hasValidationErrors = false;
    let errorMessage = '';

    if (dishCards.length > 0) {
      dishCards.forEach(card => {
        const dishId = card.getAttribute('data-dish-id');
        const prepInput = card.querySelector('.dish-prep-input');
        const remInput = card.querySelector('.dish-rem-input');
        const discInput = card.querySelector('.dish-disc-input');
        const foot = card.querySelector(`#dish-status-${dishId}`);

        const dishInfo = (afterSales.dishBreakdown || []).find(d => d.dishId === dishId) || {
          claimed: 0,
          walkInSold: 0
        };

        const prep = parseInt(prepInput?.value, 10);
        const rem = parseInt(remInput?.value, 10);
        const disc = parseInt(discInput?.value, 10);

        if (isNaN(prep) || prep < 0 || isNaN(rem) || rem < 0 || isNaN(disc) || disc < 0) {
          hasValidationErrors = true;
          errorMessage = 'Portion numbers must be non-negative whole numbers.';
          if (foot) foot.innerHTML = '<span style="color: #dc2626; font-weight: 700;">&times; Invalid whole number</span>';
          card.classList.add('dish-unbalanced');
          return;
        }

        const sold = dishInfo.claimed + dishInfo.walkInSold;
        if (prep < sold) {
          hasValidationErrors = true;
          errorMessage = `Actual Prepared (${prep}) cannot be less than portions sold (${sold}).`;
          if (foot) foot.innerHTML = `<span style="color: #dc2626; font-weight: 700;">&times; Prepared (${prep}) &lt; Sold (${sold})</span>`;
          card.classList.add('dish-unbalanced');
          return;
        }

        const dishAccounted = sold + rem + disc;
        const dishDiff = prep - dishAccounted;

        totalPrepared += prep;
        totalRemaining += rem;
        totalDiscarded += disc;

        if (dishDiff === 0) {
          if (foot) foot.innerHTML = `<span class="dish-badge-balanced">&check; Balanced: ${prep} prepared = ${dishAccounted} accounted</span>`;
          card.classList.remove('dish-unbalanced');
        } else {
          card.classList.add('dish-unbalanced');
          if (foot) {
            foot.innerHTML = `
              <span class="dish-badge-diff">
                &excl; ${dishDiff > 0 ? `+${dishDiff} unaccounted` : `${dishDiff} over-allocated`} (${prep} prepared vs ${dishAccounted} accounted)
              </span>
            `;
          }
        }
      });
    } else {
      // Fallback for single inputs if no per-dish cards are present
      const prepInput = container.querySelector('#rep-prepared-input');
      const remInput = container.querySelector('#rep-remaining-input');
      const discInput = container.querySelector('#rep-discarded-input');

      totalPrepared = parseInt(prepInput?.value, 10) || 0;
      totalRemaining = parseInt(remInput?.value, 10) || 0;
      totalDiscarded = parseInt(discInput?.value, 10) || 0;
    }

    // Sync legacy/hidden inputs for any external readers
    const hiddenPrep = container.querySelector('#rep-prepared-input');
    const hiddenRem = container.querySelector('#rep-remaining-input');
    const hiddenDisc = container.querySelector('#rep-discarded-input');
    if (hiddenPrep) hiddenPrep.value = totalPrepared;
    if (hiddenRem) hiddenRem.value = totalRemaining;
    if (hiddenDisc) hiddenDisc.value = totalDiscarded;

    const claimed = afterSales.claimedReservations;
    const walkin = afterSales.walkInSold;
    const totalSold = claimed + walkin;
    const accounted = claimed + walkin + totalRemaining + totalDiscarded;
    const diff = totalPrepared - accounted;

    // Update Section D Review table values
    const revPrep = container.querySelector('#rev-total-prepared');
    const revRem = container.querySelector('#rev-total-remaining');
    const revDisc = container.querySelector('#rev-total-discarded');
    const revStatus = container.querySelector('#rev-total-status');

    if (revPrep) revPrep.textContent = `${totalPrepared} portions`;
    if (revRem) revRem.textContent = `${totalRemaining} portions`;
    if (revDisc) revDisc.textContent = `${totalDiscarded} portions`;

    if (hasValidationErrors) {
      alertBox.className = 'portion-recon-banner recon-error';
      alertBox.innerHTML = `
        <span class="recon-banner-icon">&times;</span>
        <div>
          <strong>Invalid Portion Input</strong>
          <span style="display: block; font-size: 11.5px; margin-top: 2px;">${errorMessage}</span>
        </div>
      `;
      if (revStatus) revStatus.innerHTML = '<span style="color: #dc2626; font-weight: 800;">&times; Invalid Numbers</span>';
      if (saveBtn) saveBtn.disabled = true;
      if (submitHint) {
        submitHint.style.display = 'block';
        submitHint.textContent = errorMessage;
      }
      if (stateBadge) {
        stateBadge.className = 'closing-state-pill state-in-progress';
        stateBadge.innerHTML = '&bull; In Progress';
      }
    } else if (totalPrepared < totalSold) {
      alertBox.className = 'portion-recon-banner recon-error';
      alertBox.innerHTML = `
        <span class="recon-banner-icon">&times;</span>
        <div>
          <strong>Invalid Preparation Count</strong>
          <span style="display: block; font-size: 11.5px; margin-top: 2px;">
            Total Prepared (${totalPrepared}) cannot be less than portions sold (Claimed: ${claimed} + Walk-in: ${walkin} = ${totalSold}).
          </span>
        </div>
      `;
      if (revStatus) revStatus.innerHTML = `<span style="color: #dc2626; font-weight: 800;">&times; Prepared (${totalPrepared}) &lt; Sold (${totalSold})</span>`;
      if (saveBtn) saveBtn.disabled = true;
      if (submitHint) {
        submitHint.style.display = 'block';
        submitHint.textContent = 'Actual Prepared cannot be less than total portions sold.';
      }
      if (stateBadge) {
        stateBadge.className = 'closing-state-pill state-in-progress';
        stateBadge.innerHTML = '&bull; In Progress';
      }
    } else if (diff === 0) {
      // 3. Ready to Submit Operational State
      alertBox.className = 'portion-recon-banner recon-balanced';
      alertBox.innerHTML = `
        <span class="recon-banner-icon">&check;</span>
        <div>
          <strong>Portions Balanced: Prepared (${totalPrepared}) = Accounted (${accounted})</strong>
          <span style="display: block; font-size: 11.5px; margin-top: 2px;">
            All portions are fully accounted for. (Claimed: ${claimed} + Walk-in: ${walkin} + Leftover: ${totalRemaining} + Waste: ${totalDiscarded})
          </span>
        </div>
      `;
      if (revStatus) revStatus.innerHTML = '<span style="color: #065f46; font-weight: 800;">&check; Balanced (0 discrepancy)</span>';
      if (saveBtn) saveBtn.disabled = false;
      if (submitHint) submitHint.style.display = 'none';
      if (stateBadge) {
        stateBadge.className = 'closing-state-pill state-ready';
        stateBadge.innerHTML = '&check; Ready to Submit';
      }
    } else {
      // 2. In Progress / Discrepancy Operational State
      alertBox.className = 'portion-recon-banner recon-discrepancy';
      alertBox.innerHTML = `
        <span class="recon-banner-icon">&excl;</span>
        <div>
          <strong>Discrepancy: ${diff > 0 ? `+${diff}` : diff} portion${Math.abs(diff) === 1 ? '' : 's'} ${diff > 0 ? 'unaccounted' : 'over-allocated'}</strong>
          <span style="display: block; font-size: 11.5px; margin-top: 2px;">
            Check your numbers: Actual Prepared (${totalPrepared}) must equal Claimed (${claimed}) + Walk-in (${walkin}) + Leftover (${totalRemaining}) + Waste (${totalDiscarded}) = ${accounted}.
          </span>
        </div>
      `;
      if (revStatus) revStatus.innerHTML = `<span style="color: #b45309; font-weight: 800;">&excl; Discrepancy (${diff > 0 ? `+${diff}` : diff})</span>`;
      if (saveBtn) saveBtn.disabled = true;
      if (submitHint) {
        submitHint.style.display = 'block';
        submitHint.textContent = `Reconcile portions before submitting (${diff > 0 ? `+${diff} portions unaccounted` : `${diff} portions over-allocated`}).`;
      }
      if (stateBadge) {
        stateBadge.className = 'closing-state-pill state-in-progress';
        stateBadge.innerHTML = '&bull; In Progress';
      }
    }
  },

  attachEvents(container) {
    // Dynamic input changes for reconciliation
    const prepForm = container.querySelector('#form-after-sales-report');
    if (prepForm) {
      // Listen on all dish inputs
      prepForm.addEventListener('input', (e) => {
        if (e.target.matches('.dish-prep-input, .dish-rem-input, .dish-disc-input, #rep-prepared-input, #rep-remaining-input, #rep-discarded-input')) {
          this.updateReconciliationUI(container);
        }
      });

      prepForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitClosingReport(container);
      });
    }

    container.addEventListener('click', (e) => {
      // Edit / Update Closing Report
      const editBtn = e.target.closest('[data-action="edit-closing-report"]');
      if (editBtn) {
        this._isEditingReport = true;
        this.render(container);
        return;
      }

      // Cancel Edit Closing Report
      const cancelEditBtn = e.target.closest('[data-action="cancel-edit-closing"]');
      if (cancelEditBtn) {
        this._isEditingReport = false;
        this.render(container);
        return;
      }

      // Filter tabs
      const filterBtn = e.target.closest('[data-action="filter-prep-tab"]');
      if (filterBtn) {
        const tab = filterBtn.getAttribute('data-tab');
        if (tab) {
          state.vendorPrepTab = tab;
          this.render(container);
        }
        return;
      }

      // Step adjust limit (+5 or -5)
      const stepBtn = e.target.closest('[data-action="adjust-limit"]');
      if (stepBtn) {
        const dishId = stepBtn.getAttribute('data-dish-id');
        const delta = parseInt(stepBtn.getAttribute('data-delta'), 10);
        if (dishId && !isNaN(delta)) {
          const menu = SapatStorage.getMenu();
          const dish = menu.find(d => d.id === dishId);
          if (dish) {
            const newLimit = dish.dailyLimit + delta;
            if (newLimit < dish.reservedServings) {
              showToast(`Cannot reduce limit below locked reservations (${dish.reservedServings})`, 'warning');
              return;
            }
            if (newLimit < 5) {
              showToast('Minimum daily target is 5 portions', 'warning');
              return;
            }
            dish.dailyLimit = newLimit;
            SapatStorage.saveMenu(menu);
            showToast(`${dish.name} daily limit updated to ${newLimit}`, 'success');
            this.render(container);
          }
        }
        return;
      }

      // Set target directly from AI suggestion
      const setLimitBtn = e.target.closest('[data-action="set-dish-limit"]');
      if (setLimitBtn) {
        const dishId = setLimitBtn.getAttribute('data-dish-id');
        const target = parseInt(setLimitBtn.getAttribute('data-target'), 10);
        if (dishId && !isNaN(target)) {
          const res = SapatStorage.updateDishDailyLimit(dishId, target);
          if (res.success) {
            showToast(`Daily target for ${res.dish.name} set to ${target} portions`, 'success');
            this.render(container);
          } else {
            showToast(res.message || 'Cannot adjust limit below reserved servings', 'warning');
          }
        }
        return;
      }
    });
  },

  submitClosingReport(container) {
    const afterSales = SapatStorage.getTodayAfterSalesSummary(state.currentVendorId);
    const dishCards = container.querySelectorAll('.closing-dish-card');
    const dishBreakdown = [];
    let totalPrepared = 0;
    let totalRemaining = 0;
    let totalDiscarded = 0;

    if (dishCards.length > 0) {
      for (const card of dishCards) {
        const dishId = card.getAttribute('data-dish-id');
        const prepInput = card.querySelector('.dish-prep-input');
        const remInput = card.querySelector('.dish-rem-input');
        const discInput = card.querySelector('.dish-disc-input');
        const dishInfo = (afterSales.dishBreakdown || []).find(d => d.dishId === dishId) || {};

        const prep = parseInt(prepInput?.value, 10);
        const rem = parseInt(remInput?.value, 10);
        const disc = parseInt(discInput?.value, 10);

        if (isNaN(prep) || prep < 0 || isNaN(rem) || rem < 0 || isNaN(disc) || disc < 0) {
          showToast('All portions must be non-negative whole numbers.', 'error');
          return;
        }

        const sold = (Number(dishInfo.claimed) || 0) + (Number(dishInfo.walkInSold) || 0);
        if (prep < sold) {
          showToast(`Prepared portions for ${dishInfo.name || dishId} (${prep}) cannot be less than portions sold (${sold}).`, 'error');
          return;
        }

        const diff = prep - (sold + rem + disc);
        if (diff !== 0) {
          showToast(`Discrepancy in ${dishInfo.name || dishId}: Prepared (${prep}) does not equal Accounted (${sold + rem + disc}).`, 'error');
          return;
        }

        totalPrepared += prep;
        totalRemaining += rem;
        totalDiscarded += disc;

        dishBreakdown.push({
          dishId,
          dishName: dishInfo.name,
          category: dishInfo.category,
          dailyLimit: dishInfo.dailyLimit,
          prepared: prep,
          claimed: dishInfo.claimed,
          walkInSold: dishInfo.walkInSold,
          remaining: rem,
          discarded: disc
        });
      }
    } else {
      const prepInput = container.querySelector('#rep-prepared-input');
      const remInput = container.querySelector('#rep-remaining-input');
      const discInput = container.querySelector('#rep-discarded-input');

      totalPrepared = parseInt(prepInput?.value, 10) || 0;
      totalRemaining = parseInt(remInput?.value, 10) || 0;
      totalDiscarded = parseInt(discInput?.value, 10) || 0;
    }

    const claimed = afterSales.claimedReservations;
    const walkin = afterSales.walkInSold;
    const totalSold = claimed + walkin;
    const accounted = claimed + walkin + totalRemaining + totalDiscarded;

    if (totalPrepared < totalSold) {
      showToast(`Total Prepared (${totalPrepared}) cannot be less than portions sold (${totalSold}).`, 'error');
      return;
    }

    if (totalPrepared !== accounted) {
      const diff = totalPrepared - accounted;
      showToast(`Portion discrepancy: Prepared (${totalPrepared}) vs Accounted (${accounted}) [${diff > 0 ? `+${diff}` : diff} portions].`, 'error');
      return;
    }

    // Confirmation Step
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm(
        `Confirm End-of-Day Kitchen Closing for ${afterSales.reportDate}?\n\n` +
        `• Total Prepared: ${totalPrepared} portions\n` +
        `• Total Sold: ${totalSold} portions (${claimed} claimed + ${walkin} walk-in)\n` +
        `• Remaining Edible: ${totalRemaining} portions\n` +
        `• Discarded Waste: ${totalDiscarded} portions\n` +
        `• Unclaimed Reservations: ${afterSales.unclaimedReservations} portions\n\n` +
        `Once confirmed, this daily report is reconciled and submitted to the Campus Administrator.`
      );
      if (!confirmed) return;
    }

    const notesInput = container.querySelector('#rep-notes-input');
    const res = SapatStorage.saveAfterSalesReport({
      vendorId: state.currentVendorId,
      reportDate: afterSales.reportDate,
      totalPrepared,
      claimedReservations: claimed,
      unclaimedReservations: afterSales.unclaimedReservations,
      walkInSold: walkin,
      walkInRevenue: afterSales.walkInRevenue,
      remainingPortions: totalRemaining,
      discardedPortions: totalDiscarded,
      notes: notesInput ? notesInput.value : '',
      dishBreakdown
    });

    if (res.success) {
      showToast(`Daily closing report for ${afterSales.reportDate} saved and reconciled!`, 'success');
      this._isEditingReport = false;
      this.render(container);
    } else {
      showToast(res.message || 'Portion reconciliation failed', 'error');
    }
  }
};
