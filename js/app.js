/**
 * SAPAT — Smart Food Pre-ordering & Preparation Management
 * Multi-Vendor Edition (5 Selectable Canteen Vendors with Independent Inventory)
 * Vanilla JavaScript & LocalStorage
 */

const SapatApp = {
  // Runtime State
  currentRole: 'student', // 'student' | 'vendor'
  currentVendorId: 'vendor-lita', // Active vendor in Vendor mode
  studentVendorFilter: 'all', // 'all' | 'vendor-lita' | 'vendor-ben' | 'vendor-cora' | 'vendor-green' | 'vendor-tess'
  currentScreen: 'student-home',
  cart: [], // Array of { id, name, price, quantity, image, dailyLimit, vendorId, vendorName, vendorStall }
  activeCategory: 'all',
  searchQuery: '',
  ordersTab: 'active', // 'active' | 'history'
  vendorOrdersFilter: 'all', // 'all' | 'Pending' | 'Preparing' | 'Ready for Pickup'

  // Modal State
  selectedMealForModal: null,
  modalMealQty: 1,

  // =========================================================================
  // Initialization
  // =========================================================================
  init() {
    this.initClock();

    // Load saved states from storage
    this.currentVendorId = SapatStorage.getCurrentVendorId() || 'vendor-lita';
    this.studentVendorFilter = SapatStorage.getStudentSelectedVendor() || 'all';

    const savedRole = SapatStorage.getRole();
    if (savedRole && (savedRole === 'student' || savedRole === 'vendor')) {
      this.currentRole = savedRole;
    } else {
      this.openRoleModal();
    }

    this.currentScreen = this.currentRole === 'student' ? 'student-home' : 'vendor-dashboard';

    // Global event listeners
    window.addEventListener('sapat:data-updated', () => {
      this.render();
    });

    window.addEventListener('sapat:role-changed', (e) => {
      this.currentRole = e.detail.role;
      this.updateRoleUI();
      this.render();
    });

    window.addEventListener('sapat:vendor-changed', (e) => {
      this.currentVendorId = e.detail.vendorId;
      this.render();
    });

    window.addEventListener('sapat:student-vendor-changed', (e) => {
      this.studentVendorFilter = e.detail.vendorId;
      this.render();
    });

    this.updateRoleUI();
    this.render();
  },

  initClock() {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeEl = document.getElementById('live-phone-time');
      if (timeEl) {
        timeEl.textContent = `${hours}:${minutes}`;
      }
    };
    updateTime();
    setInterval(updateTime, 30000);
  },

  // =========================================================================
  // Role & Vendor Account Management
  // =========================================================================
  switchRole(role) {
    if (role !== 'student' && role !== 'vendor') return;
    this.currentRole = role;
    SapatStorage.saveRole(role);
    this.currentScreen = role === 'student' ? 'student-home' : 'vendor-dashboard';
    this.updateRoleUI();
    this.render();
    this.showToast(`Switched to ${role === 'student' ? 'Student' : 'Canteen Vendor'} view`, 'info');
  },

  switchRoleAndClose(role, optionalVendorId) {
    if (optionalVendorId && role === 'vendor') {
      this.currentVendorId = optionalVendorId;
      SapatStorage.setCurrentVendorId(optionalVendorId);
    }
    this.switchRole(role);
    this.closeRoleModal();
  },

  switchVendorAccount(vendorId) {
    const vendor = SapatStorage.getVendorById(vendorId);
    if (!vendor) return;
    this.currentVendorId = vendorId;
    SapatStorage.setCurrentVendorId(vendorId);
    this.showToast(`Switched account to ${vendor.name} (${vendor.stallNumber})`, 'success');
    this.render();
  },

  selectVendorForStudent(vendorId) {
    this.studentVendorFilter = vendorId;
    SapatStorage.setStudentSelectedVendor(vendorId);
    this.activeCategory = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) searchInput.value = '';
    this.navigateTo('student-menu');
    const vendor = SapatStorage.getVendorById(vendorId);
    if (vendor && vendorId !== 'all') {
      this.showToast(`Viewing menu for ${vendor.name} (${vendor.stallNumber})`, 'info');
    }
  },

  openRoleModal() {
    const modal = document.getElementById('modal-role-select');
    if (modal) {
      modal.classList.add('active');
      this.renderRoleModalVendors();
    }
  },

  closeRoleModal() {
    const modal = document.getElementById('modal-role-select');
    if (modal) modal.classList.remove('active');
  },

  renderRoleModalVendors() {
    const container = document.getElementById('modal-vendor-accounts-list');
    if (!container) return;
    const vendors = SapatStorage.getVendors();
    container.innerHTML = vendors.map(v => `
      <div class="modal-vendor-item ${v.id === this.currentVendorId ? 'active' : ''}" 
           onclick="SapatApp.switchRoleAndClose('vendor', '${v.id}')">
        <div class="m-vendor-avatar" style="background: ${v.avatarColor};">${v.avatar}</div>
        <div class="m-vendor-info">
          <div class="m-vendor-name">${v.name}</div>
          <div class="m-vendor-sub">${v.stallNumber} &bull; ${v.category}</div>
        </div>
        <span class="m-vendor-pill">${v.id === this.currentVendorId ? 'Active' : 'Select'}</span>
      </div>
    `).join('');
  },

  updateRoleUI() {
    const badge = document.getElementById('current-role-badge');
    const subtitle = document.getElementById('header-subtitle');
    const cartBtn = document.getElementById('header-cart-btn');

    if (badge) {
      if (this.currentRole === 'student') {
        badge.textContent = 'Student';
        badge.className = 'header-role-badge student';
      } else {
        const v = SapatStorage.getVendorById(this.currentVendorId);
        badge.textContent = v ? v.stallNumber : 'Vendor';
        badge.className = 'header-role-badge vendor';
      }
    }

    if (subtitle) {
      if (this.currentRole === 'student') {
        subtitle.textContent = 'Exact portions. Zero waste.';
      } else {
        const v = SapatStorage.getVendorById(this.currentVendorId);
        subtitle.textContent = v ? `${v.name}` : 'Smart Daily Prep & Orders';
      }
    }

    if (cartBtn) {
      cartBtn.style.display = this.currentRole === 'student' ? 'flex' : 'none';
    }

    this.renderBottomNav();
  },

  renderBottomNav() {
    const nav = document.getElementById('app-bottom-nav');
    if (!nav) return;

    if (this.currentRole === 'student') {
      const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      nav.innerHTML = `
        <button class="nav-item ${this.currentScreen === 'student-home' ? 'active' : ''}" onclick="SapatApp.navigateTo('student-home')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Home</span>
        </button>
        <button class="nav-item ${this.currentScreen === 'student-menu' ? 'active' : ''}" onclick="SapatApp.navigateTo('student-menu')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
          <span>Menu</span>
        </button>
        <button class="nav-item ${this.currentScreen === 'student-cart' ? 'active' : ''}" onclick="SapatApp.navigateTo('student-cart')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span>Cart</span>
          ${cartCount > 0 ? `<span class="nav-badge">${cartCount}</span>` : ''}
        </button>
        <button class="nav-item ${this.currentScreen === 'student-orders' ? 'active' : ''}" onclick="SapatApp.navigateTo('student-orders')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span>Orders</span>
        </button>
        <button class="nav-item ${this.currentScreen === 'student-profile' ? 'active' : ''}" onclick="SapatApp.navigateTo('student-profile')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Profile</span>
        </button>
      `;
    } else {
      const orders = SapatStorage.getOrders();
      const currentVendorOrders = orders.filter(o => o.vendorId === this.currentVendorId);
      const pendingCount = currentVendorOrders.filter(o => o.status === 'Pending').length;

      nav.innerHTML = `
        <button class="nav-item ${this.currentScreen === 'vendor-dashboard' ? 'active' : ''}" onclick="SapatApp.navigateTo('vendor-dashboard')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          <span>Dashboard</span>
        </button>
        <button class="nav-item ${this.currentScreen === 'vendor-menu' ? 'active' : ''}" onclick="SapatApp.navigateTo('vendor-menu')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Menu</span>
        </button>
        <button class="nav-item ${this.currentScreen === 'vendor-orders' ? 'active' : ''}" onclick="SapatApp.navigateTo('vendor-orders')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>Orders</span>
          ${pendingCount > 0 ? `<span class="nav-badge">${pendingCount}</span>` : ''}
        </button>
        <button class="nav-item ${this.currentScreen === 'vendor-prep' ? 'active' : ''}" onclick="SapatApp.navigateTo('vendor-prep')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          <span>Kitchen Prep</span>
        </button>
        <button class="nav-item ${this.currentScreen === 'vendor-profile' ? 'active' : ''}" onclick="SapatApp.navigateTo('vendor-profile')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span>Stall</span>
        </button>
      `;
    }
  },

  // =========================================================================
  // Navigation
  // =========================================================================
  navigateTo(screenId) {
    this.currentScreen = screenId;

    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.add('active');
    }

    const viewport = document.getElementById('screens-viewport');
    if (viewport) viewport.scrollTop = 0;

    this.renderBottomNav();
    this.render();
  },

  navigateToHome() {
    this.navigateTo(this.currentRole === 'student' ? 'student-home' : 'vendor-dashboard');
  },

  // =========================================================================
  // Master Render Function
  // =========================================================================
  render() {
    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders();
    const settings = SapatStorage.getSettings();

    // Render Cart Counter in Header & Bottom Nav
    const totalCartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cart-counter-badge');
    if (cartBadge) {
      if (totalCartCount > 0) {
        cartBadge.textContent = totalCartCount;
        cartBadge.style.display = 'flex';
      } else {
        cartBadge.style.display = 'none';
      }
    }

    // Always render Vendor Account Switcher bar if in vendor mode
    this.renderVendorAccountSwitcher(vendors);

    // Render based on current active screen
    if (this.currentRole === 'student') {
      if (this.currentScreen === 'student-home') {
        this.renderStudentHome(vendors, menu, orders);
      } else if (this.currentScreen === 'student-menu') {
        this.renderStudentMenu(vendors, menu);
      } else if (this.currentScreen === 'student-cart') {
        this.renderStudentCart(menu);
      } else if (this.currentScreen === 'student-orders') {
        this.renderStudentOrders(orders);
      } else if (this.currentScreen === 'student-profile') {
        this.renderStudentProfile(settings);
      }
    } else {
      // Vendor Views (Filtered strictly to current active vendor)
      const currentVendor = SapatStorage.getVendorById(this.currentVendorId);
      const vendorDishes = menu.filter(d => d.vendorId === this.currentVendorId);
      const vendorOrders = orders.filter(o => o.vendorId === this.currentVendorId);

      if (this.currentScreen === 'vendor-dashboard') {
        this.renderVendorDashboard(currentVendor, vendorDishes, vendorOrders);
      } else if (this.currentScreen === 'vendor-menu') {
        this.renderVendorMenu(currentVendor, vendorDishes);
      } else if (this.currentScreen === 'vendor-orders') {
        this.renderVendorOrders(currentVendor, vendorOrders);
      } else if (this.currentScreen === 'vendor-prep') {
        this.renderVendorPrep(currentVendor, vendorDishes, vendorOrders);
      } else if (this.currentScreen === 'vendor-profile') {
        this.renderVendorProfile(currentVendor, settings);
      }
    }
  },

  renderVendorAccountSwitcher(vendors) {
    const bars = document.querySelectorAll('.vendor-account-bar');
    bars.forEach(bar => {
      bar.innerHTML = `
        <div class="v-account-selector-wrap">
          <div class="v-account-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            <span>Demo Stall Account:</span>
          </div>
          <select class="v-account-select" onchange="SapatApp.switchVendorAccount(this.value)">
            ${vendors.map(v => `
              <option value="${v.id}" ${v.id === this.currentVendorId ? 'selected' : ''}>
                ${v.stallNumber}: ${v.name}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    });
  },

  getImgFallback() {
    return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23059669%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M18%208h1a4%204%200%200%201%200%208h-1%22%2F%3E%3Cpath%20d%3D%22M2%208h16v9a4%204%200%200%201-4%204H6a4%204%200%200%201-4-4V8z%22%2F%3E%3Cline%20x1%3D%226%22%20y1%3D%221%22%20x2%3D%226%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2210%22%20y1%3D%221%22%20x2%3D%2210%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2214%22%20y1%3D%221%22%20x2%3D%2214%22%20y2%3D%224%22%2F%3E%3C%2Fsvg%3E";
  },

  // =========================================================================
  // Student Screen 1: Home
  // =========================================================================
  renderStudentHome(vendors, menu, orders) {
    const canteensContainer = document.getElementById('explore-canteens-container');
    const featuredContainer = document.getElementById('featured-meals-container');
    const quickContainer = document.getElementById('home-quick-food-container');
    const homeActiveCount = document.getElementById('home-active-orders-count');
    const homePrepRate = document.getElementById('home-prep-rate');
    const homeTotalLeft = document.getElementById('home-total-servings-left');

    // Overall canteen metrics
    const totalDailyLimit = menu.reduce((sum, d) => sum + d.dailyLimit, 0);
    const totalReserved = menu.reduce((sum, d) => sum + d.reservedServings, 0);
    const totalRemaining = Math.max(0, totalDailyLimit - totalReserved);
    const percentReserved = totalDailyLimit > 0 ? Math.round((totalReserved / totalDailyLimit) * 100) : 0;

    if (homePrepRate) homePrepRate.textContent = `${percentReserved}% Reserved`;
    if (homeTotalLeft) homeTotalLeft.textContent = `${totalRemaining} portions left across 5 stalls`;

    // Active orders count for Maria Santos
    const activeStudentOrders = orders.filter(o => o.studentName === 'Maria Santos' && o.status !== 'Completed' && o.status !== 'Cancelled');
    if (homeActiveCount) {
      homeActiveCount.textContent = `${activeStudentOrders.length} Active`;
    }

    // 1. Render Explore Canteens Carousel / Cards
    if (canteensContainer) {
      canteensContainer.innerHTML = vendors.map(v => {
        const vendorDishes = menu.filter(d => d.vendorId === v.id && d.isAvailable);
        const vLimit = vendorDishes.reduce((s, d) => s + d.dailyLimit, 0);
        const vReserved = vendorDishes.reduce((s, d) => s + d.reservedServings, 0);
        const vRemaining = Math.max(0, vLimit - vReserved);

        return `
          <div class="canteen-card" onclick="SapatApp.selectVendorForStudent('${v.id}')">
            <div class="canteen-card-cover" style="background-image: url('${v.bannerImage}');">
              <span class="canteen-stall-badge">${v.stallNumber}</span>
              <span class="canteen-status-pill ${v.isOpen ? 'open' : 'closed'}">
                <span class="status-indicator ${v.isOpen ? 'online' : 'offline'}"></span> ${v.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <div class="canteen-card-body">
              <div class="canteen-header-row">
                <div class="canteen-avatar" style="background: ${v.avatarColor};">${v.avatar}</div>
                <div class="canteen-names">
                  <h4 class="canteen-title">${v.name}</h4>
                  <span class="canteen-cat">${v.category}</span>
                </div>
              </div>
              <p class="canteen-desc">${v.description}</p>
              <div class="canteen-footer-row">
                <span class="canteen-portions-left"><strong>${vRemaining}</strong> portions left</span>
                <span class="canteen-cta-link">Browse Menu &rarr;</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Render Featured Meals Carousel (with Vendor Identification)
    if (featuredContainer) {
      // Pick top featured dishes across vendors
      const featured = menu.filter(m => m.isAvailable).slice(0, 5);
      featuredContainer.innerHTML = featured.map(dish => {
        const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
        const isSoldOut = remaining <= 0;
        const tagClass = isSoldOut ? 'soldout' : (remaining <= 5 ? 'low' : 'available');
        const tagLabel = isSoldOut ? 'SOLD OUT' : `${remaining} left`;

        return `
          <div class="featured-card" onclick="SapatApp.openMealModal('${dish.id}')">
            <div class="featured-img-wrap">
              <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src=SapatApp.getImgFallback();">
              <span class="stock-tag-pill ${tagClass}">${tagLabel}</span>
              <span class="featured-stall-tag">${dish.vendorStall || 'Stall'}</span>
            </div>
            <div class="featured-content">
              <div class="featured-vendor-line">${dish.vendorName}</div>
              <h4>${dish.name}</h4>
              <div class="item-cat">${dish.categoryName}</div>
              <div class="featured-bottom">
                <span class="featured-price">₱${dish.price}</span>
                <button class="btn-mini-add" 
                  ${isSoldOut ? 'disabled' : ''} 
                  onclick="event.stopPropagation(); SapatApp.quickAddToCart('${dish.id}')">
                  ${isSoldOut ? 'Sold Out' : '+ Add'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Render Quick Pre-orders list (First 4 available meals)
    if (quickContainer) {
      const quickMeals = menu.filter(m => m.isAvailable).slice(0, 4);
      quickContainer.innerHTML = quickMeals.map(dish => this.generateFoodCardHTML(dish)).join('');
    }
  },

  // =========================================================================
  // Student Screen 2: Menu with Vendor Switching
  // =========================================================================
  renderStudentMenu(vendors, menu) {
    const listContainer = document.getElementById('menu-food-list');
    const vendorSelectorWrap = document.getElementById('menu-canteen-selector-wrap');
    if (!listContainer) return;

    // Render Canteen Tabs / Filter Bar
    if (vendorSelectorWrap) {
      const activeV = this.studentVendorFilter;
      vendorSelectorWrap.innerHTML = `
        <div class="canteen-tabs-bar">
          <button class="canteen-tab-pill ${activeV === 'all' ? 'active' : ''}" 
                  onclick="SapatApp.selectVendorForStudent('all')">
            All Canteens (5)
          </button>
          ${vendors.map(v => `
            <button class="canteen-tab-pill ${activeV === v.id ? 'active' : ''}" 
                    onclick="SapatApp.selectVendorForStudent('${v.id}')">
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
              <button class="btn-switch-canteen" onclick="SapatApp.selectVendorForStudent('all')">
                All Stalls
              </button>
            </div>
          `;
        })() : `
          <div class="all-canteens-notice">
            <span>Showing meals from all 5 school canteen stalls. Tap a stall above to view only its menu.</span>
          </div>
        `}
      `;
    }

    let filtered = menu.filter(d => d.isAvailable);

    // Filter by selected vendor
    if (this.studentVendorFilter !== 'all') {
      filtered = filtered.filter(d => d.vendorId === this.studentVendorFilter);
    }

    // Filter by category
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(d => d.category === this.activeCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.description.toLowerCase().includes(q) ||
        d.categoryName.toLowerCase().includes(q) ||
        (d.vendorName && d.vendorName.toLowerCase().includes(q)) ||
        (d.vendorStall && d.vendorStall.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-wrap">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3>No matching meals found</h3>
          <p>Try searching for other dishes or tap 'All Canteens' to browse the other stalls.</p>
          <button class="btn-primary-action" style="margin-top: 10px;" onclick="SapatApp.selectVendorForStudent('all')">View All Canteens</button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(dish => this.generateFoodCardHTML(dish)).join('');
  },

  generateFoodCardHTML(dish) {
    const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
    const isSoldOut = remaining <= 0;
    const percentFilled = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
    
    let gaugeClass = '';
    let statusTextClass = '';
    if (isSoldOut) {
      gaugeClass = 'soldout';
      statusTextClass = 'soldout';
    } else if (remaining <= 5) {
      gaugeClass = 'warning';
      statusTextClass = 'low';
    }

    return `
      <div class="food-card ${isSoldOut ? 'sold-out' : ''}" onclick="SapatApp.openMealModal('${dish.id}')">
        <div class="food-card-thumb">
          <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src=SapatApp.getImgFallback();">
          ${isSoldOut ? '<div class="sold-out-overlay">SOLD OUT<br><span style="font-size:9px; font-weight:500;">Limit Reached</span></div>' : ''}
          <span class="food-stall-pill">${dish.vendorStall || 'Stall'}</span>
        </div>
        
        <div class="food-card-details">
          <div>
            <div class="food-vendor-sub">${dish.vendorName}</div>
            <div class="food-header-line">
              <h4 class="food-title">${dish.name}</h4>
              <span class="food-price">₱${dish.price}</span>
            </div>
            <p class="food-desc">${dish.description}</p>
          </div>

          <!-- Real-Time Daily Servings Gauge -->
          <div class="servings-gauge">
            <div class="gauge-labels">
              <span>Daily Prep Quota</span>
              <span class="highlight-servings ${statusTextClass}">
                ${isSoldOut ? '0 servings left (Quota hit)' : `${remaining} of ${dish.dailyLimit} left`}
              </span>
            </div>
            <div class="gauge-bar-track">
              <div class="gauge-bar-fill ${gaugeClass}" style="width: ${percentFilled}%;"></div>
            </div>
          </div>

          <div class="food-card-actions">
            <span class="food-tag-pill">${dish.categoryName}</span>
            <button class="btn-add-cart" 
              ${isSoldOut ? 'disabled' : ''} 
              onclick="event.stopPropagation(); SapatApp.quickAddToCart('${dish.id}')">
              ${isSoldOut ? 'Sold Out' : '+ Reserve'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.renderStudentMenu(SapatStorage.getVendors(), SapatStorage.getMenu());
  },

  filterCategory(cat, btnEl) {
    this.activeCategory = cat;
    const chips = document.querySelectorAll('#category-filter-chips .chip-btn');
    chips.forEach(c => c.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderStudentMenu(SapatStorage.getVendors(), SapatStorage.getMenu());
  },

  // =========================================================================
  // Meal Details Modal
  // =========================================================================
  openMealModal(dishId) {
    const menu = SapatStorage.getMenu();
    const dish = menu.find(d => d.id === dishId);
    if (!dish) return;

    this.selectedMealForModal = dish;
    this.modalMealQty = 1;

    const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
    const isSoldOut = remaining <= 0;
    const percentFilled = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

    // Populate modal elements
    document.getElementById('modal-meal-title').textContent = dish.name;
    document.getElementById('modal-meal-cat').textContent = dish.categoryName;
    document.getElementById('modal-meal-price').textContent = `₱${dish.price}`;
    document.getElementById('modal-meal-desc').textContent = dish.description;
    document.getElementById('modal-meal-img').src = dish.image;
    document.getElementById('modal-meal-qty').textContent = '1';

    // Vendor badge in modal
    const vendorBadge = document.getElementById('modal-meal-vendor-badge');
    if (vendorBadge) {
      vendorBadge.textContent = `Sold by ${dish.vendorName} (${dish.vendorStall})`;
    }

    const servingsText = document.getElementById('modal-meal-servings-text');
    if (servingsText) {
      servingsText.textContent = isSoldOut ? '0 servings left (SOLD OUT)' : `${remaining} of ${dish.dailyLimit} remaining`;
      servingsText.style.color = isSoldOut ? '#dc2626' : (remaining <= 5 ? '#d97706' : '#059669');
    }

    const gaugeFill = document.getElementById('modal-meal-gauge-fill');
    if (gaugeFill) {
      gaugeFill.style.width = `${percentFilled}%`;
      gaugeFill.className = `gauge-bar-fill ${isSoldOut ? 'soldout' : (remaining <= 5 ? 'warning' : '')}`;
    }

    const prepNote = document.getElementById('modal-meal-prep-note');
    if (prepNote) {
      prepNote.textContent = dish.prepNote || 'Fresh batch prepared daily per student preorder target.';
    }

    const addBtn = document.getElementById('modal-btn-add');
    if (addBtn) {
      addBtn.disabled = isSoldOut;
      addBtn.textContent = isSoldOut ? 'Daily Limit Reached (Sold Out)' : 'Add to Preorder';
    }

    const modal = document.getElementById('modal-meal-details');
    if (modal) modal.classList.add('active');
  },

  closeMealModal() {
    const modal = document.getElementById('modal-meal-details');
    if (modal) modal.classList.remove('active');
    this.selectedMealForModal = null;
  },

  modalAdjustQty(delta) {
    if (!this.selectedMealForModal) return;
    const remaining = Math.max(0, this.selectedMealForModal.dailyLimit - this.selectedMealForModal.reservedServings);
    
    const existingInCart = this.cart.find(i => i.id === this.selectedMealForModal.id);
    const inCartQty = existingInCart ? existingInCart.quantity : 0;
    const maxCanAdd = remaining - inCartQty;

    let next = this.modalMealQty + delta;
    if (next < 1) next = 1;

    if (next > maxCanAdd) {
      this.showToast(`Limit reached: only ${maxCanAdd} additional serving(s) available!`, 'error');
      return;
    }

    this.modalMealQty = next;
    document.getElementById('modal-meal-qty').textContent = this.modalMealQty;
  },

  modalConfirmAddToCart() {
    if (!this.selectedMealForModal) return;
    this.addToCart(this.selectedMealForModal, this.modalMealQty);
    this.closeMealModal();
  },

  quickAddToCart(dishId) {
    const menu = SapatStorage.getMenu();
    const dish = menu.find(d => d.id === dishId);
    if (!dish) return;
    this.addToCart(dish, 1);
  },

  // =========================================================================
  // Cart Logic (Strict Stock Limit Validation & Vendor Association)
  // =========================================================================
  addToCart(dish, qty = 1) {
    const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
    
    if (remaining <= 0) {
      this.showToast(`${dish.name} is SOLD OUT today!`, 'error');
      return;
    }

    const existingIndex = this.cart.findIndex(i => i.id === dish.id);
    const currentQtyInCart = existingIndex > -1 ? this.cart[existingIndex].quantity : 0;

    if (currentQtyInCart + qty > remaining) {
      this.showToast(`Cannot order beyond preparation limit! Only ${remaining - currentQtyInCart} left.`, 'error');
      return;
    }

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += qty;
    } else {
      this.cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: qty,
        image: dish.image,
        dailyLimit: dish.dailyLimit,
        vendorId: dish.vendorId,
        vendorName: dish.vendorName,
        vendorStall: dish.vendorStall
      });
    }

    this.showToast(`Added ${qty}x ${dish.name} (${dish.vendorStall}) to preorder!`, 'success');
    this.render();
  },

  updateCartQty(dishId, delta) {
    const menu = SapatStorage.getMenu();
    const dish = menu.find(d => d.id === dishId);
    const cartItemIndex = this.cart.findIndex(i => i.id === dishId);
    if (cartItemIndex === -1) return;

    const remaining = dish ? Math.max(0, dish.dailyLimit - dish.reservedServings) : 99;
    const newQty = this.cart[cartItemIndex].quantity + delta;

    if (newQty <= 0) {
      this.cart.splice(cartItemIndex, 1);
      this.showToast('Item removed from cart', 'info');
    } else {
      if (newQty > remaining) {
        this.showToast(`Cannot exceed remaining kitchen batch of ${remaining} portions!`, 'error');
        return;
      }
      this.cart[cartItemIndex].quantity = newQty;
    }

    this.render();
  },

  // =========================================================================
  // Student Screen 3: Cart & Checkout
  // =========================================================================
  renderStudentCart(menu) {
    const contentWrap = document.getElementById('cart-content-wrap');
    const emptyWrap = document.getElementById('cart-empty-view');
    const itemsList = document.getElementById('cart-items-list');

    if (this.cart.length === 0) {
      if (contentWrap) contentWrap.style.display = 'none';
      if (emptyWrap) emptyWrap.style.display = 'block';
      return;
    }

    if (contentWrap) contentWrap.style.display = 'flex';
    if (emptyWrap) emptyWrap.style.display = 'none';

    let totalServings = 0;
    let subtotal = 0;

    itemsList.innerHTML = this.cart.map(item => {
      const liveDish = menu.find(d => d.id === item.id);
      const remaining = liveDish ? Math.max(0, liveDish.dailyLimit - liveDish.reservedServings) : item.quantity;
      const itemSubtotal = item.price * item.quantity;
      
      totalServings += item.quantity;
      subtotal += itemSubtotal;

      return `
        <div class="cart-item-row">
          <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src=SapatApp.getImgFallback();">
          <div class="cart-item-info">
            <span class="cart-stall-tag">${item.vendorStall}: ${item.vendorName}</span>
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-price">₱${item.price} each &bull; <strong>₱${itemSubtotal}</strong></div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
              Kitchen batch quota: ${remaining} available
            </div>
          </div>
          <div class="cart-qty-controls">
            <button class="qty-btn" onclick="SapatApp.updateCartQty('${item.id}', -1)">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="SapatApp.updateCartQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `;
    }).join('');

    // Summary
    document.getElementById('bill-total-servings').textContent = totalServings;
    document.getElementById('bill-subtotal').textContent = `₱${subtotal}`;
    document.getElementById('bill-grand-total').textContent = `₱${subtotal}`;
  },

  confirmPreorder() {
    if (this.cart.length === 0) {
      this.showToast('Your cart is empty', 'error');
      return;
    }

    const menu = SapatStorage.getMenu();
    
    // Strict Verification: Ensure none exceed current stock
    for (const item of this.cart) {
      const dish = menu.find(d => d.id === item.id);
      if (!dish) continue;
      const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
      if (item.quantity > remaining) {
        this.showToast(`Cannot reserve: ${dish.name} only has ${remaining} portions left!`, 'error');
        return;
      }
    }

    const selectedSlotEl = document.querySelector('input[name="pickup-slot"]:checked');
    const pickupSlot = selectedSlotEl ? selectedSlotEl.value : '11:30 AM (Lunch Shift 1)';
    const kitchenNote = document.getElementById('checkout-note') ? document.getElementById('checkout-note').value.trim() : '';

    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Deduct stock for all items
    this.cart.forEach(item => {
      const targetDish = menu.find(d => d.id === item.id);
      if (targetDish) {
        targetDish.reservedServings += item.quantity;
      }
    });
    SapatStorage.saveMenu(menu);

    // Group items by vendor to create independent orders per stall
    const itemsByVendor = {};
    this.cart.forEach(item => {
      const vId = item.vendorId || 'vendor-lita';
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    const existingOrders = SapatStorage.getOrders();
    const createdOrderIds = [];

    Object.keys(itemsByVendor).forEach(vId => {
      const vItems = itemsByVendor[vId];
      const vendor = SapatStorage.getVendorById(vId);
      const newOrderId = `SPT-${Math.floor(1000 + Math.random() * 9000)}`;
      createdOrderIds.push(newOrderId);

      const vTotalAmount = vItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const vTotalServings = vItems.reduce((sum, item) => sum + item.quantity, 0);

      const newOrder = {
        id: newOrderId,
        vendorId: vId,
        vendorName: vendor ? vendor.name : vItems[0].vendorName,
        vendorStall: vendor ? vendor.stallNumber : vItems[0].vendorStall,
        studentName: 'Maria Santos',
        studentId: '2024-0891',
        gradeSection: 'Grade 11 - STEM A',
        pickupTime: pickupSlot,
        specialInstructions: kitchenNote,
        items: vItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          vendorId: item.vendorId
        })),
        totalAmount: vTotalAmount,
        totalServings: vTotalServings,
        status: 'Pending',
        createdAt: `Today ${timeString}`,
        timeline: [
          { status: 'Preordered', time: timeString, done: true },
          { status: 'Confirmed', time: '--', done: false },
          { status: 'Preparing', time: '--', done: false },
          { status: 'Ready for Pickup', time: '--', done: false },
          { status: 'Completed', time: '--', done: false }
        ]
      };

      existingOrders.unshift(newOrder);
    });

    SapatStorage.saveOrders(existingOrders);

    this.cart = [];
    if (document.getElementById('checkout-note')) {
      document.getElementById('checkout-note').value = '';
    }

    this.showToast(`Pre-order placed successfully for ${createdOrderIds.join(', ')}!`, 'success');
    this.navigateTo('student-orders');
  },

  // =========================================================================
  // Student Screen 4: My Orders
  // =========================================================================
  filterOrdersTab(tab) {
    this.ordersTab = tab;
    document.getElementById('filter-orders-active').classList.toggle('active', tab === 'active');
    document.getElementById('filter-orders-history').classList.toggle('active', tab === 'history');
    this.renderStudentOrders(SapatStorage.getOrders());
  },

  renderStudentOrders(orders) {
    const container = document.getElementById('student-orders-container');
    if (!container) return;

    let studentOrders = orders.filter(o => o.studentName === 'Maria Santos');

    if (this.ordersTab === 'active') {
      studentOrders = studentOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
    } else {
      studentOrders = studentOrders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');
    }

    if (studentOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-state-wrap">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <h3>No ${this.ordersTab === 'active' ? 'active' : 'past'} pre-orders</h3>
          <p>${this.ordersTab === 'active' ? 'Reserve your lunch or snack from our 5 canteen stalls!' : 'Your completed and claimed meals will be recorded here.'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = studentOrders.map(order => {
      const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

      const steps = [
        { label: 'Ordered', key: 'Preordered' },
        { label: 'Confirmed', key: 'Confirmed' },
        { label: 'Cooking', key: 'Preparing' },
        { label: 'Ready', key: 'Ready for Pickup' },
        { label: 'Claimed', key: 'Completed' }
      ];

      const statusIndexMap = {
        'Pending': 0,
        'Confirmed': 1,
        'Preparing': 2,
        'Ready for Pickup': 3,
        'Completed': 4,
        'Cancelled': -1
      };

      const currentIdx = statusIndexMap[order.status] ?? 0;

      const progressPercent = currentIdx >= 0 ? Math.min(100, Math.max(0, (currentIdx / (steps.length - 1)) * 100)) : 0;
      const stepperHTML = order.status === 'Cancelled' ? `
        <div class="cancelled-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>This pre-order was cancelled and portions refunded to the kitchen.</span>
        </div>
      ` : `
        <div class="order-progress-stepper">
          <div class="stepper-progress-fill" style="width: calc(${progressPercent}% * 0.86);"></div>
          ${steps.map((st, idx) => {
            let cls = '';
            if (idx < currentIdx) cls = 'completed';
            else if (idx === currentIdx) cls = 'active';
            const dotContent = idx < currentIdx 
              ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' 
              : (idx + 1);
            return `
              <div class="step-point ${cls}">
                <div class="step-dot">${dotContent}</div>
                <div class="step-label">${st.label}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      return `
        <div class="order-card">
          <div class="order-card-header">
            <div>
              <div class="order-vendor-title">
                <span class="order-stall-tag">${order.vendorStall || 'Stall'}</span>
                <strong>${order.vendorName || 'Canteen'}</strong>
              </div>
              <span class="order-id-badge">Order #${order.id}</span>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${order.createdAt}</div>
            </div>
            <span class="order-status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}">
              ${order.status}
            </span>
          </div>

          <div style="font-size: 12px; margin-bottom: 6px;">
            <strong>Pickup Window:</strong> ${order.pickupTime}
          </div>

          ${stepperHTML}

          <div class="order-items-snippet">
            <strong>Dishes:</strong> ${itemsText}
            ${order.specialInstructions ? `<br><em>Note: "${order.specialInstructions}"</em>` : ''}
          </div>

          <div class="order-meta-footer">
            <span>${order.totalServings} serving(s) reserved</span>
            <span class="order-total-price">₱${order.totalAmount}</span>
          </div>

          <div class="order-actions-row">
            <button class="btn-secondary-action" onclick="SapatApp.openPickupPass('${order.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="7" y2="8.01"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="13" y2="16"></line></svg>
              View Pickup Pass
            </button>
            ${(order.status === 'Pending' || order.status === 'Confirmed') ? `
              <button class="btn-danger-outline" onclick="SapatApp.cancelStudentOrder('${order.id}')">
                Cancel
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  openPickupPass(orderId) {
    const orders = SapatStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('pass-order-id').textContent = `#${order.id}`;
    document.getElementById('pass-student-name').textContent = order.studentName;
    document.getElementById('pass-pickup-slot').textContent = order.pickupTime;

    const passStallInfo = document.getElementById('pass-stall-info');
    if (passStallInfo) {
      passStallInfo.textContent = `Present at ${order.vendorStall || 'Stall Window'} (${order.vendorName || 'Canteen Counter'}) to claim.`;
    }

    const modal = document.getElementById('modal-pickup-pass');
    if (modal) modal.classList.add('active');
  },

  closePickupPass() {
    const modal = document.getElementById('modal-pickup-pass');
    if (modal) modal.classList.remove('active');
  },

  cancelStudentOrder(orderId) {
    if (!confirm(`Cancel pre-order #${orderId}? This releases your reserved servings back to the stall immediately.`)) {
      return;
    }

    const orders = SapatStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Release reserved servings back to menu items
    const menu = SapatStorage.getMenu();
    order.items.forEach(item => {
      const dish = menu.find(d => d.id === item.id);
      if (dish) {
        dish.reservedServings = Math.max(0, dish.reservedServings - item.quantity);
      }
    });

    order.status = 'Cancelled';
    
    SapatStorage.saveMenu(menu);
    SapatStorage.saveOrders(orders);

    this.showToast(`Order #${orderId} cancelled. Servings returned to ${order.vendorStall}.`, 'info');
    this.render();
  },

  // =========================================================================
  // Student Screen 5: Profile
  // =========================================================================
  renderStudentProfile(settings) {
    const prof = settings.studentProfile || {};
    const countEl = document.getElementById('profile-preorders-count');
    const wasteEl = document.getElementById('profile-waste-saved');

    if (countEl) countEl.textContent = prof.preordersCount || 16;
    if (wasteEl) wasteEl.textContent = `${prof.wasteSavedKg || 5.4} kg`;
  },

  // =========================================================================
  // Vendor Screen 1: Dashboard (Isolated Per Vendor)
  // =========================================================================
  renderVendorDashboard(currentVendor, vendorDishes, vendorOrders) {
    // Vendor Header titles
    const vTitle = document.getElementById('vendor-dash-title');
    const vStall = document.getElementById('vendor-dash-stall');
    const vSub = document.getElementById('vendor-dash-sub');
    if (vTitle) vTitle.textContent = currentVendor.name;
    if (vStall) vStall.textContent = `${currentVendor.stallNumber} &bull; ${currentVendor.category}`;
    if (vSub) vSub.textContent = `Today's Kitchen Production Target & Orders (${currentVendor.hours})`;

    const totalOrdersCount = vendorOrders.filter(o => o.status !== 'Cancelled').length;
    const totalDailyLimit = vendorDishes.reduce((sum, d) => sum + d.dailyLimit, 0);
    const totalReserved = vendorDishes.reduce((sum, d) => sum + d.reservedServings, 0);
    const totalRemaining = Math.max(0, totalDailyLimit - totalReserved);
    const totalProjectedSales = vendorOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // KPI elements
    document.getElementById('vendor-kpi-orders').textContent = totalOrdersCount;
    document.getElementById('vendor-kpi-reserved').textContent = totalReserved;
    document.getElementById('vendor-kpi-reserved-sub').textContent = `of ${totalDailyLimit} daily target`;
    document.getElementById('vendor-kpi-remaining').textContent = totalRemaining;
    document.getElementById('vendor-kpi-sales').textContent = `₱${totalProjectedSales.toLocaleString()}`;

    // Smart Prep Recommendation per Vendor
    const smartPrepText = document.getElementById('vendor-smart-prep-text');
    if (smartPrepText) {
      if (currentVendor.id === 'vendor-lita') {
        smartPrepText.innerHTML = `High demand detected for <strong>Chicken Adobo (45 servings)</strong> and <strong>Pork Sinigang (35 servings)</strong>. Keep current batch limit to avoid overcooking.`;
      } else if (currentVendor.id === 'vendor-ben') {
        smartPrepText.innerHTML = `Morning rush peaks for <strong>Tapsilog (40 portions)</strong> and <strong>Longsilog (35 portions)</strong>. 12 portions remain available before cutoff.`;
      } else if (currentVendor.id === 'vendor-cora') {
        smartPrepText.innerHTML = `Steady midday demand for <strong>Pork Giniling (35 servings)</strong> and <strong>Ginisang Monggo (40 servings)</strong>. Preparation limits are on target.`;
      } else if (currentVendor.id === 'vendor-green') {
        smartPrepText.innerHTML = `Healthy bowls show rapid reservations for <strong>Chicken Teriyaki</strong> and <strong>Tuna Rice Bowls</strong>. Batch capacity safe at 57% reserved.`;
      } else {
        smartPrepText.innerHTML = `Snack peaks at 9:45 AM & 3:00 PM for <strong>Turon (50 servings)</strong> and <strong>Pancit Bihon (45 servings)</strong>. Fry fresh in 25-minute batches.`;
      }
    }

    // Urgent Preparation Status Items for THIS vendor only
    const urgentContainer = document.getElementById('vendor-dashboard-urgent-dishes');
    if (urgentContainer) {
      const urgentDishes = vendorDishes.filter(d => (d.reservedServings / d.dailyLimit) >= 0.70 || d.reservedServings >= d.dailyLimit);
      
      if (urgentDishes.length === 0) {
        urgentContainer.innerHTML = `
          <div style="background: white; border-radius: 12px; padding: 14px; text-align: center; color: var(--text-secondary); font-size: 12px; border: 1px solid var(--border-light);">
            <div style="display:inline-flex; align-items:center; gap:6px; color: var(--primary); font-weight: 500;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> All ${currentVendor.name} dishes are operating within safe preparation limits. No sold-out spikes yet.</div>
          </div>
        `;
      } else {
        urgentContainer.innerHTML = urgentDishes.map(dish => {
          const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
          const isSoldOut = remaining <= 0;
          return `
            <div class="prep-matrix-card" style="margin-bottom: 8px;">
              <div class="prep-matrix-top">
                <div>
                  <h4 class="prep-dish-title">${dish.name}</h4>
                  <span class="prep-dish-cat">${dish.categoryName}</span>
                </div>
                <span class="stock-tag-pill ${isSoldOut ? 'soldout' : 'low'}">
                  ${isSoldOut ? 'SOLD OUT (Max Prep Hit)' : `Only ${remaining} left`}
                </span>
              </div>
              <div class="servings-gauge">
                <div class="gauge-bar-track">
                  <div class="gauge-bar-fill ${isSoldOut ? 'soldout' : 'warning'}" style="width: ${Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit)*100))}%;"></div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px;">
                <span>Reserved: <strong>${dish.reservedServings}</strong> / Target: <strong>${dish.dailyLimit}</strong></span>
                <button class="btn-bump" onclick="SapatApp.bumpDishLimit('${dish.id}', 5)">+5 Batch Quota</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  // =========================================================================
  // Vendor Screen 2: Manage Menu (Isolated per Vendor)
  // =========================================================================
  renderVendorMenu(currentVendor, vendorDishes) {
    const container = document.getElementById('vendor-menu-container');
    const headerTitle = document.getElementById('vendor-menu-header-title');
    if (headerTitle) {
      headerTitle.textContent = `${currentVendor.name} — Menu & Limits`;
    }

    if (!container) return;

    if (vendorDishes.length === 0) {
      container.innerHTML = `
        <div class="empty-state-wrap">
          <h3>No dishes in this stall</h3>
          <p>Tap + Add Dish to add a new food item with its preparation ceiling.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = vendorDishes.map(dish => {
      const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
      return `
        <div class="vendor-menu-card">
          <img class="vendor-menu-img" src="${dish.image}" alt="${dish.name}" onerror="this.onerror=null; this.src=SapatApp.getImgFallback();">
          <div class="vendor-menu-info">
            <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 2px;">${dish.name}</h4>
            <div style="font-size: 12px; color: var(--primary-dark); font-weight: 800; margin-bottom: 4px;">₱${dish.price}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">
              Daily Limit: <strong>${dish.dailyLimit}</strong> &bull; Reserved: <strong>${dish.reservedServings}</strong>
            </div>
            <div style="font-size: 10.5px; color: ${remaining <= 0 ? '#dc2626' : '#059669'}; font-weight: 600;">
              ${remaining <= 0 ? 'SOLD OUT' : `${remaining} servings remaining`}
            </div>
          </div>
          <div class="vendor-menu-actions">
            <label class="switch" title="Toggle student availability">
              <input type="checkbox" ${dish.isAvailable ? 'checked' : ''} onchange="SapatApp.toggleDishAvailability('${dish.id}', this.checked)">
              <span class="slider"></span>
            </label>
            <button class="btn-bump" onclick="SapatApp.openEditDishModal('${dish.id}')">Edit</button>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleDishAvailability(dishId, isChecked) {
    const menu = SapatStorage.getMenu();
    const dish = menu.find(d => d.id === dishId);
    if (!dish) return;

    dish.isAvailable = isChecked;
    SapatStorage.saveMenu(menu);
    this.showToast(`${dish.name} is now ${isChecked ? 'Available' : 'Hidden'} for students`, 'info');
  },

  openAddDishModal() {
    const vendor = SapatStorage.getVendorById(this.currentVendorId);
    document.getElementById('dish-editor-title').textContent = `Add Dish to ${vendor ? vendor.name : 'Stall'}`;
    document.getElementById('edit-dish-id').value = '';
    document.getElementById('edit-dish-name').value = '';
    document.getElementById('edit-dish-category').value = 'rice-meals';
    document.getElementById('edit-dish-price').value = '65';
    document.getElementById('edit-dish-limit').value = '35';
    document.getElementById('edit-dish-suggested').value = '35';
    document.getElementById('edit-dish-img-preset').value = 'custom';
    document.getElementById('edit-dish-img-url').value = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80';
    document.getElementById('edit-dish-desc').value = '';
    document.getElementById('edit-dish-available').checked = true;

    const modal = document.getElementById('modal-dish-editor');
    if (modal) modal.classList.add('active');
  },

  openEditDishModal(dishId) {
    const menu = SapatStorage.getMenu();
    const dish = menu.find(d => d.id === dishId);
    if (!dish) return;

    document.getElementById('dish-editor-title').textContent = `Edit Dish: ${dish.name}`;
    document.getElementById('edit-dish-id').value = dish.id;
    document.getElementById('edit-dish-name').value = dish.name;
    document.getElementById('edit-dish-category').value = dish.category;
    document.getElementById('edit-dish-price').value = dish.price;
    document.getElementById('edit-dish-limit').value = dish.dailyLimit;
    document.getElementById('edit-dish-suggested').value = dish.suggestedPrep || dish.dailyLimit;
    document.getElementById('edit-dish-img-url').value = dish.image;
    document.getElementById('edit-dish-desc').value = dish.description;
    document.getElementById('edit-dish-available').checked = dish.isAvailable;

    const modal = document.getElementById('modal-dish-editor');
    if (modal) modal.classList.add('active');
  },

  closeDishEditorModal() {
    const modal = document.getElementById('modal-dish-editor');
    if (modal) modal.classList.remove('active');
  },

  handlePresetImgSelect(val) {
    if (val !== 'custom') {
      document.getElementById('edit-dish-img-url').value = val;
    }
  },

  handleSaveDish(e) {
    e.preventDefault();
    const dishId = document.getElementById('edit-dish-id').value;
    const name = document.getElementById('edit-dish-name').value.trim();
    const category = document.getElementById('edit-dish-category').value;
    const price = parseInt(document.getElementById('edit-dish-price').value, 10);
    const dailyLimit = parseInt(document.getElementById('edit-dish-limit').value, 10);
    const suggested = parseInt(document.getElementById('edit-dish-suggested').value, 10) || dailyLimit;
    const image = document.getElementById('edit-dish-img-url').value.trim() || 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80';
    const description = document.getElementById('edit-dish-desc').value.trim();
    const isAvailable = document.getElementById('edit-dish-available').checked;

    const catNames = {
      'rice-meals': 'Kanin at Ulam',
      'merienda': 'Meryenda',
      'veggies': 'Gulay & Healthy',
      'drinks': 'Inumin'
    };

    const menu = SapatStorage.getMenu();
    const currentVendor = SapatStorage.getVendorById(this.currentVendorId);

    if (dishId) {
      const dish = menu.find(d => d.id === dishId);
      if (dish) {
        dish.name = name;
        dish.category = category;
        dish.categoryName = catNames[category] || 'Special';
        dish.price = price;
        dish.dailyLimit = dailyLimit;
        dish.suggestedPrep = suggested;
        dish.image = image;
        dish.description = description;
        dish.isAvailable = isAvailable;
      }
      this.showToast('Dish and preparation limits updated!', 'success');
    } else {
      const newDish = {
        id: `dish-${this.currentVendorId}-${Date.now()}`,
        vendorId: this.currentVendorId,
        vendorName: currentVendor ? currentVendor.name : "Canteen Stall",
        vendorStall: currentVendor ? currentVendor.stallNumber : "Stall",
        name,
        category,
        categoryName: catNames[category] || 'Special',
        price,
        dailyLimit,
        reservedServings: 0,
        suggestedPrep: suggested,
        image,
        description,
        isAvailable,
        tags: ['New Dish']
      };
      menu.push(newDish);
      this.showToast(`New dish added to ${currentVendor ? currentVendor.name : 'stall'}!`, 'success');
    }

    SapatStorage.saveMenu(menu);
    this.closeDishEditorModal();
  },

  // =========================================================================
  // Vendor Screen 3: Manage Orders (Isolated per Vendor)
  // =========================================================================
  filterVendorOrders(filterKey, btnEl) {
    this.vendorOrdersFilter = filterKey;
    const tabs = document.querySelectorAll('#screen-vendor-orders .order-filter-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.render();
  },

  renderVendorOrders(currentVendor, vendorOrders) {
    const container = document.getElementById('vendor-orders-container');
    const headerTitle = document.getElementById('vendor-orders-header-title');
    if (headerTitle) {
      headerTitle.textContent = `${currentVendor.name} — Orders`;
    }

    if (!container) return;

    let filtered = vendorOrders;
    if (this.vendorOrdersFilter !== 'all') {
      filtered = filtered.filter(o => o.status === this.vendorOrdersFilter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-wrap">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <h3>No orders in this stage</h3>
          <p>Incoming pre-orders for ${currentVendor.name} will appear here with live preparation controls.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(order => {
      const itemsList = order.items.map(i => `&bull; <strong>${i.quantity}x</strong> ${i.name}`).join('<br>');
      
      let actionsHTML = '';
      if (order.status === 'Pending') {
        actionsHTML = `
          <button class="btn-primary-action" style="flex: 2; height: 38px; font-size: 12px;" onclick="SapatApp.updateOrderStatus('${order.id}', 'Confirmed')">
            Confirm Preorder
          </button>
          <button class="btn-danger-outline" style="flex: 1;" onclick="SapatApp.vendorCancelOrder('${order.id}')">
            Decline
          </button>
        `;
      } else if (order.status === 'Confirmed') {
        actionsHTML = `
          <button class="btn-primary-action" style="flex: 1; height: 38px; font-size: 12px;" onclick="SapatApp.updateOrderStatus('${order.id}', 'Preparing')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Start Preparing
          </button>
        `;
      } else if (order.status === 'Preparing') {
        actionsHTML = `
          <button class="btn-primary-action" style="flex: 1; height: 38px; font-size: 12px;" onclick="SapatApp.updateOrderStatus('${order.id}', 'Ready for Pickup')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> Mark Ready for Pickup
          </button>
        `;
      } else if (order.status === 'Ready for Pickup') {
        actionsHTML = `
          <button class="btn-primary-action" style="flex: 1; height: 38px; font-size: 12px; background: #1e293b;" onclick="SapatApp.updateOrderStatus('${order.id}', 'Completed')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete & Handover
          </button>
        `;
      } else if (order.status === 'Completed') {
        actionsHTML = `<div style="font-size: 11.5px; color: var(--primary); font-weight: 600; width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Order Claimed and Paid</div>`;
      } else if (order.status === 'Cancelled') {
        actionsHTML = `<div style="font-size: 11.5px; color: var(--status-cancelled); font-weight: 700; width: 100%; text-align: center;">Cancelled &bull; Servings Restored</div>`;
      }

      return `
        <div class="order-card">
          <div class="order-card-header">
            <div>
              <span class="order-id-badge">#${order.id} &bull; ${order.studentName}</span>
              <div style="font-size: 11px; color: var(--text-secondary);">${order.gradeSection} &bull; ${order.pickupTime}</div>
            </div>
            <span class="order-status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}">
              ${order.status}
            </span>
          </div>

          <div style="font-size: 12.5px; margin: 8px 0; color: var(--text-primary); line-height: 1.5;">
            ${itemsList}
          </div>

          ${order.specialInstructions ? `
            <div style="background: var(--secondary-warm); padding: 6px 10px; border-radius: 6px; font-size: 11px; color: #92400e; margin-bottom: 10px;">
              <strong>Student Request:</strong> "${order.specialInstructions}"
            </div>
          ` : ''}

          <div class="order-meta-footer">
            <span>${order.totalServings} serving(s) reserved</span>
            <span class="order-total-price">₱${order.totalAmount}</span>
          </div>

          <div class="order-actions-row" style="margin-top: 10px;">
            ${actionsHTML}
          </div>
        </div>
      `;
    }).join('');
  },

  updateOrderStatus(orderId, nextStatus) {
    const orders = SapatStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = nextStatus;
    
    if (order.timeline) {
      const step = order.timeline.find(s => s.status === nextStatus);
      if (step) {
        const now = new Date();
        step.done = true;
        step.time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      }
    }

    SapatStorage.saveOrders(orders);
    this.showToast(`Order #${orderId} marked as ${nextStatus}!`, 'success');
  },

  vendorCancelOrder(orderId) {
    if (!confirm(`Cancel order #${orderId}? Reserved servings will be released immediately.`)) return;

    const orders = SapatStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Release reserved servings back to this vendor's menu items
    const menu = SapatStorage.getMenu();
    order.items.forEach(item => {
      const dish = menu.find(d => d.id === item.id);
      if (dish) {
        dish.reservedServings = Math.max(0, dish.reservedServings - item.quantity);
      }
    });

    order.status = 'Cancelled';
    SapatStorage.saveMenu(menu);
    SapatStorage.saveOrders(orders);

    this.showToast(`Order #${orderId} cancelled & stock restored.`, 'info');
  },

  // =========================================================================
  // Vendor Screen 4: Preparation Management (Matrix & Limits)
  // =========================================================================
  renderVendorPrep(currentVendor, vendorDishes, vendorOrders) {
    const matrixContainer = document.getElementById('vendor-prep-matrix-container');
    const headerTitle = document.getElementById('vendor-prep-header-title');
    if (headerTitle) {
      headerTitle.textContent = `${currentVendor.name} — Prep Matrix`;
    }

    if (!matrixContainer) return;

    matrixContainer.innerHTML = vendorDishes.map(dish => {
      const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
      const isSoldOut = remaining <= 0;
      const percentReserved = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

      return `
        <div class="prep-matrix-card">
          <div class="prep-matrix-top">
            <div>
              <h4 class="prep-dish-title">${dish.name}</h4>
              <span class="prep-dish-cat">${dish.categoryName} &bull; ₱${dish.price}</span>
            </div>
            <span class="stock-tag-pill ${isSoldOut ? 'soldout' : (remaining <= 5 ? 'low' : 'available')}">
              ${isSoldOut ? 'SOLD OUT (Quota Reached)' : `${remaining} Servings Left`}
            </span>
          </div>

          <!-- Key Metrics Row -->
          <div class="prep-stats-row">
            <div class="prep-stat-col">
              <span style="color: var(--text-secondary);">Prep Ceiling</span>
              <strong>${dish.dailyLimit}</strong>
            </div>
            <div class="prep-stat-col">
              <span style="color: var(--text-secondary);">Pre-ordered</span>
              <strong style="color: var(--primary);">${dish.reservedServings}</strong>
            </div>
            <div class="prep-stat-col">
              <span style="color: var(--text-secondary);">Remaining</span>
              <strong style="color: ${isSoldOut ? '#dc2626' : '#1e293b'};">${remaining}</strong>
            </div>
            <div class="prep-stat-col">
              <span style="color: var(--text-secondary);">Capacity</span>
              <strong>${percentReserved}%</strong>
            </div>
          </div>

          <!-- Real-Time Progress Bar -->
          <div class="servings-gauge" style="margin-bottom: 8px;">
            <div class="gauge-bar-track" style="height: 7px;">
              <div class="gauge-bar-fill ${isSoldOut ? 'soldout' : (remaining <= 5 ? 'warning' : '')}" style="width: ${percentReserved}%;"></div>
            </div>
          </div>

          <!-- Historical Demand Intelligence -->
          <div class="prep-suggestion-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            <span>Simulated Demand: <strong>${dish.suggestedPrep || dish.dailyLimit} servings</strong> (Recommended batch)</span>
          </div>

          <!-- Adjust Batch Limits -->
          <div class="prep-actions-toolbar">
            <div class="prep-limit-adjuster">
              <span>Adjust Quota:</span>
              <button class="btn-bump" onclick="SapatApp.bumpDishLimit('${dish.id}', -5)">-5</button>
              <button class="btn-bump" onclick="SapatApp.bumpDishLimit('${dish.id}', 5)">+5</button>
              <button class="btn-bump" onclick="SapatApp.bumpDishLimit('${dish.id}', 10)">+10</button>
            </div>
            <button class="btn-bump" style="border-color: var(--primary); color: var(--primary);" onclick="SapatApp.openEditDishModal('${dish.id}')">
              Configure
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  bumpDishLimit(dishId, delta) {
    const menu = SapatStorage.getMenu();
    const dish = menu.find(d => d.id === dishId);
    if (!dish) return;

    const newLimit = dish.dailyLimit + delta;
    if (newLimit < dish.reservedServings) {
      this.showToast(`Cannot lower limit below already reserved servings (${dish.reservedServings})!`, 'error');
      return;
    }

    dish.dailyLimit = newLimit;
    SapatStorage.saveMenu(menu);
    this.showToast(`Daily limit for ${dish.name} set to ${newLimit} portions.`, 'success');
  },

  // =========================================================================
  // Vendor Screen 5: Profile (Reflects Active Vendor Stall)
  // =========================================================================
  renderVendorProfile(currentVendor, settings) {
    const vName = document.getElementById('vendor-profile-name');
    const vSub = document.getElementById('vendor-profile-sub');
    const vAvatar = document.getElementById('vendor-profile-avatar');
    const vEfficiency = document.getElementById('vendor-stat-efficiency');
    const vWaste = document.getElementById('vendor-stat-waste');
    const vRules = document.getElementById('vendor-profile-rules');

    if (vName) vName.textContent = currentVendor.name;
    if (vSub) vSub.textContent = `${currentVendor.stallNumber} &bull; Main Canteen Hall`;
    if (vAvatar) {
      vAvatar.textContent = currentVendor.avatar;
      vAvatar.style.background = currentVendor.avatarColor;
    }
    if (vEfficiency) vEfficiency.textContent = currentVendor.efficiency || '95%';
    if (vWaste) vWaste.textContent = currentVendor.wasteSaved || '12.4 kg';

    if (vRules) {
      vRules.innerHTML = `
        <strong>Operating Hours:</strong> ${currentVendor.hours}<br>
        <strong>Prep Cutoff:</strong> 30 minutes before slot<br>
        <strong>Express Pickup Lane:</strong> ${currentVendor.expressWindow || 'Counter Window'}
      `;
    }
  },

  // =========================================================================
  // Reset Prototype Data
  // =========================================================================
  resetDemoData() {
    if (!confirm('Reset Sapat prototype to factory seed data? This will restore original limits and 5-vendor mock data.')) return;
    this.cart = [];
    SapatStorage.resetData();
    this.currentVendorId = 'vendor-lita';
    this.studentVendorFilter = 'all';
    this.showToast('Prototype data reset to initial 5-vendor seed state!', 'success');
    this.render();
  },

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  showToast(message, type = 'success') {
    const toast = document.getElementById('sapat-toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast) return;

    toast.className = `sapat-toast show ${type}`;
    if (toastMsg) toastMsg.textContent = message;
    
    if (toastIcon) {
      if (type === 'success') {
        toastIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      } else if (type === 'error') {
        toastIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      } else {
        toastIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
      }
    }

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.SapatApp = SapatApp;
  SapatApp.init();
});
