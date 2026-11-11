import assert from 'node:assert';

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
  getElementById: (id) => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ getContext: () => null })
};

const { state } = await import('../js/state.js');
const { SapatStorage } = await import('../js/storage.js');
const { adminAnalyticsPage } = await import('../js/pages/admin/analytics.js');

// Reset to clean baseline
SapatStorage.resetData();
state.setRole('admin');

console.log('Testing render on fresh baseline:');
const container = {
  innerHTML: '',
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => []
};

try {
  adminAnalyticsPage.render(container);
  console.log('Render 1 passed! Length:', container.innerHTML.length);
} catch (e) {
  console.error('Render 1 FAILED:', e);
}

// Now test with simulated operations that could happen in the app:
// 1. Walk-in sales recorded
console.log('\nTesting after walk-in sale:');
SapatStorage.recordWalkInSale({
  vendorId: 'vendor-lita',
  dishId: 'dish-1',
  dishName: 'Chicken Adobo',
  quantity: 2,
  price: 65,
  totalAmount: 130
});

try {
  adminAnalyticsPage.render(container);
  console.log('Render 2 (after walk-in sale) passed!');
} catch (e) {
  console.error('Render 2 FAILED:', e);
}

// 2. Kitchen closing report submitted
console.log('\nTesting after kitchen closing report:');
const afterSales = SapatStorage.getTodayAfterSalesSummary('vendor-lita');
SapatStorage.saveAfterSalesReport({
  vendorId: 'vendor-lita',
  reportDate: afterSales.reportDate,
  totalPrepared: 40,
  claimedReservations: afterSales.claimedReservations,
  unclaimedReservations: afterSales.unclaimedReservations,
  walkInSold: afterSales.walkInSold,
  walkInRevenue: afterSales.walkInRevenue,
  remainingPortions: 38,
  discardedPortions: 0,
  notes: 'Closing done',
  dishBreakdown: []
});

try {
  adminAnalyticsPage.render(container);
  console.log('Render 3 (after kitchen closing report) passed!');
} catch (e) {
  console.error('Render 3 FAILED:', e);
}

// 3. Mark an order as no-show
console.log('\nTesting after mark order no-show:');
SapatStorage.markOrderNoShow('SPT-9021', 'Missed pickup');
try {
  adminAnalyticsPage.render(container);
  console.log('Render 4 (after no-show) passed!');
} catch (e) {
  console.error('Render 4 FAILED:', e);
}

// 4. Submit explanation
console.log('\nTesting after student explanation:');
SapatStorage.submitNoShowExplanation('SPT-9021', 'I was in class');
try {
  adminAnalyticsPage.render(container);
  console.log('Render 5 (after explanation) passed!');
} catch (e) {
  console.error('Render 5 FAILED:', e);
}

// 5. Refer to OSAS
console.log('\nTesting after refer to OSAS:');
const auditLogs = SapatStorage.getAuditLogs();
const noShowLog = auditLogs.find(l => l.eventType === 'NO_SHOW_RECORDED');
if (noShowLog) {
  SapatStorage.referIncidentToOSAS(noShowLog.id);
}
try {
  adminAnalyticsPage.render(container);
  console.log('Render 6 (after refer to OSAS) passed!');
} catch (e) {
  console.error('Render 6 FAILED:', e);
}

// 6. Test with old / malformed reports (e.g. without walkInRevenue or without timestamp)
console.log('\nTesting with missing fields in reports or logs:');
const rawReports = SapatStorage.getAfterSalesReports();
rawReports.push({
  id: 'OLD-1',
  vendorId: 'vendor-ben',
  reportDate: new Date().toISOString().split('T')[0],
  totalPrepared: 30,
  claimedReservations: 10,
  walkInSold: 5,
  // walkInRevenue is undefined!
  reconciled: true,
  remainingPortions: 15,
  discardedPortions: 0
});
SapatStorage.saveAfterSalesReports(rawReports);

try {
  adminAnalyticsPage.render(container);
  console.log('Render 7 (with missing walkInRevenue) passed!');
} catch (e) {
  console.error('Render 7 FAILED:', e);
}

// 7. Test with log without timestamp or eventType
const rawLogs = SapatStorage.getAuditLogs();
rawLogs.push({
  id: 'LOG-MALFORMED',
  // timestamp is missing!
  eventType: 'CUSTOM_EVENT'
});
SapatStorage.saveAuditLogs(rawLogs);

try {
  adminAnalyticsPage.render(container);
  console.log('Render 8 (with missing timestamp) passed!');
} catch (e) {
  console.error('Render 8 FAILED:', e);
}

