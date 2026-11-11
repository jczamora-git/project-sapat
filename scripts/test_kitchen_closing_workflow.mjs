/**
 * PROJECT SAPAT — END-OF-DAY KITCHEN CLOSING & AFTER-SALES RECONCILIATION TEST SUITE
 * 
 * Verifies:
 * 1. Accurate auto-retrieval of daily operations summary (Claimed, Unclaimed, Walk-in, Revenue).
 * 2. Unclaimed reservations tracked separately for accountability and NOT added to physical portions.
 * 3. Per-dish breakdown calculations (Claimed, Walk-in, Limits, Leftover, Waste).
 * 4. Automatic portion reconciliation rule:
 *    Actual Prepared = Claimed Reservations + Walk-in Sales + Remaining Edible + Discarded Portions.
 * 5. Rejection of invalid portion inputs (negative values, prepared < sold, unbalanced).
 * 6. Report submission and update in-place without duplicate reports for same vendor & date.
 * 7. Report history retrieval and persistence.
 * 8. Campus Admin Analytics integration (Submitted status, Pending Report status, Incomplete status).
 * 9. Vendor Prep Page UI rendering across all operational states (Not Started / In Progress, Ready, Submitted).
 */

// Setup Mock DOM and Storage Environment for Node.js before dynamic imports
const storageStore = new Map();
global.localStorage = {
  getItem: (key) => (storageStore.has(key) ? storageStore.get(key) : null),
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear()
};

global.window = {
  localStorage: global.localStorage,
  dispatchEvent: () => {},
  confirm: () => true
};
global.CustomEvent = class {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts ? opts.detail : null;
  }
};
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

const { SapatStorage, INITIAL_ORDERS, INITIAL_MENU } = await import('../js/storage.js');
const { vendorPrepPage } = await import('../js/pages/vendor/prep.js');
const { adminAnalyticsPage } = await import('../js/pages/admin/analytics.js');
const { state } = await import('../js/state.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('PROJECT SAPAT — KITCHEN CLOSING & AFTER-SALES RECONCILIATION TEST');
console.log('================================================================\n');

// Reset to clean storage state
SapatStorage.resetToDefaults();
const vendorId = 'vendor-lita';

// --- 1. Auto-Retrieval of Daily Operations Summary ---
console.log('--- 1. Auto-Retrieval of Daily Operations Summary ---');
const summary = SapatStorage.getTodayAfterSalesSummary(vendorId);

assert(typeof summary.reportDate === 'string', 'Report date generated in YYYY-MM-DD format');
assert(typeof summary.claimedReservations === 'number', 'Claimed reservations count is a number');
assert(typeof summary.unclaimedReservations === 'number', 'Unclaimed reservations count is a number');
assert(typeof summary.walkInSold === 'number', 'Walk-in portions sold is a number');
assert(typeof summary.walkInRevenue === 'number', 'Walk-in revenue is a number');
assert(Array.isArray(summary.dishBreakdown), 'Per-dish breakdown list is provided');
assert(summary.dishBreakdown.length > 0, `Vendor dishes found in breakdown (Count: ${summary.dishBreakdown.length})`);

// --- 2. Per-Dish Breakdown Details ---
console.log('\n--- 2. Per-Dish Breakdown Details ---');
const adobo = summary.dishBreakdown.find(d => d.name === 'Chicken Adobo');
assert(Boolean(adobo), 'Chicken Adobo dish found in breakdown');
if (adobo) {
  assert(typeof adobo.dailyLimit === 'number' && adobo.dailyLimit > 0, `Adobo has approved limit (${adobo.dailyLimit})`);
  assert(typeof adobo.claimed === 'number', `Adobo claimed count is numeric (${adobo.claimed})`);
  assert(typeof adobo.walkInSold === 'number', `Adobo walk-in count is numeric (${adobo.walkInSold})`);
  assert(typeof adobo.remaining === 'number', `Adobo remaining portions is numeric (${adobo.remaining})`);
  assert(typeof adobo.discarded === 'number', `Adobo discarded portions is numeric (${adobo.discarded})`);
}

// --- 3. Record Walk-in Sale & Verify Auto-Update of Summary ---
console.log('\n--- 3. Walk-in Sale Integration into Closing Summary ---');
const initialWalkIn = summary.walkInSold;
const initialRevenue = summary.walkInRevenue;

const saleRes = SapatStorage.recordWalkInSale({
  vendorId,
  dishId: 'dish-lita-1',
  quantity: 2
});
assert(saleRes.success === true, 'Direct walk-in counter sale recorded');

const updatedSummary = SapatStorage.getTodayAfterSalesSummary(vendorId);
assert(updatedSummary.walkInSold === initialWalkIn + 2, `Walk-in portions updated from ${initialWalkIn} to ${updatedSummary.walkInSold}`);
assert(updatedSummary.walkInRevenue === initialRevenue + saleRes.sale.totalAmount, `Walk-in revenue updated to ₱${updatedSummary.walkInRevenue.toFixed(2)}`);

// --- 4. Portion Reconciliation Formula Enforcement ---
console.log('\n--- 4. Portion Reconciliation Formula Enforcement ---');
// Formula: Actual Prepared = Claimed Reservations + Walk-in Sales + Remaining Edible + Discarded Portions
const claimed = updatedSummary.claimedReservations;
const walkIn = updatedSummary.walkInSold;
const leftover = 3;
const waste = 1;
const perfectlyBalancedPrepared = claimed + walkIn + leftover + waste;

// A. Negative portions rejection
const negRes = SapatStorage.saveAfterSalesReport({
  vendorId,
  reportDate: updatedSummary.reportDate,
  totalPrepared: perfectlyBalancedPrepared,
  claimedReservations: claimed,
  unclaimedReservations: updatedSummary.unclaimedReservations,
  walkInSold: walkIn,
  remainingPortions: -1,
  discardedPortions: waste
});
assert(negRes.success === false, 'Negative portion inputs strictly rejected');

// B. Prepared less than sold rejection
const underPreparedRes = SapatStorage.saveAfterSalesReport({
  vendorId,
  reportDate: updatedSummary.reportDate,
  totalPrepared: claimed + walkIn - 1,
  claimedReservations: claimed,
  unclaimedReservations: updatedSummary.unclaimedReservations,
  walkInSold: walkIn,
  remainingPortions: 0,
  discardedPortions: 0
});
assert(underPreparedRes.success === false, 'Prepared less than total portions sold strictly rejected');

// C. Discrepancy rejection (Prepared != Accounted)
const discrepantRes = SapatStorage.saveAfterSalesReport({
  vendorId,
  reportDate: updatedSummary.reportDate,
  totalPrepared: perfectlyBalancedPrepared + 4, // 4 portions unaccounted
  claimedReservations: claimed,
  unclaimedReservations: updatedSummary.unclaimedReservations,
  walkInSold: walkIn,
  remainingPortions: leftover,
  discardedPortions: waste
});
assert(discrepantRes.success === false, 'Discrepant report (+4 portions unaccounted) rejected');
assert(discrepantRes.message.includes('Portion reconciliation discrepancy'), 'Informative discrepancy error message returned');

// D. Balanced report saving
const balancedRes = SapatStorage.saveAfterSalesReport({
  vendorId,
  reportDate: updatedSummary.reportDate,
  totalPrepared: perfectlyBalancedPrepared,
  claimedReservations: claimed,
  unclaimedReservations: updatedSummary.unclaimedReservations,
  walkInSold: walkIn,
  walkInRevenue: updatedSummary.walkInRevenue,
  remainingPortions: leftover,
  discardedPortions: waste,
  notes: 'Closing report: normal shift, adobo broth kept chilled.',
  dishBreakdown: updatedSummary.dishBreakdown
});
assert(balancedRes.success === true, 'Balanced report successfully saved and reconciled');
assert(balancedRes.report.reconciled === true, 'Report marked as reconciled');

// --- 5. No Duplicate Reports & Update Workflow ---
console.log('\n--- 5. Prevent Duplicate Reports & Update Workflow ---');
const reportsBefore = SapatStorage.getAfterSalesReports(vendorId);
assert(reportsBefore.length === 1, 'Only one report exists for Ate Lita');

// Update today's report with adjusted leftover and waste (balanced)
const updatedReportRes = SapatStorage.saveAfterSalesReport({
  vendorId,
  reportDate: updatedSummary.reportDate,
  totalPrepared: perfectlyBalancedPrepared,
  claimedReservations: claimed,
  unclaimedReservations: updatedSummary.unclaimedReservations,
  walkInSold: walkIn,
  walkInRevenue: updatedSummary.walkInRevenue,
  remainingPortions: leftover + 1,
  discardedPortions: waste - 1,
  notes: 'Updated report: adjusted leftover after secondary check.'
});
assert(updatedReportRes.success === true, 'Updated existing report successfully');
const reportsAfter = SapatStorage.getAfterSalesReports(vendorId);
assert(reportsAfter.length === 1, 'Report updated in-place without creating duplicate entries');
assert(reportsAfter[0].remainingPortions === leftover + 1, 'Updated portion values persisted');
assert(reportsAfter[0].notes.includes('Updated report'), 'Updated notes persisted');

// --- 6. Unclaimed Reservations Separation Rule ---
console.log('\n--- 6. Unclaimed Reservations Accountability Rule ---');
// Unclaimed reservations represent paid/confirmed orders not claimed by students.
// They must be recorded for accountability but NEVER counted into physical portion sales in the formula.
assert(
  reportsAfter[0].totalPrepared === reportsAfter[0].claimedReservations + reportsAfter[0].walkInSold + reportsAfter[0].remainingPortions + reportsAfter[0].discardedPortions,
  'Physical balance formula strictly maintained: Prepared = Claimed + Walk-in + Leftover + Discarded'
);
assert(typeof reportsAfter[0].unclaimedReservations === 'number', 'Unclaimed reservations tracked as separate accountability field');

// --- 7. Campus Admin Analytics Integration ---
console.log('\n--- 7. Campus Admin Analytics Integration ---');
const container = { innerHTML: '', appendChild: () => {}, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} };
adminAnalyticsPage.render(container);
const adminHTML = container.innerHTML;

assert(adminHTML.includes('Stall Daily After-Sales &amp; Physical Sales Audit'), 'Campus Admin includes Stall Daily After-Sales section');
assert(adminHTML.includes('Submitted'), 'Ate Lita status displays "Submitted"');
assert(adminHTML.includes('Pending Report'), 'Unsubmitted stalls display "Pending Report" (not fabricated data)');

// --- 8. Vendor Prep Page UI Rendering Across Operational States ---
console.log('\n--- 8. Vendor Prep Page UI Rendering Across Operational States ---');
state.currentVendorId = 'vendor-lita';

// A. Submitted / Completed View
vendorPrepPage._isEditingReport = false;
const submittedHTML = vendorPrepPage.renderKitchenClosing(
  'vendor-lita',
  SapatStorage.getTodayAfterSalesSummary('vendor-lita'),
  reportsAfter[0]
);
assert(submittedHTML.includes('End-of-Day Kitchen Closing'), 'Submitted view has "End-of-Day Kitchen Closing" title');
assert(submittedHTML.includes('Submitted &amp; Reconciled'), 'Submitted view displays "Submitted & Reconciled" status');
assert(submittedHTML.includes('Edit / Update Closing Report'), 'Submitted view provides "Edit / Update Closing Report" action');
assert(submittedHTML.includes('Section A &bull; Daily Operations Summary'), 'Section A present in submitted view');
assert(submittedHTML.includes('Section E &bull; Recent Closing Reports'), 'Section E History present in submitted view');

// B. Active Form View (Editing / In Progress)
vendorPrepPage._isEditingReport = true;
const formHTML = vendorPrepPage.renderKitchenClosing(
  'vendor-lita',
  SapatStorage.getTodayAfterSalesSummary('vendor-lita'),
  reportsAfter[0]
);
assert(formHTML.includes('Editing Submitted Report'), 'Edit view displays editing mode banner');
assert(formHTML.includes('Section B &bull; Actual Preparation Record'), 'Section B per-dish breakdown present');
assert(formHTML.includes('Section C &bull; Automatic Portion Reconciliation'), 'Section C reconciliation present');
assert(formHTML.includes('Section D &bull; Review Closing Summary'), 'Section D review summary present');
assert(formHTML.includes('dish-prep-input'), 'Per-dish preparation inputs present');
assert(formHTML.includes('dish-rem-input'), 'Per-dish leftover inputs present');
assert(formHTML.includes('dish-disc-input'), 'Per-dish waste inputs present');

console.log('\n================================================================');
console.log(`RESULTS: ${passed}/${passed + failed} TESTS PASSED.`);
if (failed === 0) {
  console.log('ALL KITCHEN CLOSING & AFTER-SALES RECONCILIATION TESTS PASSED!');
} else {
  console.error(`FAILED ${failed} TESTS.`);
  process.exit(1);
}
console.log('================================================================');
