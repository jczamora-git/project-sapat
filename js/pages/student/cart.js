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
          <div class="page-title-wrap">
            <h2 class="page-main-heading">Pre-order Tray</h2>
            <p class="page-main-sub">Review portions & select your lunch pickup window</p>
          </div>
          <div class="empty-state-wrap">
            <div class="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <h3>Your tray is empty</h3>
            <p>Browse today's canteen dishes and reserve your portions early before daily kitchen quotas are reached.</p>
            <button class="btn-primary-action" style="margin-top: 14px; width: auto; padding: 0 20px;" data-route="#/student/menu">
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
        
        <!-- Header -->
        <div class="page-title-wrap" style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 class="page-main-heading">Pre-order Tray</h2>
            <p class="page-main-sub">${state.getCartCount()} meal portion(s) selected</p>
          </div>
          <button class="btn-clear-tray" data-action="clear-cart">Clear All</button>
        </div>

        <!-- Items in Tray -->
        <div class="cart-feed-list">
          ${items.map(item => `
            <div class="cart-item-row">
              <div class="cart-item-info">
                <span class="cart-item-stall">${item.vendorStall || 'Stall'} &bull; ${item.vendorName || 'Canteen'}</span>
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price-unit">
                  <strong>₱${item.price * item.quantity}</strong>
                  <span>(₱${item.price} each)</span>
                </div>
              </div>
              <div class="cart-stepper-control">
                <button class="qty-btn minus" data-action="cart-minus" data-dish-id="${item.id}">−</button>
                <span class="qty-number">${item.quantity}</span>
                <button class="qty-btn plus" data-action="cart-plus" data-dish-id="${item.id}">+</button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Pickup Window Selection (Selectable Cards) -->
        <div class="checkout-block-card">
          <h4 class="block-card-title">Select Pickup Window</h4>
          <div class="pickup-options-stack">
            <label class="pickup-select-card">
              <input type="radio" name="pickup-slot" value="11:30 AM (Lunch Shift 1)" checked>
              <div class="pickup-select-content">
                <span class="pickup-select-time">11:30 AM</span>
                <span class="pickup-select-shift">Lunch Shift 1</span>
              </div>
            </label>
            <label class="pickup-select-card">
              <input type="radio" name="pickup-slot" value="12:15 PM (Lunch Shift 2)">
              <div class="pickup-select-content">
                <span class="pickup-select-time">12:15 PM</span>
                <span class="pickup-select-shift">Lunch Shift 2</span>
              </div>
            </label>
            <label class="pickup-select-card">
              <input type="radio" name="pickup-slot" value="2:45 PM (Afternoon Recess)">
              <div class="pickup-select-content">
                <span class="pickup-select-time">2:45 PM</span>
                <span class="pickup-select-shift">Afternoon Recess</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Dietary Instruction / Kitchen Note -->
        <div class="checkout-block-card">
          <label class="block-card-title" for="cart-kitchen-note">Special Instructions (Optional)</label>
          <input type="text" class="cart-note-input" id="cart-kitchen-note" placeholder="e.g. Less gravy, separate chili sauce..." maxlength="100">
        </div>

        <!-- Bill Breakdown Summary -->
        <div class="cart-breakdown-card">
          <div class="bill-row">
            <span>Subtotal (${state.getCartCount()} portions)</span>
            <span class="bill-val">₱${subtotal}</span>
          </div>
          <div class="bill-row">
            <span>Pre-order Reservation Fee</span>
            <span class="bill-val free">FREE</span>
          </div>
          <div class="bill-divider"></div>
          <div class="bill-total-row">
            <div>
              <strong>Total to Pay at Stall</strong>
              <small>Upon pickup presentation</small>
            </div>
            <span class="bill-total-price">₱${subtotal}</span>
          </div>
        </div>

        <!-- Checkout Action Button -->
        <button class="btn-checkout-primary" id="btn-confirm-checkout" data-action="confirm-checkout">
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

      // 2. Clear Cart
      const clearBtn = e.target.closest('[data-action="clear-cart"]');
      if (clearBtn) {
        if (confirm('Clear all meals from your pre-order tray?')) {
          state.clearCart();
          showToast('Tray cleared', 'info');
          this.render(container);
        }
        return;
      }

      // 3. Cart Increment / Decrement
      const plusBtn = e.target.closest('[data-action="cart-plus"]');
      if (plusBtn) {
        const dishId = plusBtn.getAttribute('data-dish-id');
        const dish = SapatStorage.getDishById(dishId);
        if (dish) {
          state.addToCart(dish, 1);
          this.render(container);
        }
        return;
      }

      const minusBtn = e.target.closest('[data-action="cart-minus"]');
      if (minusBtn) {
        const dishId = minusBtn.getAttribute('data-dish-id');
        state.removeFromCart(dishId, 1);
        this.render(container);
        return;
      }

      // 4. Confirm Checkout
      const checkoutBtn = e.target.closest('[data-action="confirm-checkout"]');
      if (checkoutBtn) {
        if (state.cart.length === 0) {
          showToast('Your tray is empty.', 'error');
          return;
        }

        const selectedSlot = container.querySelector('input[name="pickup-slot"]:checked')?.value || '11:30 AM (Lunch Shift 1)';
        const note = container.querySelector('#cart-kitchen-note')?.value.trim() || '';

        const newOrder = state.createOrderFromCart(selectedSlot, note);
        if (newOrder) {
          showToast(`Pre-order #${newOrder.id} reserved successfully!`, 'success');
          router.navigate('#/student/orders');
        } else {
          showToast('Failed to place pre-order. Please try again.', 'error');
        }
      }
    });
  }
};
