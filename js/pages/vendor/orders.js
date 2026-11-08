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
        
        <!-- Stall Account Selector Bar -->
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <div class="page-title-wrap">
          <h2 class="page-main-heading">${currentVendor.stallNumber} Pre-orders</h2>
          <p class="page-main-sub">${activeCount} active pre-order(s) requiring kitchen preparation</p>
        </div>

        <!-- Orders Stack -->
        <div class="v-orders-feed-stack">
          ${vendorOrders.length === 0 ? `
            <div class="empty-state-wrap">
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
                  Confirm Pre-order
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
                <button class="btn-primary-action" style="flex: 1; height: 38px; font-size: 12px;" data-action="update-order-status" data-order-id="${order.id}" data-status="Completed">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Handover & Complete
                </button>
              `;
            } else if (order.status === 'Completed') {
              actionsHTML = `<div class="v-order-claimed-msg"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Order Claimed and Paid</div>`;
            } else if (order.status === 'Cancelled') {
              actionsHTML = `<div class="v-order-cancelled-msg">Cancelled &bull; Portions Restored</div>`;
            }

            return `
              <div class="modern-order-card">
                <div class="modern-order-head">
                  <div class="head-left-info">
                    <strong class="order-vendor-title">#${order.id} &bull; ${order.studentName}</strong>
                    <span class="order-number-ref">${order.gradeSection} &bull; ${order.pickupTime}</span>
                  </div>
                  <span class="order-status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}">
                    ${order.status}
                  </span>
                </div>

                <div class="order-dishes-summary">
                  <span class="dishes-summary-label">Dishes:</span>
                  <p class="dishes-summary-text">${itemsText}</p>
                  ${order.specialInstructions ? `<div class="dishes-kitchen-note">Note: "${order.specialInstructions}"</div>` : ''}
                </div>

                <div class="order-bottom-bar">
                  <div class="order-cost-info">
                    <span class="cost-portions">${order.totalServings} portion(s)</span>
                    <strong class="cost-total">₱${order.totalAmount}</strong>
                  </div>
                  <div class="order-action-buttons" style="flex: 1.5; justify-content: flex-end;">
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
          if (!confirm(`Decline pre-order #${orderId}? Reserved servings will be returned to the kitchen.`)) return;
          const success = SapatStorage.cancelOrder(orderId);
          if (success) {
            showToast(`Order #${orderId} declined.`, 'info');
            this.render(container);
          }
        }
      }
    });
  }
};
