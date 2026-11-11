import assert from 'node:assert';

console.log('--- TESTING VENDOR ORDERS NO-SHOW & EVENT LISTENER DISCIPLINE ---');

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
const { vendorOrdersPage } = await import('../js/pages/vendor/orders.js');

// Reset to clean storage baseline
SapatStorage.resetData();
state.setRole('vendor');
state.currentVendorId = 'vendor-lita';

class MockElement {
  constructor(id = '', className = '') {
    this.id = id;
    this.className = className;
    this.attributes = {};
    this.children = [];
    this.listeners = {};
    this.innerHTML = '';
  }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  trigger(type, event) {
    if (this.listeners[type]) {
      for (const fn of this.listeners[type]) {
        if (event._stopImmediate) break;
        fn(event);
      }
    }
  }

  querySelector(selector) {
    if (selector === '#screen-vendor-orders' && this._screen) return this._screen;
    return null;
  }
}

// Create a container with custom innerHTML setter that mimics DOM screen creation
const container = new MockElement('screens-viewport');
let screenInstanceCount = 0;

Object.defineProperty(container, 'innerHTML', {
  set(html) {
    this._html = html;
    screenInstanceCount++;
    const screen = new MockElement('screen-vendor-orders');
    screen.innerHTML = html;
    this._screen = screen;
  },
  get() {
    return this._html || '';
  }
});

// 1. Initial Render
vendorOrdersPage.render(container);
assert(container.querySelector('#screen-vendor-orders'), 'Screen #screen-vendor-orders should be created');
const firstScreen = container.querySelector('#screen-vendor-orders');
assert.strictEqual(firstScreen.listeners['click']?.length, 1, 'Screen element should have exactly 1 click listener');
assert(!container.listeners['click'] || container.listeners['click'].length === 0, 'Outer container should have 0 click listeners (no stacking!)');
console.log('PASS: Screen element has exactly 1 click listener, outer container has 0 click listeners');

// 2. Multiple Renders (simulating filter tab switching)
vendorOrdersPage.render(container);
vendorOrdersPage.render(container);
vendorOrdersPage.render(container);
const currentScreen = container.querySelector('#screen-vendor-orders');
assert.strictEqual(currentScreen.listeners['click']?.length, 1, 'After multiple renders, active screen element STILL has exactly 1 listener');
assert(!container.listeners['click'] || container.listeners['click'].length === 0, 'Outer container STILL has 0 click listeners');
console.log('PASS: After 4 renders, active screen still has exactly 1 click listener (no accumulation)');

// 3. Find Ready for Pickup test order
const orders = SapatStorage.getOrders();
const testOrder = orders.find(o => o.vendorId === 'vendor-lita' && o.status === 'Ready for Pickup');
assert(testOrder, 'There should be a Ready for Pickup order for vendor-lita');

// 4. Test clicking No-Show executes confirm() EXACTLY ONCE
let confirmCalls = 0;
global.confirm = (msg) => {
  confirmCalls++;
  return true;
};

const fakeEvent = {
  target: {
    closest(selector) {
      if (selector === '[data-action="vendor-mark-noshow"]') {
        return {
          getAttribute(attr) {
            if (attr === 'data-order-id') return testOrder.id;
            return null;
          },
          disabled: false
        };
      }
      return null;
    }
  },
  preventDefault() {},
  stopPropagation() {},
  stopImmediatePropagation() { this._stopImmediate = true; }
};

currentScreen.trigger('click', fakeEvent);

assert.strictEqual(confirmCalls, 1, `confirm() must be called exactly once, but was called ${confirmCalls} times`);
console.log('PASS: confirm() was called exactly 1 time upon clicking No-Show');

// 5. Check order status updated to 'No-show'
const updatedOrders = SapatStorage.getOrders();
const orderAfter = updatedOrders.find(o => o.id === testOrder.id);
assert.strictEqual(orderAfter.status, 'No-show', 'Order status must be updated to No-show');
console.log(`PASS: Order #${testOrder.id} status is now 'No-show'`);

// 6. Verify audit logs recorded NO_SHOW_RECORDED
const auditLogs = SapatStorage.getAuditLogs();
const noShowLog = auditLogs.find(l => l.orderId === testOrder.id && l.eventType === 'NO_SHOW_RECORDED');
assert(noShowLog, 'Audit log should record NO_SHOW_RECORDED event');
console.log('PASS: Audit log recorded NO_SHOW_RECORDED');

// 7. Test guard: If user clicks No-Show on an order that is already 'No-show'
confirmCalls = 0;
const screenAfterNoShow = container.querySelector('#screen-vendor-orders');
screenAfterNoShow.trigger('click', fakeEvent);

assert.strictEqual(confirmCalls, 0, 'confirm() should NOT be prompted again for an order already marked No-show');
console.log('PASS: Duplicate No-Show click is safely guarded and does not prompt confirmation');

console.log('\nALL NO-SHOW VERIFICATIONS PASSED SUCCESSFULLY!');
