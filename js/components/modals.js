import { state } from '../state.js';
import { SapatStorage } from '../storage.js';
import { router } from '../router.js';
import { showToast } from './toast.js';
import { renderModalVendorItem } from './vendor-card.js';
import { getImgFallback } from './food-card.js';

export function initModals() {
  // Modal 1: Role select close button & options
  const roleModal = document.getElementById('modal-role-select');
  if (roleModal) {
    const closeBtn = roleModal.querySelector('.close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeRoleModal);

    roleModal.addEventListener('click', (e) => {
      if (e.target === roleModal) closeRoleModal();

      const studentTile = e.target.closest('[data-action="switch-role-student"]');
      if (studentTile) {
        state.setRole('student');
        closeRoleModal();
        router.navigate('#/student/home');
        showToast('Switched to Student view', 'info');
        return;
      }

      const vendorTile = e.target.closest('[data-action="switch-role-vendor-main"]');
      if (vendorTile) {
        state.setRole('vendor');
        closeRoleModal();
        router.navigate('#/vendor/dashboard');
        showToast('Switched to Canteen Vendor view', 'info');
        return;
      }

      const adminTile = e.target.closest('[data-action="switch-role-admin"]');
      if (adminTile) {
        state.setRole('admin');
        closeRoleModal();
        router.navigate('#/admin/dashboard');
        showToast('Switched to Campus Administrator portal', 'success');
        return;
      }

      const specificVendorItem = e.target.closest('[data-action="switch-role-vendor"]');
      if (specificVendorItem) {
        const vendorId = specificVendorItem.getAttribute('data-vendor-id');
        if (vendorId) {
          state.setCurrentVendor(vendorId);
          state.setRole('vendor');
          closeRoleModal();
          router.navigate('#/vendor/dashboard');
          showToast(`Switched account to ${SapatStorage.getVendorById(vendorId)?.name}`, 'success');
        }
      }
    });
  }

  // Modal 2: Meal Details
  const mealModal = document.getElementById('modal-meal-details');
  if (mealModal) {
    const closeBtn = mealModal.querySelector('.close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeMealModal);

    const qtyMinus = mealModal.querySelector('[data-action="modal-qty-minus"]');
    if (qtyMinus) qtyMinus.addEventListener('click', () => modalAdjustQty(-1));

    const qtyPlus = mealModal.querySelector('[data-action="modal-qty-plus"]');
    if (qtyPlus) qtyPlus.addEventListener('click', () => modalAdjustQty(1));

    const addBtn = document.getElementById('modal-btn-add');
    if (addBtn) addBtn.addEventListener('click', modalConfirmAddToCart);

    mealModal.addEventListener('click', (e) => {
      if (e.target === mealModal) closeMealModal();
    });
  }

  // Modal 3: Dish Editor
  const dishModal = document.getElementById('modal-dish-editor');
  if (dishModal) {
    const closeBtn = dishModal.querySelector('.close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeDishEditorModal);

    const presetSelect = document.getElementById('edit-dish-img-preset');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => handlePresetImgSelect(e.target.value));
    }

    const form = document.getElementById('dish-editor-form');
    if (form) {
      form.addEventListener('submit', handleSaveDish);
    }

    dishModal.addEventListener('click', (e) => {
      if (e.target === dishModal) closeDishEditorModal();
    });
  }

  // Modal 4: Pickup Pass
  const passModal = document.getElementById('modal-pickup-pass');
  if (passModal) {
    const closeBtn = passModal.querySelector('.close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closePickupPass);

    const doneBtn = passModal.querySelector('[data-action="close-pickup-pass"]');
    if (doneBtn) doneBtn.addEventListener('click', closePickupPass);

    passModal.addEventListener('click', (e) => {
      if (e.target === passModal) closePickupPass();
    });
  }

  // Modal 5: Menu Filters & Sort
  const filterModal = document.getElementById('modal-menu-filters');
  if (filterModal) {
    const closeBtn = filterModal.querySelector('.close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeMenuFilterModal);

    const resetBtn = document.getElementById('modal-filter-btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      state.menuSortBy = 'recommended';
      state.menuInStockOnly = false;
      state.studentVendorFilter = 'all';
      state.selectedCategory = 'all';
      populateFilterModal();
      showToast('Filters reset to default', 'info');
      state.notify('menu-filter-changed', null);
      closeMenuFilterModal();
    });

    const applyBtn = document.getElementById('modal-filter-btn-apply');
    if (applyBtn) applyBtn.addEventListener('click', () => {
      const selectedSort = filterModal.querySelector('input[name="modalMenuSort"]:checked');
      if (selectedSort) state.setMenuSortBy(selectedSort.value);

      const inStockEl = document.getElementById('modal-filter-instock');
      if (inStockEl) state.setMenuInStockOnly(inStockEl.checked);

      const activeVendorChip = filterModal.querySelector('#modal-filter-vendor-chips .filter-chip.active');
      if (activeVendorChip) {
        state.setStudentVendorFilter(activeVendorChip.getAttribute('data-vendor-id') || 'all');
      }

      const activeCatChip = filterModal.querySelector('#modal-filter-cat-chips .filter-chip.active');
      if (activeCatChip) {
        state.setSelectedCategory(activeCatChip.getAttribute('data-cat-id') || 'all');
      }

      showToast('Filters applied', 'success');
      state.notify('menu-filter-changed', null);
      closeMenuFilterModal();
    });

    filterModal.addEventListener('click', (e) => {
      if (e.target === filterModal) closeMenuFilterModal();

      const vChip = e.target.closest('#modal-filter-vendor-chips .filter-chip');
      if (vChip) {
        filterModal.querySelectorAll('#modal-filter-vendor-chips .filter-chip').forEach(c => c.classList.remove('active'));
        vChip.classList.add('active');
        return;
      }

      const cChip = e.target.closest('#modal-filter-cat-chips .filter-chip');
      if (cChip) {
        filterModal.querySelectorAll('#modal-filter-cat-chips .filter-chip').forEach(c => c.classList.remove('active'));
        cChip.classList.add('active');
        return;
      }
    });
  }

  // Modal 6: Vendor QR Scanner & Handover
  const scannerModal = document.getElementById('modal-vendor-qr-scanner');
  if (scannerModal) {
    const closeBtns = scannerModal.querySelectorAll('[data-action="close-qr-scanner"], .close-modal-btn');
    closeBtns.forEach(btn => btn.addEventListener('click', closeVendorScannerModal));

    scannerModal.addEventListener('click', (e) => {
      if (e.target === scannerModal) closeVendorScannerModal();
    });

    const manualForm = document.getElementById('scanner-manual-form');
    if (manualForm) {
      manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('manual-preorder-input');
        if (input && input.value.trim()) {
          handleScannedPickupCode(input.value.trim());
        }
      });
    }

    const cancelHandoverBtn = document.getElementById('btn-cancel-handover');
    if (cancelHandoverBtn) {
      cancelHandoverBtn.addEventListener('click', () => {
        openVendorScannerModal();
      });
    }

    const confirmHandoverBtn = document.getElementById('btn-confirm-handover');
    if (confirmHandoverBtn) {
      confirmHandoverBtn.addEventListener('click', () => {
        confirmPendingHandover();
      });
    }

    const cameraSelect = document.getElementById('scanner-camera-select');
    if (cameraSelect) {
      cameraSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          startScannerCamera(e.target.value);
        }
      });
    }
  }

  // Modal 7: Online Payment Gateway Simulation
  const onlinePayModal = document.getElementById('modal-online-payment');
  if (onlinePayModal) {
    const closeBtns = onlinePayModal.querySelectorAll('[data-action="close-online-payment"], .close-modal-btn');
    closeBtns.forEach(btn => btn.addEventListener('click', closeOnlinePaymentModal));

    const providerBtns = onlinePayModal.querySelectorAll('.pay-provider-btn');
    providerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        providerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const provider = btn.getAttribute('data-provider') || 'GCash';
        const label = document.getElementById('btn-pay-label');
        if (label && currentOnlinePaymentOrder) {
          label.textContent = `Authorize & Pay ₱${(currentOnlinePaymentOrder.totalAmount || 0).toFixed(2)} via ${provider}`;
        }
      });
    });

    const successBtn = document.getElementById('btn-simulate-pay-success');
    if (successBtn) {
      successBtn.addEventListener('click', () => {
        if (!currentOnlinePaymentOrder) return;
        const activeBtn = onlinePayModal.querySelector('.pay-provider-btn.active');
        const provider = activeBtn ? activeBtn.getAttribute('data-provider') : 'GCash';
        const paymentMethod = `Online Payment (${provider})`;
        const orderId = currentOnlinePaymentOrder.id;

        const res = SapatStorage.recordOnlinePayment(orderId, paymentMethod);
        if (res.success) {
          showToast(`Payment of ₱${res.order.totalAmount} verified via ${provider}! Reservation #${res.order.id} confirmed.`, 'success');
          closeOnlinePaymentModal();
          openPickupPass(orderId);
          window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'orders' } }));
        } else {
          showToast(res.message || 'Payment processing failed', 'error');
        }
      });
    }

    const failBtn = document.getElementById('btn-simulate-pay-fail');
    if (failBtn) {
      failBtn.addEventListener('click', () => {
        if (!currentOnlinePaymentOrder) return;
        const orderId = currentOnlinePaymentOrder.id;
        SapatStorage.recordOnlinePaymentFailure(orderId, 'Simulated gateway card/wallet decline');
        showToast('Payment declined: Simulated transaction failure.', 'error');
        closeOnlinePaymentModal();
        window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'orders' } }));
      });
    }

    onlinePayModal.addEventListener('click', (e) => {
      if (e.target === onlinePayModal) closeOnlinePaymentModal();
    });
  }

  // Modal 8: No-Show Explanation
  const noshowModal = document.getElementById('modal-noshow-explanation');
  if (noshowModal) {
    const closeBtns = noshowModal.querySelectorAll('[data-action="close-noshow-modal"], .close-modal-btn');
    closeBtns.forEach(btn => btn.addEventListener('click', closeNoShowExplanationModal));

    const textarea = document.getElementById('noshow-explanation-textarea');
    const charCount = document.getElementById('noshow-char-count');
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
      });
    }

    const submitBtn = document.getElementById('btn-submit-noshow-explanation');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!currentNoShowExplanationOrderId) return;
        const text = textarea ? textarea.value.trim() : '';
        if (!text) {
          showToast('Please enter an explanation for the missed pickup.', 'warning');
          return;
        }

        const res = SapatStorage.submitNoShowExplanation(currentNoShowExplanationOrderId, text);
        if (res.success) {
          showToast('Explanation recorded. Retained for institutional review.', 'success');
          closeNoShowExplanationModal();
          window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'orders' } }));
        } else {
          showToast(res.message || 'Failed to submit explanation', 'error');
        }
      });
    }

    noshowModal.addEventListener('click', (e) => {
      if (e.target === noshowModal) closeNoShowExplanationModal();
    });
  }

  // Modal 9: Student Meal Feedback & Rating
  const feedbackModal = document.getElementById('modal-meal-feedback');
  if (feedbackModal) {
    const closeBtns = feedbackModal.querySelectorAll('[data-action="close-meal-feedback"], .close-modal-btn');
    closeBtns.forEach(btn => btn.addEventListener('click', closeMealFeedbackModal));

    const starBtns = feedbackModal.querySelectorAll('.star-btn');
    const hintEl = document.getElementById('feedback-rating-hint');
    const ratingHints = {
      1: '1 - Needs Improvement (Too salty/small/cold)',
      2: '2 - Fair (Could be better)',
      3: '3 - Good (Satisfied with meal)',
      4: '4 - Very Good (Tasty and satisfying)',
      5: '5 - Excellent! Highly recommended'
    };

    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.getAttribute('data-rating') || '5', 10);
        currentFeedbackRating = rating;
        starBtns.forEach((b, idx) => {
          if (idx < rating) {
            b.classList.add('active');
            const svg = b.querySelector('svg');
            if (svg) {
              svg.setAttribute('fill', '#FF8A24');
              svg.setAttribute('stroke', '#FF8A24');
            }
          } else {
            b.classList.remove('active');
            const svg = b.querySelector('svg');
            if (svg) {
              svg.setAttribute('fill', 'none');
              svg.setAttribute('stroke', 'currentColor');
            }
          }
        });
        if (hintEl) hintEl.textContent = ratingHints[rating] || '';
      });
    });

    const tagChips = feedbackModal.querySelectorAll('.feedback-tag-chip');
    tagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });

    const commentTextarea = document.getElementById('feedback-comment-textarea');
    const charCount = document.getElementById('feedback-char-count');
    if (commentTextarea && charCount) {
      commentTextarea.addEventListener('input', () => {
        charCount.textContent = commentTextarea.value.length;
      });
    }

    const submitBtn = document.getElementById('btn-submit-meal-feedback');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!currentFeedbackOrderId) return;
        const selectedTags = Array.from(feedbackModal.querySelectorAll('.feedback-tag-chip.selected')).map(c => c.getAttribute('data-tag'));
        const comment = commentTextarea ? commentTextarea.value.trim() : '';

        const res = SapatStorage.submitReview({
          orderId: currentFeedbackOrderId,
          rating: currentFeedbackRating,
          tasteTag: selectedTags[0] || 'Perfect Flavor',
          portionTag: selectedTags[1] || 'Just Right',
          comment
        });

        if (res.success) {
          showToast(`Salamat! Feedback submitted for ${res.review.dishName}.`, 'success');
          closeMealFeedbackModal();
          window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'reviews' } }));
        } else {
          showToast(res.message || 'Failed to submit review', 'error');
        }
      });
    }

    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) closeMealFeedbackModal();
    });
  }
}

// ==========================================
// Role Modal Methods
// ==========================================
export function openRoleModal() {
  const modal = document.getElementById('modal-role-select');
  if (!modal) return;
  modal.classList.add('active');

  const container = document.getElementById('modal-vendor-accounts-list');
  if (container) {
    const vendors = SapatStorage.getVendors();
    container.innerHTML = vendors.map(v => 
      renderModalVendorItem(v, v.id === state.currentVendorId)
    ).join('');
  }
}

export function closeRoleModal() {
  const modal = document.getElementById('modal-role-select');
  if (modal) modal.classList.remove('active');
}

// ==========================================
// Meal Details Modal Methods
// ==========================================
export function openMealModal(dishId) {
  const menu = SapatStorage.getMenu();
  const dish = menu.find(d => d.id === dishId);
  if (!dish) return;

  state.selectedMealForModal = dish;
  state.modalMealQty = 1;

  const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
  const isSoldOut = remaining <= 0;
  const percentFilled = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

  const vendorBadge = document.getElementById('modal-meal-vendor-badge');
  if (vendorBadge) {
    vendorBadge.textContent = `${dish.vendorStall || 'Stall'} • ${dish.vendorName || 'Canteen'}`;
  }

  const title = document.getElementById('modal-meal-title');
  if (title) title.textContent = dish.name;

  const img = document.getElementById('modal-meal-img');
  if (img) {
    img.src = dish.image;
    img.onerror = () => { img.src = getImgFallback(); };
  }

  const cat = document.getElementById('modal-meal-cat');
  if (cat) cat.textContent = dish.categoryName || 'Kanin at Ulam';

  const price = document.getElementById('modal-meal-price');
  if (price) price.textContent = `₱${dish.price}`;

  const desc = document.getElementById('modal-meal-desc');
  if (desc) desc.textContent = dish.description;

  const qty = document.getElementById('modal-meal-qty');
  if (qty) qty.textContent = '1';

  const servingsText = document.getElementById('modal-meal-servings-text');
  if (servingsText) {
    servingsText.textContent = isSoldOut ? '0 servings left (SOLD OUT)' : `${remaining} of ${dish.dailyLimit} remaining`;
    servingsText.style.color = isSoldOut ? 'var(--error)' : (remaining <= 5 ? 'var(--warning-text)' : 'var(--primary)');
  }

  const gaugeFill = document.getElementById('modal-meal-gauge-fill');
  if (gaugeFill) {
    gaugeFill.style.width = `${percentFilled}%`;
    gaugeFill.className = `gauge-bar-fill ${isSoldOut ? 'soldout' : (remaining <= 5 ? 'warning' : '')}`;
  }

  const prepNote = document.getElementById('modal-meal-prep-note');
  if (prepNote) {
    prepNote.textContent = dish.prepNote || 'Fresh batch prepared daily per student preorder target.';
  }

  // Calculate limits with items already in cart
  const existingInCart = state.cart.find(i => i.id === dish.id);
  const inCartQty = existingInCart ? existingInCart.quantity : 0;
  const maxCanAdd = Math.max(0, remaining - inCartQty);

  if (isSoldOut || maxCanAdd <= 0) {
    state.modalMealQty = 0;
  } else {
    state.modalMealQty = 1;
  }

  if (qty) qty.textContent = String(state.modalMealQty);

  // Subtotal display
  const subtotal = dish.price * state.modalMealQty;
  const subtotalEl = document.getElementById('modal-meal-subtotal');
  if (subtotalEl) subtotalEl.textContent = `₱${subtotal}`;

  // Stepper buttons state
  const minusBtn = document.getElementById('modal-qty-minus-btn');
  if (minusBtn) minusBtn.disabled = state.modalMealQty <= 1;

  const plusBtn = document.getElementById('modal-qty-plus-btn');
  if (plusBtn) plusBtn.disabled = state.modalMealQty >= maxCanAdd || isSoldOut;

  const addBtn = document.getElementById('modal-btn-add');
  if (addBtn) {
    addBtn.disabled = isSoldOut || maxCanAdd <= 0;
    if (isSoldOut) {
      addBtn.textContent = 'Daily Limit Reached (Sold Out)';
    } else if (maxCanAdd <= 0) {
      addBtn.textContent = 'Limit Reached in Tray';
    } else {
      addBtn.textContent = 'Add to Preorder';
    }
  }

  const modal = document.getElementById('modal-meal-details');
  if (modal) modal.classList.add('active');
}

export function closeMealModal() {
  const modal = document.getElementById('modal-meal-details');
  if (modal) modal.classList.remove('active');
  state.selectedMealForModal = null;
}

export function modalAdjustQty(delta) {
  if (!state.selectedMealForModal) return;
  const dish = state.selectedMealForModal;
  const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);

  const existingInCart = state.cart.find(i => i.id === dish.id);
  const inCartQty = existingInCart ? existingInCart.quantity : 0;
  const maxCanAdd = remaining - inCartQty;

  let next = state.modalMealQty + delta;
  if (next < 1) next = 1;

  if (next > maxCanAdd) {
    showToast(`Limit reached: only ${maxCanAdd} additional serving(s) available!`, 'error');
    return;
  }

  state.modalMealQty = next;
  const qtyEl = document.getElementById('modal-meal-qty');
  if (qtyEl) qtyEl.textContent = String(state.modalMealQty);

  // Update subtotal
  const subtotal = dish.price * state.modalMealQty;
  const subtotalEl = document.getElementById('modal-meal-subtotal');
  if (subtotalEl) subtotalEl.textContent = `₱${subtotal}`;

  // Update stepper buttons disabled state
  const minusBtn = document.getElementById('modal-qty-minus-btn');
  if (minusBtn) minusBtn.disabled = state.modalMealQty <= 1;

  const plusBtn = document.getElementById('modal-qty-plus-btn');
  if (plusBtn) plusBtn.disabled = state.modalMealQty >= maxCanAdd;
}

export function modalConfirmAddToCart() {
  if (!state.selectedMealForModal) return;
  const remaining = Math.max(0, state.selectedMealForModal.dailyLimit - state.selectedMealForModal.reservedServings);

  if (remaining <= 0) {
    showToast(`${state.selectedMealForModal.name} is SOLD OUT today!`, 'error');
    return;
  }

  const existing = state.cart.find(i => i.id === state.selectedMealForModal.id);
  const currentInCart = existing ? existing.quantity : 0;

  if (currentInCart + state.modalMealQty > remaining) {
    showToast(`Cannot order beyond preparation limit! Only ${remaining - currentInCart} left.`, 'error');
    return;
  }

  state.addToCart(state.selectedMealForModal, state.modalMealQty);
  showToast(`Added ${state.modalMealQty}x ${state.selectedMealForModal.name} to tray!`, 'success');
  closeMealModal();
}

// ==========================================
// Dish Editor Modal Methods
// ==========================================
export function openDishEditorModal(dishId) {
  if (dishId) {
    openEditDishModal(dishId);
  } else {
    openAddDishModal();
  }
}

export function openAddDishModal() {
  const vendor = SapatStorage.getVendorById(state.currentVendorId);
  document.getElementById('dish-editor-title').textContent = `Add Dish to ${vendor ? vendor.name : 'Stall'}`;
  document.getElementById('edit-dish-id').value = '';
  document.getElementById('edit-dish-name').value = '';
  document.getElementById('edit-dish-category').value = 'rice-meals';
  document.getElementById('edit-dish-price').value = '65';
  document.getElementById('edit-dish-limit').value = '35';
  document.getElementById('edit-dish-suggested').value = '35';
  document.getElementById('edit-dish-img-preset').value = 'custom';
  document.getElementById('edit-dish-img-url').value = 'assets/images/products/chicken-adobo.jpg';
  document.getElementById('edit-dish-desc').value = '';
  document.getElementById('edit-dish-available').checked = true;

  const modal = document.getElementById('modal-dish-editor');
  if (modal) modal.classList.add('active');
}

export function openEditDishModal(dishId) {
  const menu = SapatStorage.getMenu();
  const dish = menu.find(d => d.id === dishId);
  if (!dish) return;

  document.getElementById('dish-editor-title').textContent = `Edit Dish: ${dish.name}`;
  document.getElementById('edit-dish-id').value = dish.id;
  document.getElementById('edit-dish-name').value = dish.name;
  document.getElementById('edit-dish-category').value = dish.category;
  document.getElementById('edit-dish-price').value = dish.price;
  document.getElementById('edit-dish-limit').value = dish.dailyLimit;
  document.getElementById('edit-dish-suggested').value = dish.suggestedPrep || dish.dailyLimit;
  document.getElementById('edit-dish-img-url').value = dish.image;
  document.getElementById('edit-dish-desc').value = dish.description;
  document.getElementById('edit-dish-available').checked = dish.isAvailable;

  const modal = document.getElementById('modal-dish-editor');
  if (modal) modal.classList.add('active');
}

export function closeDishEditorModal() {
  const modal = document.getElementById('modal-dish-editor');
  if (modal) modal.classList.remove('active');
}

export function handlePresetImgSelect(val) {
  if (val !== 'custom') {
    document.getElementById('edit-dish-img-url').value = val;
  }
}

export function handleSaveDish(e) {
  e.preventDefault();
  const menu = SapatStorage.getMenu();
  const editId = document.getElementById('edit-dish-id').value;

  const name = document.getElementById('edit-dish-name').value.trim();
  const category = document.getElementById('edit-dish-category').value;
  const price = parseFloat(document.getElementById('edit-dish-price').value) || 50;
  const dailyLimit = parseInt(document.getElementById('edit-dish-limit').value, 10) || 30;
  const suggestedPrep = parseInt(document.getElementById('edit-dish-suggested').value, 10) || dailyLimit;
  const image = document.getElementById('edit-dish-img-url').value.trim() || 'assets/images/products/chicken-adobo.jpg';
  const description = document.getElementById('edit-dish-desc').value.trim();
  const isAvailable = document.getElementById('edit-dish-available').checked;

  const catMap = {
    'rice-meals': 'Kanin at Ulam',
    'merienda': 'Meryenda',
    'veggies': 'Gulay & Healthy',
    'drinks': 'Inumin'
  };

  const currentVendor = SapatStorage.getVendorById(state.currentVendorId);

  if (editId) {
    const dish = menu.find(d => d.id === editId);
    if (dish) {
      dish.name = name;
      dish.category = category;
      dish.categoryName = catMap[category] || 'Kanin at Ulam';
      dish.price = price;
      dish.dailyLimit = dailyLimit;
      dish.suggestedPrep = suggestedPrep;
      dish.image = image;
      dish.description = description;
      dish.isAvailable = isAvailable;
      showToast(`Updated ${dish.name}`, 'success');
    }
  } else {
    const newId = `dish-${Date.now().toString(36)}`;
    menu.push({
      id: newId,
      vendorId: state.currentVendorId,
      vendorName: currentVendor.name,
      vendorStall: currentVendor.stallNumber,
      name,
      category,
      categoryName: catMap[category] || 'Kanin at Ulam',
      price,
      dailyLimit,
      reservedServings: 0,
      suggestedPrep,
      image,
      description,
      isAvailable,
      prepNote: `Prepared fresh by ${currentVendor.name}`
    });
    showToast(`Added ${name} to ${currentVendor.name}`, 'success');
  }

  SapatStorage.saveMenu(menu);
  closeDishEditorModal();
}

// ==========================================
// Pickup Pass Modal Methods
// ==========================================
export function openPickupPass(orderId) {
  const orders = SapatStorage.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const idEl = document.getElementById('pass-order-id');
  if (idEl) idEl.textContent = `#${order.id}`;

  const studentEl = document.getElementById('pass-student-name');
  if (studentEl) studentEl.textContent = order.studentName;

  const slotEl = document.getElementById('pass-pickup-slot');
  if (slotEl) slotEl.textContent = order.pickupTime;

  const passStallInfo = document.getElementById('pass-stall-info');

  // Verify payment status: Only verified paid orders receive an active QR pass
  const isPaid = order.paymentStatus === 'Paid';
  const qrFrame = document.getElementById('pass-qr-frame');
  const unpaidNotice = document.getElementById('pass-unpaid-notice');
  const badgeEl = document.getElementById('pass-payment-status-badge');
  const unpaidDesc = document.getElementById('pass-unpaid-desc');
  const unpaidDeadline = document.getElementById('pass-unpaid-deadline');

  if (badgeEl) {
    if (isPaid) {
      badgeEl.innerHTML = `<span class="pass-verified-badge" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #065F46;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>VERIFIED PAID &bull; ${order.paymentMethod || 'Online'}</span></span>`;
    } else {
      badgeEl.innerHTML = `<span class="pass-unpaid-badge" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #92400E;"><span>AWAITING PAYMENT &bull; ${order.status}</span></span>`;
    }
  }

  if (!isPaid) {
    if (qrFrame) qrFrame.style.display = 'none';
    if (unpaidNotice) {
      unpaidNotice.style.display = 'block';
      if (unpaidDesc) {
        unpaidDesc.textContent = `Please settle ₱${order.totalAmount}.00 at ${order.vendorStall || 'Stall Counter'} (${order.counterWindow || 'Express Window'}) to confirm your reservation and activate your QR Pickup Pass.`;
      }
      if (unpaidDeadline) {
        unpaidDeadline.textContent = `Payment Deadline: ${order.paymentDeadline || 'Within 20 minutes of ordering'}`;
      }
    }
    if (passStallInfo) {
      passStallInfo.innerHTML = `⚠️ <strong>Payment Required:</strong> Visit ${order.vendorStall || 'Stall Counter'} before preparation window to pay.`;
    }
  } else {
    if (qrFrame) qrFrame.style.display = 'flex';
    if (unpaidNotice) unpaidNotice.style.display = 'none';
    if (passStallInfo) {
      passStallInfo.textContent = `Present at ${order.vendorStall || 'Stall Window'} (${order.vendorName || 'Canteen Counter'}) to claim.`;
    }

    // Ensure unique opaque pickup token exists without exposing personal data
    if (!order.pickupToken) {
      const cleanId = (order.id || 'SPT').toLowerCase().replace(/[^a-z0-9]/g, '');
      order.pickupToken = `spt_tok_${cleanId}_${btoa(order.id).substring(0, 8).toLowerCase()}`;
      SapatStorage.saveOrders(orders);
    }

    // Render actual QR code on canvas
    const canvas = document.getElementById('pass-qr-canvas');
    if (canvas) {
      if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
        window.QRCode.toCanvas(canvas, order.pickupToken, {
          width: 128,
          margin: 1,
          color: {
            dark: '#005B36',
            light: '#FFFFFF'
          }
        }, (err) => {
          if (err) console.error('QR code generation failed:', err);
        });
      }
    }
  }

  const modal = document.getElementById('modal-pickup-pass');
  if (modal) modal.classList.add('active');
}

export function closePickupPass() {
  const modal = document.getElementById('modal-pickup-pass');
  if (modal) modal.classList.remove('active');
}

// ==========================================
// Online Payment Modal Methods (Simulated Gateway)
// ==========================================
let currentOnlinePaymentOrder = null;

export function openOnlinePaymentModal(orderId) {
  const orders = SapatStorage.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  currentOnlinePaymentOrder = order;

  const orderRefEl = document.getElementById('online-pay-order-ref');
  if (orderRefEl) orderRefEl.textContent = `#${order.id}`;

  const stallEl = document.getElementById('online-pay-stall-name');
  if (stallEl) stallEl.textContent = `${order.vendorStall || 'Stall'} • ${order.vendorName || 'Canteen'}`;

  const amountEl = document.getElementById('online-pay-amount');
  if (amountEl) amountEl.textContent = `₱${(order.totalAmount || 0).toFixed(2)}`;

  const btnPayLabel = document.getElementById('btn-pay-label');
  if (btnPayLabel) btnPayLabel.textContent = `Authorize & Pay ₱${(order.totalAmount || 0).toFixed(2)} (Simulate Success)`;

  const modal = document.getElementById('modal-online-payment');
  if (modal) modal.classList.add('active');
}

export function closeOnlinePaymentModal() {
  const modal = document.getElementById('modal-online-payment');
  if (modal) modal.classList.remove('active');
  currentOnlinePaymentOrder = null;
}

// ==========================================
// Student No-Show Explanation Modal Methods
// ==========================================
let currentNoShowExplanationOrderId = null;

export function openNoShowExplanationModal(orderId) {
  const orders = SapatStorage.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  currentNoShowExplanationOrderId = order.id;

  const refEl = document.getElementById('noshow-modal-order-ref');
  if (refEl) refEl.textContent = `Pre-order #${order.id} • ${order.vendorStall || 'Stall'}`;

  const textarea = document.getElementById('noshow-explanation-textarea');
  if (textarea) {
    textarea.value = order.noShowExplanation || '';
    const charCount = document.getElementById('noshow-char-count');
    if (charCount) charCount.textContent = textarea.value.length;
  }

  const modal = document.getElementById('modal-noshow-explanation');
  if (modal) modal.classList.add('active');
}

export function closeNoShowExplanationModal() {
  const modal = document.getElementById('modal-noshow-explanation');
  if (modal) modal.classList.remove('active');
  currentNoShowExplanationOrderId = null;
}

// ==========================================
// Student Meal Feedback & Rating Modal Methods
// ==========================================
let currentFeedbackOrderId = null;
let currentFeedbackRating = 5;

export function openMealFeedbackModal(orderId) {
  const orders = SapatStorage.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  currentFeedbackOrderId = order.id;
  currentFeedbackRating = order.reviewRating || 5;

  const modal = document.getElementById('modal-meal-feedback');
  if (!modal) return;

  const thumbImg = document.getElementById('feedback-dish-img');
  const stallEl = document.getElementById('feedback-dish-stall');
  const nameEl = document.getElementById('feedback-dish-name');
  const refEl = document.getElementById('feedback-order-id');
  const commentTextarea = document.getElementById('feedback-comment-textarea');
  const charCount = document.getElementById('feedback-char-count');
  const hintEl = document.getElementById('feedback-rating-hint');

  const firstItem = order.items && order.items[0];
  const dish = firstItem ? SapatStorage.getDishById(firstItem.id) : null;

  if (thumbImg) {
    thumbImg.src = (dish && dish.image) || (firstItem && firstItem.image) || 'assets/images/products/chicken-adobo.jpg';
    thumbImg.onerror = () => { thumbImg.src = getImgFallback(); };
  }
  if (stallEl) stallEl.textContent = `${order.vendorStall || 'Stall'} • ${order.vendorName || 'Canteen'}`;
  if (nameEl) nameEl.textContent = firstItem ? `${firstItem.quantity}x ${firstItem.name}` : 'Canteen Meal';
  if (refEl) refEl.textContent = `Order #${order.id} • Claimed`;

  if (commentTextarea) {
    commentTextarea.value = order.reviewComment || '';
    if (charCount) charCount.textContent = commentTextarea.value.length;
  }

  // Update stars to current rating
  const starBtns = modal.querySelectorAll('.star-btn');
  const ratingHints = {
    1: '1 - Needs Improvement (Too salty/small/cold)',
    2: '2 - Fair (Could be better)',
    3: '3 - Good (Satisfied with meal)',
    4: '4 - Very Good (Tasty and satisfying)',
    5: '5 - Excellent! Highly recommended'
  };

  starBtns.forEach((b, idx) => {
    const svg = b.querySelector('svg');
    if (idx < currentFeedbackRating) {
      b.classList.add('active');
      if (svg) {
        svg.setAttribute('fill', '#FF8A24');
        svg.setAttribute('stroke', '#FF8A24');
      }
    } else {
      b.classList.remove('active');
      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
  });

  if (hintEl) hintEl.textContent = ratingHints[currentFeedbackRating] || '';

  modal.classList.add('active');
}

export function closeMealFeedbackModal() {
  const modal = document.getElementById('modal-meal-feedback');
  if (modal) modal.classList.remove('active');
  currentFeedbackOrderId = null;
}

// ==========================================
// Vendor QR Scanner & Handover Methods
// ==========================================
let html5QrScannerInstance = null;
let currentPendingClaimOrder = null;

export async function openVendorScannerModal() {
  const modal = document.getElementById('modal-vendor-qr-scanner');
  if (!modal) return;

  const activeView = document.getElementById('scanner-view-active');
  const confirmView = document.getElementById('scanner-view-confirmation');
  const errorBanner = document.getElementById('scanner-error-banner');
  const statusText = document.getElementById('scanner-status-text');
  const manualInput = document.getElementById('manual-preorder-input');

  if (activeView) activeView.style.display = 'block';
  if (confirmView) confirmView.style.display = 'none';
  if (errorBanner) errorBanner.style.display = 'none';
  if (manualInput) manualInput.value = '';
  if (statusText) {
    statusText.innerHTML = '<span class="scanner-status-dot online"></span><span>Camera starting... Align QR pass in frame.</span>';
  }

  modal.classList.add('active');
  currentPendingClaimOrder = null;

  startScannerCamera();
}

export function closeVendorScannerModal() {
  stopScannerCamera();
  const modal = document.getElementById('modal-vendor-qr-scanner');
  if (modal) modal.classList.remove('active');
  currentPendingClaimOrder = null;
}

export async function stopScannerCamera() {
  if (html5QrScannerInstance) {
    try {
      if (html5QrScannerInstance.isScanning) {
        await html5QrScannerInstance.stop();
      }
      await html5QrScannerInstance.clear();
    } catch (e) {
      console.warn('Error stopping QR scanner:', e);
    }
    html5QrScannerInstance = null;
  }
}

async function startScannerCamera(cameraId = null) {
  const qrReaderEl = document.getElementById('qr-reader');
  if (!qrReaderEl) return;

  await stopScannerCamera();

  if (!window.Html5Qrcode) {
    showScannerError('QR Scanner Library Unavailable', 'Please enter the pre-order code manually below.');
    return;
  }

  try {
    html5QrScannerInstance = new window.Html5Qrcode('qr-reader');
    
    // Check available cameras
    try {
      const devices = await window.Html5Qrcode.getCameras();
      const select = document.getElementById('scanner-camera-select');
      if (devices && devices.length > 1 && select) {
        select.innerHTML = devices.map((d, i) => `
          <option value="${d.id}" ${i === 0 ? 'selected' : ''}>${d.label || `Camera ${i + 1}`}</option>
        `).join('');
        select.style.display = 'block';
      }
    } catch (devErr) {
      console.log('Camera enumeration note:', devErr);
    }

    const config = {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      aspectRatio: 1.0
    };

    const cameraConfig = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'environment' };

    await html5QrScannerInstance.start(
      cameraConfig,
      config,
      (decodedText) => {
        handleScannedPickupCode(decodedText);
      },
      () => {
        // scan frame in progress
      }
    );

    const statusText = document.getElementById('scanner-status-text');
    if (statusText) {
      statusText.innerHTML = '<span class="scanner-status-dot online"></span><span>Camera live. Align student QR pass within frame.</span>';
    }
  } catch (err) {
    console.warn('Camera start failed or permission denied:', err);
    showScannerError(
      'Camera Permission Denied or Unavailable',
      'Please grant camera permissions in your browser, or verify the order reference code manually below.'
    );
  }
}

function showScannerError(title, desc) {
  const errorBanner = document.getElementById('scanner-error-banner');
  const errorTitle = document.getElementById('scanner-error-title');
  const errorDesc = document.getElementById('scanner-error-desc');
  const statusText = document.getElementById('scanner-status-text');

  if (errorBanner) errorBanner.style.display = 'flex';
  if (errorTitle) errorTitle.textContent = title;
  if (errorDesc) errorDesc.textContent = desc;
  if (statusText) {
    statusText.innerHTML = '<span class="scanner-status-dot offline"></span><span>Camera unavailable &bull; Manual fallback ready</span>';
  }
}

export function handleScannedPickupCode(codeOrToken) {
  if (!codeOrToken) return;

  let token = String(codeOrToken).trim();
  try {
    const parsed = JSON.parse(token);
    if (parsed && (parsed.token || parsed.id)) {
      token = parsed.token || parsed.id;
    }
  } catch (e) {
    // Plain string
  }

  const order = SapatStorage.getOrderByToken(token);
  if (!order) {
    showToast('Invalid QR Code. Pre-order reference not found.', 'error');
    return;
  }

  if (order.vendorId !== state.currentVendorId) {
    const owner = SapatStorage.getVendorById(order.vendorId);
    const ownerName = owner ? `${owner.name} (${owner.stallNumber})` : 'another stall';
    showToast(`Wrong stall: Pre-order #${order.id} belongs to ${ownerName}.`, 'warning');
    return;
  }

  if (order.status === 'Completed') {
    showToast(`Pre-order #${order.id} has already been claimed and completed!`, 'error');
    return;
  }

  if (order.status === 'Cancelled') {
    showToast(`Pre-order #${order.id} was cancelled.`, 'error');
    return;
  }

  stopScannerCamera();
  showHandoverConfirmation(order);
}

function showHandoverConfirmation(order) {
  currentPendingClaimOrder = order;

  const activeView = document.getElementById('scanner-view-active');
  const confirmView = document.getElementById('scanner-view-confirmation');

  if (activeView) activeView.style.display = 'none';
  if (confirmView) confirmView.style.display = 'block';

  const orderIdEl = document.getElementById('confirm-order-id');
  if (orderIdEl) orderIdEl.textContent = `#${order.id}`;

  const statusEl = document.getElementById('confirm-order-status');
  if (statusEl) {
    statusEl.textContent = order.status;
    statusEl.className = `order-status-badge ${order.status === 'Ready for Pickup' || order.status === 'Confirmed' ? 'status-confirmed' : 'status-preparing'}`;
  }

  const studentNameEl = document.getElementById('confirm-student-name');
  if (studentNameEl) studentNameEl.textContent = order.studentName;

  const studentMetaEl = document.getElementById('confirm-student-meta');
  if (studentMetaEl) {
    studentMetaEl.textContent = `${order.gradeSection || 'Student'} • Slot: ${order.pickupTime}`;
  }

  const itemsListEl = document.getElementById('confirm-items-list');
  if (itemsListEl) {
    itemsListEl.innerHTML = (order.items || []).map(item => `
      <div class="handover-item-row">
        <span class="handover-item-qty">${item.quantity}x</span>
        <span class="handover-item-name">${item.name}</span>
        <span class="handover-item-price">₱${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
  }

  const noteWrap = document.getElementById('confirm-instructions-wrap');
  const noteText = document.getElementById('confirm-instructions-text');
  if (noteWrap && noteText) {
    if (order.specialInstructions && order.specialInstructions.trim()) {
      noteText.textContent = order.specialInstructions;
      noteWrap.style.display = 'block';
    } else {
      noteWrap.style.display = 'none';
    }
  }

  const totalEl = document.getElementById('confirm-order-total');
  if (totalEl) totalEl.textContent = `₱${(order.totalAmount || 0).toFixed(2)}`;
}

export function confirmPendingHandover() {
  if (!currentPendingClaimOrder) return;
  const result = SapatStorage.claimOrder(currentPendingClaimOrder.id, state.currentVendorId);
  if (result.success) {
    showToast(`Handover complete! Pre-order #${result.order.id} claimed.`, 'success');
    closeVendorScannerModal();
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'orders' } }));
  } else {
    showToast(result.message || 'Failed to claim pre-order', 'error');
  }
}

// ==========================================
// Menu Filter Modal Methods
// ==========================================
export function openMenuFilterModal() {
  const modal = document.getElementById('modal-menu-filters');
  if (!modal) return;
  populateFilterModal();
  modal.classList.add('active');
}

export function closeMenuFilterModal() {
  const modal = document.getElementById('modal-menu-filters');
  if (modal) modal.classList.remove('active');
}

function populateFilterModal() {
  const modal = document.getElementById('modal-menu-filters');
  if (!modal) return;

  // Set sort radio
  const sortRadio = modal.querySelector(`input[name="modalMenuSort"][value="${state.menuSortBy || 'recommended'}"]`);
  if (sortRadio) sortRadio.checked = true;

  // Set in-stock toggle
  const inStockCheckbox = document.getElementById('modal-filter-instock');
  if (inStockCheckbox) inStockCheckbox.checked = !!state.menuInStockOnly;

  // Vendors
  const vendors = SapatStorage.getVendors();
  const vContainer = document.getElementById('modal-filter-vendor-chips');
  if (vContainer) {
    vContainer.innerHTML = `
      <button type="button" class="filter-chip ${state.studentVendorFilter === 'all' ? 'active' : ''}" data-vendor-id="all">
        All Canteens
      </button>
      ${vendors.map(v => `
        <button type="button" class="filter-chip ${state.studentVendorFilter === v.id ? 'active' : ''}" data-vendor-id="${v.id}">
          ${v.name}
        </button>
      `).join('')}
    `;
  }

  // Categories
  const categories = [
    { id: 'all', label: 'All Dishes' },
    { id: 'rice-meals', label: 'Rice Meals' },
    { id: 'merienda', label: 'Merienda' },
    { id: 'veggies', label: 'Healthy Bowls' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'drinks', label: 'Drinks' }
  ];
  const cContainer = document.getElementById('modal-filter-cat-chips');
  if (cContainer) {
    cContainer.innerHTML = categories.map(cat => `
      <button type="button" class="filter-chip ${state.selectedCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
        ${cat.label}
      </button>
    `).join('');
  }
}

