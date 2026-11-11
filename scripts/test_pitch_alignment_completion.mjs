/**
 * Project SAPAT — Final Pitch Deck Alignment & Prototype Completion Verification Suite
 * Verifies all 7 capabilities:
 * 1. Student meal suggestions & single-vote tracking
 * 2. Vendor walk-in sales recording & portion deduction
 * 3. Daily after-sales reconciliation report & discrepancy validation
 * 4. School calendar simulation context
 * 5. Weather simulation context
 * 6. Unified context-aware forecasting with benchmark preservation
 * 7. Campus Admin multi-stall after-sales & walk-in summary
 */

// Mock browser environment for Node.js
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

const { SapatStorage } = await import('../js/storage.js');
const { ForecastingService } = await import('../js/services/forecasting.service.js');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`PASS: ${message}`);
  } else {
    console.error(`FAIL: ${message}`);
  }
}

console.log('================================================================');
console.log('PROJECT SAPAT — PITCH DECK ALIGNMENT VERIFICATION SUITE');
console.log('================================================================\n');

// Reset to clean baseline
SapatStorage.resetData();

// --- 1. STUDENT MEAL SUGGESTIONS & VOTING ---
console.log('--- 1. Student Meal Suggestions & Single-Vote Tracking ---');
const student1 = '2026-0001';
const student2 = '2026-0002';

const subRes = SapatStorage.submitMealSuggestion({
  studentId: student1,
  studentName: 'Maria Santos',
  dishName: 'Crispy Lechon Kawali Bowl',
  description: 'Crunchy pork with spiced vinegar and mang tomas',
  vendorId: 'vendor-lita'
});
assert(subRes.success === true, 'Student suggestion submitted successfully');
assert(subRes.suggestion.votes === 1, 'Author automatically gets the initial vote');

// Attempt duplicate suggestion
const dupRes = SapatStorage.submitMealSuggestion({
  studentId: student2,
  studentName: 'Juan Dela Cruz',
  dishName: 'Crispy Lechon Kawali Bowl',
  vendorId: 'vendor-lita'
});
assert(dupRes.success === false, 'Duplicate suggestion name blocked');

// Author attempts to vote again -> blocked
const dupVoteRes = SapatStorage.voteMealSuggestion(subRes.suggestion.id, student1);
assert(dupVoteRes.success === false, 'Duplicate vote by same student blocked');

// Different student votes -> allowed
const secondVoteRes = SapatStorage.voteMealSuggestion(subRes.suggestion.id, student2);
assert(secondVoteRes.success === true && secondVoteRes.votes === 2, 'Second student can vote and increments tally to 2');

// Verify inclusion in vendor wishlist
const litaWishlist = ForecastingService.getRequestedMeals('vendor-lita');
const foundInWishlist = litaWishlist.find(w => w.dishName === 'Crispy Lechon Kawali Bowl');
assert(!!foundInWishlist && foundInWishlist.votes === 2, 'Student suggestion dynamically integrated into Vendor Wishlist');

// --- 2. VENDOR WALK-IN SALES & PORTION AVAILABILITY ---
console.log('\n--- 2. Vendor Walk-in Sales Recording & Portion Availability ---');
const dishId = 'dish-lita-1'; // Chicken Adobo (Limit: 45, Reserved: 24 -> 21 left)
const initialAvail = SapatStorage.getDishAvailablePortions(dishId);
assert(initialAvail === 21, `Initial portions available: ${initialAvail} (Expected 21)`);

// Record walk-in sale of 3 portions
const saleRes = SapatStorage.recordWalkInSale({
  vendorId: 'vendor-lita',
  dishId,
  quantity: 3
});
assert(saleRes.success === true, 'Walk-in sale of 3 portions recorded');
assert(saleRes.sale.totalAmount === (65 * 3), 'Walk-in sale total computed accurately (3 x 65 = 195)');

const updatedAvail = SapatStorage.getDishAvailablePortions(dishId);
assert(updatedAvail === 18, `Portions available decreased from 21 to 18 after walk-in sale`);

// Attempt walk-in sale exceeding available inventory
const excessiveSale = SapatStorage.recordWalkInSale({
  vendorId: 'vendor-lita',
  dishId,
  quantity: 25 // Only 18 available
});
assert(excessiveSale.success === false, 'Walk-in sale exceeding available portions rejected');

// Cross-vendor dish sale blocked
const crossSale = SapatStorage.recordWalkInSale({
  vendorId: 'vendor-ben',
  dishId, // Belongs to vendor-lita
  quantity: 1
});
assert(crossSale.success === false, 'Recording dish belonging to different vendor blocked');

// --- 3. DAILY AFTER-SALES RECONCILIATION REPORT ---
console.log('\n--- 3. Daily After-Sales Reconciliation Report ---');
const afterSalesSummary = SapatStorage.getTodayAfterSalesSummary('vendor-lita');
assert(typeof afterSalesSummary.claimedReservations === 'number', 'Claimed reservations auto-derived');
assert(afterSalesSummary.walkInSold === 3, 'Walk-in sales auto-derived into after-sales summary');

// Physical reconciliation rule:
// Total Prepared = Claimed Reservations + Walk-in Sales + Remaining + Discarded
const claimed = afterSalesSummary.claimedReservations;
const walkIn = afterSalesSummary.walkInSold;
const remainingPortions = 2;
const discardedPortions = 1;
const validPrepared = claimed + walkIn + remainingPortions + discardedPortions;

const saveReportRes = SapatStorage.saveAfterSalesReport({
  vendorId: 'vendor-lita',
  reportDate: afterSalesSummary.reportDate,
  totalPrepared: validPrepared,
  claimedReservations: claimed,
  unclaimedReservations: afterSalesSummary.unclaimedReservations,
  walkInSold: walkIn,
  remainingPortions,
  discardedPortions,
  notes: 'Reconciled test report'
});
assert(saveReportRes.success === true, 'Balanced after-sales report saved and reconciled');

// Discrepant report attempt (prepared != accounted)
const invalidReportRes = SapatStorage.saveAfterSalesReport({
  vendorId: 'vendor-lita',
  reportDate: afterSalesSummary.reportDate,
  totalPrepared: validPrepared + 5, // Discrepancy of +5
  claimedReservations: claimed,
  unclaimedReservations: afterSalesSummary.unclaimedReservations,
  walkInSold: walkIn,
  remainingPortions,
  discardedPortions,
  notes: 'Unbalanced report'
});
assert(invalidReportRes.success === false, 'Discrepant after-sales report rejected with discrepancy notice');

// --- 4 & 5. ACADEMIC & WEATHER CONTEXT SIMULATION ---
console.log('\n--- 4 & 5. Academic & Weather Context Simulation ---');
// Save custom context
SapatStorage.saveForecastContext('vendor-lita', {
  academicSchedule: 'Examination Week',
  weatherCondition: 'Sunny'
});
const savedContext = SapatStorage.getForecastContext('vendor-lita');
assert(savedContext.academicSchedule === 'Examination Week', 'Academic schedule context persisted');
assert(savedContext.weatherCondition === 'Sunny', 'Weather condition context persisted');

// Restore default benchmark context for Lita
SapatStorage.saveForecastContext('vendor-lita', {
  academicSchedule: 'Regular Academic Schedule',
  weatherCondition: 'Rainy'
});

// --- 6. UNIFIED CONTEXT-AWARE FORECASTING & BENCHMARK PRESERVATION ---
console.log('\n--- 6. Unified Context-Aware Forecasting & Benchmark Preservation ---');
const forecastLita = ForecastingService.getVendorForecast('vendor-lita');
const sinigangForecast = forecastLita.dishes.find(d => d.dishId === 'dish-lita-2');
assert(sinigangForecast.currentLimit === 35, 'Sinigang current limit is 35');
assert(sinigangForecast.confirmedPreorders === 32, 'Sinigang confirmed preorders is 32');
assert(sinigangForecast.predictedDemand === 46, 'Sinigang predicted demand is 46');
assert(sinigangForecast.safetyBuffer === 4, 'Sinigang safety buffer is 4');
assert(sinigangForecast.recommendedTarget === 50, 'Sinigang recommended target is 50');
assert(sinigangForecast.additionalNeeded === 15, 'Sinigang additional needed is 15 (+15 portions)');

// Non-Lita vendor isolation check (e.g. Kuya Ben does not show Ate Lita dishes)
const forecastBen = ForecastingService.getVendorForecast('vendor-ben');
assert(forecastBen.vendorId === 'vendor-ben', 'Kuya Ben forecast isolated to Kuya Ben stall');
const benHasLitaDish = forecastBen.dishes.some(d => d.dishId === 'dish-lita-1' || d.dishId === 'dish-lita-2');
assert(!benHasLitaDish, 'Vendor isolation intact: no Ate Lita dishes present in Kuya Ben forecast');

// Tomorrow forecast check
const tmrBen = ForecastingService.getTomorrowForecast('vendor-ben');
assert(tmrBen && tmrBen.dishes && tmrBen.dishes.length > 0, 'Tomorrow forecast populated for Kuya Ben');

// --- 7. CAMPUS ADMIN ANALYTICS ---
console.log('\n--- 7. Campus Admin Analytics ---');
const campusAnalytics = ForecastingService.getCampusWideAnalytics();
assert(campusAnalytics.canteenComparisons.length === 5, 'Campus analytics includes all 5 canteen stalls');
assert(Number(campusAnalytics.totalCampusTarget) > 0, 'Total campus prep target aggregated');
assert(Number(campusAnalytics.totalCampusReserved) > 0, 'Total campus reserved portions aggregated');

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED.`);
if (passedTests === totalTests) {
  console.log('ALL PITCH DECK ALIGNMENT CAPABILITIES VERIFIED SUCCESSFULLY!');
} else {
  console.error('SOME TESTS FAILED');
  process.exit(1);
}
console.log('================================================================');
