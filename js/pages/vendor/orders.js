import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { showToast } from '../../components/toast.js';
import { openVendorScannerModal } from '../../components/modals.js';

export const vendorOrdersPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset' || event === 'orders-updated') {
          const currentScreen = document.getElementById('screen-vendor-orders');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    if (!currentVendor) return;

    const orders = SapatStorage.getOrders();
    const vendorOrders = orders.filter(o => o.vendorId === state.currentVendorId);

    const activeFilter = state.vendorOrdersFilter || 'all';
    let filteredOrders = vendorOrders;
    if (activeFilter === 'Pending') {
      filteredOrders = vendorOrders.filter(o => o.status === 'Pending' || o.status === 'Awaiting Counter Payment' || o.status === 'Awaiting Payment');
    } else if (activeFilter !== 'all') {
      filteredOrders = vendorOrders.filter(o => o.status === activeFilter);
    }

    const counts = {
      all: vendorOrders.length,
      Pending: vendorOrders.filter(o => o.status === 'Pending' || o.status === 'Awaiting Counter Payment' || o.status === 'Awaiting Payment').length,
      Confirmed: vendorOrders.filter(o => o.status === 'Confirmed').length,
      Preparing: vendorOrders.filter(o => o.status === 'Preparing').length,
      'Ready for Pickup': vendorOrders.filter(o => o.status === 'Ready for Pickup').length,
      Completed: vendorOrders.filter(o => o.status === 'Completed').length
    };

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-orders">
        
        <!-- Header: Title & Scan Pickup Pass CTA -->
        <div class="v-orders-header-row">
          <div>
            <h2 class="page-main-heading">${currentVendor.name} Pre-orders</h2>
            <p class="page-main-sub">${currentVendor.stallNumber} &bull; ${counts.all - counts.Completed} active reservations requiring kitchen fulfillment</p>
          </div>
          <button class="btn-primary-action v-scan-pickup-btn" data-action="open-qr-scanner" type="button" title="Scan student pickup pass using camera">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10"></rect></svg>
            <span>Scan Pickup Pass</span>
          </button>
        </div>

        <!-- Status Filter Tabs Strip -->
        <div class="v-order-status-tabs">
          <button class="v-tab-btn ${activeFilter === 'all' ? 'active' : ''}" data-action="filter-orders" data-status="all" type="button">
            <span>All</span>
            <span class="v-tab-count">${counts.all}</span>
          </button>
          <button class="v-tab-btn ${activeFilter === 'Pending' ? 'active' : ''}" data-action="filter-orders" data-status="Pending" type="button">
            <span>Pending</span>
            ${counts.Pending > 0 ? `<span class="v-tab-count warning">${counts.Pending}</span>` : '<span class="v-tab-count">0</span>'}
          </button>
          <button class="v-tab-btn ${activeFilter === 'Confirmed' ? 'active' : ''}" data-action="filter-orders" data-status="Confirmed" type="button">
            <span>Confirmed</span>
            <span class="v-tab-count">${counts.Confirmed}</span>
          </button>
          <button class="v-tab-btn ${activeFilter === 'Preparing' ? 'active' : ''}" data-action="filter-orders" data-status="Preparing" type="button">
            <span>Preparing</span>
            <span class="v-tab-count">${counts.Preparing}</span>
          </button>
          <button class="v-tab-btn ${activeFilter === 'Ready for Pickup' ? 'active' : ''}" data-action="filter-orders" data-status="Ready for Pickup" type="button">
            <span>Ready</span>
            <span class="v-tab-count">${counts['Ready for Pickup']}</span>
          </button>
          <button class="v-tab-btn ${activeFilter === 'Completed' ? 'active' : ''}" data-action="filter-orders" data-status="Completed" type="button">
            <span>Completed</span>
            <span class="v-tab-count">${counts.Completed}</span>
          </button>
        </div>

        <!-- Orders Stack -->
        <div class="v-orders-feed-stack">
          ${filteredOrders.length === 0 ? `
            <div class="v-empty-orders-card">
              <div class="empty-state-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <h3>No ${activeFilter !== 'all' ? activeFilter.toLowerCase() : ''} pre-orders</h3>
              <p>When students place orders for ${currentVendor.name}, they will appear here with pickup slot schedules.</p>
              ${activeFilter !== 'all' ? `
                <button class="btn-filter-reset" style="margin-top: 10px; width: auto;" data-action="filter-orders" data-status="all">Show All Orders</button>
              ` : ''}
            </div>
          ` : filteredOrders.map(order => {
            let statusBadgeClass = 'status-pending';
            if (order.status === 'Confirmed') statusBadgeClass = 'status-confirmed';
            else if (order.status === 'Preparing') statusBadgeClass = 'status-preparing';
            else if (order.status === 'Ready for Pickup') statusBadgeClass = 'status-confirmed';
            else if (order.status === 'Completed') statusBadgeClass = 'status-completed';
            else if (order.status === 'Cancelled' || order.status === 'Expired') statusBadgeClass = 'status-cancelled';
            else if (order.status === 'No-show') statusBadgeClass = 'status-cancelled';

            const isPaid = order.paymentStatus === 'Paid';
            const isCounterPending = order.status === 'Awaiting Counter Payment' || (!isPaid && order.status === 'Pending' && order.paymentMethod === 'Counter Payment');
            const isOnlinePending = !isPaid && order.status === 'Pending' && order.paymentMethod === 'Online Payment';

            let paymentBadgeHTML = '';
            if (isPaid) {
              paymentBadgeHTML = `
                <span class="v-payment-badge paid">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Paid &bull; ${order.paymentMethod || 'Online'}
                </span>
              `;
            } else if (order.status === 'Expired') {
              paymentBadgeHTML = `<span class="v-payment-badge expired">Expired &bull; Unpaid</span>`;
            } else if (order.status === 'No-show') {
              paymentBadgeHTML = `<span class="v-payment-badge noshow">Missed &bull; No-Show</span>`;
            } else {
              paymentBadgeHTML = `
                <span class="v-payment-badge pending">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Unpaid &bull; ${order.paymentMethod || 'Counter'}
                </span>
              `;
            }

            let actionsHTML = '';
            if (isCounterPending) {
              actionsHTML = `
                <div class="v-order-action-split">
                  <button class="btn-primary-action v-action-primary-btn" data-action="vendor-verify-counter-payment" data-order-id="${order.id}" type="button">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Verify Payment (₱${order.totalAmount.toFixed(2)})</span>
                  </button>
                  <button class="btn-danger-outline v-action-decline-btn" data-action="vendor-expire-unpaid" data-order-id="${order.id}" type="button" title="Expire unpaid reservation and release portions">
                    Expire Unpaid
                  </button>
                </div>
              `;
            } else if (isOnlinePending) {
              actionsHTML = `
                <div class="v-order-action-split">
                  <span class="v-unpaid-gateway-hint">Awaiting Gateway Callback</span>
                  <button class="btn-danger-outline v-action-decline-btn" data-action="vendor-decline-order" data-order-id="${order.id}" type="button">
                    Decline
                  </button>
                </div>
              `;
            } else if (order.status === 'Pending') {
              actionsHTML = `
                <div class="v-order-action-split">
                  <button class="btn-primary-action v-action-primary-btn" data-action="update-order-status" data-order-id="${order.id}" data-status="Confirmed" type="button">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Confirm Pre-order</span>
                  </button>
                  <button class="btn-danger-outline v-action-decline-btn" data-action="vendor-decline-order" data-order-id="${order.id}" type="button">
                    Decline
                  </button>
                </div>
              `;
            } else if (order.status === 'Confirmed') {
              actionsHTML = `
                <button class="btn-primary-action v-action-full-btn" data-action="update-order-status" data-order-id="${order.id}" data-status="Preparing" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>Start Cooking / Preparing</span>
                </button>
              `;
            } else if (order.status === 'Preparing') {
              actionsHTML = `
                <button class="btn-primary-action v-action-full-btn v-btn-ready" data-action="update-order-status" data-order-id="${order.id}" data-status="Ready for Pickup" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  <span>Ready at Express Counter</span>
                </button>
              `;
            } else if (order.status === 'Ready for Pickup') {
              actionsHTML = `
                <div class="v-order-action-split" style="gap: 6px;">
                  <button class="btn-primary-action v-action-primary-btn" data-action="vendor-handover-order" data-order-id="${order.id}" type="button">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Handover</span>
                  </button>
                  <button class="btn-secondary-action v-action-scan-single" data-action="open-qr-scanner" type="button" title="Scan QR to verify">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10"></rect></svg>
                    <span>Scan</span>
                  </button>
                  <button class="btn-danger-outline" style="padding: 0 8px; font-size: 11px; height: 34px; white-space: nowrap;" data-action="vendor-mark-noshow" data-order-id="${order.id}" type="button" title="Record uncollected meal as No-Show">
                    No-Show
                  </button>
                </div>
              `;
            } else if (order.status === 'Completed') {
              actionsHTML = `
                <div class="v-order-claimed-banner">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Handed Over & Completed</span>
                </div>
              `;
            } else if (order.status === 'No-show') {
              actionsHTML = `
                <div class="v-order-cancelled-banner" style="background: #FEF2F2; color: #991B1B; border-color: #FECACA;">
                  <span>Uncollected No-Show &bull; Logged to OSAS</span>
                </div>
              `;
            } else if (order.status === 'Expired') {
              actionsHTML = `
                <div class="v-order-cancelled-banner">
                  <span>Expired Unpaid &bull; Portions Restored</span>
                </div>
              `;
            } else if (order.status === 'Cancelled') {
              actionsHTML = `
                <div class="v-order-cancelled-banner">
                  <span>Cancelled &bull; Portions Restored</span>
                </div>
              `;
            }

            return `
              <div class="v-order-item-card ${order.status === 'Completed' ? 'v-order-done' : ''}">
                <!-- Top Row: Reference, Pickup Time, Status -->
                <div class="v-order-card-header">
                  <div class="v-order-ref-group">
                    <span class="v-order-ref-badge">#${order.id}</span>
                    <span class="v-order-time-sub">${order.createdAt && order.createdAt.includes('T') ? order.createdAt.split('T')[0] : (order.createdAt || 'Today')}</span>
                  </div>
                  <div class="v-order-head-badges">
                    ${paymentBadgeHTML}
                    <span class="order-status-badge ${statusBadgeClass}">
                      ${order.status}
                    </span>
                  </div>
                </div>

                <!-- Student & Slot Info -->
                <div class="v-order-student-row">
                  <div class="v-student-avatar-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div class="v-student-info">
                    <strong class="v-student-name">${order.studentName}</strong>
                    <span class="v-student-meta">${order.gradeSection || 'Student'}</span>
                  </div>
                  <div class="v-order-slot-pill">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>${order.pickupTime}</span>
                  </div>
                </div>

                <!-- Itemized Food Items -->
                <div class="v-order-items-box">
                  ${(order.items || []).map(item => `
                    <div class="v-order-line-item">
                      <span class="v-item-qty">${item.quantity}x</span>
                      <span class="v-item-name">${item.name}</span>
                      <span class="v-item-price">₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Kitchen Special Instructions (if any) -->
                ${order.specialInstructions && order.specialInstructions.trim() ? `
                  <div class="v-order-note-block">
                    <span class="v-note-tag">Kitchen Note:</span>
                    <p class="v-note-content">${order.specialInstructions}</p>
                  </div>
                ` : ''}

                <!-- Total Amount & Quick Action Controls -->
                <div class="v-order-footer-bar">
                  <div class="v-order-total-group">
                    <span class="v-total-sublabel">Total Pre-order</span>
                    <strong class="v-total-price">₱${order.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div class="v-order-cta-wrap">
                    ${actionsHTML}
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
      // Open QR scanner modal
      const scanBtn = e.target.closest('[data-action="open-qr-scanner"]');
      if (scanBtn) {
        openVendorScannerModal();
        return;
      }

      // Filter tabs
      const filterBtn = e.target.closest('[data-action="filter-orders"]');
      if (filterBtn) {
        const status = filterBtn.getAttribute('data-status');
        if (status) {
          state.vendorOrdersFilter = status;
          this.render(container);
        }
        return;
      }

      // Verify counter payment
      const verifyCounterBtn = e.target.closest('[data-action="vendor-verify-counter-payment"]');
      if (verifyCounterBtn) {
        const orderId = verifyCounterBtn.getAttribute('data-order-id');
        if (orderId) {
          const result = SapatStorage.verifyCounterPayment(orderId, 'Cash Counter Payment', `Verified at stall counter`);
          if (result.success) {
            showToast(`Payment verified for #${orderId}! Order is now Confirmed.`, 'success');
            this.render(container);
          } else {
            showToast(result.message, 'error');
          }
        }
        return;
      }

      // Expire unpaid reservation
      const expireBtn = e.target.closest('[data-action="vendor-expire-unpaid"]');
      if (expireBtn) {
        const orderId = expireBtn.getAttribute('data-order-id');
        if (orderId) {
          if (confirm(`Expire unpaid reservation #${orderId} and release portions to kitchen inventory?`)) {
            const result = SapatStorage.expireUnpaidReservation(orderId, 'Counter payment deadline reached at stall.');
            if (result.success) {
              showToast(`Reservation #${orderId} marked Expired. Portions restored.`, 'info');
              this.render(container);
            } else {
              showToast(result.message, 'error');
            }
          }
        }
        return;
      }

      // Mark order as No-Show
      const noShowBtn = e.target.closest('[data-action="vendor-mark-noshow"]');
      if (noShowBtn) {
        const orderId = noShowBtn.getAttribute('data-order-id');
        if (orderId) {
          if (confirm(`Mark pre-order #${orderId} as No-Show? The scheduled pickup window and grace period have ended.`)) {
            const result = SapatStorage.markOrderNoShow(orderId, 'Uncollected order after pickup shift grace period.');
            if (result.success) {
              showToast(`Order #${orderId} marked as No-Show. Logged to student accountability.`, 'warning');
              this.render(container);
            } else {
              showToast(result.message, 'error');
            }
          }
        }
        return;
      }

      // Update order status transition
      const updateBtn = e.target.closest('[data-action="update-order-status"]');
      if (updateBtn) {
        const orderId = updateBtn.getAttribute('data-order-id');
        const nextStatus = updateBtn.getAttribute('data-status');
        if (orderId && nextStatus) {
          const orders = SapatStorage.getOrders();
          const order = orders.find(o => o.id === orderId);
          if (order) {
            // BLOCKING RULE: cannot advance to Confirmed, Preparing, or Ready for Pickup if unpaid!
            if (['Confirmed', 'Preparing', 'Ready for Pickup'].includes(nextStatus) && order.paymentStatus !== 'Paid') {
              showToast(`Cannot advance order #${order.id}: Verified payment is required first!`, 'error');
              return;
            }

            order.status = nextStatus;
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (Array.isArray(order.timeline)) {
              const step = order.timeline.find(t => t.status === nextStatus);
              if (step) {
                step.time = now;
                step.done = true;
              }
            }
            SapatStorage.saveOrders(orders);
            showToast(`Pre-order #${order.id} status updated to ${nextStatus}`, 'success');
            this.render(container);
          }
        }
        return;
      }

      // Vendor manual handover completion
      const handoverBtn = e.target.closest('[data-action="vendor-handover-order"]');
      if (handoverBtn) {
        const orderId = handoverBtn.getAttribute('data-order-id');
        if (orderId) {
          const result = SapatStorage.claimOrder(orderId, state.currentVendorId);
          if (result.success) {
            showToast(`Pre-order #${orderId} handed over successfully!`, 'success');
            this.render(container);
          } else {
            showToast(result.message, 'error');
          }
        }
        return;
      }

      // Vendor decline order
      const declineBtn = e.target.closest('[data-action="vendor-decline-order"]');
      if (declineBtn) {
        const orderId = declineBtn.getAttribute('data-order-id');
        if (orderId) {
          const orders = SapatStorage.getOrders();
          const order = orders.find(o => o.id === orderId);
          if (order) {
            order.status = 'Cancelled';
            
            // Restore inventory portions
            const menu = SapatStorage.getMenu();
            for (const item of (order.items || [])) {
              const dish = menu.find(d => d.id === item.id);
              if (dish) {
                dish.reservedServings = Math.max(0, (dish.reservedServings || 0) - item.quantity);
              }
            }
            SapatStorage.saveMenu(menu);
            SapatStorage.saveOrders(orders);
            showToast(`Pre-order #${order.id} declined & portions returned to inventory.`, 'info');
            this.render(container);
          }
        }
        return;
      }
    });
  }
};
