import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { showToast } from '../../components/toast.js';
import { renderFeaturedMealCard, getImgFallback } from '../../components/food-card.js';
import { openMealModal, openOnlinePaymentModal } from '../../components/modals.js';

export const studentCartPage = {
  render(container) {
    const items = state.cart;
    const subtotal = state.getCartTotal();
    const count = state.getCartCount();

    if (items.length === 0) {
      const menu = SapatStorage.getMenu();
      const suggestions = menu.filter(d => d.isAvailable && (d.dailyLimit - d.reservedServings) > 0).slice(0, 4);

      container.innerHTML = `
        <section class="screen active" id="screen-student-cart">
          <div class="page-title-wrap">
            <h2 class="page-main-heading">Pre-order Tray</h2>
            <p class="page-main-sub">Review portions & select your lunch pickup window</p>
          </div>

          <!-- Engaging Empty State Banner -->
          <div class="cart-empty-feature-card">
            <div class="empty-tray-art">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <h3 class="cart-empty-title">Your Pre-order Tray is Empty</h3>
            <p class="cart-empty-sub">Avoid lunchtime sellouts by reserving freshly cooked meals ahead of time. Canteen kitchens lock portion batches specifically for pre-orders.</p>
            <button class="btn-primary-action cart-empty-browse-btn" data-route="#/student/menu">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              <span>Explore Canteen Menu</span>
            </button>
          </div>

          <!-- Suggested Dishes to Reserve -->
          <div class="section-row-header" style="margin-top: 24px;">
            <div>
              <h3 class="section-heading">Available Specials Today</h3>
              <span class="section-subtext">Popular dishes ready for lunch reservation</span>
            </div>
            <button class="section-see-all-btn" data-route="#/student/menu">View all menu &rarr;</button>
          </div>
          <div class="meals-grid-2col" id="cart-suggested-grid">
            ${suggestions.map(d => renderFeaturedMealCard(d)).join('')}
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
                    <div class="cart-item-top-row">
                      <span class="cart-item-stall">${item.vendorStall || 'Stall'} &bull; ${item.vendorName || 'Canteen'}</span>
                      <button class="cart-item-remove-btn" data-action="cart-remove" data-dish-id="${item.id}" title="Remove item" aria-label="Remove item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
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

            <!-- Payment Method Selection -->
            <div class="checkout-block-card">
              <div class="block-card-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                <h4 class="block-card-title">Payment Method & Settlement</h4>
              </div>
              <p class="block-card-desc">Reservations require verified payment before official confirmation.</p>
              
              <div class="payment-method-options-stack">
                <label class="payment-select-card active">
                  <input type="radio" name="payment-method" value="Online Payment" checked>
                  <div class="payment-select-content">
                    <div class="payment-select-info">
                      <span class="payment-method-name">Online Payment</span>
                      <span class="payment-method-desc">GCash &bull; Maya &bull; QR Ph (Instant Digital Pass)</span>
                    </div>
                    <span class="payment-select-tag instant">Instant Pass</span>
                  </div>
                </label>

                <label class="payment-select-card">
                  <input type="radio" name="payment-method" value="Counter Payment">
                  <div class="payment-select-content">
                    <div class="payment-select-info">
                      <span class="payment-method-name">Pay at Canteen Counter</span>
                      <span class="payment-method-desc">Cash/e-Wallet in person within 20 mins cutoff</span>
                    </div>
                    <span class="payment-select-tag counter">Stall Window</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Accountability & Cancellation Policy Acknowledgment -->
            <div class="checkout-policy-card">
              <label class="policy-checkbox-label">
                <input type="checkbox" id="cart-policy-ack" checked>
                <span class="policy-checkbox-text">
                  I understand that pre-orders require verified payment. Unpaid counter reservations expire after the cutoff, and uncollected confirmed orders are logged under student accountability.
                </span>
              </label>
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
                  <strong>Total Settlement</strong>
                  <small id="bill-method-hint">Instant digital pass issued upon online payment</small>
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

      // 4. Cart Remove Item
      const removeBtn = e.target.closest('[data-action="cart-remove"]');
      if (removeBtn) {
        const dishId = removeBtn.getAttribute('data-dish-id');
        state.updateCartQty(dishId, -999);
        showToast('Item removed from tray', 'info');
        this.render(container);
        return;
      }

      // 5. Quick Add from empty tray recommendations
      const quickAddBtn = e.target.closest('[data-action="quick-add"]');
      if (quickAddBtn) {
        e.stopPropagation();
        const dishId = quickAddBtn.getAttribute('data-dish-id');
        const dish = SapatStorage.getDishById(dishId);
        if (dish) {
          const success = state.addToCart(dish, 1);
          if (success) {
            showToast(`Added 1x ${dish.name} to tray`, 'success');
            this.render(container);
          }
        }
        return;
      }

      // 6. Open meal modal
      const mealEl = e.target.closest('[data-action="open-meal"]');
      if (mealEl) {
        const dishId = mealEl.getAttribute('data-dish-id');
        if (dishId) {
          openMealModal(dishId);
          return;
        }
      }

      // 7. Confirm Checkout
      const checkoutBtn = e.target.closest('[data-action="confirm-checkout"]');
      if (checkoutBtn) {
        if (state.cart.length === 0) {
          showToast('Your tray is empty.', 'error');
          return;
        }

        const policyAck = container.querySelector('#cart-policy-ack')?.checked;
        if (!policyAck) {
          showToast('Please agree to the payment and reservation accountability policy.', 'error');
          return;
        }

        const selectedSlot = container.querySelector('input[name="pickup-slot"]:checked')?.value || '11:30 AM (Lunch Shift 1)';
        const paymentMethod = container.querySelector('input[name="payment-method"]:checked')?.value || 'Online Payment';
        const note = container.querySelector('#cart-kitchen-note')?.value.trim() || '';

        // Generate orders grouped by vendor
        const currentOrders = SapatStorage.getOrders();
        const menu = SapatStorage.getMenu();
        const settings = SapatStorage.getSettings();
        const deadlineMin = settings.counterPaymentDeadlineMinutes || 20;

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
          const paymentDeadline = paymentMethod === 'Counter Payment'
            ? new Date(Date.now() + deadlineMin * 60000).toISOString()
            : null;

          const newOrder = {
            id: orderId,
            pickupToken: 'spt_tok_' + orderId.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 8),
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
            status: paymentMethod === 'Counter Payment' ? 'Awaiting Counter Payment' : 'Pending',
            paymentMethod: paymentMethod,
            paymentStatus: 'Pending',
            paymentDeadline: paymentDeadline,
            counterWindow: vendor ? vendor.stallNumber : 'Express Counter 1',
            paidAt: null,
            transactionReference: null,
            createdAt: new Date().toISOString()
          };

          // Hold portions in kitchen inventory for this reservation
          for (const item of vItems) {
            const dish = menu.find(d => d.id === item.id);
            if (dish) {
              dish.reservedServings = (dish.reservedServings || 0) + item.quantity;
            }
          }

          // Create payment audit record
          SapatStorage.createPaymentRecord({
            reservationId: newOrder.id,
            studentName: newOrder.studentName,
            gradeSection: newOrder.gradeSection,
            vendorId: newOrder.vendorId,
            vendorName: newOrder.vendorName,
            vendorStall: newOrder.vendorStall,
            amount: newOrder.totalAmount,
            method: newOrder.paymentMethod,
            status: 'Pending',
            paymentDeadline: newOrder.paymentDeadline,
            counterWindow: newOrder.counterWindow,
            items: newOrder.items
          });

          // Log reservation creation audit event
          SapatStorage.logAuditEvent({
            eventType: paymentMethod === 'Counter Payment' ? 'COUNTER_PAYMENT_INITIATED' : 'ONLINE_PAYMENT_INITIATED',
            reservationId: newOrder.id,
            studentName: newOrder.studentName,
            vendorId: newOrder.vendorId,
            amount: newOrder.totalAmount,
            details: `Pre-order created. Settlement method: ${paymentMethod}. Status: ${newOrder.status}.`
          });

          createdOrders.push(newOrder);
          currentOrders.unshift(newOrder);
        }

        SapatStorage.saveMenu(menu);
        SapatStorage.saveOrders(currentOrders);
        state.clearCart();

        if (paymentMethod === 'Online Payment') {
          showToast(`Order #${createdOrders[0].id} created! Complete payment below.`, 'info');
          openOnlinePaymentModal(createdOrders[0].id);
        } else {
          showToast(`Order #${createdOrders[0].id} created! Pay at ${createdOrders[0].vendorStall} within ${deadlineMin} mins.`, 'success');
          router.navigate('#/student/orders');
        }
      }
    });
  }
};
