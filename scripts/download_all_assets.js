const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function downloadFile(url, dest) {
  console.log(`Downloading: ${url} -> ${dest}`);
  execFileSync('curl.exe', [
    '-s', '-L',
    '-A', 'SapatCanteenApp/1.0 (https://sapat.ph; contact@sapat.ph)',
    '-o', dest,
    url
  ]);
  const stats = fs.statSync(dest);
  if (stats.size < 5000) {
    throw new Error(`Downloaded file too small: ${stats.size} bytes`);
  }
  console.log(`[OK] Saved ${path.basename(dest)} (${stats.size} bytes)`);
  sleep(1100);
}

// 1. Remaining 6 dishes to download
const productsDir = path.join(__dirname, '..', 'assets', 'images', 'products');
const dishFixes = {
  'hotsilog.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Hotsilog%2C_Mar_2024.jpg',
  'chicken-teriyaki.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Chicken_teriyaki.jpg',
  'tofu-veggie-bowl.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Rice_bowl_topped_with_tofu_%287960798384%29.jpg',
  'tuna-rice-bowl.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Spicy_tuna_rice_bowl_%2835032450572%29.jpg',
  'turon.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Turon_na_Saging.jpg',
  'cheese-lumpia.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Cheese_lumpia_%28Philippines%29.jpg'
};

for (const [file, url] of Object.entries(dishFixes)) {
  const dest = path.join(productsDir, file);
  try {
    downloadFile(url, dest);
  } catch (err) {
    console.error(`[ERR] Error on ${file}:`, err.message);
  }
}

// 2. Canteen Banners
const canteensDir = path.join(__dirname, '..', 'assets', 'images', 'canteens');
const canteenUrls = {
  'ate-lita.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Carinderia_Cebu_City_003.jpg',
  'kuya-ben.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Carinderia_Cebu_City_004.jpg',
  'nanay-cora.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Carinderia_Cebu_City_005.jpg',
  'green-bowl.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Carinderia_Cebu_City_006.jpg',
  'aling-tess.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Turon_na_Saging.jpg'
};

for (const [file, url] of Object.entries(canteenUrls)) {
  const dest = path.join(canteensDir, file);
  try {
    downloadFile(url, dest);
  } catch (err) {
    console.error(`[ERR] Error on canteen ${file}:`, err.message);
  }
}

// 3. Category Images
const categoriesDir = path.join(__dirname, '..', 'assets', 'images', 'categories');
const drinkUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Samalamig_%282378832517%29.jpg';
try {
  downloadFile(drinkUrl, path.join(categoriesDir, 'drinks.jpg'));
} catch (e) {
  console.error('Error downloading drinks category:', e.message);
}

// Copy other category tiles from authentic products
const copyCat = (srcFile, destFile) => {
  const src = path.join(productsDir, srcFile);
  const dest = path.join(categoriesDir, destFile);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[OK] Copied category tile ${destFile} from ${srcFile}`);
  }
};

copyCat('chicken-adobo.jpg', 'all-dishes.jpg');
copyCat('tapsilog.jpg', 'rice-meals.jpg');
copyCat('turon.jpg', 'merienda.jpg');
copyCat('tofu-veggie-bowl.jpg', 'healthy-bowls.jpg');
copyCat('lumpiang-shanghai.jpg', 'snacks.jpg');

console.log('Asset preparation complete.');
