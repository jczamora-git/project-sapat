import fs from 'fs';
import path from 'path';

console.log('=== TEST SUITE: STUDENT MENU PAGE REDESIGN ===');

// Setup mock browser environment
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};

const listeners = {};
global.window = {
  dispatchEvent: (event) => {
    const list = listeners[event.type] || [];
    list.forEach(cb => cb(event));
  },
  addEventListener: (type, cb) => {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(cb);
  }
};
global.CustomEvent = class {
  constructor(name, opts) { this.type = name; this.detail = opts ? opts.detail : null; }
};

// Simple Mock DOM Element
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this._innerHTML = '';
    this.classList = new Set();
    this.attributes = {};
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
  }
  contains(child) {
    return true;
  }
  querySelector(sel) {
    return this._innerHTML.includes(sel.replace(/^[#.\[\]="']+/g, '')) ? new MockElement() : null;
  }
  querySelectorAll(sel) {
    return [];
  }
  addEventListener(event, handler) {}
}

global.document = {
  getElementById: (id) => new MockElement(),
  querySelector: (sel) => new MockElement(),
  querySelectorAll: (sel) => []
};

// Import application modules dynamically (import router first to initialize route map)
const { router } = await import('../js/router.js');
const { state } = await import('../js/state.js');
const { SapatStorage, INITIAL_MENU, INITIAL_VENDORS } = await import('../js/storage.js');
const { studentMenuPage } = await import('../js/pages/student/menu.js');
const { renderFeaturedMealCard } = await import('../js/components/food-card.js');
const { getCanteenBrandMark } = await import('../js/components/vendor-card.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    testsFailed++;
  }
}

// 1. Initial State & Render
console.log('\n[1] Default Menu Catalog Rendering:');
state.studentVendorFilter = 'all';
state.selectedCategory = 'all';
state.searchQuery = '';
state.menuInStockOnly = false;
state.menuSortBy = 'recommended';

const container = new MockElement('div');
studentMenuPage.render(container);
const html = container.innerHTML;

assert(html.includes('Explore Meals'), 'Page title "Explore Meals" rendered');
assert(html.includes('Pre-order freshly prepared portions from campus canteens.'), 'Subtitle rendered');
assert(!html.includes('menu-header-cart-btn'), 'Redundant cart shortcut removed from menu page header');
assert(!html.includes('filter-count-badge'), 'No unnecessary filter count badge');
assert(html.includes('menu-category-nav'), 'Category horizontal navigation rendered');
assert(html.includes('All Dishes') && html.includes('Rice Meals') && html.includes('Healthy Bowls') && html.includes('Merienda'), 'All categories present');
assert(html.includes('menu-canteen-scroller'), 'Canteen selector track rendered');
assert(html.includes('All Canteens') && (html.includes('Ate Lita\'s Kitchen') || html.includes('Ate Lita&#39;s Kitchen')), 'All Canteens card and individual canteen cards rendered');
assert(!html.includes('selected-vendor-banner'), 'No duplicate large stall banner rendered');

// 2. Individual Canteen Selection
console.log('\n[2] Canteen Filter & Duplicate Card Elimination:');
state.setStudentVendorFilter('vendor-lita');
studentMenuPage.render(container);
const litaHtml = container.innerHTML;

assert(!litaHtml.includes('selected-vendor-banner'), 'NO duplicate stall information card created below selector');
assert(litaHtml.includes('Ate Lita\'s Kitchen') || litaHtml.includes('Ate Lita&#39;s Kitchen'), 'Catalog title reflects selected canteen');
assert(litaHtml.includes('Chicken Adobo') && litaHtml.includes('Pork Sinigang'), 'Ate Lita dishes rendered');
assert(!litaHtml.includes('Tapsilog'), 'Other stalls (Kuya Ben) correctly excluded');

// 3. Combined Canteen and Category Filtering
console.log('\n[3] Combined Category and Canteen Filtering:');
state.setSelectedCategory('rice-meals');
studentMenuPage.render(container);
const combinedHtml = container.innerHTML;

assert(combinedHtml.includes('Chicken Adobo'), 'Chicken Adobo (rice meal) present');
assert(combinedHtml.includes('Pork Sinigang'), 'Pork Sinigang (rice meal) present');
assert(!combinedHtml.includes('Crispy Lumpiang Shanghai'), 'Lumpiang Shanghai (merienda) correctly excluded');

// 4. Sold-out Product Representation
console.log('\n[4] Sold-Out Product State & Card Refinement:');
const soldOutDish = INITIAL_MENU.find(d => d.id === 'dish-lita-3');
const soldOutCardHtml = renderFeaturedMealCard(soldOutDish);

assert(soldOutCardHtml.includes('sold-out'), 'Sold out card has sold-out class');
assert(soldOutCardHtml.includes('media-soldout-scrim'), 'Sold out card displays understated scrim overlay');
assert(soldOutCardHtml.includes('Sold out today'), 'Remaining portion indicates Sold out today');
assert(soldOutCardHtml.includes('disabled'), 'Quick add button is disabled for sold out dish');
assert(!soldOutCardHtml.includes('media-tag-pill'), 'Stacked media tag pills removed for clean photography focus');
assert(!soldOutCardHtml.includes('grid-card-rating'), 'Rating pill removed from product card to avoid clutter');

// 5. In-Stock Product with Low Stock
console.log('\n[5] Low-Stock Product Indicator:');
const lowStockDish = INITIAL_MENU.find(d => d.id === 'dish-lita-2'); // 3 left
const lowStockCardHtml = renderFeaturedMealCard(lowStockDish);
assert(lowStockCardHtml.includes('low-stock'), 'Low stock dish (<5) has low-stock class');
assert(lowStockCardHtml.includes('Only 3 left'), 'Low stock shows "Only 3 left"');

// 6. Search Filter
console.log('\n[6] Search Filter Execution:');
state.studentVendorFilter = 'all';
state.selectedCategory = 'all';
state.searchQuery = 'adobo';
studentMenuPage.render(container);
const searchHtml = container.innerHTML;
assert(searchHtml.includes('Chicken Adobo'), 'Search matches Chicken Adobo');
assert(!searchHtml.includes('Tapsilog'), 'Search excludes non-matching dishes');

// 7. Empty State
console.log('\n[7] Empty / No-Results State:');
state.searchQuery = 'nonexistent-query-xyz';
studentMenuPage.render(container);
const emptyHtml = container.innerHTML;
assert(emptyHtml.includes('menu-empty-state'), 'Empty state container rendered');
assert(emptyHtml.includes('No matching meals found'), 'Empty state title present');
assert(emptyHtml.includes('Reset All Filters'), 'Reset button present in empty state');

// 8. Add to Cart
console.log('\n[8] Add to Cart Functionality:');
const initialCartCount = state.getCartCount();
const testDish = INITIAL_MENU[0];
state.addToCart(testDish, 1);
assert(state.cart.some(i => i.id === testDish.id), 'Successfully added meal to cart tray');
assert(state.getCartCount() === initialCartCount + 1, 'Cart count increased by 1');

// 9. Reset All Filters
console.log('\n[9] Reset All Filters:');
state.studentVendorFilter = 'all';
state.selectedCategory = 'all';
state.searchQuery = '';
studentMenuPage.render(container);
const resetHtml = container.innerHTML;
assert(resetHtml.includes('15 meals available'), 'All 15 meals available restored after reset');

// 10. Distinctive Canteen Brand Marks (SVG-based, no generic photo thumbs)
console.log('\n[10] Distinctive Canteen Brand Marks:');
assert(resetHtml.includes('canteen-brand-mark brand-mark-all'), 'All Canteens has custom brand-mark-all');
assert(resetHtml.includes('canteen-brand-mark brand-mark-lita'), 'Ate Lita has custom brand-mark-lita');
assert(resetHtml.includes('canteen-brand-mark brand-mark-ben'), 'Kuya Ben has custom brand-mark-ben');
assert(resetHtml.includes('canteen-brand-mark brand-mark-cora'), 'Nanay Cora has custom brand-mark-cora');
assert(resetHtml.includes('canteen-brand-mark brand-mark-green'), 'Green Bowl has custom brand-mark-green');
assert(resetHtml.includes('canteen-brand-mark brand-mark-tess'), 'Merienda ni Aling Tess has custom brand-mark-tess');
assert(!resetHtml.includes('canteen-select-thumb'), 'No generic food photo thumbnails used in canteen selector');
assert(resetHtml.includes('Stall #1') && resetHtml.includes('Stall #2') && resetHtml.includes('Stall #3'), 'Stall numbers clearly rendered in canteen cards');

// Verify individual brand mark helper outputs
const litaMark = getCanteenBrandMark('vendor-lita');
const benMark = getCanteenBrandMark('vendor-ben');
const coraMark = getCanteenBrandMark('vendor-cora');
const greenMark = getCanteenBrandMark('vendor-green');
const tessMark = getCanteenBrandMark('vendor-tess');

assert(litaMark.includes('<svg') && litaMark.includes('brand-mark-lita'), 'Ate Lita SVG mark generated');
assert(benMark.includes('<svg') && benMark.includes('brand-mark-ben'), 'Kuya Ben SVG mark generated');
assert(coraMark.includes('<svg') && coraMark.includes('brand-mark-cora'), 'Nanay Cora SVG mark generated');
assert(greenMark.includes('<svg') && greenMark.includes('brand-mark-green'), 'Green Bowl SVG mark generated');
assert(tessMark.includes('<svg') && tessMark.includes('brand-mark-tess'), 'Merienda Tess SVG mark generated');

// 11. CSS Compact Proportions and Spacing Verification
console.log('\n[11] Compact Product Card Proportions:');
const cssContent = fs.readFileSync('css/styles.css', 'utf-8');
assert(cssContent.includes('aspect-ratio: 4 / 3;'), '4:3 aspect ratio applied to product card media');
assert(cssContent.includes('padding: 7px 8px 8px;'), 'Compact 7px 8px 8px body padding applied to food-grid-card');
assert(cssContent.includes('gap: 8px;'), 'Reduced 8px grid gap applied');
assert(cssContent.includes('.canteen-brand-mark {'), 'Canteen brand mark styling defined');
assert(cssContent.includes('@media (min-width: 769px)') && cssContent.includes('grid-template-columns: repeat(6, 1fr);'), 'Desktop 6-column canteen grid defined');

console.log(`\nRESULTS: ${testsPassed} passed, ${testsFailed} failed.`);
if (testsFailed > 0) process.exit(1);
