import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { renderVendorAccountBar } from '../../components/vendor-card.js';
import { openAddDishModal, openEditDishModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';

export const vendorMenuPage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    const menu = SapatStorage.getMenu();

    let vendorDishes = menu.filter(d => d.vendorId === state.currentVendorId);
    if (state.vendorMenuTab !== 'all') {
      vendorDishes = vendorDishes.filter(d => d.category === state.vendorMenuTab);
    }

    const categories = [
      { id: 'all', label: 'All Dishes' },
      { id: 'rice-meals', label: 'Rice Meals' },
      { id: 'merienda', label: 'Merienda' },
      { id: 'veggies', label: 'Healthy Bowls' },
      { id: 'drinks', label: 'Beverages' }
    ];

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-menu">
        
        <!-- Stall Account Selector Bar -->
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <!-- Section Header -->
        <div class="page-title-wrap" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2 class="page-main-heading">${currentVendor.stallNumber} Dishes</h2>
            <p class="page-main-sub">Control daily prep limits & availability for ${currentVendor.name}</p>
          </div>
          <button class="btn-primary-action" data-action="add-dish" style="width: auto; height: 34px; padding: 0 14px; font-size: 11.5px;">
            + Add Dish
          </button>
        </div>

        <!-- Category Filter -->
        <div class="category-chips-strip">
          ${categories.map(cat => `
            <button class="cat-chip-btn ${state.vendorMenuTab === cat.id ? 'active' : ''}" data-action="filter-vendor-menu" data-cat-id="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <!-- Dishes Management Stack -->
        <div class="v-menu-manage-stack">
          ${vendorDishes.length === 0 ? `
            <div class="empty-state-wrap">
              <p>No dishes found in this category.</p>
              <button class="btn-primary-action" style="margin-top: 10px; width: auto; padding: 0 16px;" data-action="add-dish">+ Add New Dish</button>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            return `
              <div class="v-dish-manage-card">
                <div class="v-dish-thumb-wrap">
                  <img src="${dish.image}" alt="${dish.name}" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                </div>
                
                <div class="v-dish-info-col">
                  <h4 class="v-dish-title">${dish.name}</h4>
                  <div class="v-dish-price-line">₱${dish.price} &bull; <span class="v-cat-name">${dish.categoryName}</span></div>
                  <div class="v-dish-quota-meta">
                    <strong>${dish.reservedServings}</strong> of ${dish.dailyLimit} reserved (<span class="${isSoldOut ? 'text-danger' : 'text-primary'}">${remaining} left</span>)
                  </div>
                </div>

                <div class="v-dish-controls-col">
                  <label class="switch-toggle" title="Toggle active in canteen menu">
                    <input type="checkbox" data-action="toggle-availability" data-dish-id="${dish.id}" ${dish.isAvailable ? 'checked' : ''}>
                    <span class="slider-round"></span>
                  </label>
                  <button class="btn-edit-dish" data-action="edit-dish" data-dish-id="${dish.id}">Edit</button>
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
      // Category filter
      const catBtn = e.target.closest('[data-action="filter-vendor-menu"]');
      if (catBtn) {
        const catId = catBtn.getAttribute('data-cat-id');
        if (catId) {
          state.vendorMenuTab = catId;
          this.render(container);
        }
        return;
      }

      // Add dish
      const addBtn = e.target.closest('[data-action="add-dish"]');
      if (addBtn) {
        openAddDishModal();
        return;
      }

      // Edit dish
      const editBtn = e.target.closest('[data-action="edit-dish"]');
      if (editBtn) {
        const dishId = editBtn.getAttribute('data-dish-id');
        if (dishId) {
          openEditDishModal(dishId);
        }
        return;
      }
    });

    // Toggle availability
    container.addEventListener('change', (e) => {
      const toggle = e.target.closest('[data-action="toggle-availability"]');
      if (toggle) {
        const dishId = toggle.getAttribute('data-dish-id');
        const isChecked = toggle.checked;
        const success = SapatStorage.toggleDishAvailability(dishId, isChecked);
        if (success) {
          showToast(`Dish is now ${isChecked ? 'available in menu' : 'hidden from students'}`, 'info');
        }
      }
    });
  }
};
