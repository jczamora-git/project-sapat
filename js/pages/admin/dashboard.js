import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openRoleModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const adminDashboardPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'role-changed' || event === 'data-reset' || event === 'order-status-changed') {
          const currentScreen = document.getElementById('screen-admin-dashboard');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders();
    const payments = SapatStorage.getPayments ? SapatStorage.getPayments() : [];

    const activeOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalServingsTarget = menu.reduce((s, d) => s + (Number(d.dailyLimit) || 0), 0);
    const totalServingsReserved = menu.reduce((s, d) => s + (Number(d.reservedServings) || 0), 0);
    const totalServingsRemaining = Math.max(0, totalServingsTarget - totalServingsReserved);
    const reservationRate = totalServingsTarget > 0 ? Math.round((totalServingsReserved / totalServingsTarget) * 100) : 0;
    
    // Revenue calculations: separate total order value, verified paid revenue, and claimed/completed order value
    const totalOrderValue = activeOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const paidOrders = activeOrders.filter(o => o.paymentStatus === 'Paid' || o.status === 'Completed');
    const verifiedRevenue = paidOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const completedOrders = activeOrders.filter(o => o.status === 'Completed');
    const completedRevenue = completedOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);

    // Food waste saved computation:
    // Sapat limits production to locked orders, saving approx ~0.052kg per exact-prepared portion.
    const wastePreventedKg = (totalServingsReserved * 0.052).toFixed(1);

    // Vendor open/closed breakdown
    const openVendorsCount = vendors.filter(v => v.isOpen).length;
    const closedVendorsCount = vendors.length - openVendorsCount;

    // Derive context-aware campus insights for the administrator
    const forecastContext = SapatStorage.getForecastContext ? SapatStorage.getForecastContext('vendor-lita') : {
      academicSchedule: 'Regular Academic Schedule',
      weatherCondition: 'Rainy'
    };

    // Stalls nearing preparation capacity (>= 75% booked)
    const nearingCapacityStalls = vendors.filter(v => {
      const vDishes = menu.filter(d => d.vendorId === v.id);
      const target = vDishes.reduce((s, d) => s + (Number(d.dailyLimit) || 0), 0);
      const res = vDishes.reduce((s, d) => s + (Number(d.reservedServings) || 0), 0);
      return target > 0 && (res / target) >= 0.75;
    });

    const pendingPaymentCount = activeOrders.filter(o => o.paymentStatus === 'Pending' || o.status === 'Awaiting Counter Payment').length;

    container.innerHTML = `
      <section class="screen active admin-screen" id="screen-admin-dashboard">
        
        <!-- Enterprise Header -->
        <div class="admin-page-header">
          <div class="admin-header-left">
            <div class="admin-campus-pill">
              <span class="admin-live-dot"></span>
              <span>Main Campus Canteen &bull; Enterprise Operations</span>
            </div>
            <h2 class="admin-main-title">Campus Executive Dashboard</h2>
            <p class="admin-main-sub">Multi-stall food production, live portion quotas & waste prevention analytics</p>
          </div>
          <div class="admin-header-actions">
            <button class="btn-admin-action secondary" data-action="open-role-modal" title="Switch User Role">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
              <span>Switch Role</span>
            </button>
            <button class="btn-admin-action primary" data-route="#/admin/analytics">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        <!-- 4 Top-Tier Campus KPI Cards -->
        <div class="admin-kpi-grid">
          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Pre-order Reservations</span>
              <span class="kpi-badge success">${reservationRate}% Reserved</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${totalServingsReserved}</span>
              <span class="kpi-denom">/ ${totalServingsTarget} portions</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="kpi-progress-fill green" style="width: ${reservationRate}%;"></div>
            </div>
            <span class="kpi-caption">${totalServingsRemaining} portions remaining today across all stalls</span>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Food Waste Prevented</span>
              <span class="kpi-badge emerald">Demo Estimate</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${wastePreventedKg}</span>
              <span class="kpi-unit">kg</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="kpi-progress-fill orange" style="width: 96%;"></div>
            </div>
            <span class="kpi-caption">Avoided waste from locked pre-order batching</span>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Campus Kitchen Revenue</span>
              <span class="kpi-badge blue">₱${verifiedRevenue.toLocaleString()} Verified</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">₱${verifiedRevenue.toLocaleString()}</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="kpi-progress-fill blue" style="width: ${totalOrderValue > 0 ? Math.round((verifiedRevenue / totalOrderValue) * 100) : 100}%;"></div>
            </div>
            <span class="kpi-caption">₱${totalOrderValue.toLocaleString()} gross booked (${pendingPaymentCount} pending)</span>
          </div>

          <div class="admin-kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-label">Active Canteen Stalls</span>
              <span class="kpi-badge success">${openVendorsCount} of ${vendors.length} Open</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-number">${vendors.length}</span>
              <span class="kpi-denom">Licensed Stalls</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="kpi-progress-fill green" style="width: 100%;"></div>
            </div>
            <span class="kpi-caption">${openVendorsCount} of ${vendors.length} stalls active and prepping</span>
          </div>
        </div>

        <!-- Campus Insights & Recommended Actions (Simplified AI Summary) -->
        <div class="admin-ai-banner">
          <div class="ai-banner-icon-col">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="ai-banner-content">
            <div class="ai-badge-row">
              <span class="ai-pill-tag">Campus Operations Assistant</span>
              <span class="ai-pill-accuracy">Demand Insights</span>
            </div>
            <h3 class="ai-banner-heading">Campus Insights &amp; Recommended Actions</h3>
            <p class="ai-banner-desc">
              ${nearingCapacityStalls.length > 0 ? `
                <strong>Capacity Watch:</strong> ${nearingCapacityStalls.map(s => s.name).join(', ')} are over 75% booked. Review extra portion capacity before cutoff.
              ` : `
                <strong>Kitchen Pacing:</strong> All stalls are pacing smoothly within scheduled limits.
              `}
              ${forecastContext.weatherCondition === 'Rainy' ? `Rainy weather is boosting demand for hot soups and warm broths (+18%).` : `Weather conditions support standard baseline lunch attendance.`}
            </p>
          </div>
          <button class="btn-ai-details" data-route="#/admin/analytics">View Analytics &rarr;</button>
        </div>

        <!-- Canteen Stalls Live Operational Matrix -->
        <div class="admin-section-header">
          <div>
            <h3 class="admin-section-title">Live Canteen Stalls Matrix</h3>
            <span class="admin-section-subtitle">Real-time portion booking pace and prep status per kitchen station</span>
          </div>
          <button class="btn-admin-text-action" data-route="#/admin/canteens">Manage All Stalls (5) &rarr;</button>
        </div>

        <div class="admin-stalls-grid">
          ${vendors.map(v => {
            const vDishes = menu.filter(d => d.vendorId === v.id);
            const vTarget = vDishes.reduce((s, d) => s + (Number(d.dailyLimit) || 0), 0);
            const vReserved = vDishes.reduce((s, d) => s + (Number(d.reservedServings) || 0), 0);
            const vRemaining = Math.max(0, vTarget - vReserved);
            const vPct = vTarget > 0 ? Math.round((vReserved / vTarget) * 100) : 0;
            const isHigh = vPct >= 75;

            return `
              <div class="admin-stall-card">
                <div class="stall-card-top">
                  <div class="stall-badge-row">
                    <span class="admin-stall-num">${v.stallNumber}</span>
                    <span class="admin-status-indicator ${v.isOpen ? 'open' : 'closed'}">
                      ${v.isOpen ? 'Open & Prepping' : 'Stall Closed'}
                    </span>
                  </div>
                  <h4 class="admin-stall-name">${v.name}</h4>
                  <span class="admin-stall-cat">${v.category}</span>
                </div>

                <div class="stall-card-metrics">
                  <div class="stall-metric-item">
                    <span class="metric-label">Prep Target</span>
                    <strong class="metric-val">${vTarget}</strong>
                  </div>
                  <div class="stall-metric-item">
                    <span class="metric-label">Reserved</span>
                    <strong class="metric-val ${isHigh ? 'text-primary' : ''}">${vReserved}</strong>
                  </div>
                  <div class="stall-metric-item">
                    <span class="metric-label">Available</span>
                    <strong class="metric-val ${vRemaining <= 10 ? 'text-orange' : ''}">${vRemaining}</strong>
                  </div>
                </div>

                <div class="stall-quota-track">
                  <div class="stall-quota-fill ${vPct >= 85 ? 'warning' : 'green'}" style="width: ${vPct}%;"></div>
                </div>
                
                <div class="stall-card-footer">
                  <span class="stall-hours">${v.hours} &bull; ${v.expressWindow}</span>
                  <span class="stall-rate-badge">${vPct}% booked</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Recent Campus Pre-orders Stream -->
        <div class="admin-section-header" style="margin-top: 24px;">
          <div>
            <h3 class="admin-section-title">Campus Reservation Feed</h3>
            <span class="admin-section-subtitle">Real-time incoming pre-orders across all main canteen pickup windows (Demo Data)</span>
          </div>
          <span class="admin-feed-counter">${orders.length} total demo reservations</span>
        </div>

        <div class="admin-table-card">
          <div class="admin-table-responsive">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Student</th>
                  <th>Stall</th>
                  <th>Dishes</th>
                  <th>Pickup Slot</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${orders.slice(0, 8).map(o => {
                  let badgeClass = 'status-pending';
                  if (o.status === 'Confirmed' || o.status === 'Ready for Pickup') badgeClass = 'status-confirmed';
                  else if (o.status === 'Preparing') badgeClass = 'status-preparing';
                  else if (o.status === 'Completed') badgeClass = 'status-completed';
                  else if (o.status === 'Cancelled' || o.status === 'Expired') badgeClass = 'status-cancelled';

                  const dishesText = o.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                  const isPaid = o.paymentStatus === 'Paid';

                  return `
                    <tr>
                      <td><strong class="ref-code">#${o.id}</strong></td>
                      <td>
                        <div class="table-student-col">
                          <strong>${o.studentName}</strong>
                          <small>${o.gradeSection || 'Student'}</small>
                        </div>
                      </td>
                      <td><span class="table-stall-pill">${o.vendorStall || 'Stall'}</span></td>
                      <td class="table-dish-col" title="${dishesText}">${dishesText}</td>
                      <td><span class="table-slot-text">${o.pickupTime}</span></td>
                      <td><strong class="table-price-text">₱${o.totalAmount}</strong></td>
                      <td>
                        <span class="settings-value-pill" style="font-size: 10.5px; padding: 2px 6px; ${isPaid ? 'color: #065F46; background: #D1FAE5; border-color: #A7F3D0;' : 'color: #92400E; background: #FEF3C7; border-color: #FDE68A;'}">
                          ${isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td><span class="order-status-badge ${badgeClass}">${o.status}</span></td>
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
    container.addEventListener('click', (e) => {
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      const roleBtn = e.target.closest('[data-action="open-role-modal"]');
      if (roleBtn) {
        openRoleModal();
        return;
      }
    });
  }
};

