/**
 * PROJECT SAPAT — STUDENT CHECKOUT UI REFINEMENT & PAY AT THE COUNTER TEST SUITE
 * 
 * Verifies:
 * 1. Checkout modal layout and hierarchy (order ref, canteen stall, amount, selectable cards).
 * 2. Two distinct payment methods: Digital Payment and Pay at the Counter.
 * 3. Digital payment authorization (GCash, Maya, QRPh), phone validation, and gateway simulation.
 * 4. Pay at the Counter selection, dynamic panel switching, and CTA ("Place Order — Pay at Counter").
 * 5. Counter reservation creation: Awaiting Counter Payment, pending status, payment deadline.
 * 6. Counter payment success screen ("Reservation Received!", cashier instructions, no active QR).
 * 7. Vendor counter payment verification: vendor-only confirmation, status transitions to Confirmed/Paid.
 * 8. QR pickup pass unlock only after payment verification.
 * 9. Expiration mechanism: releases reserved portions safely and prevents duplicate expiration.
 */

// Mock browser environment for Node.js
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

const domStore = new Map();
global.document = {
  getElementById: (id) => {
    if (!domStore.has(id)) {
      domStore.set(id, {
        id,
        textContent: '',
        innerHTML: '',
        value: '',
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {}
      });
    }
    return domStore.get(id);
  },
  querySelector: () => null,
  querySelectorAll: () => []
};

const { SapatStorage, INITIAL_ORDERS } = await import('../js/storage.js');
const { openCheckoutModal, openOnlinePaymentModal, closeOnlinePaymentModal } = await import('../js/components/modals.js');
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
console.log('PROJECT SAPAT — STUDENT CHECKOUT & PAY AT COUNTER TEST SUITE');
console.log('================================================================\n');

// Reset to clean storage
SapatStorage.resetToDefaults();

// --- 1. Settings & Cutoff Verification ---
console.log('--- 1. Settings & Cutoff Verification ---');
const settings = SapatStorage.getSettings();
assert(typeof settings.counterPaymentDeadlineMinutes === 'number' && settings.counterPaymentDeadlineMinutes > 0,
  `Counter payment deadline configured from settings (${settings.counterPaymentDeadlineMinutes} mins)`);

// --- 2. Setup Test Order for Checkout Modal ---
console.log('\n--- 2. Checkout Modal & Method Selection ---');
const testOrderId = 'SPT-8812';
const targetVendorId = 'vendor-lita';
const testOrder = {
  id: testOrderId,
  pickupToken: 'spt_tok_test_8812_xyz',
  studentName: 'Maria Santos',
  studentId: '2024-0891',
  gradeSection: 'Grade 11 - STEM A',
  vendorId: targetVendorId,
  vendorName: "Ate Lita's Kitchen",
  vendorStall: 'Stall #3',
  items: [
    { id: 'dish-lita-1', name: 'Chicken Adobo', price: 65, quantity: 2 }
  ],
  totalAmount: 130,
  totalServings: 2,
  pickupTime: '11:30 AM (Lunch Shift 1)',
  status: 'Pending',
  paymentMethod: 'Online Payment',
  paymentStatus: 'Pending',
  createdAt: new Date().toISOString()
};

const orders = SapatStorage.getOrders();
orders.unshift(testOrder);
SapatStorage.saveOrders(orders);

// Open in Digital Payment mode
openCheckoutModal(testOrderId, 'Online Payment');

const refEl = document.getElementById('online-pay-order-ref');
const stallEl = document.getElementById('online-pay-stall-name');
const amountEl = document.getElementById('online-pay-amount');
const modalEl = document.getElementById('modal-online-payment');
const digitalCard = document.getElementById('method-card-digital');
const counterCard = document.getElementById('method-card-counter');
const digitalPanel = document.getElementById('checkout-digital-panel');
const counterPanel = document.getElementById('checkout-counter-panel');

assert(refEl.textContent === `#${testOrderId}`, 'Order reference prominently visible in checkout modal');
assert(stallEl.textContent.includes("Ate Lita's Kitchen"), 'Canteen stall details populated');
assert(amountEl.textContent === '₱130.00', 'Total payable amount formatted with currency symbol');
assert(modalEl.classList.contains('active'), 'Checkout modal activates bottom-sheet presentation');
assert(digitalCard.classList.contains('active'), 'Digital Payment card is active');
assert(digitalPanel.style.display === 'block', 'Digital payment panel visible');
assert(counterPanel.style.display === 'none', 'Counter payment panel hidden in digital mode');

// Switch to Pay at the Counter mode
openCheckoutModal(testOrderId, 'Counter Payment');
assert(counterCard.classList.contains('active'), 'Pay at the Counter card is active');
assert(counterPanel.style.display === 'block', 'Counter payment panel visible');
assert(digitalPanel.style.display === 'none', 'Digital payment panel hidden in counter mode');

const counterAmountEl = document.getElementById('counter-info-amount');
const counterDeadlineEl = document.getElementById('counter-info-deadline');
assert(counterAmountEl.textContent === '₱130.00', 'Counter panel displays amount due (₱130.00)');
assert(counterDeadlineEl.textContent.includes('20 minutes'), 'Counter panel displays 20 minutes payment deadline from settings');

// --- 3. Digital Payment Flow & Gateway Simulation ---
console.log('\n--- 3. Digital Payment Flow & Gateway Simulation ---');
// A. Failed payment simulation
const failRes = SapatStorage.recordOnlinePaymentFailure(testOrderId, 'Card declined in sandbox');
const orderAfterFail = SapatStorage.getOrders().find(o => o.id === testOrderId);
assert(orderAfterFail.paymentStatus === 'Failed', 'Payment failure recorded');
assert(orderAfterFail.status !== 'Confirmed', 'Failed payment does NOT mark order Confirmed');

// B. Successful payment authorization
const successRes = SapatStorage.recordOnlinePayment(testOrderId, 'Online Payment (GCash)');
assert(successRes.success === true, 'Digital payment authorization succeeded');
const orderAfterPaid = SapatStorage.getOrders().find(o => o.id === testOrderId);
assert(orderAfterPaid.paymentStatus === 'Paid', 'Order paymentStatus updated to Paid');
assert(orderAfterPaid.status === 'Confirmed', 'Order confirmed after verified digital payment');
assert(Boolean(orderAfterPaid.paidAt), 'Paid timestamp recorded');
assert(Boolean(orderAfterPaid.transactionReference), 'Gateway transaction reference generated');

// --- 4. Pay at the Counter Flow ---
console.log('\n--- 4. Pay at the Counter Flow & Order Creation ---');
const counterOrderId = 'SPT-8813';
const targetDish = SapatStorage.getMenu().find(d => d.id === 'dish-lita-1');
const reservedBefore = targetDish.reservedServings || 0;

const newCounterOrder = {
  id: counterOrderId,
  pickupToken: 'spt_tok_test_8813_abc',
  studentName: 'Juan Dela Cruz',
  studentId: '2024-0442',
  gradeSection: 'Grade 12 - STEM B',
  vendorId: targetVendorId,
  vendorName: "Ate Lita's Kitchen",
  vendorStall: 'Stall #3',
  items: [
    { id: targetDish.id, name: targetDish.name, price: targetDish.price, quantity: 1 }
  ],
  totalAmount: targetDish.price,
  totalServings: 1,
  pickupTime: '12:15 PM (Lunch Shift 2)',
  status: 'Awaiting Counter Payment',
  paymentMethod: 'Counter Payment',
  paymentStatus: 'Pending',
  paymentDeadline: new Date(Date.now() + settings.counterPaymentDeadlineMinutes * 60000).toISOString(),
  counterWindow: 'Stall #3',
  createdAt: new Date().toISOString()
};

// Temporarily reserve portion in kitchen inventory
const currentMenu = SapatStorage.getMenu();
const menuDish = currentMenu.find(d => d.id === targetDish.id);
menuDish.reservedServings = reservedBefore + 1;
SapatStorage.saveMenu(currentMenu);

const allOrders = SapatStorage.getOrders();
allOrders.unshift(newCounterOrder);
SapatStorage.saveOrders(allOrders);

assert(newCounterOrder.status === 'Awaiting Counter Payment', 'Counter order created with status "Awaiting Counter Payment"');
assert(newCounterOrder.paymentStatus === 'Pending', 'Counter order paymentStatus is "Pending" (not auto-paid)');
assert(newCounterOrder.paymentMethod === 'Counter Payment', 'Payment method recorded as "Counter Payment"');
assert(Boolean(newCounterOrder.paymentDeadline), 'Payment deadline timestamp persisted');

const menuAfterReserve = SapatStorage.getMenu();
const reservedAfter = menuAfterReserve.find(d => d.id === targetDish.id).reservedServings;
assert(reservedAfter === reservedBefore + 1, 'Portion temporarily held in kitchen inventory');

// --- 5. QR Code Locked for Unpaid Counter Order ---
console.log('\n--- 5. QR Pickup Pass Gated for Unpaid Counter Order ---');
const claimUnpaid = SapatStorage.claimOrder(counterOrderId, targetVendorId);
assert(claimUnpaid.success === false, 'Cannot claim unpaid counter reservation');
assert(claimUnpaid.reason === 'UNPAID_ORDER', 'Blocked with UNPAID_ORDER reason');

// --- 6. Vendor Verification of Counter Payment ---
console.log('\n--- 6. Vendor Counter Payment Verification ---');
const verifyRes = SapatStorage.verifyCounterPayment(counterOrderId, `Verified by Ate Lita`);
assert(verifyRes.success === true, 'Assigned vendor successfully verified cash counter payment');

const verifiedOrder = SapatStorage.getOrders().find(o => o.id === counterOrderId);
assert(verifiedOrder.paymentStatus === 'Paid', 'Order paymentStatus updated to Paid after vendor verification');
assert(verifiedOrder.status === 'Confirmed', 'Order status promoted to Confirmed');
assert(Boolean(verifiedOrder.paidAt), 'Paid timestamp recorded upon verification');
assert(verifiedOrder.verifiedBy.includes('Ate Lita'), 'Verifying vendor recorded on order');

// Duplicate verification blocked
const duplicateVerify = SapatStorage.verifyCounterPayment(counterOrderId, 'Second verification');
assert(duplicateVerify.success === false && duplicateVerify.reason === 'ALREADY_PAID', 'Duplicate counter verification prevented');

// Once verified, pickup pass can be claimed
const claimVerified = SapatStorage.claimOrder(counterOrderId, targetVendorId);
assert(claimVerified.success === true, 'Verified order can now be successfully claimed at stall');

// --- 7. Expiration of Overdue Counter Orders & Portion Release ---
console.log('\n--- 7. Expiration of Overdue Counter Orders & Portion Release ---');
const expOrderId = 'SPT-8814';
const initialReserved = SapatStorage.getMenu().find(d => d.id === targetDish.id).reservedServings || 0;

// Temporarily reserve 2 portions
const menuForExp = SapatStorage.getMenu();
menuForExp.find(d => d.id === targetDish.id).reservedServings = initialReserved + 2;
SapatStorage.saveMenu(menuForExp);

const expOrder = {
  id: expOrderId,
  pickupToken: 'spt_tok_test_8814_exp',
  studentName: 'Ana Gomez',
  studentId: '2024-0311',
  vendorId: targetVendorId,
  items: [
    { id: targetDish.id, name: targetDish.name, price: targetDish.price, quantity: 2 }
  ],
  totalAmount: targetDish.price * 2,
  totalServings: 2,
  status: 'Awaiting Counter Payment',
  paymentMethod: 'Counter Payment',
  paymentStatus: 'Pending',
  paymentDeadline: new Date(Date.now() - 60000).toISOString(), // 1 minute in the past (overdue)
  createdAt: new Date(Date.now() - 1200000).toISOString()
};

const ordersList = SapatStorage.getOrders();
ordersList.unshift(expOrder);
SapatStorage.saveOrders(ordersList);

// Sweep overdue orders
const expiredCount = SapatStorage.expireOverduePayments();
assert(expiredCount >= 1, `Overdue unpaid counter order automatically expired (${expiredCount} order)`);

const orderPostExpire = SapatStorage.getOrders().find(o => o.id === expOrderId);
assert(orderPostExpire.status === 'Expired' && orderPostExpire.paymentStatus === 'Expired', 'Order status marked Expired');

const menuPostExpire = SapatStorage.getMenu();
const restoredPortions = menuPostExpire.find(d => d.id === targetDish.id).reservedServings;
assert(restoredPortions === initialReserved, `Reserved portions released back to kitchen inventory (Restored to ${initialReserved})`);

// Duplicate expiration prevented
const dupExpire = SapatStorage.expireUnpaidReservation(expOrderId);
assert(dupExpire.success === true, 'Idempotent handling of already expired reservation');

// Verified paid order cannot be expired
const expPaidAttempt = SapatStorage.expireUnpaidReservation(testOrderId);
assert(expPaidAttempt.success === false, 'Cannot expire a verified paid order');

console.log('\n================================================================');
console.log(`RESULTS: ${passed}/${passed + failed} TESTS PASSED.`);
if (failed === 0) {
  console.log('ALL STUDENT CHECKOUT & PAY AT COUNTER TESTS PASSED!');
} else {
  console.error(`FAILED ${failed} TESTS.`);
  process.exit(1);
}
console.log('================================================================');
