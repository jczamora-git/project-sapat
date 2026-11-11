import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { renderFeaturedMealCard } from '../../components/food-card.js';
import { getCanteenBrandMark } from '../../components/vendor-card.js';
import { openMealModal, openMenuFilterModal, openSuggestMealModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentMenuPage = {
  _unsubscribe: null,
  _dataListenerAdded: false,
  activeTab: 'browse', // 'browse' | 'wishlist'

  render(container) {
    // Check if query param specifies wishlist tab
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
      if (window.location.hash.includes('tab=wishlist')) {
        this.activeTab = 'wishlist';
      } else if (window.location.hash.includes('tab=browse')) {
        this.activeTab = 'browse';
      }
    }

    // Subscribe to state updates if not already subscribed
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (
          event === 'menu-filter-changed' ||
          event === 'menu-sort-changed' ||
          event === 'category-changed' ||
          event === 'student-vendor-filter-changed' ||
          event === 'cart-updated' ||
          event === 'role-changed' ||
          event === 'data-reset'
        ) {
          const currentScreen = document.getElementById('screen-student-menu');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
    }

    if (!this._dataListenerAdded && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      this._dataListenerAdded = true;
      window.addEventListener('sapat:data-updated', (e) => {
        if (e?.detail?.type === 'meal-suggestions' || e?.detail?.type === 'suggestion-votes') {
          const currentScreen = document.getElementById('screen-student-menu');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
      window.addEventListener('sapat:student-auth-changed', () => {
        const currentScreen = document.getElementById('screen-student-menu');
        if (currentScreen && container.contains(currentScreen)) {
          this.render(container);
        }
      });
    }

    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const activeV = state.studentVendorFilter || 'all';
    const activeCat = state.selectedCategory || 'all';

    // Student Wishlist data
    const campusSuggestions = SapatStorage.getMealSuggestions().sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const currentStudent = SapatStorage.getCurrentStudent();
    const votedList = currentStudent ? SapatStorage.getStudentVotes(currentStudent.schoolId) : [];

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
      filtered = filtered.filter(d => SapatStorage.getDishAvailablePortions(d.id) > 0);
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
        const aRem = SapatStorage.getDishAvailablePortions(a.id);
        const bRem = SapatStorage.getDishAvailablePortions(b.id);
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
            <h2 class="menu-header-title">${this.activeTab === 'wishlist' ? 'Campus Meal Wishlist' : 'Explore Meals'}</h2>
            <p class="menu-header-sub">${this.activeTab === 'wishlist' ? 'Vote for dishes you want canteen cooks to prepare next.' : 'Pre-order freshly prepared portions from campus canteens.'}</p>
          </div>
        </div>

        <!-- Segmented Tab Navigation: Browse Meals vs Meal Wishlist -->
        <div class="menu-tab-segmented-control">
          <button type="button" class="menu-segment-btn ${this.activeTab === 'browse' ? 'active' : ''}" data-action="switch-menu-tab" data-tab="browse">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
            <span>Browse Meals</span>
          </button>
          <button type="button" class="menu-segment-btn ${this.activeTab === 'wishlist' ? 'active' : ''}" data-action="switch-menu-tab" data-tab="wishlist">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            <span>Meal Wishlist</span>
            <span class="menu-tab-badge">${campusSuggestions.length}</span>
          </button>
        </div>

        ${this.activeTab === 'browse' ? `
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
        ` : `
          <!-- Dedicated Campus Meal Wishlist View -->
          <div class="wishlist-tab-header">
            <div class="wishlist-tab-intro">
              <div class="wishlist-tab-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                <span>Student Demand Driven</span>
              </div>
              <h3 class="wishlist-tab-title">What meals should your canteen offer next?</h3>
              <p class="wishlist-tab-desc">Vote for dishes you want canteen cooks to prepare. Cooks monitor student wishlist demand daily to adjust preparation targets.</p>
            </div>
            <button type="button" class="btn-wishlist-suggest" data-action="open-suggest-modal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Suggest a Meal</span>
            </button>
          </div>

          <div class="wishlist-cards-list" id="menu-wishlist-cards-list">
            ${campusSuggestions.length === 0 ? `
              <div class="wishlist-empty-state">
                <div class="empty-state-visual">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                </div>
                <h4 class="empty-state-title">No meal suggestions yet</h4>
                <p class="empty-state-text">Be the first to suggest a dish you'd love your campus canteen cooks to prepare!</p>
                <button type="button" class="btn-primary-action empty-state-btn" data-action="open-suggest-modal">
                  Suggest a Meal
                </button>
              </div>
            ` : campusSuggestions.map(s => {
              const hasVoted = (votedList || []).includes(s.id) || (s.voterIds || []).includes(currentStudent?.schoolId);
              const vendorObj = s.vendorId && s.vendorId !== 'all' ? SapatStorage.getVendorById(s.vendorId) : null;
              const vendorName = vendorObj ? vendorObj.name : 'Campus-Wide Suggestion';
              const stallTag = vendorObj ? vendorObj.stallNumber : 'All Stalls';

              return `
                <div class="student-wishlist-card">
                  <div class="wishlist-card-main">
                    <div class="wishlist-card-tags">
                      <span class="wishlist-stall-tag">${vendorName} &bull; ${stallTag}</span>
                      <span class="wishlist-request-tag">${s.votes || 0} student request${(s.votes || 0) === 1 ? '' : 's'}</span>
                    </div>
                    <h4 class="wishlist-dish-title">${s.dishName}</h4>
                    <p class="wishlist-dish-desc">${s.description || 'Suggested by campus student community'}</p>
                    <div class="wishlist-card-footer">
                      <span class="wishlist-suggested-by">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Suggested by ${s.studentName || 'Student'}</span>
                      </span>
                    </div>
                  </div>
                  <div class="wishlist-vote-action-col">
                    <button type="button" class="btn-vote-wishlist ${hasVoted ? 'voted' : ''}" data-action="vote-suggestion" data-suggestion-id="${s.id}" title="${hasVoted ? 'You have voted for this dish' : 'Vote for this dish'}">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="${hasVoted ? 'var(--primary)' : 'none'}" stroke="${hasVoted ? 'var(--primary)' : 'currentColor'}" stroke-width="2.2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                      <strong class="vote-number">${s.votes || 0}</strong>
                      <span class="vote-caption">${hasVoted ? 'Voted' : 'Vote'}</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}

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
      // Switch between Browse Meals and Meal Wishlist tabs
      const tabBtn = e.target.closest('[data-action="switch-menu-tab"]');
      if (tabBtn) {
        const targetTab = tabBtn.getAttribute('data-tab');
        if (targetTab && (targetTab === 'browse' || targetTab === 'wishlist')) {
          this.activeTab = targetTab;
          if (typeof window !== 'undefined' && window.location) {
            if (targetTab === 'wishlist') {
              window.location.hash = '#/student/menu?tab=wishlist';
            } else {
              window.location.hash = '#/student/menu';
            }
          }
          this.render(container);
        }
        return;
      }

      // Open suggest meal modal
      const suggestBtn = e.target.closest('[data-action="open-suggest-modal"]');
      if (suggestBtn) {
        const student = SapatStorage.getCurrentStudent();
        if (!student) {
          showToast('Please sign in with your School ID to suggest a meal.', 'info');
          router.navigate('#/auth/login');
          return;
        }
        openSuggestMealModal();
        return;
      }

      // Vote on suggestion
      const voteBtn = e.target.closest('[data-action="vote-suggestion"]');
      if (voteBtn) {
        const suggestionId = voteBtn.getAttribute('data-suggestion-id');
        if (suggestionId) {
          const student = SapatStorage.getCurrentStudent();
          if (!student) {
            showToast('Please sign in with your School ID to vote on meal suggestions.', 'info');
            router.navigate('#/auth/login');
            return;
          }
          const res = SapatStorage.voteMealSuggestion(suggestionId, student.schoolId);
          if (res.success) {
            showToast('Vote counted! Thanks for supporting campus comfort food.', 'success');
            this.render(container);
          } else {
            showToast(res.message || 'Already voted for this dish', 'info');
          }
        }
        return;
      }

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
