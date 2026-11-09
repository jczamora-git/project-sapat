/**
 * Project SAPAT — Payment Management, Reservation Confirmation & Student Accountability Verification Suite
 */

import fs from 'fs';

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
  dispatchEvent: () => { },
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
};

global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

// Load QRCode library
const qrcodeSrc = fs.readFileSync('js/lib/qrcode.min.js', 'utf8');
eval(qrcodeSrc + '; global.QRCode = QRCode; global.window.QRCode = QRCode;');

import { SapatStorage } from '../js/storage.js';
import { ForecastingService } from '../js/services/forecasting.service.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`FAIL: ${message}`);
  }
}

console.log('================================================================');
console.log('PROJECT SAPAT — PAYMENT & ACCOUNTABILITY VERIFICATION SUITE');
console.log('================================================================\n');

// Reset to clean test state
SapatStorage.resetData();

// 1. Initial Storage & Schema Verification
console.log('--- 1. Storage & Settings Verification ---');
const settings = SapatStorage.getSettings();
assert(settings.studentAffairsOffice.includes('OSAS'), 'Settings configured with Student Affairs Office (OSAS)');
assert(settings.counterPaymentDeadlineMinutes === 20, 'Direct counter payment cutoff configured to 20 minutes');
assert(settings.pickupGracePeriodMinutes === 15, 'Pickup grace period configured to 15 minutes');

const initialPayments = SapatStorage.getPayments();
assert(Array.isArray(initialPayments) && initialPayments.length > 0, 'Payments initialized with audit records');

const initialAuditLogs = SapatStorage.getAuditLogs();
assert(Array.isArray(initialAuditLogs) && initialAuditLogs.length > 0, 'Audit logs initialized with event trail');

// 2. Online Payment Workflow
console.log('\n--- 2. Online Payment Simulation Workflow ---');
const orders = SapatStorage.getOrders();
const menu = SapatStorage.getMenu();

// Create a new unpaid online pre-order
const testOnlineOrderId = 'SPT-TEST-ONL-1';
const testDish = menu.find(d => d.vendorId === 'vendor-lita');
const initialReserved = testDish.reservedServings || 0;

const onlineOrder = {
  id: testOnlineOrderId,
  pickupToken: 'spt_tok_test_onl_123',
  studentName: 'Juan Dela Cruz',
  gradeSection: 'Grade 12 - STEM B',
  vendorId: 'vendor-lita',
  vendorName: "Ate Lita's Kitchen",
  vendorStall: 'Stall #3',
  items: [{ id: testDish.id, name: testDish.name, price: testDish.price, quantity: 2 }],
  totalAmount: testDish.price * 2,
  totalServings: 2,
  pickupTime: '11:30 AM (Lunch Shift 1)',
  status: 'Pending',
  paymentMethod: 'Online Payment',
  paymentStatus: 'Pending',
  createdAt: new Date().toISOString()
};

orders.unshift(onlineOrder);
testDish.reservedServings = initialReserved + 2;
SapatStorage.saveMenu(menu);
SapatStorage.saveOrders(orders);

SapatStorage.createPaymentRecord({
  reservationId: onlineOrder.id,
  studentName: onlineOrder.studentName,
  gradeSection: onlineOrder.gradeSection,
  vendorId: onlineOrder.vendorId,
  vendorName: onlineOrder.vendorName,
  vendorStall: onlineOrder.vendorStall,
  amount: onlineOrder.totalAmount,
  method: 'Online Payment',
  status: 'Pending',
  items: onlineOrder.items
});

// CRITERIA 3 & 7: Unpaid reservation cannot be claimed
const claimUnpaidResult = SapatStorage.claimOrder(testOnlineOrderId, 'vendor-lita');
assert(!claimUnpaidResult.success && claimUnpaidResult.reason === 'UNPAID_ORDER', 'Claim strictly rejected on unpaid reservation');

// Perform Online Payment Simulation
const onlinePayResult = SapatStorage.recordOnlinePayment(testOnlineOrderId, 'GCash', '09171234567');
assert(onlinePayResult.success, 'Online payment simulation succeeded with gateway callback reference');

const updatedOnlineOrder = SapatStorage.getOrders().find(o => o.id === testOnlineOrderId);
assert(updatedOnlineOrder.paymentStatus === 'Paid', 'Order paymentStatus updated to Paid');
assert(updatedOnlineOrder.status === 'Confirmed', 'Order officially Confirmed upon verified payment');
assert(Boolean(updatedOnlineOrder.paidAt && updatedOnlineOrder.transactionReference), 'Order records paid timestamp and gateway reference');

// Duplicate payment prevention
const duplicatePayResult = SapatStorage.recordOnlinePayment(testOnlineOrderId, 'GCash', '09171234567');
assert(!duplicatePayResult.success && duplicatePayResult.reason === 'ALREADY_PAID', 'Duplicate online payment attempt prevented');

// CRITERIA 6 & 8: QR Generation for Paid & Confirmed Order
const qrCodeData = global.window.QRCode.create(updatedOnlineOrder.pickupToken);
assert(qrCodeData && qrCodeData.modules && qrCodeData.modules.size > 0, 'Valid QR pickup pass generated for paid confirmed order');

// Claiming paid order by vendor
const claimPaidResult = SapatStorage.claimOrder(testOnlineOrderId, 'vendor-lita');
assert(claimPaidResult.success, 'Paid order successfully claimed at stall counter');

// 3. Counter Payment Workflow & Expiration
console.log('\n--- 3. Direct Counter Payment Workflow ---');
const testCounterOrderId = 'SPT-TEST-CTR-1';
const counterOrder = {
  id: testCounterOrderId,
  pickupToken: 'spt_tok_test_ctr_456',
  studentName: 'Ana Gomez',
  gradeSection: 'Grade 11 - ABM A',
  vendorId: 'vendor-lita',
  vendorName: "Ate Lita's Kitchen",
  vendorStall: 'Stall #3',
  items: [{ id: testDish.id, name: testDish.name, price: testDish.price, quantity: 1 }],
  totalAmount: testDish.price,
  totalServings: 1,
  pickupTime: '12:15 PM (Lunch Shift 2)',
  status: 'Awaiting Counter Payment',
  paymentMethod: 'Counter Payment',
  paymentStatus: 'Pending',
  paymentDeadline: new Date(Date.now() + 20 * 60000).toISOString(),
  counterWindow: 'Stall #3',
  createdAt: new Date().toISOString()
};

const currentOrders = SapatStorage.getOrders();
currentOrders.unshift(counterOrder);
SapatStorage.saveOrders(currentOrders);

SapatStorage.createPaymentRecord({
  reservationId: counterOrder.id,
  studentName: counterOrder.studentName,
  gradeSection: counterOrder.gradeSection,
  vendorId: counterOrder.vendorId,
  vendorName: counterOrder.vendorName,
  vendorStall: counterOrder.vendorStall,
  amount: counterOrder.totalAmount,
  method: 'Counter Payment',
  status: 'Pending',
  paymentDeadline: counterOrder.paymentDeadline,
  counterWindow: counterOrder.counterWindow,
  items: counterOrder.items
});

// CRITERIA 2: Vendor verifies counter payment
const verifyCounterResult = SapatStorage.verifyCounterPayment(testCounterOrderId, 'Cash Counter Payment', 'Verified by Lita Stall #3');
assert(verifyCounterResult.success, 'Vendor successfully verified cash counter payment');

const verifiedCounterOrder = SapatStorage.getOrders().find(o => o.id === testCounterOrderId);
assert(verifiedCounterOrder.paymentStatus === 'Paid', 'Counter reservation marked Paid');
assert(verifiedCounterOrder.status === 'Confirmed', 'Counter reservation advanced to Confirmed');

// Duplicate counter payment prevention
const duplicateCounterResult = SapatStorage.verifyCounterPayment(testCounterOrderId, 'Cash', 'Verified again');
assert(!duplicateCounterResult.success && duplicateCounterResult.reason === 'ALREADY_PAID', 'Duplicate counter verification blocked');

// CRITERIA 4 & 5: Payment Deadline Expiration & Portions Release
console.log('\n--- 4. Unpaid Deadline Expiration & Inventory Release ---');
const testExpOrderId = 'SPT-TEST-EXP-1';
const dishMenuBefore = SapatStorage.getMenu();
const targetDish = dishMenuBefore.find(d => d.vendorId === 'vendor-lita');
const reservedBefore = targetDish.reservedServings;

const expiringOrder = {
  id: testExpOrderId,
  pickupToken: 'spt_tok_test_exp_789',
  studentName: 'Pedro Penduko',
  gradeSection: 'Grade 10 - Rizal',
  vendorId: 'vendor-lita',
  vendorName: "Ate Lita's Kitchen",
  vendorStall: 'Stall #3',
  items: [{ id: targetDish.id, name: targetDish.name, price: targetDish.price, quantity: 3 }],
  totalAmount: targetDish.price * 3,
  totalServings: 3,
  pickupTime: '11:30 AM (Lunch Shift 1)',
  status: 'Awaiting Counter Payment',
  paymentMethod: 'Counter Payment',
  paymentStatus: 'Pending',
  paymentDeadline: new Date(Date.now() - 5000).toISOString(), // Expired
  createdAt: new Date().toISOString()
};

targetDish.reservedServings += 3;
SapatStorage.saveMenu(dishMenuBefore);

const ordersWithExp = SapatStorage.getOrders();
ordersWithExp.unshift(expiringOrder);
SapatStorage.saveOrders(ordersWithExp);

const expireResult = SapatStorage.expireUnpaidReservation(testExpOrderId, 'Test: Deadline passed');
assert(expireResult.success, 'Unpaid reservation successfully marked Expired');

const expiredOrder = SapatStorage.getOrders().find(o => o.id === testExpOrderId);
assert(expiredOrder.status === 'Expired' && expiredOrder.paymentStatus === 'Expired', 'Order status & paymentStatus are Expired');

const menuAfterExpire = SapatStorage.getMenu();
const dishAfterExpire = menuAfterExpire.find(d => d.id === targetDish.id);
assert(dishAfterExpire.reservedServings === reservedBefore, 'Reserved portions safely released back to kitchen inventory');

// Cannot claim expired order
const claimExpiredResult = SapatStorage.claimOrder(testExpOrderId, 'vendor-lita');
assert(!claimExpiredResult.success && claimExpiredResult.reason === 'EXPIRED', 'Claiming expired order blocked');

// 5. Student Accountability & No-Show Workflow
console.log('\n--- 5. Student Accountability & No-Show Tracking ---');
const testNoShowOrderId = 'SPT-TEST-NOSHOW-1';
const noShowOrder = {
  id: testNoShowOrderId,
  pickupToken: 'spt_tok_noshow_test',
  studentName: 'Clara Santos',
  gradeSection: 'Grade 12 - HUMSS B',
  vendorId: 'vendor-lita',
  vendorName: "Ate Lita's Kitchen",
  vendorStall: 'Stall #3',
  items: [{ id: targetDish.id, name: targetDish.name, price: targetDish.price, quantity: 1 }],
  totalAmount: targetDish.price,
  totalServings: 1,
  pickupTime: '11:30 AM (Lunch Shift 1)',
  status: 'Ready for Pickup',
  paymentMethod: 'Online Payment',
  paymentStatus: 'Paid',
  paidAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
};

const ordersWithNoShow = SapatStorage.getOrders();
ordersWithNoShow.unshift(noShowOrder);
SapatStorage.saveOrders(ordersWithNoShow);

// Vendor marks as No-Show
const noShowResult = SapatStorage.markOrderNoShow(testNoShowOrderId, 'Uncollected after 15 min grace period');
assert(noShowResult.success, 'Vendor successfully marked uncollected meal as No-Show');

const markedNoShow = SapatStorage.getOrders().find(o => o.id === testNoShowOrderId);
assert(markedNoShow.status === 'No-show', 'Order status updated to No-show');

// Cannot claim order after marked No-show
const claimNoShowResult = SapatStorage.claimOrder(testNoShowOrderId, 'vendor-lita');
assert(!claimNoShowResult.success && claimNoShowResult.reason === 'NO_SHOW', 'Claiming no-show meal blocked');

// Student submits explanation
const explainResult = SapatStorage.submitNoShowExplanation(testNoShowOrderId, 'Unexpected midterm examination extended past lunch period.');
assert(explainResult.success, 'Student explanation submitted and recorded');

const explainedOrder = SapatStorage.getOrders().find(o => o.id === testNoShowOrderId);
assert(explainedOrder.noShowExplanation.includes('midterm examination'), 'Student explanation persisted on order record');

// Audit log contains explanation
const auditLogsAfterExplain = SapatStorage.getAuditLogs();
const noShowLog = auditLogsAfterExplain.find(l => l.reservationId === testNoShowOrderId && l.eventType === 'NO_SHOW_RECORDED');
assert(Boolean(noShowLog && noShowLog.studentExplanation), 'Audit trail captures student explanation');

// 6. Admin Governance & OSAS Referral
console.log('\n--- 6. Admin Governance & OSAS Disciplinary Action ---');
if (noShowLog) {
  const referResult = SapatStorage.referIncidentToOSAS(noShowLog.id);
  assert(referResult.success, 'Incident successfully referred to OSAS for disciplinary hearing');

  const referredLog = SapatStorage.getAuditLogs().find(l => l.id === noShowLog.id);
  assert(referredLog.referredToOSAS === true, 'Incident flagged with referredToOSAS');

  const resolveResult = SapatStorage.resolveIncident(noShowLog.id, 'Excused by Department Chair - Verified departmental exam');
  assert(resolveResult.success, 'OSAS incident successfully resolved with official administrative notes');

  const resolvedLog = SapatStorage.getAuditLogs().find(l => l.id === noShowLog.id);
  assert(resolvedLog.resolved === true && resolvedLog.resolutionNote.includes('Verified departmental exam'), 'Resolution note and timestamp logged in permanent audit trail');
}

// 7. Verify Core Functionality (Menu, Forecasting, Feedbacks)
console.log('\n--- 7. Verification of Forecasting & Feedback Integrity ---');
const forecast = ForecastingService.getVendorForecast('vendor-lita');
assert(forecast && forecast.dishes.length > 0, 'Forecasting service intact and operational');

const campusWide = ForecastingService.getCampusWideAnalytics();
assert(campusWide && campusWide.totalWastePreventedKg > 0, 'Campus-wide waste analytics intact');

// 8. Customer Portal Student Feedback System Integration
console.log('\n--- 8. Customer Portal Student Feedback System ---');
const initialReviews = SapatStorage.getReviews();
assert(Array.isArray(initialReviews) && initialReviews.length > 0, 'Reviews initialized with verified seed feedback');

// Submit review on completed order
const reviewResult = SapatStorage.submitReview({
  orderId: testOnlineOrderId,
  vendorId: 'vendor-lita',
  dishName: 'Chicken Adobo',
  studentName: 'Maria Santos',
  rating: 5,
  tasteTag: 'Perfect Flavor',
  portionTag: 'Generous Serving',
  comment: 'Super savory and delicious adobo. Canteen staff was polite and fast!'
});
assert(reviewResult.success, 'Student review submitted successfully');

const completedOrderAfterReview = SapatStorage.getOrders().find(o => o.id === testOnlineOrderId);
assert(completedOrderAfterReview.reviewed === true, 'Completed order marked as reviewed');
assert(completedOrderAfterReview.reviewRating === 5, 'Review rating saved on order record');

// Feedback reflected in SAPAT Intelligence Customer Taste Analysis
const tasteAnalysis = ForecastingService.getCustomerTasteAnalysis('vendor-lita');
assert(tasteAnalysis && tasteAnalysis.recentReviews.some(r => r.comment && r.comment.includes('Super savory')), 'Student feedback dynamically reflected in vendor customer taste analysis');

// Audit log captures feedback submission
const feedbackAuditLog = SapatStorage.getAuditLogs().find(l => l.eventType === 'FEEDBACK_SUBMITTED' && l.orderId === testOnlineOrderId);
assert(Boolean(feedbackAuditLog), 'Audit event logged for student feedback submission');

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED.`);
if (passedTests === totalTests) {
  console.log('ALL PAYMENT & ACCOUNTABILITY ACCEPTANCE CRITERIA SATISFIED!');
} else {
  console.error(`ATTENTION: ${totalTests - passedTests} tests failed.`);
}
console.log('================================================================');
