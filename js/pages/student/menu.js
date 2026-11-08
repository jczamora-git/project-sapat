import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { renderFeaturedMealCard } from '../../components/food-card.js';
import { openMealModal, openMenuFilterModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentMenuPage = {
  _unsubscribe: null,

  render(container) {
    // Subscribe to state updates if not already subscribed
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (
          event === 'menu-filter-changed' ||
          event === 'menu-sort-changed' ||
          event === 'category-changed' ||
          event === 'student-vendor-filter-changed' ||
          event === 'cart-updated'
        ) {
          // Re-render if the menu screen is currently in DOM
          const currentScreen = document.getElementById('screen-student-menu');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const activeV = state.studentVendorFilter || 'all';
    const activeCat = state.selectedCategory || 'all';
    const cartCount = state.getCartCount();

    // Visual image-based category tiles
    const visualCategories = [
      { 
        id: 'all', 
        label: 'All Dishes', 
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=320&q=80' 
      },
      { 
        id: 'rice-meals', 
        label: 'Rice Meals', 
        img: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=320&q=80' 
      },
      { 
        id: 'merienda', 
        label: 'Merienda', 
        img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=320&q=80' 
      },
      { 
        id: 'veggies', 
        label: 'Healthy Bowls', 
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=320&q=80' 
      },
      { 
        id: 'snacks', 
        label: 'Snacks', 
        img: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=320&q=80' 
      },
      { 
        id: 'drinks', 
        label: 'Drinks', 
        img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=320&q=80' 
      }
    ];

    // Compute active filter count for badge
    let activeFilterCount = 0;
    if (activeV !== 'all') activeFilterCount++;
    if (activeCat !== 'all') activeFilterCount++;
    if (state.menuInStockOnly) activeFilterCount++;
    if (state.menuSortBy && state.menuSortBy !== 'recommended') activeFilterCount++;

    // 1. Base availability
    let filtered = menu.filter(d => d.isAvailable);

    // 2. In-stock availability filter
    if (state.menuInStockOnly) {
      filtered = filtered.filter(d => (d.dailyLimit - d.reservedServings) > 0);
    }

    // 3. Vendor filter
    if (activeV !== 'all') {
      filtered = filtered.filter(d => d.vendorId === activeV);
    }

    // 4. Category filter
    if (activeCat !== 'all') {
      if (activeCat === 'snacks') {
        filtered = filtered.filter(d => 
          d.category === 'merienda' || 
          d.category === 'snacks' || 
          d.name.toLowerCase().includes('lumpia') || 
          d.name.toLowerCase().includes('turon') ||
          (d.tags && d.tags.some(t => t.toLowerCase().includes('snack')))
        );
      } else {
        filtered = filtered.filter(d => d.category === activeCat);
      }
    }

    // 5. Search query
    if (state.searchQuery && state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(q) || 
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.categoryName && d.categoryName.toLowerCase().includes(q)) ||
        (d.vendorName && d.vendorName.toLowerCase().includes(q)) ||
        (d.vendorStall && d.vendorStall.toLowerCase().includes(q))
      );
    }

    // 6. Sorting
    if (state.menuSortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (state.menuSortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      // Default: Recommended (In-stock first, then preserve catalog ordering)
      filtered.sort((a, b) => {
        const aRem = Math.max(0, a.dailyLimit - a.reservedServings);
        const bRem = Math.max(0, b.dailyLimit - b.reservedServings);
        if ((aRem > 0) !== (bRem > 0)) {
          return aRem > 0 ? -1 : 1;
        }
        return 0;
      });
    }

    const hasActiveFilters = activeV !== 'all' || activeCat !== 'all' || !!state.searchQuery || state.menuInStockOnly || (state.menuSortBy && state.menuSortBy !== 'recommended');

    container.innerHTML = `
      <section class="screen active" id="screen-student-menu">
        
        <!-- A. Dedicated Catalog Page Header -->
        <div class="menu-page-header">
          <div class="menu-header-text">
            <h2 class="menu-header-title">Explore Menu</h2>
            <p class="menu-header-sub">Find meals available for preorder.</p>
          </div>
          <button class="menu-header-cart-btn" data-route="#/student/cart" title="View Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span class="menu-cart-badge ${cartCount > 0 ? 'visible' : ''}">${cartCount}</span>
          </button>
        </div>

        <!-- B. Search & Filter Bar -->
        <div class="menu-search-filter-row">
          <div class="menu-search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="menu-search-input" id="menu-search-input" placeholder="Search dishes, stalls, or ulam..." value="${state.searchQuery || ''}">
            ${state.searchQuery ? `
              <button class="search-clear-btn" data-action="clear-search" title="Clear search">&times;</button>
            ` : ''}
          </div>
          <button class="menu-filter-btn ${activeFilterCount > 0 ? 'has-filters' : ''}" data-action="open-filter-modal" title="Filter & Sort">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span>Filters</span>
            ${activeFilterCount > 0 ? `<span class="filter-count-badge">${activeFilterCount}</span>` : ''}
          </button>
        </div>

        <!-- C. Browse by Category (Image-Based Tiles) -->
        <div class="menu-section-header">
          <span class="menu-section-title">Browse by Category</span>
        </div>
        <div class="menu-category-scroll" id="menu-category-scroll">
          ${visualCategories.map(cat => {
            const isSelected = activeCat === cat.id;
            return `
              <div class="menu-category-card ${isSelected ? 'active' : ''}" data-action="filter-category" data-cat-id="${cat.id}">
                <img src="${cat.img}" alt="${cat.label}" loading="lazy">
                <div class="cat-scrim"></div>
                <span class="cat-label">${cat.label}</span>
                ${isSelected ? `
                  <span class="cat-active-check">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- D. Vendor Filter Horizontal Strip -->
        <div class="menu-section-header" style="margin-top: 14px;">
          <span class="menu-section-title">Canteen Stalls</span>
          ${activeV !== 'all' ? `
            <button class="menu-section-action-link" data-action="filter-vendor" data-vendor-id="all">View All (5)</button>
          ` : ''}
        </div>
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

        <!-- Selected Vendor Banner (If Filtered by Stall) -->
        ${activeV !== 'all' ? (() => {
          const v = SapatStorage.getVendorById(activeV);
          if (!v) return '';
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

        <!-- E. Food Catalog Grid Header & Counter -->
        <div class="catalog-section-header">
          <div class="catalog-count-wrap">
            <span class="catalog-count-number">${filtered.length}</span>
            <span class="catalog-count-label">meal${filtered.length === 1 ? '' : 's'} available</span>
          </div>
          ${hasActiveFilters ? `
            <button class="catalog-clear-link" data-action="reset-all-filters">Clear all filters</button>
          ` : ''}
        </div>

        <!-- Food Catalog Grid (2-Column Discovery Experience) -->
        <div class="menu-food-grid" id="menu-food-grid">
          ${filtered.length > 0 ? filtered.map(dish => renderFeaturedMealCard(dish)).join('') : `
            <div class="empty-state-wrap">
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h3>No matching dishes found</h3>
              <p>Try adjusting your search keywords, category, or stall filter.</p>
              <button class="btn-primary-action" style="margin-top: 12px; width: auto; padding: 0 20px;" data-action="reset-all-filters">
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
      // Direct route navigation (e.g. cart shortcut button)
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      // Clear search
      const clearBtn = e.target.closest('[data-action="clear-search"]');
      if (clearBtn) {
        state.searchQuery = '';
        this.render(container);
        return;
      }

      // Reset all filters
      const resetBtn = e.target.closest('[data-action="reset-all-filters"]');
      if (resetBtn) {
        state.searchQuery = '';
        state.studentVendorFilter = 'all';
        state.selectedCategory = 'all';
        state.menuInStockOnly = false;
        state.menuSortBy = 'recommended';
        showToast('All filters cleared', 'info');
        this.render(container);
        return;
      }

      // Open filter modal
      const filterBtn = e.target.closest('[data-action="open-filter-modal"]');
      if (filterBtn) {
        openMenuFilterModal();
        return;
      }

      // Category tile select
      const catTile = e.target.closest('[data-action="filter-category"]');
      if (catTile) {
        const catId = catTile.getAttribute('data-cat-id');
        if (catId) {
          state.setSelectedCategory(catId);
          this.render(container);
        }
        return;
      }

      // Vendor tab select
      const vendorBtn = e.target.closest('[data-action="filter-vendor"]');
      if (vendorBtn) {
        const vId = vendorBtn.getAttribute('data-vendor-id');
        if (vId) {
          state.setStudentVendorFilter(vId);
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
