import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';

export const studentCartPage = {
  render(container) {
    const items = state.cart;
    const subtotal = state.getCartTotal();
    const count = state.getCartCount();

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
            <button class="btn-primary-action" style="margin-top: 14px; width: auto; padding: 0 22px;" data-route="#/student/menu">
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
            <p class="page-main-sub">${count} portion${count === 1 ? '' : 's'} selected for reservation</p>
          </div>
          <button class="btn-clear-tray" data-action="clear-cart">Clear All</button>
        </div>

        <div class="cart-columns-layout">
          <!-- Left Column: Items in Tray -->
          <div class="cart-items-column">
            <div class="cart-feed-list">
              ${items.map(item => `
                <div class="cart-item-card">
                  <div class="cart-item-thumb">
                    <img src="${item.image || ''}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                  </div>
                  
                  <div class="cart-item-details">
                    <span class="cart-item-stall">${item.vendorStall || 'Stall'} &bull; ${item.vendorName || 'Canteen'}</span>
                    <h4 class="cart-item-name">${item.name}</h4>
                    <div class="cart-item-pricing">
                      <span class="cart-item-subtotal">₱${item.price * item.quantity}</span>
                      <span class="cart-item-unitprice">₱${item.price} each</span>
                    </div>
                  </div>

                  <div class="cart-stepper-control">
                    <button class="cart-step-btn minus" data-action="cart-minus" data-dish-id="${item.id}" aria-label="Decrease quantity">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <span class="cart-step-num">${item.quantity}</span>
                    <button class="cart-step-btn plus" data-action="cart-plus" data-dish-id="${item.id}" aria-label="Increase quantity">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Column: Pickup & Settlement -->
          <div class="cart-summary-column">
            <!-- Pickup Window Selection (Food App Style) -->
            <div class="checkout-block-card">
              <div class="block-card-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <h4 class="block-card-title">Select Pickup Window</h4>
              </div>
              <p class="block-card-desc">Canteen kitchens prepare portions in batches matched to your chosen pickup shift.</p>
              
              <div class="pickup-options-stack">
                <label class="pickup-select-card">
                  <input type="radio" name="pickup-slot" value="11:30 AM (Lunch Shift 1)" checked>
                  <div class="pickup-select-content">
                    <div>
                      <span class="pickup-select-time">11:30 AM</span>
                      <span class="pickup-select-shift">Lunch Shift 1</span>
                    </div>
                    <span class="pickup-select-badge">Optimal Freshness</span>
                  </div>
                </label>

                <label class="pickup-select-card">
                  <input type="radio" name="pickup-slot" value="12:15 PM (Lunch Shift 2)">
                  <div class="pickup-select-content">
                    <div>
                      <span class="pickup-select-time">12:15 PM</span>
                      <span class="pickup-select-shift">Lunch Shift 2</span>
                    </div>
                    <span class="pickup-select-badge secondary">Peak Shift</span>
                  </div>
                </label>

                <label class="pickup-select-card">
                  <input type="radio" name="pickup-slot" value="2:45 PM (Afternoon Recess)">
                  <div class="pickup-select-content">
                    <div>
                      <span class="pickup-select-time">2:45 PM</span>
                      <span class="pickup-select-shift">Afternoon Recess</span>
                    </div>
                    <span class="pickup-select-badge secondary">Warm Snacks</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Dietary Instruction / Kitchen Note -->
            <div class="checkout-block-card">
              <div class="block-card-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <label class="block-card-title" for="cart-kitchen-note" style="margin: 0;">Special Kitchen Note (Optional)</label>
              </div>
              <input type="text" class="cart-note-input" id="cart-kitchen-note" placeholder="e.g. Less gravy, separate chili sauce, no onion..." maxlength="100">
            </div>

            <!-- Bill Breakdown Summary -->
            <div class="cart-breakdown-card">
              <div class="bill-row">
                <span>Subtotal (${count} portion${count === 1 ? '' : 's'})</span>
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
                  <small>Cash / e-Wallet upon claiming at stall window</small>
                </div>
                <span class="bill-total-price">₱${subtotal}</span>
              </div>
            </div>

            <!-- Sticky-Ready Checkout Action Button -->
            <button class="btn-checkout-primary" id="btn-confirm-checkout" data-action="confirm-checkout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Confirm & Lock Pre-order (₱${subtotal})</span>
            </button>
          </div>
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
          const success = state.addToCart(dish, 1);
          if (success) {
            this.render(container);
          }
        }
        return;
      }

      const minusBtn = e.target.closest('[data-action="cart-minus"]');
      if (minusBtn) {
        const dishId = minusBtn.getAttribute('data-dish-id');
        state.updateCartQty(dishId, -1);
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

        // Generate orders grouped by vendor
        const currentOrders = SapatStorage.getOrders();
        const menu = SapatStorage.getMenu();

        // Group cart items by vendorId
        const vendorGroups = {};
        for (const item of state.cart) {
          if (!vendorGroups[item.vendorId]) {
            vendorGroups[item.vendorId] = [];
          }
          vendorGroups[item.vendorId].push(item);
        }

        const createdOrders = [];
        for (const [vendorId, vItems] of Object.entries(vendorGroups)) {
          const vTotal = vItems.reduce((s, i) => s + (i.price * i.quantity), 0);
          const vServings = vItems.reduce((s, i) => s + i.quantity, 0);
          const vendor = SapatStorage.getVendorById(vendorId);

          const orderId = 'SPT-' + Math.floor(1000 + Math.random() * 9000);
          const newOrder = {
            id: orderId,
            studentName: 'Maria Santos',
            gradeSection: 'Grade 11 - STEM A',
            vendorId,
            vendorName: vendor ? vendor.name : 'Canteen Stall',
            vendorStall: vendor ? vendor.stallNumber : 'Stall',
            items: vItems.map(i => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity
            })),
            totalAmount: vTotal,
            totalServings: vServings,
            pickupTime: selectedSlot,
            specialInstructions: note,
            status: 'Pending',
            createdAt: new Date().toISOString()
          };

          // Deduct portions from inventory
          for (const item of vItems) {
            const dish = menu.find(d => d.id === item.id);
            if (dish) {
              dish.reservedServings = (dish.reservedServings || 0) + item.quantity;
            }
          }

          createdOrders.push(newOrder);
          currentOrders.unshift(newOrder);
        }

        SapatStorage.saveMenu(menu);
        SapatStorage.saveOrders(currentOrders);
        state.clearCart();

        showToast(`Pre-order #${createdOrders[0].id} placed successfully!`, 'success');
        router.navigate('#/student/orders');
      }
    });
  }
};
