import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { renderCanteenCard } from '../../components/vendor-card.js';
import { renderFeaturedMealCard } from '../../components/food-card.js';
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

    container.innerHTML = `
      <section class="screen active" id="screen-student-home">
        
        <!-- B. Welcome Section (Editorial, No Boxed Hero Card) -->
        <div class="home-welcome-section">
          <div class="home-campus-tag">
            <span class="live-pulse-dot"></span>
            <span>Main Campus Canteen &bull; Lunch Shift Pre-orders</span>
          </div>
          <h2 class="home-greeting-heading">Good morning, Maria</h2>
          <p class="home-greeting-sub">Reserve freshly cooked meals ahead of time to lock in your portion and skip canteen lines.</p>
        </div>

        <!-- C. Search Input (Navigates to Menu) -->
        <div class="home-search-wrap" data-route="#/student/menu">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="home-search-input" id="home-search-input" placeholder="Search dishes, stalls, or ulam..." autocomplete="off">
        </div>

        <!-- D. Explore Canteens (Horizontal Scroll) -->
        <div class="section-row-header">
          <div>
            <h3 class="section-heading">Explore Canteens</h3>
            <span class="section-subtext">5 independent food stalls with live portion quotas</span>
          </div>
          <span class="section-badge-counter">5 Open</span>
        </div>
        <div class="canteen-scroll-container" id="explore-canteens-container">
          ${vendors.map(v => renderCanteenCard(v, menu)).join('')}
        </div>

        <!-- F. Available Meals Today (Modern 2-Column Food Grid) -->
        <div class="section-row-header" style="margin-top: 24px;">
          <div>
            <h3 class="section-heading">Available Meals Today</h3>
            <span class="section-subtext">Chef specials and student favorites ready to reserve</span>
          </div>
          <button class="section-see-all-btn" data-route="#/student/menu">See all (${availableDishes.length})</button>
        </div>
        <div class="meals-grid-2col" id="home-meals-grid">
          ${availableDishes.slice(0, 6).map(d => renderFeaturedMealCard(d)).join('')}
        </div>

        <!-- G. Impact Summary (Compact & Unobtrusive) -->
        <div class="home-impact-strip">
          <div class="impact-stat-item">
            <span class="impact-stat-value">4.8 kg</span>
            <span class="impact-stat-label">Daily Food Waste Prevented</span>
          </div>
          <div class="impact-stat-divider"></div>
          <div class="impact-stat-item">
            <span class="impact-stat-value">${reservedRate}%</span>
            <span class="impact-stat-label">Campus Kitchens Reserved</span>
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
      searchInput.addEventListener('click', () => {
        // focus input
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

      // Category chip filter -> navigate to menu
      const catBtn = e.target.closest('[data-action="filter-home-category"]');
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
