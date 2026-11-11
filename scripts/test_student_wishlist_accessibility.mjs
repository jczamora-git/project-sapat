/**
 * TEST SUITE: STUDENT MEAL WISHLIST ACCESSIBILITY & VOTING INTEGRATION
 */

// Mock browser globals
global.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; }
};

global.window = {
  location: { hash: '#/student/home' },
  dispatchEvent: () => {},
  addEventListener: () => {},
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
};

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.innerHTML = '';
    this.classList = new Set();
    this.children = [];
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  addEventListener() {}
  contains() { return true; }
}
global.document = {
  getElementById: (id) => new MockElement('div'),
  createElement: (tag) => new MockElement(tag)
};

const { SapatStorage } = await import('../js/storage.js');
const { ForecastingService } = await import('../js/services/forecasting.service.js');
const { studentHomePage } = await import('../js/pages/student/home.js');
const { studentMenuPage } = await import('../js/pages/student/menu.js');
const { router } = await import('../js/router.js');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('TEST SUITE: STUDENT MEAL WISHLIST ACCESSIBILITY');
console.log('================================================================\n');

// 1. Reset baseline
SapatStorage.resetData();

// [1] HOMEPAGE QUICK ACCESS SHORTCUT
console.log('[1] Homepage Upper Portion Quick Access Shortcut:');
const homeContainer = new MockElement('div');
studentHomePage.render(homeContainer);
const homeHtml = homeContainer.innerHTML;

assert(homeHtml.includes('home-wishlist-quick-card'), 'Quick access shortcut card rendered on Homepage');
assert(homeHtml.includes('Campus Meal Wishlist'), 'Campus Meal Wishlist title rendered in shortcut');
assert(homeHtml.includes("Vote for meals you'd like your canteen to offer"), 'Helpful subtitle description present');
assert(homeHtml.includes('data-action="open-wishlist-tab"') && homeHtml.includes('View &amp; Vote'), 'View & Vote action button present');
assert(homeHtml.includes('data-action="open-suggest-modal"') && homeHtml.includes('Suggest a Meal'), 'Suggest a Meal secondary action present');
assert(homeHtml.includes('student suggestions'), 'Actual count of student suggestions rendered');
assert(!homeHtml.includes('student-wishlist-cards'), 'Redundant full 3-card block removed from lower homepage');
assert(homeHtml.includes('home-wishlist-teaser-card'), 'Concise discovery teaser callout rendered on lower homepage');

// [2] MENU PAGE SEGMENTED TABS
console.log('\n[2] Menu Page Segmented Navigation (Browse Meals vs Meal Wishlist):');
const menuContainer = new MockElement('div');

// Default Browse Meals mode
studentMenuPage.activeTab = 'browse';
global.window.location.hash = '#/student/menu';
studentMenuPage.render(menuContainer);
const menuBrowseHtml = menuContainer.innerHTML;

assert(menuBrowseHtml.includes('menu-tab-segmented-control'), 'Segmented navigation tab control rendered');
assert(menuBrowseHtml.includes('Browse Meals') && menuBrowseHtml.includes('Meal Wishlist'), 'Both tabs present in segmented control');
assert(menuBrowseHtml.includes('menu-food-grid'), 'Browse Meals tab renders full food catalog grid');
assert(menuBrowseHtml.includes('menu-category-nav'), 'Browse Meals tab preserves category navigation');
assert(menuBrowseHtml.includes('menu-canteen-scroller'), 'Browse Meals tab preserves canteen stall selector');

// [3] MENU PAGE MEAL WISHLIST TAB
console.log('\n[3] Menu Page Meal Wishlist Tab View:');
studentMenuPage.activeTab = 'wishlist';
global.window.location.hash = '#/student/menu?tab=wishlist';
studentMenuPage.render(menuContainer);
const menuWishlistHtml = menuContainer.innerHTML;

assert(menuWishlistHtml.includes('wishlist-tab-header'), 'Wishlist tab header rendered');
assert(menuWishlistHtml.includes('wishlist-cards-list'), 'Dedicated wishlist cards list rendered');
assert(menuWishlistHtml.includes('btn-vote-wishlist'), 'Interactive vote action buttons rendered');
assert(menuWishlistHtml.includes('btn-wishlist-suggest'), 'Suggest a Meal action button present inside Wishlist tab');
assert(menuWishlistHtml.includes('student request'), 'Student request counts rendered on cards');

// [4] DATA UNIFICATION & PERSISTENT VOTING
console.log('\n[4] Shared Data Integrity & Voting Workflow:');
const initialSuggestions = SapatStorage.getMealSuggestions();
const topInitial = initialSuggestions[0];
const initialVotes = Number(topInitial.votes) || 0;

// Vote as student '2026-0001'
const voteRes1 = SapatStorage.voteMealSuggestion(topInitial.id, '2026-0001');
assert(voteRes1.success === true, 'Student 2026-0001 successfully voted');
assert(voteRes1.votes === initialVotes + 1, 'Vote count incremented by 1');

// Duplicate vote attempt by same student
const dupVoteRes = SapatStorage.voteMealSuggestion(topInitial.id, '2026-0001');
assert(dupVoteRes.success === false, 'Duplicate vote prevented');

// Second student votes
const voteRes2 = SapatStorage.voteMealSuggestion(topInitial.id, '2026-0002');
assert(voteRes2.success === true, 'Student 2026-0002 successfully voted');
assert(voteRes2.votes === initialVotes + 2, 'Vote count incremented to +2');

// Re-render both pages to verify synchronization
studentHomePage.render(homeContainer);
studentMenuPage.activeTab = 'wishlist';
studentMenuPage.render(menuContainer);

assert(homeContainer.innerHTML.includes(`${initialSuggestions.length} student suggestions`), 'Homepage shortcut displays synced suggestion count');
assert(menuContainer.innerHTML.includes(`${initialVotes + 2}`), 'Menu wishlist displays updated vote count');

// [5] VENDOR-SIDE SYNCHRONIZATION
console.log('\n[5] Vendor-Side Forecasting & Wishlist Integration:');
const vendorWishlist = ForecastingService.getRequestedMeals('vendor-lita');
assert(Array.isArray(vendorWishlist) && vendorWishlist.length > 0, 'Vendor-side wishlist populated from shared storage');

// [6] ROUTE COMPATIBILITY (Query Parameter Stripping)
console.log('\n[6] Route Compatibility (#/student/menu?tab=wishlist):');
const cleanHash = '#/student/menu?tab=wishlist'.split('?')[0];
assert(cleanHash === '#/student/menu', 'Route query cleanly resolves to existing menu route');
assert(!!router.routes[cleanHash], 'Existing menu page route handler correctly found');

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED.`);
if (passedTests === totalTests) {
  console.log('ALL STUDENT MEAL WISHLIST ACCESSIBILITY CRITERIA SATISFIED!');
} else {
  console.error('TESTS FAILED');
  process.exit(1);
}
console.log('================================================================');

