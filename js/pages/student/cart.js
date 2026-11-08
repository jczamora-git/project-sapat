import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { showToast } from '../../components/toast.js';

export const studentCartPage = {
  render(container) {
    const items = state.cart;
    const subtotal = state.getCartTotal();

    if (items.length === 0) {
      container.innerHTML = `
        <section class="screen active" id="screen-student-cart">
          <div class="page-header">
            <h3>My Pre-order Tray</h3>
            <p>Review portions and select your pickup slot</p>
          </div>
          <div class="empty-state-wrap" style="padding: 40px 16px;">
            <div class="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <h3>Your tray is empty</h3>
            <p>Browse today's canteen dishes and reserve your portions early before daily kitchen quotas are reached.</p>
            <button class="btn-primary-action" style="margin-top: 14px;" data-route="#/student/menu">
              Browse Canteen Menu
            </button>
          </div>
        </section>
      `;
      this.attachEvents(container);
      return;
    }

    container.innerHTML = `
      <section class="screen active" id="screen-student-cart">
        <div class="page-header">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3>My Pre-order Tray</h3>
            <button class="btn-text-danger" data-action="clear-cart" style="font-size: 12px; color: var(--status-cancelled); background: none; border: none; font-weight: 600; cursor: pointer;">
              Clear All
            </button>
          </div>
          <p>Review portions and select your pickup slot</p>
        </div>

        <!-- Items in Tray -->
        <div class="cart-items-wrap" style="display: flex; flex-direction: column; gap: 10px;">
          ${items.map(item => `
            <div class="cart-item-card" style="background: var(--surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1; padding-right: 10px;">
                <span style="font-size: 10px; font-weight: 700; color: var(--primary); text-transform: uppercase;">${item.vendorStall || 'Stall'} &bull; ${item.vendorName || 'Canteen'}</span>
                <h4 style="font-size: 13.5px; font-weight: 700; margin: 2px 0 3px;">${item.name}</h4>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">₱${item.price * item.quantity} <span style="font-size: 11px; font-weight: 400; color: var(--text-secondary);">(₱${item.price} each)</span></div>
              </div>
              <div class="cart-qty-controls" style="display: flex; align-items: center; gap: 6px;">
                <button class="qty-btn" data-action="cart-minus" data-dish-id="${item.id}" style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--surface-muted); font-weight: 700;">-</button>
                <span style="font-size: 13px; font-weight: 700; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="qty-btn" data-action="cart-plus" data-dish-id="${item.id}" style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--surface-muted); font-weight: 700;">+</button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Pickup Slot Selection -->
        <div class="pickup-slots-section" style="margin-top: 14px;">
          <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Select Pickup Window</h4>
          <div class="pickup-options-grid" style="display: flex; flex-direction: column; gap: 8px;">
            <label class="pickup-card">
              <input type="radio" name="pickup-slot" value="11:30 AM (Lunch Shift 1)" checked style="accent-color: var(--primary);">
              <div class="pickup-info">
                <span class="pickup-time">11:30 AM</span>
                <span class="pickup-tag">Lunch Shift 1</span>
              </div>
            </label>
            <label class="pickup-card">
              <input type="radio" name="pickup-slot" value="12:15 PM (Lunch Shift 2)" style="accent-color: var(--primary);">
              <div class="pickup-info">
                <span class="pickup-time">12:15 PM</span>
                <span class="pickup-tag">Lunch Shift 2</span>
              </div>
            </label>
            <label class="pickup-card">
              <input type="radio" name="pickup-slot" value="2:45 PM (Afternoon Recess)" style="accent-color: var(--primary);">
              <div class="pickup-info">
                <span class="pickup-time">2:45 PM</span>
                <span class="pickup-tag">Afternoon Recess</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Kitchen Note -->
        <div class="form-group" style="margin-top: 12px;">
          <label class="form-label" style="font-size: 12px;">Special Instructions / Dietary Note (Optional)</label>
          <input type="text" class="form-input" id="cart-kitchen-note" placeholder="e.g. Less gravy, extra spoon..." style="height: 38px;">
        </div>

        <!-- Order Summary Breakdown -->
        <div class="bill-summary-card" style="background: var(--surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
            <span style="color: var(--text-secondary);">Subtotal (${state.getCartCount()} portions)</span>
            <span style="font-weight: 600;">₱${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
            <span style="color: var(--text-secondary);">Reservation / Canteen Fee</span>
            <span style="font-weight: 600; color: var(--primary);">FREE</span>
          </div>
          <div style="border-top: 1px dashed var(--border-subtle); margin: 8px 0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 14px; font-weight: 800;">
            <span>Total to Pay at Stall</span>
            <span style="color: var(--primary);">₱${subtotal}</span>
          </div>
        </div>

        <button class="btn-primary-action" id="btn-confirm-checkout" data-action="confirm-checkout" style="margin-top: 14px; height: 44px; width: 100%;">
          Confirm & Reserve Pre-order (₱${subtotal})
        </button>
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

      // 2. Qty minus
      const minusBtn = e.target.closest('[data-action="cart-minus"]');
      if (minusBtn) {
        const dishId = minusBtn.getAttribute('data-dish-id');
        if (dishId) {
          state.updateCartQty(dishId, -1);
          this.render(container);
        }
        return;
      }

      // 3. Qty plus
      const plusBtn = e.target.closest('[data-action="cart-plus"]');
      if (plusBtn) {
        const dishId = plusBtn.getAttribute('data-dish-id');
        if (dishId) {
          const menu = SapatStorage.getMenu();
          const dish = menu.find(d => d.id === dishId);
          if (dish) {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const inCart = state.cart.find(i => i.id === dishId)?.quantity || 0;
            if (inCart >= remaining) {
              showToast(`Limit reached: only ${remaining} portions available today!`, 'error');
              return;
            }
            state.updateCartQty(dishId, 1);
            this.render(container);
          }
        }
        return;
      }

      // 4. Clear Cart
      const clearBtn = e.target.closest('[data-action="clear-cart"]');
      if (clearBtn) {
        state.clearCart();
        showToast('Pre-order tray cleared', 'info');
        this.render(container);
        return;
      }

      // 5. Confirm Checkout
      const checkoutBtn = e.target.closest('[data-action="confirm-checkout"]');
      if (checkoutBtn) {
        this.handleCheckout();
        return;
      }
    });
  },

  handleCheckout() {
    if (state.cart.length === 0) {
      showToast('Your tray is empty!', 'error');
      return;
    }

    const menu = SapatStorage.getMenu();

    // Verify stock
    for (const item of state.cart) {
      const dish = menu.find(d => d.id === item.id);
      if (!dish) continue;
      const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
      if (item.quantity > remaining) {
        showToast(`Cannot reserve: ${dish.name} only has ${remaining} portions left!`, 'error');
        return;
      }
    }

    const selectedSlotEl = document.querySelector('input[name="pickup-slot"]:checked');
    const pickupSlot = selectedSlotEl ? selectedSlotEl.value : '11:30 AM (Lunch Shift 1)';
    const noteEl = document.getElementById('cart-kitchen-note');
    const kitchenNote = noteEl ? noteEl.value.trim() : '';

    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Deduct stock for all items
    state.cart.forEach(item => {
      const targetDish = menu.find(d => d.id === item.id);
      if (targetDish) {
        targetDish.reservedServings += item.quantity;
      }
    });
    SapatStorage.saveMenu(menu);

    // Group items by vendor to create independent orders per stall
    const itemsByVendor = {};
    state.cart.forEach(item => {
      const vId = item.vendorId || 'vendor-lita';
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    const existingOrders = SapatStorage.getOrders();
    const createdOrderIds = [];

    Object.keys(itemsByVendor).forEach(vId => {
      const vItems = itemsByVendor[vId];
      const vendor = SapatStorage.getVendorById(vId);
      const newOrderId = `SPT-${Math.floor(1000 + Math.random() * 9000)}`;
      createdOrderIds.push(newOrderId);

      const vTotalAmount = vItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const vTotalServings = vItems.reduce((sum, item) => sum + item.quantity, 0);

      const newOrder = {
        id: newOrderId,
        vendorId: vId,
        vendorName: vendor ? vendor.name : vItems[0].vendorName,
        vendorStall: vendor ? vendor.stallNumber : vItems[0].vendorStall,
        studentName: 'Maria Santos',
        studentId: '2024-0891',
        gradeSection: 'Grade 11 - STEM A',
        pickupTime: pickupSlot,
        specialInstructions: kitchenNote,
        items: vItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          vendorId: item.vendorId
        })),
        totalAmount: vTotalAmount,
        totalServings: vTotalServings,
        status: 'Confirmed',
        createdAt: `Today, ${timeString}`
      };

      existingOrders.unshift(newOrder);
    });

    SapatStorage.saveOrders(existingOrders);
    state.clearCart();

    showToast(`Pre-order placed for ${createdOrderIds.join(', ')}!`, 'success');
    router.navigate('#/student/orders');
  }
};

