import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { studentMenuPage } from './menu.js';
import { renderCanteenCard } from '../../components/vendor-card.js';
import { renderFeaturedMealCard, renderSpotlightMealCard } from '../../components/food-card.js';
import { openMealModal, openMealFeedbackModal, openSuggestMealModal } from '../../components/modals.js';
import { showToast } from '../../components/toast.js';
import { ForecastingService } from '../../services/forecasting.service.js';

export const studentHomePage = {
  _unsubscribe: null,
  _dataListenerAdded: false,

  render(container) {
    if (!this._unsubscribe) {
      this._unsubscribe = state.subscribe((event) => {
        if (event === 'role-changed' || event === 'data-reset') {
          const currentScreen = document.getElementById('screen-student-home');
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
          const currentScreen = document.getElementById('screen-student-home');
          if (currentScreen && container.contains(currentScreen)) {
            this.render(container);
          }
        }
      });
      window.addEventListener('sapat:student-auth-changed', () => {
        const currentScreen = document.getElementById('screen-student-home');
        if (currentScreen && container.contains(currentScreen)) {
          this.render(container);
        }
      });
    }

    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();

    const totalDailyLimit = menu.reduce((s, d) => s + (d.isAvailable ? d.dailyLimit : 0), 0);
    const totalReserved = menu.reduce((s, d) => s + (d.isAvailable ? d.reservedServings : 0), 0);
    const reservedRate = totalDailyLimit > 0 ? Math.round((totalReserved / totalDailyLimit) * 100) : 68;

    const completedOrders = SapatStorage.getOrders().filter(o => o.status === 'Completed');
    const unreviewedOrder = completedOrders.find(o => !o.reviewed);

    const availableDishes = menu.filter(m => m.isAvailable);
    // Chef's Daily Spotlight dish: Ate Lita's Chicken Adobo or first dish
    const spotlightDish = menu.find(d => d.id === 'dish-lita-1') || availableDishes[0];

    // Student Suggestions and Campus Wishlist
    const currentStudent = SapatStorage.getCurrentStudent();
    const studentDisplayName = currentStudent ? (currentStudent.fullName ? currentStudent.fullName.split(' ')[0] : 'Maria') : 'Student';
    const votedList = currentStudent ? SapatStorage.getStudentVotes(currentStudent.schoolId) : [];
    const rawSuggestions = SapatStorage.getMealSuggestions();
    
    // Seed default suggestions if empty so student always sees interactive voting
    if (!rawSuggestions || rawSuggestions.length === 0) {
      SapatStorage.saveMealSuggestions([
        {
          id: 'SUG-SEED-01',
          studentId: '2026-0002',
          studentName: 'Juan Dela Cruz',
          dishName: 'Bicol Express Pork Rice Bowl',
          description: 'Spicy coconut chili comfort meal for rainy days and exam week',
          vendorId: 'vendor-lita',
          votes: 68,
          voterIds: ['2026-0002'],
          createdAt: '2026-11-09T08:00:00.000Z'
        },
        {
          id: 'SUG-SEED-02',
          studentId: '2024-0551',
          studentName: 'Paolo Reyes',
          dishName: 'Warm Ginataang Bilo-Bilo with Langka',
          description: 'Sweet afternoon merienda dessert paired with cold sago',
          vendorId: 'vendor-tess',
          votes: 94,
          voterIds: ['2024-0551'],
          createdAt: '2026-11-09T09:30:00.000Z'
        },
        {
          id: 'SUG-SEED-03',
          studentId: '2024-0891',
          studentName: 'Maria Santos',
          dishName: 'Sizzling Spicy Sisilog with Calamansi',
          description: 'Crispy savory pork sisig with garlic rice and egg',
          vendorId: 'vendor-ben',
          votes: 112,
          voterIds: ['2024-0891'],
          createdAt: '2026-11-09T07:15:00.000Z'
        }
      ]);
    }
    const campusSuggestions = SapatStorage.getMealSuggestions().sort((a, b) => (b.votes || 0) - (a.votes || 0));

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
            <h2 class="home-greeting-heading">Good morning, ${studentDisplayName}</h2>
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

        <!-- Campus Meal Wishlist Quick Access Shortcut -->
        <div class="home-wishlist-quick-card">
          <div class="wishlist-quick-main">
            <div class="wishlist-quick-badge-row">
              <span class="wishlist-quick-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                Campus Meal Wishlist
              </span>
              <span class="wishlist-quick-count">${campusSuggestions.length} student suggestions</span>
            </div>
            <p class="wishlist-quick-desc">Vote for meals you'd like your canteen to offer.</p>
          </div>
          <div class="wishlist-quick-actions">
            <button type="button" class="btn-wishlist-quick primary" data-action="open-wishlist-tab">
              View &amp; Vote
            </button>
            <button type="button" class="btn-wishlist-quick secondary" data-action="open-suggest-modal">
              Suggest a Meal
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

        <!-- Student Meal Feedback Prompt Banner -->
        ${unreviewedOrder ? `
          <div class="home-feedback-prompt-banner">
            <div class="feedback-banner-info">
              <span class="feedback-banner-kicker">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF8A24" stroke="#FF8A24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Rate Your Recent Meal
              </span>
              <h4 class="feedback-banner-title">How was your ${unreviewedOrder.items && unreviewedOrder.items[0] ? unreviewedOrder.items[0].name : 'lunch'}?</h4>
              <p class="feedback-banner-sub">${unreviewedOrder.vendorName} uses verified reviews to refine seasoning and portions.</p>
            </div>
            <button class="btn-home-feedback" data-action="open-meal-feedback" data-order-id="${unreviewedOrder.id}">
              Rate Meal
            </button>
          </div>
        ` : ''}

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

        <!-- Campus Meal Wishlist Summary Callout Banner -->
        <div class="home-wishlist-teaser-card" data-action="open-wishlist-tab">
          <div class="wishlist-teaser-icon-col">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          </div>
          <div class="wishlist-teaser-body">
            <div class="wishlist-teaser-kicker-row">
              <span class="wishlist-teaser-kicker">Campus Meal Wishlist</span>
              <span class="wishlist-teaser-badge">${campusSuggestions.length} dishes in voting</span>
            </div>
            <h4 class="wishlist-teaser-title">Help decide what meals cooks prepare next</h4>
            <p class="wishlist-teaser-desc">Top-voted student suggestions are sent straight to canteen cooks for kitchen prep planning.</p>
          </div>
          <button type="button" class="btn-wishlist-teaser-action" data-action="open-wishlist-tab">
            View All &rarr;
          </button>
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

      // Open meal feedback modal
      const feedbackBtn = e.target.closest('[data-action="open-meal-feedback"]');
      if (feedbackBtn) {
        const orderId = feedbackBtn.getAttribute('data-order-id');
        if (orderId) {
          openMealFeedbackModal(orderId);
          return;
        }
      }

      // Open Wishlist tab on Menu page
      const openWishlistBtn = e.target.closest('[data-action="open-wishlist-tab"]');
      if (openWishlistBtn) {
        studentMenuPage.activeTab = 'wishlist';
        router.navigate('#/student/menu?tab=wishlist');
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
    });
  }
};
