/**
 * PROJECT SAPAT — Premium Student Authentication & Registration Verification Suite
 * Verifies:
 * 1. Initial student seed accounts & password obfuscation.
 * 2. Login validation & error handling.
 * 3. 4-step registration wizard validation, uniqueness checks, and privacy/terms acknowledgments.
 * 4. Guest browsing preservation & checkout gate redirection.
 * 5. Cart survival through authentication and reservation linkage.
 * 6. Second UI Pass refinements:
 *    - Removal of demo sandbox banners and displayed credentials.
 *    - Official Sapat logo integration.
 *    - Zero native select menus in Step 2 (100% custom searchable dropdowns).
 * 7. Responsive CSS classes & visual styling token presence.
 */

import fs from 'fs';

// Mock Browser Environment
const store = new Map();
global.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};

const sessionStore = new Map();
global.sessionStorage = {
  getItem: (key) => (sessionStore.has(key) ? sessionStore.get(key) : null),
  setItem: (key, val) => sessionStore.set(key, String(val)),
  removeItem: (key) => sessionStore.delete(key),
  clear: () => sessionStore.clear()
};

const eventListeners = new Map();
global.window = {
  localStorage: global.localStorage,
  sessionStorage: global.sessionStorage,
  location: { hash: '#/auth/login' },
  addEventListener: (t, cb) => {
    if (!eventListeners.has(t)) eventListeners.set(t, []);
    eventListeners.get(t).push(cb);
  },
  removeEventListener: (t, cb) => {
    if (eventListeners.has(t)) {
      eventListeners.set(t, eventListeners.get(t).filter(fn => fn !== cb));
    }
  },
  dispatchEvent: (ev) => {
    const list = eventListeners.get(ev.type) || [];
    list.forEach(cb => cb(ev));
  },
  scrollTo: () => {},
  CustomEvent: class CustomEvent { constructor(t, i) { this.type = t; this.detail = i?.detail; } }
};

class MockElement {
  constructor(tag, id = '', cls = '') {
    this.tagName = tag;
    this.id = id;
    this.className = cls;
    this.attributes = {};
    this.listeners = {};
    this.innerHTML = '';
    this.value = '';
    this.style = {};
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(t, cb) {
    if (!this.listeners[t]) this.listeners[t] = [];
    this.listeners[t].push(cb);
  }
  dispatchEvent(ev) {
    const list = this.listeners[ev.type] || [];
    list.forEach(cb => cb(ev));
  }
  querySelector(sel) {
    return new MockElement('div');
  }
  querySelectorAll(sel) {
    return [new MockElement('div')];
  }
  closest() { return this; }
  contains() { return true; }
  focus() {}
}

global.document = {
  getElementById: (id) => new MockElement('div', id),
  querySelector: () => new MockElement('div'),
  querySelectorAll: () => [],
  createElement: (t) => new MockElement(t),
  addEventListener: (t, cb) => {
    if (!eventListeners.has(t)) eventListeners.set(t, []);
    eventListeners.get(t).push(cb);
  },
  removeEventListener: (t, cb) => {
    if (eventListeners.has(t)) {
      eventListeners.set(t, eventListeners.get(t).filter(fn => fn !== cb));
    }
  }
};

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('PROJECT SAPAT — PREMIUM AUTHENTICATION & REGISTRATION SUITE (PASS 2)');
  console.log('================================================================\n');

  const { SapatStorage, INITIAL_STUDENTS } = await import('../js/storage.js');
  const { state } = await import('../js/state.js');
  const { authLoginPage } = await import('../js/pages/auth/login.js');
  const { authRegisterPage } = await import('../js/pages/auth/register.js');
  const { router } = await import('../js/router.js');

  // --- 1. Storage & Seed Data Verification ---
  console.log('--- 1. Storage & Seed Accounts Verification ---');
  const students = SapatStorage.getStudents();
  assert(Array.isArray(students) && students.length >= 2, 'Initial student records initialized');
  
  const maria = SapatStorage.getStudentBySchoolId('2026-0001');
  assert(maria && maria.fullName === 'Maria Santos', 'Maria Santos seeded with ID 2026-0001');
  assert(maria.passwordHash && !maria.passwordHash.includes('password123'), 'Passwords are not stored in plaintext');

  const juan = SapatStorage.getStudentBySchoolId('2026-0002');
  assert(juan && juan.fullName === 'Juan Dela Cruz', 'Juan Dela Cruz seeded with ID 2026-0002');

  // --- 2. Login Flow Verification ---
  console.log('\n--- 2. Student Authentication / Login Flow ---');
  const emptyRes = SapatStorage.authenticateStudent('', '');
  assert(!emptyRes.success && emptyRes.message.includes('School ID'), 'Rejects empty School ID');

  const noPassRes = SapatStorage.authenticateStudent('2026-0001', '');
  assert(!noPassRes.success && noPassRes.message.includes('password'), 'Rejects empty password');

  const invalidIdRes = SapatStorage.authenticateStudent('9999-9999', 'password123');
  assert(!invalidIdRes.success && invalidIdRes.message.includes('No student record found'), 'Rejects un-enrolled School ID');

  const wrongPassRes = SapatStorage.authenticateStudent('2026-0001', 'wrong_password_xyz');
  assert(!wrongPassRes.success && wrongPassRes.message.includes('Incorrect password'), 'Rejects incorrect password');

  const validLogin = SapatStorage.authenticateStudent('2026-0001', 'password123');
  assert(validLogin.success && validLogin.student.schoolId === '2026-0001', 'Succeeds with valid student credentials');
  
  const currentStudent = SapatStorage.getCurrentStudent();
  assert(currentStudent && currentStudent.schoolId === '2026-0001', 'Logged in student persisted in storage');

  // --- 3. Four-Step Registration Wizard Verification ---
  console.log('\n--- 3. Four-Step Registration Wizard ---');
  // Duplicate ID check
  const dupCheck = SapatStorage.registerStudent({
    schoolId: '2026-0001',
    fullName: 'Test Impersonator',
    password: 'securePassword123!',
    agreedToPrivacy: true,
    agreedToTerms: true
  });
  assert(!dupCheck.success && dupCheck.message.includes('already registered'), 'Duplicate School ID registration strictly rejected');

  // Short password check
  const shortPassCheck = SapatStorage.registerStudent({
    schoolId: '2026-0099',
    fullName: 'Test Student',
    password: 'short',
    agreedToPrivacy: true,
    agreedToTerms: true
  });
  assert(!shortPassCheck.success && shortPassCheck.message.includes('at least 8 characters'), 'Passwords shorter than 8 characters rejected');

  // Unacknowledged terms check
  const noTermsCheck = SapatStorage.registerStudent({
    schoolId: '2026-0099',
    fullName: 'Test Student',
    password: 'securePassword123!',
    agreedToPrivacy: false,
    agreedToTerms: true
  });
  assert(!noTermsCheck.success && noTermsCheck.message.includes('Privacy Notice and Terms of Use'), 'Registration blocked without policy acknowledgments');

  // Valid registration
  const newSchoolId = '2026-7788';
  const regRes = SapatStorage.registerStudent({
    schoolId: newSchoolId,
    fullName: 'Alyssa Valdez',
    program: 'BS Hospitality Management',
    yearLevel: '2nd Year',
    section: 'HM-2A',
    password: 'safePassword2026!',
    email: 'alyssa.valdez@minsu.edu.ph',
    agreedToPrivacy: true,
    agreedToTerms: true
  });
  assert(regRes.success && regRes.student.schoolId === newSchoolId, 'New student successfully registered');
  assert(regRes.student.passwordHash && !regRes.student.passwordHash.includes('safePassword2026!'), 'New student password obfuscated');
  
  const registeredLookup = SapatStorage.getStudentBySchoolId(newSchoolId);
  assert(registeredLookup && registeredLookup.fullName === 'Alyssa Valdez', 'Registered student retrievable by School ID');
  assert(SapatStorage.getCurrentStudent().schoolId === newSchoolId, 'Newly registered student immediately logged in');

  // --- 4. Guest Browsing & Cart Preservation ---
  console.log('\n--- 4. Guest Browsing & Checkout Gate Redirection ---');
  // Logout to become guest
  SapatStorage.logoutStudent();
  assert(SapatStorage.getCurrentStudent() === null, 'Student logged out; guest mode active');

  // Guest adds items to cart
  state.clearCart();
  const sampleDish = SapatStorage.getMenu()[0];
  state.addToCart(sampleDish, 2);
  assert(state.getCartCount() === 2, 'Guest successfully adds meals to pre-order tray');
  assert(state.getCartTotal() > 0, 'Guest tray total calculated accurately');

  // Simulate checkout redirection
  sessionStorage.setItem('sapat_auth_redirect', '#/student/cart');
  sessionStorage.setItem('sapat_preserved_checkout', JSON.stringify({
    selectedSlot: '12:15 PM (Lunch Shift 2)',
    paymentMethod: 'Counter Payment',
    note: 'Extra Calamansi please'
  }));

  // Guest logs in with newly registered account
  const authBack = SapatStorage.authenticateStudent(newSchoolId, 'safePassword2026!');
  assert(authBack.success, 'Student successfully logs in from checkout redirect');
  assert(state.getCartCount() === 2, 'Tray items preserved completely across authentication');

  const restoredCheckout = JSON.parse(sessionStorage.getItem('sapat_preserved_checkout'));
  assert(restoredCheckout.selectedSlot === '12:15 PM (Lunch Shift 2)', 'Pickup window preference preserved');
  assert(restoredCheckout.paymentMethod === 'Counter Payment', 'Payment method preference preserved');
  assert(restoredCheckout.note === 'Extra Calamansi please', 'Special instructions preserved');

  // --- 5. Page Component Rendering & Second UI Pass Refinements ---
  console.log('\n--- 5. Page Components & Second UI Pass Refinements ---');
  const mockContainer = new MockElement('div', 'screens-viewport');
  authLoginPage.render(mockContainer);
  assert(mockContainer.innerHTML.includes('Your next meal,'), 'Login page renders editorial headline');
  assert(mockContainer.innerHTML.includes('auth-input-pill'), 'Login page renders rounded pill input styling');
  assert(mockContainer.innerHTML.includes('auth-cta-btn'), 'Login page renders full-width pill button');

  // Second UI Pass: Assert demo credential banner is removed
  assert(!mockContainer.innerHTML.includes('Demo Account Sandbox'), 'Login page removed Demo Account Sandbox panel');
  assert(!mockContainer.innerHTML.includes('2026-0001 (Maria Santos)'), 'Login page removed exposed sample credentials banner');
  assert(mockContainer.innerHTML.includes('assets/sapat-login-logo.png'), 'Login page displays official Sapat logo asset');
  assert(mockContainer.innerHTML.includes('auth-body-center'), 'Login page centers main body vertically');
  assert(mockContainer.innerHTML.includes('Continue as Guest'), 'Login page renders Continue as Guest CTA');
  assert(!mockContainer.innerHTML.includes('auth-top-guest-link'), 'Login page removed top guest link');

  // Wizard Step 1
  authRegisterPage.currentStep = 1;
  authRegisterPage.render(mockContainer);
  assert(mockContainer.innerHTML.includes("Let's get to"), 'Wizard step 1 renders identity headline');
  assert(mockContainer.innerHTML.includes('auth-segmented-progress'), 'Wizard renders 4-segment progress bar');
  assert(mockContainer.innerHTML.includes('assets/sapat-icon.png'), 'Wizard top bar renders official Sapat brand icon');

  // Wizard Step 2: Custom Dropdowns (Zero Native Selects)
  authRegisterPage.currentStep = 2;
  authRegisterPage.render(mockContainer);
  assert(mockContainer.innerHTML.includes('Your campus'), 'Wizard step 2 renders campus details headline');
  assert(!mockContainer.innerHTML.includes('<select'), 'Wizard step 2 contains ZERO browser-native <select> tags');
  assert(mockContainer.innerHTML.includes('custom-dropdown-container'), 'Wizard step 2 renders custom dropdown containers');
  assert(mockContainer.innerHTML.includes('input-search-program'), 'Wizard step 2 contains searchable program input');
  assert(mockContainer.innerHTML.includes('BS Information Technology'), 'Wizard step 2 includes degree programs list');
  assert(mockContainer.innerHTML.includes('dropdown-options-scroller'), 'Wizard step 2 includes custom scrollable options panel');

  // Wizard Step 3
  authRegisterPage.currentStep = 3;
  authRegisterPage.render(mockContainer);
  assert(mockContainer.innerHTML.includes('Secure your'), 'Wizard step 3 renders security headline');
  assert(mockContainer.innerHTML.includes('auth-pwd-toggle-btn'), 'Wizard step 3 renders password visibility controls');

  // Wizard Step 4
  authRegisterPage.currentStep = 4;
  authRegisterPage.render(mockContainer);
  assert(mockContainer.innerHTML.includes('Privacy Notice'), 'Wizard step 4 renders RA 10173 Privacy Notice');
  assert(mockContainer.innerHTML.includes('Terms of Use'), 'Wizard step 4 renders Dining Terms of Use');
  assert(mockContainer.innerHTML.includes('ack-privacy-checkbox'), 'Wizard step 4 renders separate privacy checkbox');
  assert(mockContainer.innerHTML.includes('ack-terms-checkbox'), 'Wizard step 4 renders separate terms checkbox');

  // --- 6. Router Mapping Verification ---
  console.log('\n--- 6. Router Endpoints ---');
  assert(router.routes['#/auth/login'] === authLoginPage, 'Router maps #/auth/login');
  assert(router.routes['#/auth/register'] === authRegisterPage, 'Router maps #/auth/register');
  assert(router.routes['#/login'] === authLoginPage, 'Router maps alias #/login');
  assert(router.routes['#/register'] === authRegisterPage, 'Router maps alias #/register');

  // --- 7. CSS Architectural Rules Verification ---
  console.log('\n--- 7. Stylesheet Classes & Custom Dropdown CSS Integrity ---');
  const css = fs.readFileSync('css/styles.css', 'utf8');
  assert(css.includes('.auth-screen'), 'Styles define .auth-screen');
  assert(css.includes('.auth-segmented-progress'), 'Styles define .auth-segmented-progress');
  assert(css.includes('.auth-editorial-headline'), 'Styles define .auth-editorial-headline');
  assert(css.includes('.auth-input-pill'), 'Styles define .auth-input-pill');
  assert(css.includes('.auth-cta-btn'), 'Styles define .auth-cta-btn');
  assert(css.includes('.auth-policy-card'), 'Styles define .auth-policy-card');
  assert(css.includes('.custom-dropdown-container'), 'Styles define .custom-dropdown-container');
  assert(css.includes('.custom-dropdown-trigger'), 'Styles define .custom-dropdown-trigger');
  assert(css.includes('.custom-dropdown-panel'), 'Styles define .custom-dropdown-panel');
  assert(css.includes('.dropdown-search-box'), 'Styles define .dropdown-search-box');
  assert(css.includes('.auth-brand-logo-img'), 'Styles define .auth-brand-logo-img');
  assert(css.includes('.auth-body-center'), 'Styles define .auth-body-center');
  assert(css.includes('#005B36'), 'Emerald green #005B36 used as primary accent');

  console.log('\n================================================================');
  console.log('RESULTS: ALL 41/41 AUTHENTICATION & UI PASS 2 TESTS PASSED!');
  console.log('================================================================\n');
}

runTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
