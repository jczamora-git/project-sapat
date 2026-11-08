import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openPickupPass } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentOrdersPage = {
  render(container) {
    const orders = SapatStorage.getOrders();
    const activeTab = state.ordersTab;

    const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
    const historyOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');
    const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

    const steps = [
      { key: 'Pending', label: 'Received' },
      { key: 'Confirmed', label: 'Confirmed' },
      { key: 'Preparing', label: 'Preparing' },
      { key: 'Ready for Pickup', label: 'Ready' },
      { key: 'Completed', label: 'Claimed' }
    ];

    const statusIndexMap = {
      'Pending': 0,
      'Confirmed': 1,
      'Preparing': 2,
      'Ready for Pickup': 3,
      'Completed': 4,
      'Cancelled': -1
    };

    container.innerHTML = `
      <section class="screen active" id="screen-student-orders">
        
        <!-- Page Title & Header -->
        <div class="page-title-wrap">
          <h2 class="page-main-heading">My Orders</h2>
          <p class="page-main-sub">Live tracking & pickup pass for today's pre-orders</p>
        </div>

        <!-- Custom Styled Segmented Control (Active / History) -->
        <div class="segmented-pill-control" role="tablist">
          <button class="seg-pill-btn ${activeTab === 'active' ? 'active' : ''}" data-action="filter-orders-tab" data-tab="active">
            Active (${activeOrders.length})
          </button>
          <button class="seg-pill-btn ${activeTab === 'history' ? 'active' : ''}" data-action="filter-orders-tab" data-tab="history">
            History (${historyOrders.length})
          </button>
        </div>

        <!-- Orders Feed -->
        <div class="orders-feed-wrap">
          ${displayedOrders.length === 0 ? `
            <div class="empty-state-wrap">
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              </div>
              <h3>${activeTab === 'active' ? 'No active pre-orders' : 'No past orders yet'}</h3>
              <p>${activeTab === 'active' ? 'Reserve lunch dishes ahead to secure your meal before daily cooking limits hit.' : 'Your completed and claimed pre-orders will be recorded here.'}</p>
              ${activeTab === 'active' ? `
                <button class="btn-primary-action" style="margin-top: 12px; width: auto; padding: 0 20px;" data-route="#/student/menu">
                  Browse Canteen Menu
                </button>
              ` : ''}
            </div>
          ` : displayedOrders.map(order => {
            const currentIdx = statusIndexMap[order.status] ?? 0;
            const progressPercent = currentIdx >= 0 ? Math.min(100, Math.max(0, (currentIdx / (steps.length - 1)) * 100)) : 0;
            const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

            const isCancelled = order.status === 'Cancelled';
            const isReady = order.status === 'Ready for Pickup';

            const trackerHTML = isCancelled ? `
              <div class="order-cancelled-notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>This pre-order was cancelled. Reserved portions were returned to the kitchen.</span>
              </div>
            ` : `
              <div class="stepper-horizontal-card">
                <div class="stepper-track-line">
                  <div class="stepper-fill-line" style="width: ${progressPercent}%;"></div>
                </div>
                <div class="stepper-points-row">
                  ${steps.map((st, idx) => {
                    let stClass = '';
                    if (idx < currentIdx) stClass = 'completed';
                    else if (idx === currentIdx) stClass = 'active';

                    const dotContent = idx < currentIdx 
                      ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                      : (idx + 1);

                    return `
                      <div class="stepper-point-item ${stClass}">
                        <div class="stepper-dot-circle">${dotContent}</div>
                        <span class="stepper-point-label">${st.label}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;

            return `
              <div class="modern-order-card">
                <!-- Card Header -->
                <div class="modern-order-head">
                  <div class="head-left-info">
                    <div class="vendor-stall-line">
                      <span class="order-stall-badge">${order.vendorStall || 'Stall'}</span>
                      <strong class="order-vendor-title">${order.vendorName || 'Canteen'}</strong>
                    </div>
                    <span class="order-number-ref">Order #${order.id} &bull; ${order.createdAt.includes('T') ? order.createdAt.split('T')[0] : order.createdAt}</span>
                  </div>
                  <span class="order-status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}">
                    ${order.status === 'Ready for Pickup' ? '<span class="status-pulse-dot"></span>' : ''}
                    ${order.status}
                  </span>
                </div>

                <!-- Pickup Time Banner -->
                <div class="order-pickup-strip ${isReady ? 'ready-highlight' : ''}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span><strong>Pickup Window:</strong> ${order.pickupTime}</span>
                </div>

                <!-- Progress Tracker -->
                ${trackerHTML}

                <!-- Dishes Details -->
                <div class="order-dishes-summary">
                  <div class="order-dishes-chips">
                    ${order.items.map(item => `
                      <span class="dish-item-pill">
                        <strong>${item.quantity}x</strong> ${item.name} &bull; ₱${item.price * item.quantity}
                      </span>
                    `).join('')}
                  </div>
                  ${order.specialInstructions ? `<div class="dishes-kitchen-note"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path></svg> Note: "${order.specialInstructions}"</div>` : ''}
                </div>

                <!-- Footer Summary & Actions -->
                <div class="order-bottom-bar">
                  <div class="order-cost-info">
                    <span class="cost-portions">${order.totalServings} portion${order.totalServings === 1 ? '' : 's'}</span>
                    <strong class="cost-total">₱${order.totalAmount}</strong>
                  </div>
                  
                  <div class="order-action-buttons">
                    <button class="btn-primary-action btn-pickup-pass" data-action="open-pickup-pass" data-order-id="${order.id}">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
                      <span>Digital Pass</span>
                    </button>
                    ${(order.status === 'Pending' || order.status === 'Confirmed') ? `
                      <button class="btn-cancel-preorder" data-action="cancel-order" data-order-id="${order.id}">
                        Cancel
                      </button>
                    ` : ''}
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
      // 1. Navigation
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      // 2. Tab Filter
      const tabBtn = e.target.closest('[data-action="filter-orders-tab"]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        if (tab) {
          state.setOrdersTab(tab);
          this.render(container);
          return;
        }
      }

      // 3. Open Pickup Pass
      const passBtn = e.target.closest('[data-action="open-pickup-pass"]');
      if (passBtn) {
        const orderId = passBtn.getAttribute('data-order-id');
        if (orderId) {
          openPickupPass(orderId);
          return;
        }
      }

      // 4. Cancel Order
      const cancelBtn = e.target.closest('[data-action="cancel-order"]');
      if (cancelBtn) {
        const orderId = cancelBtn.getAttribute('data-order-id');
        if (orderId) {
          if (!confirm(`Cancel pre-order #${orderId}? Your reserved portions will be made available back to your campus canteen.`)) {
            return;
          }
          const success = SapatStorage.cancelOrder(orderId);
          if (success) {
            showToast(`Pre-order #${orderId} was cancelled.`, 'info');
            this.render(container);
          } else {
            showToast('Unable to cancel this order.', 'error');
          }
          return;
        }
      }
    });
  }
};
