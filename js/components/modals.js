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

  const addBtn = document.getElementById('modal-btn-add');
  if (addBtn) {
    addBtn.disabled = isSoldOut;
    addBtn.textContent = isSoldOut ? 'Daily Limit Reached (Sold Out)' : 'Add to Preorder';
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
  const remaining = Math.max(0, state.selectedMealForModal.dailyLimit - state.selectedMealForModal.reservedServings);

  const existingInCart = state.cart.find(i => i.id === state.selectedMealForModal.id);
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
  if (qtyEl) qtyEl.textContent = state.modalMealQty;
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
  document.getElementById('edit-dish-img-url').value = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80';
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
  const image = document.getElementById('edit-dish-img-url').value.trim() || 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80';
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
  if (passStallInfo) {
    passStallInfo.textContent = `Present at ${order.vendorStall || 'Stall Window'} (${order.vendorName || 'Canteen Counter'}) to claim.`;
  }

  const modal = document.getElementById('modal-pickup-pass');
  if (modal) modal.classList.add('active');
}

export function closePickupPass() {
  const modal = document.getElementById('modal-pickup-pass');
  if (modal) modal.classList.remove('active');
}

