import { SapatStorage } from './storage.js';

class AppState {
  constructor() {
    this.role = SapatStorage.getRole() || 'student';
    this.currentVendorId = SapatStorage.getCurrentVendorId() || 'vendor-lita';
    this.studentVendorFilter = SapatStorage.getStudentSelectedVendor() || 'all';
    this.cart = [];
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.menuSortBy = 'recommended';
    this.menuInStockOnly = false;
    this.ordersTab = 'active';
    this.vendorMenuTab = 'all';
    this.vendorPrepTab = 'all';
    this.selectedMealForModal = null;
    this.modalMealQty = 1;

    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload, this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  setRole(newRole) {
    if (newRole !== 'student' && newRole !== 'vendor' && newRole !== 'admin') return;
    this.role = newRole;
    SapatStorage.saveRole(newRole);
    this.notify('role-changed', newRole);
  }

  setCurrentVendor(vendorId) {
    this.currentVendorId = vendorId;
    SapatStorage.setCurrentVendorId(vendorId);
    this.notify('vendor-changed', vendorId);
  }

  setStudentVendorFilter(vendorId) {
    this.studentVendorFilter = vendorId;
    SapatStorage.setStudentSelectedVendor(vendorId);
    this.notify('student-vendor-filter-changed', vendorId);
  }

  setSearchQuery(q) {
    this.searchQuery = q || '';
    this.notify('search-changed', this.searchQuery);
  }

  setSelectedCategory(catId) {
    this.selectedCategory = catId || 'all';
    this.notify('category-changed', this.selectedCategory);
  }

  setMenuSortBy(sort) {
    this.menuSortBy = sort || 'recommended';
    this.notify('menu-sort-changed', this.menuSortBy);
  }

  setMenuInStockOnly(stockOnly) {
    this.menuInStockOnly = !!stockOnly;
    this.notify('menu-filter-changed', this.menuInStockOnly);
  }

  setOrdersTab(tab) {
    this.ordersTab = tab || 'active';
    this.notify('orders-tab-changed', this.ordersTab);
  }

  getCurrentStudent() {
    return SapatStorage.getCurrentStudent();
  }

  isStudentAuthenticated() {
    return !!SapatStorage.getCurrentStudent();
  }

  loginStudent(student) {
    SapatStorage.setCurrentStudent(student);
    this.notify('student-auth-changed', student);
  }

  logoutStudent() {
    SapatStorage.logoutStudent();
    this.notify('student-auth-changed', null);
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  addToCart(dish, quantity = 1) {
    const existingIndex = this.cart.findIndex(i => i.id === dish.id);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      const vendor = SapatStorage.getVendorById(dish.vendorId);
      this.cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity,
        vendorId: dish.vendorId,
        vendorName: vendor ? vendor.name : 'Canteen Stall',
        vendorStall: vendor ? vendor.stallNumber : 'Stall',
        image: dish.image,
        category: dish.category
      });
    }
    this.notify('cart-updated', this.cart);
  }

  updateCartQty(dishId, delta) {
    const item = this.cart.find(i => i.id === dishId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.id !== dishId);
    }
    this.notify('cart-updated', this.cart);
  }

  clearCart() {
    this.cart = [];
    this.notify('cart-updated', this.cart);
  }

  resetAll() {
    this.cart = [];
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.menuSortBy = 'recommended';
    this.menuInStockOnly = false;
    this.ordersTab = 'active';
    this.vendorMenuTab = 'all';
    this.vendorPrepTab = 'all';
    this.currentVendorId = 'vendor-lita';
    this.studentVendorFilter = 'all';
    SapatStorage.resetData();
    this.notify('data-reset', null);
  }
}

export const state = new AppState();

