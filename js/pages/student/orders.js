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
        <div class="page-header">
          <h3>My Canteen Orders</h3>
          <p>Live status & pickup pass for today's reservations</p>
        </div>

        <!-- Segmented Tab -->
        <div class="segmented-control" style="margin-bottom: 14px;">
          <button class="segment-btn ${activeTab === 'active' ? 'active' : ''}" data-action="filter-orders-tab" data-tab="active">
            Active (${activeOrders.length})
          </button>
          <button class="segment-btn ${activeTab === 'history' ? 'active' : ''}" data-action="filter-orders-tab" data-tab="history">
            History (${historyOrders.length})
          </button>
        </div>

        <!-- Orders List -->
        <div class="orders-list-wrap" style="display: flex; flex-direction: column; gap: 12px;">
          ${displayedOrders.length === 0 ? `
            <div class="empty-state-wrap" style="padding: 35px 16px;">
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              </div>
              <h3>${activeTab === 'active' ? 'No active pre-orders' : 'No order history yet'}</h3>
              <p>${activeTab === 'active' ? 'Reserve meals ahead to skip the canteen queue and secure your lunch.' : 'Past completed pre-orders will appear here.'}</p>
              ${activeTab === 'active' ? `
                <button class="btn-primary-action" style="margin-top: 10px;" data-route="#/student/menu">
                  Browse Menu & Order
                </button>
              ` : ''}
            </div>
          ` : displayedOrders.map(order => {
            const currentIdx = statusIndexMap[order.status] ?? 0;
            const progressPercent = currentIdx >= 0 ? Math.min(100, Math.max(0, (currentIdx / (steps.length - 1)) * 100)) : 0;
            const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

            const stepperHTML = order.status === 'Cancelled' ? `
              <div class="cancelled-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>This pre-order was cancelled and portions refunded to the kitchen.</span>
              </div>
            ` : `
              <div class="order-progress-stepper">
                <div class="stepper-progress-fill" style="width: calc(${progressPercent}% * 0.86);"></div>
                ${steps.map((st, idx) => {
                  let cls = '';
                  if (idx < currentIdx) cls = 'completed';
                  else if (idx === currentIdx) cls = 'active';
                  const dotContent = idx < currentIdx 
                    ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' 
                    : (idx + 1);
                  return `
                    <div class="step-point ${cls}">
                      <div class="step-dot">${dotContent}</div>
                      <div class="step-label">${st.label}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;

            return `
              <div class="order-card">
                <div class="order-card-header">
                  <div>
                    <div class="order-vendor-title">
                      <span class="order-stall-tag">${order.vendorStall || 'Stall'}</span>
                      <strong>${order.vendorName || 'Canteen'}</strong>
                    </div>
                    <span class="order-id-badge">Order #${order.id}</span>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${order.createdAt}</div>
                  </div>
                  <span class="order-status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}">
                    ${order.status}
                  </span>
                </div>

                <div style="font-size: 12px; margin-bottom: 6px;">
                  <strong>Pickup Window:</strong> ${order.pickupTime}
                </div>

                ${stepperHTML}

                <div class="order-items-snippet">
                  <strong>Dishes:</strong> ${itemsText}
                  ${order.specialInstructions ? `<br><em>Note: "${order.specialInstructions}"</em>` : ''}
                </div>

                <div class="order-meta-footer">
                  <span>${order.totalServings} serving(s) reserved</span>
                  <span class="order-total-price">₱${order.totalAmount}</span>
                </div>

                <div class="order-actions-row">
                  <button class="btn-secondary-action" data-action="open-pickup-pass" data-order-id="${order.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="7" y2="8.01"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="13" y2="16"></line></svg>
                    View Pickup Pass
                  </button>
                  ${(order.status === 'Pending' || order.status === 'Confirmed') ? `
                    <button class="btn-danger-outline" data-action="cancel-order" data-order-id="${order.id}">
                      Cancel
                    </button>
                  ` : ''}
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

      // 2. Filter Tab
      const tabBtn = e.target.closest('[data-action="filter-orders-tab"]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        if (tab) {
          state.ordersTab = tab;
          this.render(container);
        }
        return;
      }

      // 3. Open Pickup Pass
      const passBtn = e.target.closest('[data-action="open-pickup-pass"]');
      if (passBtn) {
        const orderId = passBtn.getAttribute('data-order-id');
        if (orderId) {
          openPickupPass(orderId);
        }
        return;
      }

      // 4. Cancel Order
      const cancelBtn = e.target.closest('[data-action="cancel-order"]');
      if (cancelBtn) {
        const orderId = cancelBtn.getAttribute('data-order-id');
        if (orderId) {
          this.handleCancelOrder(orderId, container);
        }
        return;
      }
    });
  },

  handleCancelOrder(orderId, container) {
    if (!confirm(`Cancel pre-order #${orderId}? This releases your reserved servings back to the stall immediately.`)) {
      return;
    }

    const orders = SapatStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Release reserved servings back to menu items
    const menu = SapatStorage.getMenu();
    order.items.forEach(item => {
      const dish = menu.find(d => d.id === item.id);
      if (dish) {
        dish.reservedServings = Math.max(0, dish.reservedServings - item.quantity);
      }
    });
    SapatStorage.saveMenu(menu);

    order.status = 'Cancelled';
    SapatStorage.saveOrders(orders);

    showToast(`Pre-order #${orderId} cancelled. Servings returned to kitchen.`, 'info');
    this.render(container);
  }
};

