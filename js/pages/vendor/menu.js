import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { openAddDishModal, openEditDishModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';
import { ForecastingService } from '../../services/forecasting.service.js';

export const vendorMenuPage = {
  _unsubscribe: null,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'vendor-changed' || event === 'data-reset' || event === 'menu-updated') {
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

    const activeTab = state.vendorMenuTab || 'all';
    if (activeTab !== 'all') {
      vendorDishes = vendorDishes.filter(d => d.category === activeTab);
    }

    // Pull forecast to show subtle smart indicators only on select dishes
    const forecast = ForecastingService.getVendorForecast(state.currentVendorId);
    const forecastMap = new Map((forecast.dishes || []).map(d => [d.dishId, d]));

    const categories = [
      { id: 'all', label: 'All Dishes', icon: '<path d="M4 6h16M4 12h16M4 18h16"></path>' },
      { id: 'rice-meals', label: 'Rice Meals', icon: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path>' },
      { id: 'merienda', label: 'Merienda', icon: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>' },
      { id: 'veggies', label: 'Healthy Bowls', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' },
      { id: 'drinks', label: 'Beverages', icon: '<path d="M5 4h14l-1.5 14.5a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5L5 4z"></path>' }
    ];

    container.innerHTML = `
      <section class="screen active" id="screen-vendor-menu">
        
        <!-- Header: Stall Name & Add Dish Action -->
        <div class="v-page-header-row">
          <div class="v-header-title-wrap">
            <h2 class="page-main-heading">${currentVendor.name} Menu Catalog</h2>
            <p class="page-main-sub">${currentVendor.stallNumber} &bull; Manage dishes, daily cooking quotas, and online pre-order availability</p>
          </div>
          <button class="btn-primary-action v-add-dish-btn" data-action="add-dish" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add New Dish</span>
          </button>
        </div>

        <!-- Category Filter Tabs -->
        <div class="v-category-chips-nav">
          ${categories.map(cat => `
            <button class="v-cat-pill ${activeTab === cat.id ? 'active' : ''}" data-action="filter-vendor-menu" data-cat-id="${cat.id}" type="button">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${cat.icon}
              </svg>
              <span>${cat.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Dishes Management Grid -->
        <div class="v-menu-manage-stack">
          ${vendorDishes.length === 0 ? `
            <div class="v-empty-menu-box">
              <div class="empty-state-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <h3>No dishes in this category</h3>
              <p>Add freshly prepared meals or select another category above.</p>
              <button class="btn-primary-action" style="margin-top: 12px; width: auto; padding: 0 18px;" data-action="add-dish">+ Add New Dish</button>
            </div>
          ` : vendorDishes.map(dish => {
            const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
            const isSoldOut = remaining <= 0;
            const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
            const isHighDemand = pct >= 70;
            const dishForecast = forecastMap.get(dish.id);

            return `
              <div class="v-dish-manage-card ${!dish.isAvailable ? 'v-dish-inactive' : ''}">
                <div class="v-dish-card-body">
                  <div class="v-dish-thumb-wrap">
                    <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                    ${!dish.isAvailable ? `
                      <div class="v-dish-hidden-scrim">
                        <span>Hidden</span>
                      </div>
                    ` : ''}
                    <span class="v-dish-stall-badge">${dish.vendorStall || currentVendor.stallNumber}</span>
                  </div>
                  
                  <div class="v-dish-info-col">
                    <div class="v-dish-header-row">
                      <div class="v-dish-name-wrap">
                        <h4 class="v-dish-title">${dish.name}</h4>
                        <span class="v-dish-cat-label">${dish.categoryName || 'Ulam'}</span>
                      </div>
                      <span class="v-dish-price">₱${dish.price}</span>
                    </div>

                    <!-- Subtle AI Indicator (shown only on high demand dishes) -->
                    ${dishForecast && dishForecast.actionType === 'increase' ? `
                      <div class="v-dish-ai-notice">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        <span>Forecast: High Demand &bull; ${dishForecast.suggestedTarget} suggested</span>
                      </div>
                    ` : ''}

                    <!-- Quota Breakdown Grid -->
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
                        <strong class="v-cell-val ${isSoldOut ? 'soldout' : (remaining <= 5 ? 'warning' : '')}">${remaining}</strong>
                      </div>
                    </div>

                    <!-- Quota Progress Bar -->
                    <div class="v-dish-quota-bar">
                      <div class="v-dish-quota-fill ${isSoldOut ? 'soldout' : (isHighDemand ? 'warning' : '')}" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                </div>

                <!-- Footer: Availability Toggle & Edit Dish Action -->
                <div class="v-dish-footer-actions">
                  <div class="v-toggle-status-wrap">
                    <label class="switch-toggle" title="Toggle active in canteen menu">
                      <input type="checkbox" data-action="toggle-availability" data-dish-id="${dish.id}" ${dish.isAvailable ? 'checked' : ''}>
                      <span class="slider-round"></span>
                    </label>
                    <span class="v-toggle-status-text">${dish.isAvailable ? 'Available for Pre-order' : 'Hidden from Menu'}</span>
                  </div>

                  <button class="btn-edit-dish" data-action="edit-dish" data-dish-id="${dish.id}" type="button">
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
