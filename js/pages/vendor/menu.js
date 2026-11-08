import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { openAddDishModal, openEditDishModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';

export const vendorMenuPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset') {
          const currentScreen = document.getElementById('screen-vendor-menu');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const currentVendor = SapatStorage.getVendorById(state.currentVendorId);
    if (!currentVendor) return;

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
        
        <!-- Page Title & Header Actions -->
        <div class="page-title-wrap" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
          <div>
            <h2 class="page-main-heading">${currentVendor.stallNumber} Dishes</h2>
            <p class="page-main-sub">Control daily prep limits & availability for ${currentVendor.name}</p>
          </div>
          <button class="btn-primary-action" data-action="add-dish" style="width: auto; height: 36px; padding: 0 14px; font-size: 12px; white-space: nowrap; flex-shrink: 0;">
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
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <p>No dishes found in this category.</p>
              <button class="btn-primary-action" style="margin-top: 10px; width: auto; padding: 0 16px;" data-action="add-dish">+ Add New Dish</button>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

            return `
              <div class="v-dish-manage-card">
                <div class="v-dish-card-body">
                  <div class="v-dish-thumb-wrap">
                    <img src="${dish.image}" alt="${dish.name}" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                    <span class="v-dish-thumb-tag">${dish.vendorStall || 'Stall'}</span>
                  </div>
                  
                  <div class="v-dish-info-col">
                    <div class="v-dish-header-row">
                      <h4 class="v-dish-title">${dish.name}</h4>
                      <span class="v-dish-price">₱${dish.price}</span>
                    </div>
                    
                    <span class="v-dish-cat-label">${dish.categoryName || 'Ulam'}</span>

                    <!-- Quota Statistics Breakdown -->
                    <div class="v-dish-stats-grid">
                      <div class="v-stat-cell">
                        <span class="v-cell-label">Daily Limit</span>
                        <strong class="v-cell-val">${dish.dailyLimit}</strong>
                      </div>
                      <div class="v-stat-cell">
                        <span class="v-cell-label">Reserved</span>
                        <strong class="v-cell-val">${dish.reservedServings}</strong>
                      </div>
                      <div class="v-stat-cell">
                        <span class="v-cell-label">Remaining</span>
                        <strong class="v-cell-val ${isSoldOut ? 'soldout' : ''}">${remaining}</strong>
                      </div>
                    </div>

                    <!-- Mini Quota Bar -->
                    <div class="v-dish-quota-bar" style="margin-top: 6px;">
                      <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : (pct >= 70 ? 'warning' : '')}" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                </div>

                <!-- Footer Actions: Availability Toggle & Edit Action -->
                <div class="v-dish-footer-actions">
                  <div class="v-toggle-status-wrap">
                    <label class="switch-toggle" title="Toggle active in canteen menu">
                      <input type="checkbox" data-action="toggle-availability" data-dish-id="${dish.id}" ${dish.isAvailable ? 'checked' : ''}>
                      <span class="slider-round"></span>
                    </label>
                    <span class="v-toggle-status-text">${dish.isAvailable ? 'Active on Menu' : 'Hidden from Menu'}</span>
                  </div>

                  <button class="btn-edit-dish" data-action="edit-dish" data-dish-id="${dish.id}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    <span>Edit Dish</span>
                  </button>
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
          showToast(`Dish is now ${isChecked ? 'active on canteen menu' : 'hidden from students'}`, 'info');
          this.render(container);
        }
      }
    });
  }
};
