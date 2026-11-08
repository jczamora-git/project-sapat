import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { renderStudentFoodCard, renderFeaturedMealCard } from '../../components/food-card.js';
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
      { id: 'rice-meals', label: 'Rice Meals' },
      { id: 'merienda', label: 'Merienda' },
      { id: 'veggies', label: 'Healthy Bowls' },
      { id: 'drinks', label: 'Beverages' }
    ];

    container.innerHTML = `
      <section class="screen active" id="screen-student-menu">
        
        <!-- Page Title & Header -->
        <div class="page-title-wrap">
          <h2 class="page-main-heading">Canteen Menu</h2>
          <p class="page-main-sub">Pre-order exact portions from 5 campus stalls</p>
        </div>

        <!-- Clean Vendor Selector Tabs -->
        <div class="vendor-filter-strip" id="menu-vendor-strip">
          <button class="vendor-pill-tab ${activeV === 'all' ? 'active' : ''}" data-action="filter-vendor" data-vendor-id="all">
            All Stalls (5)
          </button>
          ${vendors.map(v => `
            <button class="vendor-pill-tab ${activeV === v.id ? 'active' : ''}" data-action="filter-vendor" data-vendor-id="${v.id}">
              ${v.stallNumber}: ${v.name}
            </button>
          `).join('')}
        </div>

        <!-- Active Vendor Info Banner (If Filtered) -->
        ${activeV !== 'all' ? (() => {
          const v = SapatStorage.getVendorById(activeV);
          const vDishes = menu.filter(d => d.vendorId === v.id);
          const vLeft = vDishes.reduce((sum, d) => sum + Math.max(0, d.dailyLimit - d.reservedServings), 0);
          return `
            <div class="selected-vendor-banner">
              <div class="v-banner-left">
                <span class="v-banner-stall">${v.stallNumber} &bull; ${v.statusText}</span>
                <h3 class="v-banner-title">${v.name}</h3>
                <span class="v-banner-meta">${v.hours} &bull; <strong>${vLeft} portions available</strong> today</span>
              </div>
              <button class="v-banner-reset-btn" data-action="filter-vendor" data-vendor-id="all">
                All Stalls
              </button>
            </div>
          `;
        })() : ''}

        <!-- Modern Search Bar -->
        <div class="menu-search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="menu-search-input" id="menu-search-input" placeholder="Search dish, stall, or ulam..." value="${state.searchQuery}">
          ${state.searchQuery ? `
            <button class="search-clear-btn" data-action="clear-search">&times;</button>
          ` : ''}
        </div>

        <!-- Horizontal Food Categories -->
        <div class="category-chips-strip" id="category-filter-chips">
          ${categories.map(cat => `
            <button class="cat-chip-btn ${state.selectedCategory === cat.id ? 'active' : ''}" data-action="filter-category" data-cat-id="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <!-- Image-Focused Food Listings (2-Column Grid for Discovery) -->
        <div class="menu-food-grid" id="menu-food-grid">
          ${filtered.length > 0 ? filtered.map(dish => renderFeaturedMealCard(dish)).join('') : `
            <div class="empty-state-wrap">
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h3>No matching dishes found</h3>
              <p>Try searching for a different dish or select another canteen stall.</p>
              <button class="btn-primary-action" style="margin-top: 10px; width: auto; padding: 0 18px;" data-action="reset-filters">
                Show All Dishes
              </button>
            </div>
          `}
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    // Search input
    const searchInput = container.querySelector('#menu-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        this.render(container);
        const updatedInput = container.querySelector('#menu-search-input');
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.selectionStart = updatedInput.selectionEnd = updatedInput.value.length;
        }
      });
    }

    container.addEventListener('click', (e) => {
      // Clear search
      const clearBtn = e.target.closest('[data-action="clear-search"]');
      if (clearBtn) {
        state.searchQuery = '';
        this.render(container);
        return;
      }

      // Reset filters
      const resetBtn = e.target.closest('[data-action="reset-filters"]');
      if (resetBtn) {
        state.searchQuery = '';
        state.studentVendorFilter = 'all';
        state.selectedCategory = 'all';
        this.render(container);
        return;
      }

      // Vendor tab
      const vendorBtn = e.target.closest('[data-action="filter-vendor"]');
      if (vendorBtn) {
        const vId = vendorBtn.getAttribute('data-vendor-id');
        if (vId) {
          state.setStudentVendorFilter(vId);
          this.render(container);
        }
        return;
      }

      // Category chip
      const catBtn = e.target.closest('[data-action="filter-category"]');
      if (catBtn) {
        const catId = catBtn.getAttribute('data-cat-id');
        if (catId) {
          state.setSelectedCategory(catId);
          this.render(container);
        }
        return;
      }

      // Quick add to cart
      const quickAddBtn = e.target.closest('[data-action="quick-add"]');
      if (quickAddBtn) {
        e.stopPropagation();
        const dishId = quickAddBtn.getAttribute('data-dish-id');
        const dish = SapatStorage.getDishById(dishId);
        if (dish) {
          const success = state.addToCart(dish, 1);
          if (success) {
            showToast(`Added 1x ${dish.name} to tray`, 'success');
          }
        }
        return;
      }

      // Open meal details modal
      const mealEl = e.target.closest('[data-action="open-meal"]');
      if (mealEl) {
        const dishId = mealEl.getAttribute('data-dish-id');
        if (dishId) {
          openMealModal(dishId);
          return;
        }
      }
    });
  }
};
