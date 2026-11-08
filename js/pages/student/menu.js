import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { renderFeaturedMealCard } from '../../components/food-card.js';
import { getCanteenBrandMark } from '../../components/vendor-card.js';
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

    // Professional SVG icons & clean labels matching Home page identity
    const categories = [
      { 
        id: 'all', 
        label: 'All Dishes', 
        svg: '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect>' 
      },
      { 
        id: 'rice-meals', 
        label: 'Rice Meals', 
        svg: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0-2h-.93A8 8 0 0 1 11 4.07V5a1 1 0 0 1 2 0v-.93A8 8 0 0 1 19.93 11H19a1 1 0 0 1 0 2h.93A8 8 0 0 1 13 16.93z"></path>' 
      },
      { 
        id: 'veggies', 
        label: 'Healthy Bowls', 
        svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' 
      },
      { 
        id: 'merienda', 
        label: 'Merienda', 
        svg: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>' 
      },
      { 
        id: 'snacks', 
        label: 'Snacks', 
        svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>' 
      },
      { 
        id: 'drinks', 
        label: 'Drinks', 
        svg: '<path d="M5 4h14l-1.5 14.5a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5L5 4z"></path><line x1="4" y1="4" x2="20" y2="4"></line><line x1="15" y1="1" x2="13" y2="4"></line>' 
      }
    ];

    // Filter pipeline
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
      // Default: Recommended (In-stock first, then catalog order)
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
    const selectedVendor = activeV !== 'all' ? SapatStorage.getVendorById(activeV) : null;
    const selectedCategoryObj = activeCat !== 'all' ? categories.find(c => c.id === activeCat) : null;

    // Determine catalog heading
    let catalogTitle = 'All Available Meals';
    if (selectedVendor && selectedCategoryObj) {
      catalogTitle = `${selectedVendor.name} &bull; ${selectedCategoryObj.label}`;
    } else if (selectedVendor) {
      catalogTitle = selectedVendor.name;
    } else if (selectedCategoryObj) {
      catalogTitle = selectedCategoryObj.label;
    }

    container.innerHTML = `
      <section class="screen active" id="screen-student-menu">
        
        <!-- A. Clean and Distinctive Menu Header -->
        <div class="menu-page-header">
          <div class="menu-header-text">
            <h2 class="menu-header-title">Explore Meals</h2>
            <p class="menu-header-sub">Pre-order freshly prepared portions from campus canteens.</p>
          </div>
        </div>

        <!-- B. Refined Search and Filter -->
        <div class="menu-search-filter-row">
          <div class="menu-search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="menu-search-input" id="menu-search-input" placeholder="Search dishes, stalls, or ulam..." value="${state.searchQuery || ''}">
            ${state.searchQuery ? `
              <button class="search-clear-btn" data-action="clear-search" type="button" title="Clear search">&times;</button>
            ` : ''}
          </div>
          <button class="menu-filter-btn ${hasActiveFilters ? 'has-filters' : ''}" data-action="open-filter-modal" type="button" title="Filter & Sort">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span>Filters</span>
          </button>
        </div>

        <!-- C. Refined Category Navigation (Home-Style SVG Icons) -->
        <div class="menu-category-nav">
          ${categories.map(cat => {
            const isSelected = activeCat === cat.id;
            return `
              <button class="menu-cat-chip ${isSelected ? 'active' : ''}" type="button" data-action="filter-category" data-cat-id="${cat.id}">
                <svg class="menu-cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${cat.svg}
                </svg>
                <span class="menu-cat-label">${cat.label}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- D. Premium Canteen / Stall Selector -->
        <div class="menu-section-header">
          <span class="menu-section-title">Campus Canteens</span>
          ${activeV !== 'all' ? `
            <button class="menu-section-action-link" type="button" data-action="filter-vendor" data-vendor-id="all">Show All</button>
          ` : ''}
        </div>
        <div class="menu-canteen-scroller" id="menu-canteen-scroller">
          <!-- All Canteens Card -->
          <div class="canteen-select-card ${activeV === 'all' ? 'active' : ''}" data-action="filter-vendor" data-vendor-id="all">
            ${getCanteenBrandMark('all')}
            <div class="canteen-select-info">
              <span class="canteen-select-name">All Canteens</span>
              <span class="canteen-select-meta">
                <span class="canteen-status-dot online"></span> 5 open stalls
              </span>
            </div>
          </div>

          <!-- Individual Canteen Cards -->
          ${vendors.map(v => {
            const isSelected = activeV === v.id;
            return `
              <div class="canteen-select-card ${isSelected ? 'active' : ''}" data-action="filter-vendor" data-vendor-id="${v.id}">
                ${getCanteenBrandMark(v.id)}
                <div class="canteen-select-info">
                  <span class="canteen-select-name">${v.name}</span>
                  <span class="canteen-select-meta">
                    <span class="canteen-status-dot ${v.isOpen ? 'online' : 'offline'}"></span> ${v.isOpen ? 'Open' : 'Closed'} &bull; ${v.stallNumber}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- E. Product Discovery Section Header (No Duplicate Stall Banner!) -->
        <div class="catalog-section-header">
          <div class="catalog-title-group">
            <h3 class="catalog-section-title">${catalogTitle}</h3>
            <span class="catalog-section-counter">${filtered.length} meal${filtered.length === 1 ? '' : 's'} available</span>
          </div>
          ${hasActiveFilters ? `
            <button class="catalog-clear-btn" data-action="reset-all-filters" type="button">
              Clear filters
            </button>
          ` : ''}
        </div>

        <!-- F. Product Discovery 2-Column Grid -->
        <div class="menu-food-grid" id="menu-food-grid">
          ${filtered.length > 0 ? filtered.map(dish => renderFeaturedMealCard(dish)).join('') : `
            <div class="menu-empty-state">
              <div class="empty-state-visual">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h3 class="empty-state-title">No matching meals found</h3>
              <p class="empty-state-text">No canteen dishes match your current filters. Try selecting another category or resetting filters.</p>
              <button class="btn-primary-action empty-state-btn" data-action="reset-all-filters" type="button">
                Reset All Filters
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
      // Direct route navigation
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

      // Category chip select
      const catChip = e.target.closest('[data-action="filter-category"]');
      if (catChip) {
        const catId = catChip.getAttribute('data-cat-id');
        if (catId) {
          state.setSelectedCategory(catId);
          this.render(container);
        }
        return;
      }

      // Canteen selector card
      const vendorCard = e.target.closest('[data-action="filter-vendor"]');
      if (vendorCard) {
        const vId = vendorCard.getAttribute('data-vendor-id');
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
