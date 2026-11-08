const fs = require('fs');
const path = require('path');

console.log('--- SAPAT ASSET & STORAGE VERIFICATION ---');

// 1. Check all dish files
const dishes = [
  'chicken-adobo.jpg',
  'pork-sinigang.jpg',
  'lumpiang-shanghai.jpg',
  'tapsilog.jpg',
  'hotsilog.jpg',
  'longsilog.jpg',
  'pork-giniling.jpg',
  'ginisang-monggo.jpg',
  'fried-fish-meal.jpg',
  'chicken-teriyaki.jpg',
  'tofu-veggie-bowl.jpg',
  'tuna-rice-bowl.jpg',
  'pancit-bihon.jpg',
  'turon.jpg',
  'cheese-lumpia.jpg'
];

let allPassed = true;
console.log('\n[1/4] Verifying 15 Dish Files:');
dishes.forEach((d) => {
  const p = path.join(__dirname, '..', 'assets', 'images', 'products', d);
  if (!fs.existsSync(p)) {
    console.error(`  FAIL: Missing ${d}`);
    allPassed = false;
  } else {
    const s = fs.statSync(p);
    if (s.size < 10000) {
      console.error(`  FAIL: ${d} too small (${s.size} bytes)`);
      allPassed = false;
    } else {
      console.log(`  PASS: ${d} (${(s.size / 1024).toFixed(1)} KB)`);
    }
  }
});

// 2. Check 5 Canteen Banners
const canteens = [
  'ate-lita.jpg',
  'kuya-ben.jpg',
  'nanay-cora.jpg',
  'green-bowl.jpg',
  'aling-tess.jpg'
];

console.log('\n[2/4] Verifying 5 Canteen Banners:');
canteens.forEach((c) => {
  const p = path.join(__dirname, '..', 'assets', 'images', 'canteens', c);
  if (!fs.existsSync(p)) {
    console.error(`  FAIL: Missing canteen ${c}`);
    allPassed = false;
  } else {
    const s = fs.statSync(p);
    if (s.size < 10000) {
      console.error(`  FAIL: ${c} too small (${s.size} bytes)`);
      allPassed = false;
    } else {
      console.log(`  PASS: ${c} (${(s.size / 1024).toFixed(1)} KB)`);
    }
  }
});

// 3. Check 6 Category Tiles
const categories = [
  'all-dishes.jpg',
  'rice-meals.jpg',
  'merienda.jpg',
  'healthy-bowls.jpg',
  'snacks.jpg',
  'drinks.jpg'
];

console.log('\n[3/4] Verifying 6 Category Tiles:');
categories.forEach((cat) => {
  const p = path.join(__dirname, '..', 'assets', 'images', 'categories', cat);
  if (!fs.existsSync(p)) {
    console.error(`  FAIL: Missing category ${cat}`);
    allPassed = false;
  } else {
    const s = fs.statSync(p);
    if (s.size < 10000) {
      console.error(`  FAIL: ${cat} too small (${s.size} bytes)`);
      allPassed = false;
    } else {
      console.log(`  PASS: ${cat} (${(s.size / 1024).toFixed(1)} KB)`);
    }
  }
});

// 4. Test LocalStorage Migration in Node environment
console.log('\n[4/4] Testing LocalStorage Image Migration:');
// Mock window and localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
global.window = {
  dispatchEvent: () => {}
};
global.CustomEvent = class {
  constructor(name, opts) { this.name = name; this.opts = opts; }
};

const { SapatStorage, INITIAL_MENU, INITIAL_VENDORS } = require('../js/storage.js');

// Simulate legacy localStorage data having old unsplash images but customized user limits
const legacyMenu = INITIAL_MENU.map(item => ({
  ...item,
  image: 'https://images.unsplash.com/legacy-dish-url',
  dailyLimit: 99, // custom user value
  reservedServings: 50
}));
store['sapat_menu_items_v2'] = JSON.stringify(legacyMenu);

const legacyVendors = INITIAL_VENDORS.map(v => ({
  ...v,
  bannerImage: 'https://images.unsplash.com/legacy-vendor-banner'
}));
store['sapat_vendors_v2'] = JSON.stringify(legacyVendors);

// Run getMenu() and getVendors()
const migratedMenu = SapatStorage.getMenu();
const migratedVendors = SapatStorage.getVendors();

// Verify
let migrationSuccess = true;
migratedMenu.forEach(item => {
  if (item.image.includes('unsplash.com')) {
    console.error(`  FAIL: ${item.id} image not migrated: ${item.image}`);
    migrationSuccess = false;
  }
  if (!item.image.startsWith('assets/images/products/')) {
    console.error(`  FAIL: ${item.id} image path unexpected: ${item.image}`);
    migrationSuccess = false;
  }
  if (item.dailyLimit !== 99 || item.reservedServings !== 50) {
    console.error(`  FAIL: ${item.id} customized limits were lost!`);
    migrationSuccess = false;
  }
});

migratedVendors.forEach(v => {
  if (v.bannerImage.includes('unsplash.com')) {
    console.error(`  FAIL: ${v.id} bannerImage not migrated: ${v.bannerImage}`);
    migrationSuccess = false;
  }
  if (!v.bannerImage.startsWith('assets/images/canteens/')) {
    console.error(`  FAIL: ${v.id} bannerImage unexpected: ${v.bannerImage}`);
    migrationSuccess = false;
  }
});

if (migrationSuccess) {
  console.log('  PASS: Safe image migration preserves inventory & updates all 15 dishes + 5 canteens');
} else {
  allPassed = false;
}

if (!allPassed) {
  console.error('\nOVERALL RESULT: FAILED');
  process.exit(1);
} else {
  console.log('\nOVERALL RESULT: ALL CHECKS PASSED');
}

