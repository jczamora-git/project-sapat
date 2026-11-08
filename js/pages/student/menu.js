import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { renderStudentFoodCard } from '../../components/food-card.js';
import { openMealModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentMenuPage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const activeV = state.studentVendorFilter;

    let filtered = menu.filter(d => d.isAvailable);

    // Filter by selected vendor
    if (activeV !== 'all') {
      filtered = filtered.filter(d => d.vendorId === activeV);
    }

    // Filter by category
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(d => d.category === state.selectedCategory);
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.description.toLowerCase().includes(q) ||
        (d.categoryName && d.categoryName.toLowerCase().includes(q)) ||
        (d.vendorName && d.vendorName.toLowerCase().includes(q)) ||
        (d.vendorStall && d.vendorStall.toLowerCase().includes(q))
      );
    }

    const categories = [
      { id: 'all', label: 'All Dishes' },
      { id: 'rice-meals', label: 'Kanin at Ulam' },
      { id: 'merienda', label: 'Meryenda' },
      { id: 'veggies', label: 'Gulay & Healthy' },
      { id: 'drinks', label: 'Inumin' }
    ];

    container.innerHTML = `
      <section class="screen active" id="screen-student-menu">
        <div id="menu-canteen-selector-wrap">
          <div class="canteen-tabs-bar">
            <button class="canteen-tab-pill ${activeV === 'all' ? 'active' : ''}" data-action="filter-vendor" data-vendor-id="all">
              All Canteens (5)
            </button>
            ${vendors.map(v => `
              <button class="canteen-tab-pill ${activeV === v.id ? 'active' : ''}" data-action="filter-vendor" data-vendor-id="${v.id}">
                ${v.stallNumber}: ${v.name}
              </button>
            `).join('')}
          </div>

          ${activeV !== 'all' ? (() => {
            const v = SapatStorage.getVendorById(activeV);
            const vDishes = menu.filter(d => d.vendorId === v.id);
            const vLeft = vDishes.reduce((sum, d) => sum + Math.max(0, d.dailyLimit - d.reservedServings), 0);
            return `
              <div class="selected-canteen-header-card">
                <div class="s-canteen-left">
                  <div class="s-canteen-avatar" style="background: ${v.avatarColor};">${v.avatar}</div>
                  <div>
                    <div class="s-canteen-stall">${v.stallNumber} &bull; <span style="color:#059669; font-weight:700;">${v.statusText}</span></div>
                    <h3 class="s-canteen-name">${v.name}</h3>
                    <p class="s-canteen-hours"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${v.hours} &bull; <strong>${vLeft} portions</strong> ready to reserve</p>
                  </div>
                </div>
                <button class="btn-switch-canteen" data-action="filter-vendor" data-vendor-id="all">
                  All Stalls
                </button>
              </div>
            `;
          })() : `
            <div class="all-canteens-notice">
              <span>Showing meals from all 5 school canteen stalls. Tap a stall above to view only its menu.</span>
            </div>
          `}
        </div>

        <!-- Search Bar -->
        <div class="search-bar-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="search-input" id="menu-search-input" placeholder="Search dish, stall, or ingredients..." value="${state.searchQuery}">
        </div>

        <!-- Category Filter Chips -->
        <div class="chip-filter-scroll" id="category-filter-chips">
          ${categories.map(cat => `
            <button class="chip-btn ${state.selectedCategory === cat.id ? 'active' : ''}" data-action="filter-category" data-cat-id="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <!-- Food List Grid -->
        <div class="food-cards-list" id="menu-food-list" style="margin-top: 14px;">
          ${filtered.length > 0 ? filtered.map(dish => renderStudentFoodCard(dish)).join('') : `
            <div class="empty-state-wrap">
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h3>No matching meals found</h3>
              <p>Try searching for other dishes or tap 'All Canteens' to browse the other stalls.</p>
              <button class="btn-primary-action" style="margin-top: 10px;" data-action="filter-vendor" data-vendor-id="all">View All Canteens</button>
            </div>
          `}
        </div>
      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    // 1. Search Input
    const searchInput = container.querySelector('#menu-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        this.render(container);
        // keep focus in input
        const updatedInput = container.querySelector('#menu-search-input');
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.selectionStart = updatedInput.selectionEnd = updatedInput.value.length;
        }
      });
    }

    // 2. Click Delegation
    container.addEventListener('click', (e) => {
      // Vendor Filter Tab
      const vendorBtn = e.target.closest('[data-action="filter-vendor"]');
      if (vendorBtn) {
        const vId = vendorBtn.getAttribute('data-vendor-id');
        if (vId) {
          state.setStudentVendorFilter(vId);
          this.render(container);
          const v = SapatStorage.getVendorById(vId);
          if (v && vId !== 'all') {
            showToast(`Viewing menu for ${v.name} (${v.stallNumber})`, 'info');
          }
        }
        return;
      }

      // Category Chip
      const catBtn = e.target.closest('[data-action="filter-category"]');
      if (catBtn) {
        const catId = catBtn.getAttribute('data-cat-id');
        if (catId) {
          state.selectedCategory = catId;
          this.render(container);
        }
        return;
      }

      // Quick Add
      const quickAddBtn = e.target.closest('[data-action="quick-add"]');
      if (quickAddBtn) {
        e.stopPropagation();
        const dishId = quickAddBtn.getAttribute('data-dish-id');
        const dish = SapatStorage.getMenu().find(d => d.id === dishId);
        if (dish) {
          const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
          const inCart = (state.cart.find(i => i.id === dish.id)?.quantity || 0);
          if (inCart >= remaining) {
            showToast(`Cannot add more! Only ${remaining} portions left today.`, 'error');
            return;
          }
          state.addToCart(dish, 1);
          showToast(`Added ${dish.name} to tray!`, 'success');
        }
        return;
      }

      // Open Meal Modal
      const mealCard = e.target.closest('[data-action="open-meal"]');
      if (mealCard) {
        const dishId = mealCard.getAttribute('data-dish-id');
        if (dishId) {
          openMealModal(dishId);
        }
      }
    });
  }
};

