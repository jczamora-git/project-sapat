import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { renderVendorAccountBar } from '../../components/vendor-card.js';
import { showToast } from '../../components/toast.js';

export const vendorOrdersPage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    const orders = SapatStorage.getOrders();

    const vendorOrders = orders.filter(o => o.vendorId === state.currentVendorId);
    const activeCount = vendorOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-orders">
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <div class="page-header">
          <h3>${currentVendor.stallNumber} Incoming Pre-orders</h3>
          <p>${activeCount} active pre-order(s) requiring kitchen preparation</p>
        </div>

        <!-- Orders List -->
        <div class="vendor-orders-list-wrap" style="display: flex; flex-direction: column; gap: 12px;">
          ${vendorOrders.length === 0 ? `
            <div class="empty-state-wrap" style="padding: 35px 16px;">
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <h3>No pre-orders yet for ${currentVendor.name}</h3>
              <p>When students place reservations for this stall, they will immediately appear here with real-time pickup slots.</p>
            </div>
          ` : vendorOrders.map(order => {
            const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

            let actionsHTML = '';
            if (order.status === 'Pending') {
              actionsHTML = `
                <button class="btn-primary-action" style="flex: 2; height: 38px; font-size: 12px;" data-action="update-order-status" data-order-id="${order.id}" data-status="Confirmed">
                  Confirm Preorder
                </button>
                <button class="btn-danger-outline" style="flex: 1;" data-action="vendor-decline-order" data-order-id="${order.id}">
                  Decline
                </button>
              `;
            } else if (order.status === 'Confirmed') {
              actionsHTML = `
                <button class="btn-primary-action" style="flex: 1; height: 38px; font-size: 12px;" data-action="update-order-status" data-order-id="${order.id}" data-status="Preparing">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Start Preparing
                </button>
              `;
            } else if (order.status === 'Preparing') {
              actionsHTML = `
                <button class="btn-primary-action" style="flex: 1; height: 38px; font-size: 12px;" data-action="update-order-status" data-order-id="${order.id}" data-status="Ready for Pickup">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> Mark Ready for Pickup
                </button>
              `;
            } else if (order.status === 'Ready for Pickup') {
              actionsHTML = `
                <button class="btn-primary-action" style="flex: 1; height: 38px; font-size: 12px; background: #1e293b;" data-action="update-order-status" data-order-id="${order.id}" data-status="Completed">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete & Handover
                </button>
              `;
            } else if (order.status === 'Completed') {
              actionsHTML = `<div style="font-size: 11.5px; color: var(--primary); font-weight: 600; width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Order Claimed and Paid</div>`;
            } else if (order.status === 'Cancelled') {
              actionsHTML = `<div style="font-size: 11.5px; color: var(--status-cancelled); font-weight: 700; width: 100%; text-align: center;">Cancelled &bull; Servings Restored</div>`;
            }

            return `
              <div class="order-card">
                <div class="order-card-header">
                  <div>
                    <span class="order-id-badge">#${order.id} &bull; ${order.studentName}</span>
                    <div style="font-size: 11px; color: var(--text-secondary);">${order.gradeSection} &bull; ${order.pickupTime}</div>
                  </div>
                  <span class="order-status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}">
                    ${order.status}
                  </span>
                </div>

                <div class="order-items-snippet" style="margin: 8px 0;">
                  <strong>Reserved:</strong> ${itemsText}
                  ${order.specialInstructions ? `<br><em>Note: "${order.specialInstructions}"</em>` : ''}
                </div>

                <div class="order-meta-footer">
                  <span>${order.totalServings} serving(s) reserved</span>
                  <span class="order-total-price">₱${order.totalAmount}</span>
                </div>

                <div class="order-actions-row" style="margin-top: 10px;">
                  ${actionsHTML}
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
    const select = container.querySelector('[data-action="switch-vendor-account"]');
    if (select) {
      select.addEventListener('change', (e) => {
        const vendorId = e.target.value;
        state.setCurrentVendor(vendorId);
        const v = SapatStorage.getVendorById(vendorId);
        showToast(`Switched account to ${v.name} (${v.stallNumber})`, 'success');
        this.render(container);
      });
    }

    container.addEventListener('click', (e) => {
      // Update order status
      const updateBtn = e.target.closest('[data-action="update-order-status"]');
      if (updateBtn) {
        const orderId = updateBtn.getAttribute('data-order-id');
        const nextStatus = updateBtn.getAttribute('data-status');
        if (orderId && nextStatus) {
          const orders = SapatStorage.getOrders();
          const order = orders.find(o => o.id === orderId);
          if (order) {
            order.status = nextStatus;
            SapatStorage.saveOrders(orders);
            showToast(`Order #${orderId} marked as '${nextStatus}'`, 'success');
            this.render(container);
          }
        }
        return;
      }

      // Decline order
      const declineBtn = e.target.closest('[data-action="vendor-decline-order"]');
      if (declineBtn) {
        const orderId = declineBtn.getAttribute('data-order-id');
        if (orderId) {
          this.handleDeclineOrder(orderId, container);
        }
        return;
      }
    });
  },

  handleDeclineOrder(orderId, container) {
    if (!confirm(`Decline order #${orderId}? This will cancel the reservation and return portions back to kitchen limits.`)) return;

    const orders = SapatStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Release portions
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
    showToast(`Order #${orderId} was declined. Servings restored.`, 'info');
    this.render(container);
  }
};
