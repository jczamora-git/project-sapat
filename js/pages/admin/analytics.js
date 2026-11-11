import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { ForecastingService } from '../../services/forecasting.service.js';
import { showToast } from '../../components/toast.js';

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

    const campusAnalytics = ForecastingService.getCampusWideAnalytics() || {
      totalCampusTarget: 0,
      totalCampusReserved: 0,
      totalCampusRemaining: 0,
      totalWastePreventedKg: '0.0',
      co2SavedKg: '0.0',
      avgSatisfaction: 90,
      avgAccuracy: '96.0',
      canteenComparisons: [],
      topCampusRequested: []
    };
    const payments = SapatStorage.getPayments() || [];
    const orders = SapatStorage.getOrders() || [];
    const auditLogs = SapatStorage.getAuditLogs() || [];
    const settings = SapatStorage.getSettings() || {};
    const vendors = SapatStorage.getVendors() || [];

    const todayDate = new Date().toISOString().split('T')[0];
    const afterSalesByVendor = vendors.map(v => {
      const summary = SapatStorage.getTodayAfterSalesSummary(v.id) || {};
      return {
        vendor: v,
        summary
      };
    });

    const totalPaidAmount = payments.filter(p => p.status === 'Paid' || p.paymentStatus === 'Paid').reduce((sum, p) => sum + (Number(p.amount) || Number(p.totalAmount) || 0), 0);
    const expiredUnpaidCount = orders.filter(o => o.status === 'Expired' || o.paymentStatus === 'Expired').length;
    const noShowCount = orders.filter(o => o.status === 'No-show').length;
    const osasReferredCount = auditLogs.filter(l => Boolean(l.referredToOSAS)).length;

    // Shift distribution derived dynamically from actual order items and pickup shifts
    const activeOrdersList = orders.filter(o => o.status !== 'Cancelled');
    const shiftPortions = {
      'shift-1': 0, // 11:30 AM Lunch Shift 1
      'shift-2': 0, // 12:15 PM Lunch Shift 2
      'shift-recess': 0 // Afternoon Recess
    };

    activeOrdersList.forEach(o => {
      const orderPortions = (o.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      const timeStr = (o.pickupTime || '').toLowerCase();
      if (timeStr.includes('11:30') || timeStr.includes('shift 1')) {
        shiftPortions['shift-1'] += orderPortions;
      } else if (timeStr.includes('12:15') || timeStr.includes('shift 2')) {
        shiftPortions['shift-2'] += orderPortions;
      } else {
        shiftPortions['shift-recess'] += orderPortions;
      }
    });

    const totalDerivedPortions = shiftPortions['shift-1'] + shiftPortions['shift-2'] + shiftPortions['shift-recess'];
    const safeTotal = totalDerivedPortions > 0 ? totalDerivedPortions : 1;
    const shift1Pct = Math.round((shiftPortions['shift-1'] / safeTotal) * 100);
    const shift2Pct = Math.round((shiftPortions['shift-2'] / safeTotal) * 100);
    const shiftRecessPct = Math.max(0, 100 - shift1Pct - shift2Pct);

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
        <div class="admin-kpi-grid">
          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Food Waste Prevented</span>
              <span class="kpi-badge emerald">Scenario Estimate</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.totalWastePreventedKg}</span>
              <span class="kpi-unit">kg</span>
            </div>
            <p class="kpi-caption" style="margin-top: 6px;">
              Avoided waste through exact pre-order batching across stalls.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">How Students Rate Meals</span>
              <span class="kpi-badge success">${campusAnalytics.avgSatisfaction}% Approval</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.avgSatisfaction}%</span>
              <span class="kpi-denom">satisfaction</span>
            </div>
            <p class="kpi-caption" style="margin-top: 6px;">
              Aggregated student sentiment from verified reviews.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Preparation Performance</span>
              <span class="kpi-badge blue">${campusAnalytics.avgAccuracy}% Average</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.avgAccuracy}%</span>
              <span class="kpi-denom">across 5 stalls</span>
            </div>
            <p class="kpi-caption" style="margin-top: 6px;">
              Fulfillment precision across recent operating shifts.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Campus Reservations</span>
              <span class="kpi-badge success">${campusAnalytics.totalCampusReserved} Booked</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${campusAnalytics.totalCampusReserved}</span>
              <span class="kpi-denom">/ ${campusAnalytics.totalCampusTarget} portions</span>
            </div>
            <p class="kpi-caption" style="margin-top: 6px;">
              ${campusAnalytics.totalCampusRemaining} unreserved portions remaining today.
            </p>
          </div>
        </div>

        <!-- Traditional vs Sapat Food Waste Comparison Chart -->
        <div class="admin-chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Food Waste Reduction: Traditional Guesswork vs Exact Batching</h3>
              <p class="chart-subtitle">Illustrative scenario comparing arbitrary food preparation vs pre-order batch control</p>
            </div>
            <span class="chart-tag-badge">Scenario Model</span>
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

        <!-- Peak Shifts Distribution (Reconciled from Actual Order Portions) -->
        <div class="admin-section-header" style="margin-top: 24px;">
          <div>
            <h3 class="admin-section-title">Pre-order Pickup Shift Distribution</h3>
            <span class="admin-section-subtitle">Staggered student arrival schedule derived from confirmed reservations (${totalDerivedPortions} portions)</span>
          </div>
        </div>

        <div class="shift-distribution-grid">
          <div class="shift-card">
            <div class="shift-card-head">
              <span class="shift-time">11:30 AM</span>
              <span class="shift-name">Lunch Shift 1</span>
            </div>
            <strong class="shift-percentage">${shift1Pct}%</strong>
            <span class="shift-portions">${shiftPortions['shift-1']} portions reserved</span>
            <div class="shift-track"><div class="shift-fill" style="width: ${shift1Pct}%;"></div></div>
            <small class="shift-sub">Fresh Batch Cooked 11:00 AM</small>
          </div>

          <div class="shift-card">
            <div class="shift-card-head">
              <span class="shift-time">12:15 PM</span>
              <span class="shift-name">Lunch Shift 2</span>
            </div>
            <strong class="shift-percentage">${shift2Pct}%</strong>
            <span class="shift-portions">${shiftPortions['shift-2']} portions reserved</span>
            <div class="shift-track"><div class="shift-fill" style="width: ${shift2Pct}%;"></div></div>
            <small class="shift-sub">Fresh Batch Cooked 11:45 AM</small>
          </div>

          <div class="shift-card">
            <div class="shift-card-head">
              <span class="shift-time">2:45 PM</span>
              <span class="shift-name">Afternoon Recess</span>
            </div>
            <strong class="shift-percentage">${shiftRecessPct}%</strong>
            <span class="shift-portions">${shiftPortions['shift-recess']} portions reserved</span>
            <div class="shift-track"><div class="shift-fill" style="width: ${shiftRecessPct}%;"></div></div>
            <small class="shift-sub">Warm Snacks Cooked 2:15 PM</small>
          </div>
        </div>

        <!-- Order & Payment Monitoring -->
        <div class="admin-section-header" style="margin-top: 32px;">
          <div>
            <h3 class="admin-section-title">Order &amp; Payment Monitoring</h3>
            <span class="admin-section-subtitle">Operational overview of verified settlements, expired counter pre-orders, and uncollected orders</span>
          </div>
          <span class="admin-campus-pill" style="font-size: 11px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Operational Visibility Active
          </span>
        </div>

        <!-- Accountability KPI Grid -->
        <div class="admin-kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 20px;">
          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Verified Pre-order Revenue</span>
              <span class="kpi-badge emerald">100% Verified</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">₱${totalPaidAmount.toFixed(0)}</span>
              <span class="kpi-unit">settled</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Protected vendor capital against unclaimed food preparation.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Expired Counter Orders</span>
              <span class="kpi-badge blue">Portions Released</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${expiredUnpaidCount}</span>
              <span class="kpi-denom">orders expired</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Unpaid counter requests safely returned to canteen inventory.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Uncollected No-Shows</span>
              <span class="kpi-badge warning" style="background: #FEF2F2; color: #991B1B;">Waste Violations</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${noShowCount}</span>
              <span class="kpi-denom">missed pickups</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Confirmed orders prepared by vendors but not collected by students.
            </p>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">OSAS Referrals</span>
              <span class="kpi-badge purple" style="background: #F3E8FF; color: #6B21A8;">Disciplinary Log</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${osasReferredCount}</span>
              <span class="kpi-denom">active review</span>
            </div>
            <p class="kpi-caption" style="margin-top: 8px;">
              Logged under ${settings.studentAffairsOffice || 'Office of Student Affairs'}.
            </p>
          </div>
        </div>

        <!-- Student Accountability Incident Audit Table -->
        <div class="admin-table-card">
          <div class="admin-table-responsive">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Student & Account</th>
                  <th>Order Ref</th>
                  <th>Incident / Event</th>
                  <th>Explanation / Details</th>
                  <th>OSAS Disciplinary Status</th>
                  <th style="text-align: right;">Administrative Action</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-tertiary);">No accountability incidents or payment audit logs recorded yet.</td>
                  </tr>
                ` : auditLogs.slice(0, 10).map(log => {
                  let badgeClass = 'table-confidence-badge';
                  const evtType = String(log?.eventType || '');
                  if (evtType.includes('NO_SHOW')) badgeClass = 'kpi-badge warning';
                  else if (evtType.includes('EXPIRED')) badgeClass = 'kpi-badge blue';
                  else if (evtType.includes('VERIFIED')) badgeClass = 'kpi-badge emerald';

                  const rawTs = String(log?.timestamp || '');
                  let formattedTs = 'Recent';
                  if (rawTs.includes('T')) {
                    const parts = rawTs.split('T');
                    formattedTs = (parts[1] ? parts[1].slice(0, 5) : '') + ' ' + (parts[0] || '');
                  } else if (rawTs) {
                    formattedTs = rawTs;
                  }

                  const orderRef = log?.reservationId || log?.orderId || 'N/A';
                  const eventDisplay = evtType ? evtType.replace(/_/g, ' ') : 'EVENT LOGGED';

                  return `
                    <tr>
                      <td style="white-space: nowrap; font-size: 11px; color: var(--text-secondary);">${formattedTs}</td>
                      <td>
                        <strong>${log?.studentName || 'Student'}</strong>
                      </td>
                      <td><span class="v-order-ref-badge" style="font-size: 11px;">#${orderRef}</span></td>
                      <td><span class="${badgeClass}">${eventDisplay}</span></td>
                      <td style="max-width: 280px; font-size: 12px; line-height: 1.4;">
                        ${log?.studentExplanation ? `<strong style="display:block; color: var(--primary);">Student: "${log.studentExplanation}"</strong>` : ''}
                        <span>${log?.details || ''}</span>
                        ${log?.resolutionNote ? `<small style="display:block; color: var(--text-tertiary); margin-top: 2px;">Resolution: ${log.resolutionNote}</small>` : ''}
                      </td>
                      <td>
                        ${log?.referredToOSAS ? `
                          <span class="settings-value-pill" style="color: #991B1B; background: #FEE2E2; border-color: #FECACA; font-size: 11px;">
                            Referred to OSAS
                          </span>
                        ` : (log?.resolved ? `
                          <span class="settings-value-pill" style="color: #065F46; background: #D1FAE5; border-color: #A7F3D0; font-size: 11px;">
                            Resolved
                          </span>
                        ` : `
                          <span class="settings-value-pill" style="font-size: 11px;">Under Evaluation</span>
                        `)}
                      </td>
                      <td style="text-align: right; white-space: nowrap;">
                        ${(!log?.referredToOSAS && !log?.resolved && evtType === 'NO_SHOW_RECORDED') ? `
                          <button class="btn-primary-action btn-sm" style="font-size: 11px; padding: 4px 8px; margin-right: 4px;" data-action="refer-to-osas" data-log-id="${log?.id}">
                            Refer to OSAS
                          </button>
                        ` : ''}
                        ${(!log?.resolved) ? `
                          <button class="btn-secondary-action btn-sm" style="font-size: 11px; padding: 4px 8px;" data-action="resolve-incident" data-log-id="${log?.id}">
                            Resolve
                          </button>
                        ` : '<span style="font-size: 11px; color: var(--text-tertiary);">Case Closed</span>'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Campus Daily After-Sales & Walk-in Summary Across All Stalls -->
        <div class="admin-table-card" style="margin-top: 24px;">
          <div class="admin-card-header">
            <div>
              <span class="admin-card-eyebrow">Campus Multi-Vendor Reconciliation</span>
              <h3 class="admin-card-title">Stall Daily After-Sales &amp; Physical Sales Audit</h3>
            </div>
            <span class="settings-value-pill" style="font-size: 11px;">Date: ${todayDate}</span>
          </div>

          <div class="admin-table-responsive">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Canteen Stall</th>
                  <th>Claimed Pre-orders</th>
                  <th>Walk-in Sold</th>
                  <th>Walk-in Revenue</th>
                  <th>Unclaimed Portions</th>
                  <th>Reconciliation Status</th>
                </tr>
              </thead>
              <tbody>
                ${afterSalesByVendor.map(({ vendor, summary }) => {
                  const rep = summary ? summary.existingReport : null;
                  const claimedCount = Number(rep ? rep.claimedReservations : summary?.claimedReservations) || 0;
                  const walkInCount = Number(rep ? rep.walkInSold : summary?.walkInSold) || 0;
                  const rawRev = rep && rep.walkInRevenue != null ? rep.walkInRevenue : summary?.walkInRevenue;
                  const walkInRev = Number(rawRev) || 0;
                  const unclaimedCount = Number(rep ? rep.unclaimedReservations : summary?.unclaimedReservations) || 0;

                  let statusPill = '';
                  if (rep) {
                    if (rep.reconciled) {
                      const totalSold = claimedCount + walkInCount;
                      statusPill = `
                        <span class="settings-value-pill" style="color: #065F46; background: #D1FAE5; border-color: #A7F3D0; font-size: 11px; font-weight: 700;">
                          Submitted (${rep.totalPrepared || totalSold} prepared, ${totalSold} sold, ${rep.discardedPortions || 0} waste)
                        </span>
                      `;
                    } else {
                      statusPill = `
                        <span class="settings-value-pill" style="color: #991B1B; background: #FEE2E2; border-color: #FECACA; font-size: 11px; font-weight: 700;">
                          Incomplete
                        </span>
                      `;
                    }
                  } else {
                    statusPill = `
                      <span class="settings-value-pill" style="font-size: 11px; color: #92400E; background: #FEF3C7; border-color: #FDE68A; font-weight: 700;">
                        Pending Report
                      </span>
                    `;
                  }

                  return `
                    <tr>
                      <td>
                        <strong>${vendor?.name || 'Stall'}</strong>
                        <span style="display: block; font-size: 11px; color: var(--text-secondary);">${vendor?.stallNumber || ''}</span>
                      </td>
                      <td>${claimedCount} portions</td>
                      <td><strong style="color: var(--primary);">${walkInCount} portions</strong></td>
                      <td>₱${walkInRev.toFixed(2)}</td>
                      <td>${unclaimedCount} portions</td>
                      <td>${statusPill}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    const screen = container.querySelector('#screen-admin-analytics');
    if (!screen) return;

    screen.addEventListener('click', (e) => {
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        e.preventDefault();
        e.stopPropagation();
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      // Refer incident to OSAS
      const osasBtn = e.target.closest('[data-action="refer-to-osas"]');
      if (osasBtn) {
        e.preventDefault();
        e.stopPropagation();
        const logId = osasBtn.getAttribute('data-log-id');
        if (logId) {
          osasBtn.disabled = true;
          const result = SapatStorage.referIncidentToOSAS(logId);
          if (result.success) {
            showToast('Incident referred to Office of Student Affairs and Services (OSAS).', 'warning');
            this.render(container);
          } else {
            showToast(result.message, 'error');
            osasBtn.disabled = false;
          }
        }
        return;
      }

      // Resolve incident
      const resolveBtn = e.target.closest('[data-action="resolve-incident"]');
      if (resolveBtn) {
        e.preventDefault();
        e.stopPropagation();
        const logId = resolveBtn.getAttribute('data-log-id');
        if (logId) {
          resolveBtn.disabled = true;
          const note = prompt('Enter administrative resolution note (e.g., Valid medical excuse verified by school clinic):', 'Excuse verified with valid documentation.');
          if (note !== null) {
            const result = SapatStorage.resolveIncident(logId, note);
            if (result.success) {
              showToast('Incident marked as resolved in OSAS audit record.', 'success');
              this.render(container);
            } else {
              showToast(result.message, 'error');
              resolveBtn.disabled = false;
            }
          } else {
            resolveBtn.disabled = false;
          }
        }
        return;
      }
    });
  }
};
