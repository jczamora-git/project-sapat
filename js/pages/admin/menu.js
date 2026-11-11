import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { openAddDishModal, openEditDishModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { getImgFallback } from '../../components/food-card.js';

export const adminMenuPage = {
  _unsubscribe: null,
  activeStallFilter: 'all',
  activeCatFilter: 'all',
  searchQuery: '',

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'role-changed' || event === 'data-reset') {
          const currentScreen = document.getElementById('screen-admin-menu');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();

    let filtered = menu;
    if (this.activeStallFilter !== 'all') {
      filtered = filtered.filter(d => d.vendorId === this.activeStallFilter);
    }
    if (this.activeCatFilter !== 'all') {
      filtered = filtered.filter(d => d.category === this.activeCatFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(q) || 
        (d.vendorName && d.vendorName.toLowerCase().includes(q)) ||
        (d.categoryName && d.categoryName.toLowerCase().includes(q))
      );
    }

    container.innerHTML = `
      <section class="screen active admin-screen" id="screen-admin-menu">
        
        <!-- Header -->
        <div class="admin-page-header">
          <div class="admin-header-left">
            <div class="admin-campus-pill">
              <span class="admin-live-dot"></span>
              <span>Campus Catalog &amp; Oversight &bull; All Canteens</span>
            </div>
            <h2 class="admin-main-title">Campus Menu Catalog &amp; Oversight</h2>
            <p class="admin-main-sub">Campus-level visibility over stall offerings, pricing, and vendor daily cooking thresholds</p>
          </div>
          <div class="admin-header-actions">
            <button class="btn-admin-action primary" data-action="admin-add-dish">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Add New Dish</span>
            </button>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="admin-filter-toolbar">
          <div class="admin-search-input-wrap">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="admin-search-input" id="admin-menu-search" placeholder="Search dish title, stall, or category..." value="${this.searchQuery}">
          </div>
          
          <div class="admin-filter-chips-row">
            <button class="admin-pill-tab ${this.activeStallFilter === 'all' ? 'active' : ''}" data-action="filter-stall" data-stall="all">
              All Stalls (${menu.length})
            </button>
            ${vendors.map(v => `
              <button class="admin-pill-tab ${this.activeStallFilter === v.id ? 'active' : ''}" data-action="filter-stall" data-stall="${v.id}">
                ${v.stallNumber}: ${v.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Catalog Table -->
        <div class="admin-table-card">
          <div class="admin-table-responsive">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Stall</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Daily Prep Limit</th>
                  <th>Booked</th>
                  <th>Remaining</th>
                  <th>Menu Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align: center; padding: 24px; color: var(--text-secondary);">
                      No dishes found matching your current filter criteria.
                    </td>
                  </tr>
                ` : filtered.map(dish => {
                  const remaining = SapatStorage.getDishAvailablePortions ? SapatStorage.getDishAvailablePortions(dish.id) : Math.max(0, dish.dailyLimit - dish.reservedServings);
                  const isSoldOut = remaining <= 0;
                  const pct = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

                  return `
                    <tr>
                      <td>
                        <div class="table-dish-media-col">
                          <img class="dish-table-thumb" src="${dish.image}" alt="${dish.name}" onerror="this.onerror=null; this.src='${getImgFallback()}';">
                          <div class="dish-table-title-wrap">
                            <strong class="dish-table-name">${dish.name}</strong>
                            <span class="dish-table-desc">${dish.description ? dish.description.slice(0, 48) + '...' : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td><span class="table-stall-pill">${dish.vendorStall || 'Stall'}</span></td>
                      <td><span class="table-cat-text">${dish.categoryName || 'Ulam'}</span></td>
                      <td><strong class="table-price-text">₱${dish.price}</strong></td>
                      <td>
                        <div class="table-quota-adjust-cell">
                          <strong class="quota-number">${dish.dailyLimit}</strong>
                          <span class="quota-unit">portions</span>
                        </div>
                      </td>
                      <td>
                        <div class="table-progress-cell">
                          <span>${dish.reservedServings} (${pct}%)</span>
                          <div class="mini-progress-track">
                            <div class="mini-progress-fill ${isSoldOut ? 'soldout' : (pct >= 70 ? 'warning' : 'green')}" style="width: ${pct}%;"></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong class="table-remain-text ${isSoldOut ? 'text-red' : ''}">${remaining} left</strong>
                      </td>
                      <td>
                        <label class="switch-toggle" title="Toggle Canteen Availability">
                          <input type="checkbox" data-action="admin-toggle-dish" data-dish-id="${dish.id}" ${dish.isAvailable ? 'checked' : ''}>
                          <span class="slider-round"></span>
                        </label>
                      </td>
                      <td>
                        <button class="btn-table-edit" data-action="admin-edit-dish" data-dish-id="${dish.id}">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    // Search input
    const searchInput = container.querySelector('#admin-menu-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
      });
    }

    container.addEventListener('click', (e) => {
      // Stall filter
      const stallBtn = e.target.closest('[data-action="filter-stall"]');
      if (stallBtn) {
        this.activeStallFilter = stallBtn.getAttribute('data-stall') || 'all';
        this.render(container);
        return;
      }

      // Add dish
      const addBtn = e.target.closest('[data-action="admin-add-dish"]');
      if (addBtn) {
        openAddDishModal();
        return;
      }

      // Edit dish
      const editBtn = e.target.closest('[data-action="admin-edit-dish"]');
      if (editBtn) {
        const dishId = editBtn.getAttribute('data-dish-id');
        if (dishId) {
          openEditDishModal(dishId);
        }
        return;
      }
    });

    // Toggle dish availability
    container.addEventListener('change', (e) => {
      const toggle = e.target.closest('[data-action="admin-toggle-dish"]');
      if (toggle) {
        const dishId = toggle.getAttribute('data-dish-id');
        const isChecked = toggle.checked;
        const success = SapatStorage.toggleDishAvailability(dishId, isChecked);
        if (success) {
          showToast(`Dish is now ${isChecked ? 'visible on student menu' : 'hidden from student menu'}`, 'info');
          this.render(container);
        }
      }
    });
  }
};

