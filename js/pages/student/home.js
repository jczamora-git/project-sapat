import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { renderCanteenCard } from '../../components/vendor-card.js';
import { renderFeaturedMealCard, renderStudentFoodCard } from '../../components/food-card.js';
import { openMealModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';

export const studentHomePage = {
  render(container) {
    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders();

    const activeOrders = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Completed');
    const totalDailyLimit = menu.reduce((s, d) => s + (d.isAvailable ? d.dailyLimit : 0), 0);
    const totalReserved = menu.reduce((s, d) => s + (d.isAvailable ? d.reservedServings : 0), 0);
    const reservedRate = totalDailyLimit > 0 ? Math.round((totalReserved / totalDailyLimit) * 100) : 68;

    const featuredDishes = menu.filter(m => m.isAvailable).slice(0, 5);
    const quickMeals = menu.filter(m => m.isAvailable).slice(0, 4);

    container.innerHTML = `
      <section class="screen active" id="screen-student-home">
        <div class="welcome-hero">
          <div class="hero-sub">Magandang araw</div>
          <h2>Maria Santos</h2>
          <p>Pre-order canteen meals early to help our cooks prepare exact daily portions.</p>
          <div class="hero-stats-row">
            <div class="hero-stat-item">
              <span class="stat-label">Stall Preparation</span>
              <span class="stat-value">${reservedRate}% Reserved</span>
            </div>
            <div class="hero-stat-item">
              <span class="stat-label">Daily Waste Saved</span>
              <span class="stat-value">4.8 kg</span>
            </div>
          </div>
        </div>

        <!-- Kitchen Live Preparation Banner -->
        <div class="kitchen-live-banner">
          <div class="kitchen-pulse-dot"></div>
          <div class="kitchen-live-text">
            <h4>Canteen Kitchens are preparing today's pre-orders</h4>
            <p>Order cutoff is 30 minutes before each pickup window</p>
          </div>
        </div>

        <!-- Explore Canteens Section -->
        <div class="section-header" style="margin-top: 18px;">
          <div>
            <h3>Explore Canteens</h3>
            <p style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">Browse independent menus and live portion quotas</p>
          </div>
          <span class="badge-pill-green">5 Stalls Open</span>
        </div>
        <div class="canteen-scroll-container" id="explore-canteens-container">
          ${vendors.map(v => renderCanteenCard(v, menu)).join('')}
        </div>

        <!-- Quick Actions -->
        <div class="quick-action-grid">
          <div class="action-tile" data-route="#/student/menu">
            <div class="action-tile-icon green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
            </div>
            <div class="action-tile-text">
              <h4>Browse Menu</h4>
              <p>Reserve meal</p>
            </div>
          </div>
          <div class="action-tile" data-route="#/student/orders">
            <div class="action-tile-icon amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <div class="action-tile-text">
              <h4>My Orders</h4>
              <p>${activeOrders.length} Active</p>
            </div>
          </div>
        </div>

        <!-- Featured Meals -->
        <div class="section-header">
          <h3>Featured Meals Today</h3>
          <button class="see-all-btn" data-route="#/student/menu">See all</button>
        </div>
        <div class="featured-scroll-container">
          ${featuredDishes.map(d => renderFeaturedMealCard(d)).join('')}
        </div>

        <!-- Quick Pre-orders -->
        <div class="section-header" style="margin-top: 24px;">
          <h3>Quick Pre-orders</h3>
          <span style="font-size: 11px; color: var(--text-secondary);">${totalDailyLimit - totalReserved} portions left today</span>
        </div>
        <div class="food-cards-list">
          ${quickMeals.map(d => renderStudentFoodCard(d)).join('')}
        </div>
      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      // 1. Navigation buttons or action tiles
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        const route = routeEl.getAttribute('data-route');
        if (route) {
          router.navigate(route);
          return;
        }
      }

      // 2. Select vendor from Explore Canteens
      const vendorEl = e.target.closest('[data-action="select-vendor"]');
      if (vendorEl) {
        const vendorId = vendorEl.getAttribute('data-vendor-id');
        if (vendorId) {
          state.setStudentVendorFilter(vendorId);
          router.navigate('#/student/menu');
          const v = SapatStorage.getVendorById(vendorId);
          if (v) showToast(`Viewing menu for ${v.name} (${v.stallNumber})`, 'info');
        }
        return;
      }

      // 3. Quick add button
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

      // 4. Open Meal Modal
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
