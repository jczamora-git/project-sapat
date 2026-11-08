import fs from 'fs';
import path from 'path';

// Setup minimal browser-like globals for Node testing
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

// Import storage & services
const { SapatStorage } = await import('../js/storage.js');
const { ForecastingService } = await import('../js/services/forecasting.service.js');
const { vendorDashboardPage } = await import('../js/pages/vendor/dashboard.js');
const { vendorMenuPage } = await import('../js/pages/vendor/menu.js');
const { vendorOrdersPage } = await import('../js/pages/vendor/orders.js');
const { vendorPrepPage } = await import('../js/pages/vendor/prep.js');
const { vendorProfilePage } = await import('../js/pages/vendor/profile.js');

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

console.log('--- SAPAT VENDOR OVERHAUL & QR SYSTEM VERIFICATION ---');

// 1. Initial Storage Reset
SapatStorage.resetData();
const orders = SapatStorage.getOrders();
assert(orders.length > 0, 'Orders initialized in storage');

const testOrder = orders[0];
assert(testOrder.pickupToken && testOrder.pickupToken.startsWith('spt_tok_'), 'Order contains unique opaque pickupToken');
assert(testOrder.id.startsWith('SPT-'), 'Order contains human-readable preorder code');

// 2. QRCode generation capability
const qrCodeData = global.window.QRCode.create(testOrder.pickupToken);
assert(qrCodeData && qrCodeData.modules && qrCodeData.modules.size > 0, 'QR Code matrix computed successfully from pickupToken');

let qrSvg = null;
await new Promise((resolve, reject) => {
  global.window.QRCode.toString(testOrder.pickupToken, { type: 'svg' }, (err, str) => {
    if (err) return reject(err);
    qrSvg = str;
    resolve(str);
  });
});
assert(qrSvg && qrSvg.includes('<svg') && qrSvg.includes('</svg>'), 'QR code rendered as valid SVG string from pickupToken');

// Test toCanvas with mock canvas element as done in modals.js
const mockCanvas = {
  width: 0,
  height: 0,
  style: {},
  getContext: () => ({
    clearRect: () => {},
    createImageData: (w, h) => ({ data: new Uint8Array(w * h * 4) }),
    putImageData: () => {}
  })
};
let canvasRendered = false;
await new Promise((resolve, reject) => {
  global.window.QRCode.toCanvas(mockCanvas, testOrder.pickupToken, { width: 180, margin: 1 }, (err) => {
    if (err) return reject(err);
    canvasRendered = true;
    resolve(true);
  });
});
assert(canvasRendered && mockCanvas.width === 180, 'QR code successfully rendered onto pickup pass canvas');

// 3. Lookup Order by Token and by Code
const foundByToken = SapatStorage.getOrderByToken(testOrder.pickupToken);
assert(foundByToken && foundByToken.id === testOrder.id, 'Lookup succeeded using opaque QR pickup token');

const foundByCode = SapatStorage.getOrderByToken(testOrder.id);
assert(foundByCode && foundByCode.id === testOrder.id, 'Lookup succeeded using manual preorder reference code (fallback)');

const foundByLower = SapatStorage.getOrderByToken(testOrder.id.toLowerCase());
assert(foundByLower && foundByLower.id === testOrder.id, 'Lookup succeeded case-insensitively for manual code');

// 4. Cross-stall protection
const wrongVendorId = testOrder.vendorId === 'vendor-lita' ? 'vendor-ben' : 'vendor-lita';
const crossStallClaim = SapatStorage.claimOrder(testOrder.pickupToken, wrongVendorId);
assert(!crossStallClaim.success && crossStallClaim.reason === 'WRONG_VENDOR' && crossStallClaim.message.includes('belongs to'), 'Cross-stall claim rejected with error message');

// 5. Invalid token protection
const fakeClaim = SapatStorage.claimOrder('invalid_token_123', testOrder.vendorId);
assert(!fakeClaim.success && fakeClaim.reason === 'NOT_FOUND', 'Non-existent token rejected');

// 6. Legitimate Claim Handover
const claimResult = SapatStorage.claimOrder(testOrder.pickupToken, testOrder.vendorId);
assert(claimResult.success && claimResult.order.status === 'Completed', 'Order successfully claimed by owning stall and marked Completed');

const updatedOrder = SapatStorage.getOrderByToken(testOrder.pickupToken);
assert(updatedOrder.status === 'Completed', 'Order status persisted as Completed');
assert(updatedOrder.claimedAt !== null && updatedOrder.claimedAt !== undefined, 'Order claimedAt timestamp recorded');
const hasCompletedTimeline = updatedOrder.timeline.some(t => t.status === 'Completed');
assert(hasCompletedTimeline, 'Order timeline contains Completed entry with timestamp');

// 7. Duplicate redemption prevention
const duplicateClaim = SapatStorage.claimOrder(testOrder.pickupToken, testOrder.vendorId);
assert(!duplicateClaim.success && duplicateClaim.reason === 'ALREADY_CLAIMED', 'Duplicate claim attempt prevented');

// 8. Forecasting Service & SAPAT Intelligence Engine
const forecast = ForecastingService.getVendorForecast('vendor-lita');
assert(forecast !== null, 'Forecasting service returns forecast for vendor-lita');
assert(forecast.dishes && forecast.dishes.length > 0, 'Demand forecast contains dish predictions');
assert(forecast.pickupWindows && forecast.pickupWindows.length === 3, 'Forecast contains 3 campus shift windows');
assert(forecast.sustainability && forecast.sustainability.wastePreventedKg !== undefined, 'Forecast contains sustainability waste stats');

// 8b. Customer Taste Analysis & Student Feedback
const taste = ForecastingService.getCustomerTasteAnalysis('vendor-lita');
assert(taste && taste.sentimentScore >= 80, 'Customer taste analysis reports high sentiment score');
assert(taste.flavorRatings && taste.flavorRatings.tenderness > 0, 'Customer taste ratings include flavor attributes');
assert(taste.keyStrengths && taste.keyStrengths.length > 0, 'Key strengths generated for student feedback');
assert(taste.improvementsNeeded && taste.improvementsNeeded.length > 0, 'Actionable improvements identified');
assert(taste.recentReviews && taste.recentReviews.length > 0, 'Recent verified reviews loaded');

// 8c. Requested Meals Wishlist
const wishlist = ForecastingService.getRequestedMeals('vendor-lita');
assert(wishlist && wishlist.length > 0, 'Requested meals wishlist populated');
assert(wishlist[0].votes >= wishlist[1].votes, 'Wishlist sorted in descending order of student votes');
assert(wishlist[0].suggestedPrice > 0, 'Wishlist item includes target price point');

// 8d. Tomorrow's Predictive Demand Forecast
const tomorrow = ForecastingService.getTomorrowForecast('vendor-lita');
assert(tomorrow && tomorrow.forecastDate.includes('Tomorrow'), 'Tomorrow forecast includes calendar date and schedule');
assert(tomorrow.weatherCondition && tomorrow.weatherImpact, 'Tomorrow forecast includes weather impact correlation');
assert(tomorrow.dishes && tomorrow.dishes.length > 0, 'Tomorrow forecast includes dish preparation recommendations');

// 8e. Interactive Live Simulation Sandbox
const simRush = ForecastingService.simulateRushOrders('vendor-lita', 5);
assert(simRush && simRush.newReserved > 0, 'Simulate rush orders successfully increments reservation count');

const simReview = ForecastingService.simulateStudentFeedback('vendor-lita', 'Gabriel Mendoza', 5, 'Fast pickup at counter!');
assert(simReview && simReview.studentName === 'Gabriel Mendoza', 'Simulate student feedback adds new review');

const updatedTaste = ForecastingService.getCustomerTasteAnalysis('vendor-lita');
assert(updatedTaste.recentReviews[0].studentName === 'Gabriel Mendoza', 'Taste analysis dynamically incorporates simulated review');

const simVote = ForecastingService.simulateDishRequest('vendor-lita', wishlist[0].dishName);
assert(simVote && simVote.addedVotes > 0, 'Simulate dish request increments vote tally');

const simReset = ForecastingService.resetSimulation('vendor-lita');
assert(simReset === true, 'Simulation reset restores clean baseline dataset');

// 9. Kitchen Prep safe batch adjustments
const menu = SapatStorage.getMenu().filter(d => d.vendorId === 'vendor-lita');
const dish = menu[0];
const initialLimit = dish.dailyLimit || 30;

// Test +5 limit adjustment
const prepUpdateInc = SapatStorage.updateDishDailyLimit(dish.id, initialLimit + 5);
assert(prepUpdateInc.success && prepUpdateInc.dish.dailyLimit === initialLimit + 5, 'Daily limit increased safely by +5');

// Test apply AI recommendation target
const recTarget = forecast.dishes[0]?.suggestedTarget || 45;
const prepUpdateAI = SapatStorage.updateDishDailyLimit(dish.id, recTarget);
assert(prepUpdateAI.success && prepUpdateAI.dish.dailyLimit === recTarget, 'Applied AI target successfully to kitchen quota');

// 10. Render all 5 vendor screens & AI tabs
const createMockContainer = () => ({
  innerHTML: '',
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  contains: () => true
});

const dashboardContainer = createMockContainer();
vendorDashboardPage._activeAiTab = 'prep';
vendorDashboardPage.render(dashboardContainer);
assert(dashboardContainer.innerHTML.includes('vendor-identity-card'), 'Dashboard renders branded vendor identity card');
assert(dashboardContainer.innerHTML.includes('v-ai-intelligence-section'), 'Dashboard renders SAPAT Intelligence AI preview');
assert(dashboardContainer.innerHTML.includes('Adjust Daily Target'), 'Dashboard renders AI adjust target button');

// Render Taste tab
vendorDashboardPage._activeAiTab = 'taste';
vendorDashboardPage.render(dashboardContainer);
assert(dashboardContainer.innerHTML.includes('v-taste-section'), 'Dashboard renders Customer Taste AI tab');
assert(dashboardContainer.innerHTML.includes('What Students Love'), 'Dashboard renders What Students Love insights');

// Render Wishlist tab
vendorDashboardPage._activeAiTab = 'wishlist';
vendorDashboardPage.render(dashboardContainer);
assert(dashboardContainer.innerHTML.includes('v-wishlist-section'), 'Dashboard renders Requested Meals Wishlist tab');
assert(dashboardContainer.innerHTML.includes('Student Votes'), 'Dashboard renders student votes counter');

// Render Simulation tab
vendorDashboardPage._activeAiTab = 'simulation';
vendorDashboardPage.render(dashboardContainer);
assert(dashboardContainer.innerHTML.includes('v-simulation-section'), 'Dashboard renders Live Pitch Simulation sandbox');
assert(dashboardContainer.innerHTML.includes('Simulate +5 Rush Pre-orders'), 'Dashboard renders live simulation action buttons');

const menuContainer = createMockContainer();
vendorMenuPage.render(menuContainer);
assert(menuContainer.innerHTML.includes('v-category-chips-nav'), 'Menu page renders category selector');
assert(menuContainer.innerHTML.includes('v-dish-manage-card'), 'Menu page renders dish management cards');

const ordersContainer = createMockContainer();
vendorOrdersPage.render(ordersContainer);
assert(ordersContainer.innerHTML.includes('v-scan-pickup-btn'), 'Orders page renders Scan Pickup Pass CTA');
assert(ordersContainer.innerHTML.includes('v-order-status-tabs'), 'Orders page renders status filter tabs');

const prepContainer = createMockContainer();
vendorPrepPage.render(prepContainer);
assert(prepContainer.innerHTML.includes('v-prep-segment-control'), 'Prep page renders segment controls');
assert(prepContainer.innerHTML.includes('v-prep-ai-callout'), 'Prep page renders SAPAT Intelligence recommendation callout');

const profileContainer = createMockContainer();
vendorProfilePage.render(profileContainer);
assert(profileContainer.innerHTML.includes('v-profile-business-card'), 'Profile page renders branded stall business card');
assert(profileContainer.innerHTML.includes('v-profile-metrics-deck'), 'Profile page renders accuracy and waste metrics');

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('ALL VENDOR OVERHAUL TESTS PASSED.');
} else {
  console.error('SOME TESTS FAILED.');
  process.exit(1);
}
