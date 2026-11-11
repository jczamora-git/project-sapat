import { ForecastingService } from '../js/services/forecasting.service.js';
import { SapatStorage } from '../js/storage.js';
import { MOCK_HISTORICAL_LOGS } from '../js/data/intelligence.data.js';

// Setup Mock LocalStorage for Node testing if not in browser
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

if (typeof window === 'undefined') {
  global.window = {
    dispatchEvent: () => true
  };
  global.CustomEvent = class CustomEvent {
    constructor(type, detail) { this.type = type; this.detail = detail; }
  };
}

console.log('=== RUNNING SAPAT FORECASTING VERIFICATION SUITE ===\n');

// 1. Test Forecasting Logic & Benchmark Example
console.log('TEST 1: Forecasting Logic & Formula Verification');
const forecastLita = ForecastingService.getVendorForecast('vendor-lita');
const sinigang = forecastLita.dishes.find(d => d.dishName.includes('Sinigang'));

if (!sinigang) {
  console.error('FAIL: Sinigang dish not found in vendor-lita forecast');
  process.exit(1);
}

console.log(`Checking Sinigang metrics:`);
console.log(`- Current Limit: ${sinigang.currentLimit}`);
console.log(`- Confirmed Pre-orders: ${sinigang.confirmedPreorders}`);
console.log(`- Predicted Demand: ${sinigang.predictedDemand}`);
console.log(`- Safety Buffer: ${sinigang.safetyBuffer}`);
console.log(`- Recommended Target: ${sinigang.recommendedTarget}`);
console.log(`- Additional Needed: ${sinigang.additionalNeeded}`);

const expectedTarget = sinigang.predictedDemand + sinigang.safetyBuffer;
const expectedAdditional = Math.max(expectedTarget - sinigang.currentLimit, 0);

if (sinigang.recommendedTarget !== expectedTarget) {
  console.error(`FAIL: Recommended Target (${sinigang.recommendedTarget}) !== Predicted + Buffer (${expectedTarget})`);
  process.exit(1);
}

if (sinigang.additionalNeeded !== expectedAdditional) {
  console.error(`FAIL: Additional Needed (${sinigang.additionalNeeded}) !== max(Target - Limit, 0) (${expectedAdditional})`);
  process.exit(1);
}

// Check benchmark scenario from prompt:
// Current Limit: 35, Confirmed: 32, Predicted: 46, Buffer: 4, Recommended: 50, Additional: 15
if (sinigang.currentLimit === 35 && sinigang.confirmedPreorders === 32) {
  if (sinigang.predictedDemand === 46 && sinigang.safetyBuffer === 4 && sinigang.recommendedTarget === 50 && sinigang.additionalNeeded === 15) {
    console.log('PASS: Exact benchmark scenario matched perfectly (35 limit -> 32 confirmed -> 46 predicted + 4 buffer = 50 target, +15 needed)');
  } else {
    console.error('FAIL: Exact benchmark values did not match prompt requirements');
    process.exit(1);
  }
} else {
  console.log('PASS: Formula Recommended = Predicted + Buffer and Additional = max(Target - Limit, 0) verified');
}

// Verify explanation exists
if (!sinigang.explanation || sinigang.explanation.length < 20) {
  console.error('FAIL: Missing explainable breakdown rationale');
  process.exit(1);
}
console.log(`PASS: Explanation provided: "${sinigang.explanation}"\n`);


// 2. Test Pickup Shift Forecasting
console.log('TEST 2: Pickup Shift Forecasting Math & Sum Consistency');
const totalConfirmed = forecastLita.dishes.reduce((s, d) => s + d.confirmedPreorders, 0);
const totalPredicted = forecastLita.dishes.reduce((s, d) => s + d.predictedDemand, 0);
const totalAdditional = Math.max(0, totalPredicted - totalConfirmed);

const shiftSumConfirmed = forecastLita.pickupWindows.reduce((s, w) => s + w.confirmedPreorders, 0);
const shiftSumAdditional = forecastLita.pickupWindows.reduce((s, w) => s + w.predictedAdditional, 0);
const shiftSumTotalExpected = forecastLita.pickupWindows.reduce((s, w) => s + w.totalExpectedDemand, 0);
const shiftSumPct = forecastLita.pickupWindows.reduce((s, w) => s + w.pct, 0);

console.log(`Overall totals across dishes: Confirmed=${totalConfirmed}, Predicted=${totalPredicted}, Additional=${totalAdditional}`);
console.log(`Shift sum: Confirmed=${shiftSumConfirmed}, Additional=${shiftSumAdditional}, TotalExpected=${shiftSumTotalExpected}, PctSum=${shiftSumPct}%`);

if (shiftSumConfirmed !== totalConfirmed) {
  console.error(`FAIL: Shift sum confirmed (${shiftSumConfirmed}) !== Total Confirmed (${totalConfirmed})`);
  process.exit(1);
}
if (shiftSumAdditional !== totalAdditional) {
  console.error(`FAIL: Shift sum additional (${shiftSumAdditional}) !== Total Additional (${totalAdditional})`);
  process.exit(1);
}
if (shiftSumTotalExpected !== totalPredicted) {
  console.error(`FAIL: Shift sum total expected (${shiftSumTotalExpected}) !== Total Predicted (${totalPredicted})`);
  process.exit(1);
}
if (shiftSumPct !== 100) {
  console.error(`FAIL: Shift sum percentage (${shiftSumPct}) !== 100%`);
  process.exit(1);
}

// Verify each shift has all 4 required fields
forecastLita.pickupWindows.forEach(w => {
  if (w.confirmedPreorders === undefined || w.predictedAdditional === undefined || w.totalExpectedDemand === undefined || w.pct === undefined) {
    console.error(`FAIL: Shift ${w.slot} missing one of the 4 required fields`);
    process.exit(1);
  }
});
console.log('PASS: All shift sums match overall forecast with zero double-counting, sum of % is 100%.\n');


// 3. Test Forecast Confidence Indicator & Factors
console.log('TEST 3: Forecast Confidence Indicator & Transparent Factors');
const confidence = forecastLita.confidence;
console.log(`Confidence Level: ${confidence.level} (${confidence.score}%)`);
console.log(`Factors count: ${confidence.factors.length}`);

if (!['High', 'Moderate', 'Low'].includes(confidence.level)) {
  console.error(`FAIL: Invalid confidence level: ${confidence.level}`);
  process.exit(1);
}

const requiredFactorNames = [
  'Historical Order Patterns',
  'Recent Reservations',
  'Weekday & Seasonal Trends',
  'Academic Schedules & Events',
  'Student Preferences & Feedback',
  'Weather Conditions'
];

requiredFactorNames.forEach(reqName => {
  const found = confidence.factors.find(f => f.name.toLowerCase().includes(reqName.toLowerCase().slice(0, 10)));
  if (!found) {
    console.error(`FAIL: Required factor missing: ${reqName}`);
    process.exit(1);
  }
});
if (!confidence.prototypeNotice) {
  console.error('FAIL: Missing prototype simulation transparency disclaimer');
  process.exit(1);
}
console.log(`PASS: Forecast confidence transparently derived with all 6 factors and prototype notice.\n`);


// 4. Test Actual vs Predicted Performance Tracking
console.log('TEST 4: Actual vs Predicted Performance Tracking & Accuracy Computation');
const perf = forecastLita.historicalPerformance;
if (!perf.hasData) {
  console.error('FAIL: Expected historical logs for vendor-lita');
  process.exit(1);
}

console.log(`Audited Shift Logs: ${perf.logs.length} days`);
console.log(`Calculated Average Accuracy: ${perf.averageAccuracy}%`);
console.log(`Total Food Waste Saved: ${perf.totalWasteSavedKg} kg`);

// Verify log fields
perf.logs.forEach(log => {
  if (log.predictedDemand === undefined || log.prepared === undefined || log.claimed === undefined || log.cancelledNoShow === undefined || log.unsold === undefined) {
    console.error('FAIL: Historical log missing required tracking fields', log);
    process.exit(1);
  }
  const calcAcc = ((log.claimed / log.prepared) * 100).toFixed(1);
  if (log.accuracy !== calcAcc) {
    console.error(`FAIL: Log accuracy mismatch: ${log.accuracy} !== ${calcAcc}`);
    process.exit(1);
  }
});

// Test empty state handling
console.log('Testing empty state for vendor with no logs:');
const emptyPerf = ForecastingService.getHistoricalPerformance('non-existent-stall');
if (emptyPerf.hasData === false && emptyPerf.averageAccuracy === null && emptyPerf.logs.length === 0) {
  console.log('PASS: Correctly handles empty historical data without fabricating fake accuracy.');
} else {
  console.error('FAIL: Did not handle empty historical data properly', emptyPerf);
  process.exit(1);
}
console.log('PASS: Actual vs Predicted tracking and dynamic accuracy verified.\n');


// 5. Test Data Consistency & Explicit Approval
console.log('TEST 5: Data Consistency & Vendor Limit Update Synchronization');
const menuBefore = SapatStorage.getMenu();
const targetDish = menuBefore.find(d => d.id === 'dish-lita-2');
const originalLimit = targetDish.dailyLimit;

// Update limit as if vendor approved AI recommended target of 50
const updateResult = SapatStorage.updateDishDailyLimit(targetDish.id, 50);
if (!updateResult.success || updateResult.dish.dailyLimit !== 50) {
  console.error('FAIL: updateDishDailyLimit failed', updateResult);
  process.exit(1);
}

// Re-run forecast after vendor approval
const forecastAfter = ForecastingService.getVendorForecast('vendor-lita');
const sinigangAfter = forecastAfter.dishes.find(d => d.dishId === 'dish-lita-2');

console.log(`After approving target = 50:`);
console.log(`- Current Limit: ${sinigangAfter.currentLimit}`);
console.log(`- Recommended Target: ${sinigangAfter.recommendedTarget}`);
console.log(`- Additional Needed: ${sinigangAfter.additionalNeeded}`);
console.log(`- Status State: ${sinigangAfter.statusState}`);

if (sinigangAfter.currentLimit !== 50 || sinigangAfter.additionalNeeded !== 0 || sinigangAfter.statusState !== 'optimal') {
  console.error('FAIL: Forecast did not synchronize after limit update', sinigangAfter);
  process.exit(1);
}

// Restore original limit
SapatStorage.updateDishDailyLimit(targetDish.id, originalLimit);
console.log('PASS: Single source of truth is fully synchronized after explicit approval.\n');

console.log('=== ALL SAPAT FORECASTING VERIFICATION TESTS PASSED SUCCESSFULLY! ===');

