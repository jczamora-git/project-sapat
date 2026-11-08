/**
 * PROJECT SAPAT — Master Quality Assurance & Release Test Suite
 * Verifies Student, Vendor, Admin workflows, QR Code generation/scanning/claiming,
 * SAPAT Intelligence, responsive CSS layout rules, and technical asset integrity.
 */

import fs from 'fs';
import path from 'path';

// Minimal mock DOM for Node execution
const store = new Map();
global.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};

global.window = {
  localStorage: global.localStorage,
  dispatchEvent: () => {},
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
};

global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ getContext: () => null })
};

// Evaluate QRCode library
const qrcodeSrc = fs.readFileSync('js/lib/qrcode.min.js', 'utf8');
eval(qrcodeSrc + '; global.QRCode = QRCode; global.window.QRCode = QRCode;');

// Load application modules
const { SapatStorage, INITIAL_VENDORS, INITIAL_MENU, INITIAL_ORDERS } = await import('../js/storage.js');
const { state } = await import('../js/state.js');
const { ForecastingService } = await import('../js/services/forecasting.service.js');

// Import all page modules
const { studentHomePage } = await import('../js/pages/student/home.js');
const { studentMenuPage } = await import('../js/pages/student/menu.js');
const { studentCartPage } = await import('../js/pages/student/cart.js');
const { studentOrdersPage } = await import('../js/pages/student/orders.js');
const { studentProfilePage } = await import('../js/pages/student/profile.js');

const { vendorDashboardPage } = await import('../js/pages/vendor/dashboard.js');
const { vendorIntelligencePage } = await import('../js/pages/vendor/intelligence.js');
const { vendorMenuPage } = await import('../js/pages/vendor/menu.js');
const { vendorOrdersPage } = await import('../js/pages/vendor/orders.js');
const { vendorPrepPage } = await import('../js/pages/vendor/prep.js');
const { vendorProfilePage } = await import('../js/pages/vendor/profile.js');

const { adminDashboardPage } = await import('../js/pages/admin/dashboard.js');
const { adminCanteensPage } = await import('../js/pages/admin/canteens.js');
const { adminMenuPage } = await import('../js/pages/admin/menu.js');
const { adminAnalyticsPage } = await import('../js/pages/admin/analytics.js');
const { adminSettingsPage } = await import('../js/pages/admin/settings.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`PASS: ${message}`);
  }
}

console.log('========================================================');
console.log('PROJECT SAPAT — FINAL PRE-RELEASE VERIFICATION SUITE');
console.log('========================================================\n');

// 1. Data Store Baseline
SapatStorage.resetData();
const vendors = SapatStorage.getVendors();
const menu = SapatStorage.getMenu();
const orders = SapatStorage.getOrders();

assert(vendors.length === 5, 'All 5 licensed canteen vendors initialized');
assert(menu.length >= 10, 'Menu contains items across all stalls');
assert(orders.length >= 2, 'Orders initialized with mock preorder records');

// 2. Student Workflow: Cart & Checkout
state.addToCart(menu[0], 2);
assert(state.cart.length === 1 && state.cart[0].quantity === 2, 'Meal successfully added to student cart');

state.updateCartQty(menu[0].id, -1);
assert(state.cart[0].quantity === 1, 'Cart quantity modified safely');

const cartTotal = state.getCartTotal();
assert(cartTotal === menu[0].price, 'Cart total computed accurately');

// Simulate order creation from cart
const newOrderId = `SPT-${Math.floor(1000 + Math.random() * 9000)}`;
const newPickupToken = `spt_tok_${newOrderId.toLowerCase()}_${Date.now().toString(36)}`;
const newOrderRecord = {
  id: newOrderId,
  pickupToken: newPickupToken,
  studentName: 'Julian Santos',
  studentId: '2023-10822',
  gradeSection: 'BSIT 3-A',
  vendorId: menu[0].vendorId,
  vendorName: "Ate Lita's Kitchen",
  vendorStall: 'Stall #3',
  pickupTime: 'Lunch Shift 1 (11:30 AM - 12:10 PM)',
  items: [{ id: menu[0].id, name: menu[0].name, price: menu[0].price, quantity: 1 }],
  totalAmount: menu[0].price,
  totalServings: 1,
  status: 'Ready for Pickup',
  createdAt: new Date().toISOString(),
  claimedAt: null,
  timeline: [
    { title: 'Pre-order Placed', time: '10:15 AM', status: 'Pending', done: true },
    { title: 'Kitchen Confirmed', time: '10:20 AM', status: 'Confirmed', done: true },
    { title: 'Portions Packed & Ready', time: '11:15 AM', status: 'Ready for Pickup', done: true },
    { title: 'Claimed at Counter', time: '--:--', status: 'Completed', done: false }
  ]
};
const updatedOrders = [newOrderRecord, ...orders];
SapatStorage.saveOrders(updatedOrders);
state.clearCart();
assert(state.cart.length === 0, 'Cart cleared after checkout');

// 3. QR Code System & Validation
let qrMatrix = global.window.QRCode.create(newPickupToken);
assert(qrMatrix && qrMatrix.modules.size > 0, 'Real QR matrix generated from opaque reservation token');

let qrSvg = null;
await new Promise(r => global.window.QRCode.toString(newPickupToken, { type: 'svg' }, (e, s) => { qrSvg = s; r(); }));
assert(qrSvg && qrSvg.includes('<svg') && qrSvg.includes('</svg>'), 'QR code rendered as clean SVG');

const foundByToken = SapatStorage.getOrderByToken(newPickupToken);
assert(foundByToken && foundByToken.id === newOrderId, 'Order retrieved by opaque QR token');

const foundByCode = SapatStorage.getOrderByToken(newOrderId);
assert(foundByCode && foundByCode.pickupToken === newPickupToken, 'Order retrieved by manual preorder code');

// Cross-stall protection test
const wrongClaim = SapatStorage.claimOrder(newPickupToken, 'vendor-ben');
assert(!wrongClaim.success && wrongClaim.reason === 'WRONG_VENDOR', 'Claim rejected when scanned at wrong stall counter');

// Legitimate handover claim
const legitClaim = SapatStorage.claimOrder(newPickupToken, menu[0].vendorId);
assert(legitClaim.success && legitClaim.order.status === 'Completed', 'Order successfully claimed by correct stall and marked Completed');
assert(legitClaim.order.claimedAt !== null, 'Claimed timestamp recorded');

// Duplicate claim prevention
const duplicateClaim = SapatStorage.claimOrder(newPickupToken, menu[0].vendorId);
assert(!duplicateClaim.success && duplicateClaim.reason === 'ALREADY_CLAIMED', 'Duplicate claim attempt blocked');

// 4. SAPAT Intelligence & Simulation Engine
const forecast = ForecastingService.getVendorForecast('vendor-lita');
assert(forecast.dishes.length > 0, 'Forecast generated with dish recommendations');
assert(forecast.pickupWindows.length === 3, 'Pickup window shift distributions generated');
assert(forecast.sustainability.wastePreventedKg > 0, 'Sustainability waste prevention calculated');

const taste = ForecastingService.getCustomerTasteAnalysis('vendor-lita');
assert(taste.sentimentScore >= 80, 'Customer sentiment analysis generated');
assert(taste.keyStrengths.length > 0 && taste.improvementsNeeded.length > 0, 'Actionable taste insights present');

const wishlist = ForecastingService.getRequestedMeals('vendor-lita');
assert(wishlist.length > 0 && wishlist[0].votes > 0, 'Requested meals wishlist populated');

const tomorrow = ForecastingService.getTomorrowForecast('vendor-lita');
assert(tomorrow.forecastDate && tomorrow.weatherCondition, 'Tomorrow predictive forecast generated');

// Campus-Wide Aggregated Analytics
const campusAnalytics = ForecastingService.getCampusWideAnalytics();
assert(campusAnalytics.totalCampusTarget > 0, 'Campus-wide macro demand calculated');
assert(campusAnalytics.canteenComparisons.length === 5, 'Campus-wide comparison includes all 5 stalls');
assert(campusAnalytics.topCampusRequested.length > 0, 'Campus-wide meal requests aggregated');

// Simulation test
const simRush = ForecastingService.simulateRushOrders('vendor-lita', 5);
assert(simRush && simRush.newReserved > 0, 'Live simulation increments reservation velocity');
ForecastingService.resetSimulation('vendor-lita');

// 5. Render All 16 Pages Across Roles
const createMockContainer = () => ({
  innerHTML: '',
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  contains: () => true
});

const container = createMockContainer();

// Student Pages
studentHomePage.render(container);
assert(container.innerHTML.includes('spotlight-meal-card'), 'Student Home renders spotlight card');

studentMenuPage.render(container);
assert(container.innerHTML.includes('menu-food-grid'), 'Student Menu renders food grid');

studentCartPage.render(container);
assert(container.innerHTML.includes('cart-'), 'Student Cart renders view');

studentOrdersPage.render(container);
assert(container.innerHTML.includes('orders-'), 'Student Orders renders feed');

studentProfilePage.render(container);
assert(container.innerHTML.includes('profile-'), 'Student Profile renders details');

// Dedicated Vendor SAPAT Intelligence Hub (6 Pillars)
vendorIntelligencePage._activePillar = 'forecast';
vendorIntelligencePage.render(container);
assert(container.innerHTML.includes('v-ai-hub-header-card') && container.innerHTML.includes('v-tomorrow-insight-card'), 'Vendor Intelligence renders Demand & Tomorrow pillar');

vendorIntelligencePage._activePillar = 'prep';
vendorIntelligencePage.render(container);
assert(container.innerHTML.includes('v-ai-cards-grid'), 'Vendor Intelligence renders Smart Prep Targets pillar');

vendorIntelligencePage._activePillar = 'taste';
vendorIntelligencePage.render(container);
assert(container.innerHTML.includes('v-taste-hero-card'), 'Vendor Intelligence renders Customer Taste AI pillar');

vendorIntelligencePage._activePillar = 'wishlist';
vendorIntelligencePage.render(container);
assert(container.innerHTML.includes('v-wishlist-cards-stack'), 'Vendor Intelligence renders Requested Meals wishlist pillar');

vendorIntelligencePage._activePillar = 'performance';
vendorIntelligencePage.render(container);
assert(container.innerHTML.includes('admin-data-table'), 'Vendor Intelligence renders Waste & Performance log table');

vendorIntelligencePage._activePillar = 'simulation';
vendorIntelligencePage.render(container);
assert(container.innerHTML.includes('v-sim-hero-banner'), 'Vendor Intelligence renders Live Presentation Simulation Sandbox');

// Vendor Pages
vendorDashboardPage._activeAiTab = 'prep';
vendorDashboardPage.render(container);
assert(container.innerHTML.includes('v-ai-intelligence-section'), 'Vendor Dashboard renders SAPAT Intelligence');

vendorMenuPage.render(container);
assert(container.innerHTML.includes('v-dish-manage-card'), 'Vendor Menu renders management cards');

vendorOrdersPage.render(container);
assert(container.innerHTML.includes('v-scan-pickup-btn'), 'Vendor Orders renders Scan Pickup Pass CTA');

vendorPrepPage.render(container);
assert(container.innerHTML.includes('v-prep-segment-control'), 'Vendor Kitchen Prep renders batch control');

vendorProfilePage.render(container);
assert(container.innerHTML.includes('v-profile-business-card'), 'Vendor Profile renders stall business card');

// Admin Pages
adminDashboardPage.render(container);
assert(container.innerHTML.includes('admin-kpi-grid'), 'Admin Dashboard renders executive KPIs');

adminCanteensPage.render(container);
assert(container.innerHTML.includes('admin-canteen-card'), 'Admin Canteens renders stall management');

adminMenuPage.render(container);
assert(container.innerHTML.includes('admin-data-table'), 'Admin Menu renders dish catalog table');

adminAnalyticsPage.render(container);
assert(container.innerHTML.includes('admin-kpi-grid') && container.innerHTML.includes('Canteen Stalls Operational Intelligence Matrix'), 'Admin Analytics renders macro campus-wide reports and multi-canteen table');

adminSettingsPage.render(container);
assert(container.innerHTML.includes('settings-'), 'Admin Settings renders system configuration');

// 6. CSS Responsive Rules Audit
const cssContent = fs.readFileSync('css/styles.css', 'utf8');
assert(cssContent.includes('@media (min-width: 769px)'), 'Desktop responsive layout rules present');
assert(cssContent.includes('@media (max-width: 500px)'), 'Mobile compact layout rules present');
assert(cssContent.includes('.vendor-scanner-sheet'), 'Vendor QR scanner modal styles present');
assert(cssContent.includes('.v-ai-pillar-nav'), 'Vendor SAPAT Intelligence 6-pillar nav styles present');
assert(cssContent.includes('.v-tomorrow-insight-card'), 'Vendor Tomorrow predictive insight card styles present');

console.log('\n========================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED.`);
if (passedTests === totalTests) {
  console.log('ALL PHASES PASS QUALITY ASSURANCE STANDARDS.');
} else {
  console.error('VERIFICATION FAILED.');
  process.exit(1);
}
