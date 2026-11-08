import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { renderCanteenCard } from '../../components/vendor-card.js';
import { renderFeaturedMealCard, renderSpotlightMealCard } from '../../components/food-card.js';
import { openMealModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentHomePage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();

    const totalDailyLimit = menu.reduce((s, d) => s + (d.isAvailable ? d.dailyLimit : 0), 0);
    const totalReserved = menu.reduce((s, d) => s + (d.isAvailable ? d.reservedServings : 0), 0);
    const reservedRate = totalDailyLimit > 0 ? Math.round((totalReserved / totalDailyLimit) * 100) : 68;

    const availableDishes = menu.filter(m => m.isAvailable);
    // Chef's Daily Spotlight dish: Ate Lita's Chicken Adobo or first dish
    const spotlightDish = menu.find(d => d.id === 'dish-lita-1') || availableDishes[0];

    const quickCategories = [
      { id: 'all', label: 'All Specials', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
      { id: 'rice-meals', label: 'Rice Meals', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0-2h-.93A8 8 0 0 1 11 4.07V5a1 1 0 0 1 2 0v-.93A8 8 0 0 1 19.93 11H19a1 1 0 0 1 0 2h.93A8 8 0 0 1 13 16.93z' },
      { id: 'veggies', label: 'Healthy Bowls', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { id: 'merienda', label: 'Merienda', icon: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z' }
    ];

    container.innerHTML = `
      <section class="screen active" id="screen-student-home">
        
        <!-- Top App Greeting & Campus Bar -->
        <div class="home-top-bar">
          <div class="home-greeting-meta">
            <span class="home-location-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>Main Canteen Hall &bull; Open Now</span>
            </span>
            <h2 class="home-greeting-heading">Good morning, Maria</h2>
            <p class="home-greeting-sub">Pre-order hot portions early. Skip the long midday queues.</p>
          </div>
        </div>

        <!-- Quick Instant Search Field -->
        <div class="home-search-container" data-route="#/student/menu">
          <div class="home-search-bar">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="home-search-input" id="home-search-input" placeholder="Search dishes, stalls, or ulam..." autocomplete="off">
            <button class="home-search-filter-btn" data-route="#/student/menu" title="Search Menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </button>
          </div>
        </div>

        <!-- Expressive Hero Banner (High-Impact Food Photography) -->
        <div class="home-hero-banner" data-route="#/student/menu">
          <div class="hero-banner-content">
            <span class="hero-kicker-badge">Zero Queue &bull; Hot &amp; Fresh</span>
            <h3 class="hero-banner-title">Fresh Canteen Meals Cooked to Order</h3>
            <p class="hero-banner-sub">Lock in chef-prepared portions before daily batch limits run out. Claim in seconds at stall window.</p>
            <div class="hero-banner-actions">
              <span class="btn-hero-preorder">Pre-order Now &rarr;</span>
            </div>
          </div>
          <div class="hero-banner-media">
            <img src="assets/images/products/chicken-adobo.jpg" alt="Delicious Canteen Dish" loading="lazy">
          </div>
        </div>

        <!-- Quick Category Chips Strip -->
        <div class="home-category-chips-strip">
          ${quickCategories.map(cat => `
            <button class="home-cat-pill" data-action="quick-filter-category" data-cat-id="${cat.id}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${cat.icon}"></path></svg>
              <span>${cat.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Asymmetric Chef's Daily Spotlight Card -->
        ${spotlightDish ? `
          <div class="section-row-header" style="margin-top: 20px;">
            <div>
              <h3 class="section-heading">Chef's Spotlight Dish</h3>
              <span class="section-subtext">Today's most recommended campus pre-order</span>
            </div>
          </div>
          <div class="home-spotlight-container">
            ${renderSpotlightMealCard(spotlightDish)}
          </div>
        ` : ''}

        <!-- Explore Canteen Stalls (Horizontal Cards) -->
        <div class="section-row-header" style="margin-top: 24px;">
          <div>
            <h3 class="section-heading">Explore Canteen Stalls</h3>
            <span class="section-subtext">5 independent food stalls with live portion quotas</span>
          </div>
          <span class="section-badge-counter">5 Open</span>
        </div>
        <div class="canteen-scroll-container" id="explore-canteens-container">
          ${vendors.map(v => renderCanteenCard(v, menu)).join('')}
        </div>

        <!-- Campus Favorites Ready to Reserve (Food Grid) -->
        <div class="section-row-header" style="margin-top: 24px;">
          <div>
            <h3 class="section-heading">Available Meals Today</h3>
            <span class="section-subtext">Chef specials and student favorites ready to reserve</span>
          </div>
          <button class="section-see-all-btn" data-route="#/student/menu">See all (${availableDishes.length}) &rarr;</button>
        </div>
        <div class="meals-grid-2col" id="home-meals-grid">
          ${availableDishes.slice(0, 6).map(d => renderFeaturedMealCard(d)).join('')}
        </div>

        <!-- Sustainability & Zero-Waste Impact Banner -->
        <div class="home-impact-strip">
          <div class="impact-stat-item">
            <span class="impact-stat-value">4.8 kg</span>
            <span class="impact-stat-label">Daily Food Waste Prevented</span>
          </div>
          <div class="impact-stat-divider"></div>
          <div class="impact-stat-item">
            <span class="impact-stat-value">${reservedRate}%</span>
            <span class="impact-stat-label">Kitchen Capacity Pre-ordered</span>
          </div>
        </div>

      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    // 1. Search navigation
    const searchInput = container.querySelector('#home-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) {
            state.setSearchQuery(q);
            router.navigate('#/student/menu');
          }
        }
      });
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    container.addEventListener('click', (e) => {
      // Direct navigation
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      // Quick Category Filter
      const catBtn = e.target.closest('[data-action="quick-filter-category"]');
      if (catBtn) {
        const catId = catBtn.getAttribute('data-cat-id');
        if (catId) {
          state.setSelectedCategory(catId);
          router.navigate('#/student/menu');
          return;
        }
      }

      // Vendor card selection -> filter vendor and navigate
      const vendorEl = e.target.closest('[data-action="select-vendor"]');
      if (vendorEl) {
        const vendorId = vendorEl.getAttribute('data-vendor-id');
        if (vendorId) {
          state.setStudentVendorFilter(vendorId);
          router.navigate('#/student/menu');
          const v = SapatStorage.getVendorById(vendorId);
          if (v) showToast(`Viewing ${v.name} (${v.stallNumber})`, 'info');
          return;
        }
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
