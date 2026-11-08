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
      { id: 'rice-meals', label: 'Kanin at Ulam' },
      { id: 'merienda', label: 'Meryenda' },
      { id: 'veggies', label: 'Gulay & Healthy' },
      { id: 'drinks', label: 'Inumin' }
    ];

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-menu">
        <div class="vendor-account-bar">
          ${renderVendorAccountBar(state.currentVendorId, vendors)}
        </div>

        <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3>${currentVendor.stallNumber} Menu Management</h3>
            <p>Control preparation limits and availability for ${currentVendor.name}</p>
          </div>
          <button class="btn-primary-action" data-action="add-dish" style="height: 36px; padding: 0 14px; font-size: 12px; white-space: nowrap;">
            + Add Dish
          </button>
        </div>

        <!-- Category Filter -->
        <div class="chip-filter-scroll" style="margin-bottom: 12px;">
          ${categories.map(cat => `
            <button class="chip-btn ${state.vendorMenuTab === cat.id ? 'active' : ''}" data-action="filter-vendor-menu" data-cat-id="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <!-- Dishes List -->
        <div class="vendor-menu-list-wrap" style="display: flex; flex-direction: column; gap: 10px;">
          ${vendorDishes.length === 0 ? `
            <div class="empty-state-wrap" style="padding: 30px 16px;">
              <p>No dishes found in this category.</p>
              <button class="btn-secondary-action" style="margin-top: 10px;" data-action="add-dish">+ Add New Dish</button>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            return `
              <div class="v-dish-row-card" style="background: var(--surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--surface-muted);">
                  <img src="${dish.image}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                </div>
                <div style="flex: 1;">
                  <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 2px;">${dish.name}</h4>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">${dish.categoryName} &bull; ₱${dish.price}</div>
                  <div style="font-size: 11.5px;">
                    <strong>${dish.reservedServings}</strong> of ${dish.dailyLimit} reserved (${remaining} left)
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                  <label class="switch">
                    <input type="checkbox" data-action="toggle-availability" data-dish-id="${dish.id}" ${dish.isAvailable ? 'checked' : ''}>
                    <span class="slider"></span>
                  </label>
                  <button class="btn-bump" data-action="edit-dish" data-dish-id="${dish.id}">Edit</button>
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

    container.addEventListener('change', (e) => {
      // Toggle availability
      const toggle = e.target.closest('[data-action="toggle-availability"]');
      if (toggle) {
        const dishId = toggle.getAttribute('data-dish-id');
        const isChecked = toggle.checked;
        const menu = SapatStorage.getMenu();
        const dish = menu.find(d => d.id === dishId);
        if (dish) {
          dish.isAvailable = isChecked;
          SapatStorage.saveMenu(menu);
          showToast(`${dish.name} is now ${isChecked ? 'Available' : 'Hidden'} for students`, 'info');
        }
      }
    });
  }
};
