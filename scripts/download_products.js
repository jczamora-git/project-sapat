const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dishUrls = {
  'chicken-adobo.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chicken_Adobo_over_rice.jpg',
  'pork-sinigang.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Sinigang_na_Baboy.jpg',
  'lumpiang-shanghai.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Lumpiang_Shanghai_%28Philippines%29.jpg',
  'tapsilog.jpg': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Tapsilog.jpg',
  'hotsilog.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Hotsilog%2C_Mar_2024.jpg',
  'longsilog.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/59/Skinless_Longsilog_in_Taichung.jpg',
  'pork-giniling.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Pork_Giniling%2C_Mar_2024.jpg',
  'ginisang-monggo.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Ginisang_munggo_with_fried_bangus.jpg',
  'fried-fish-meal.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Fried_Bangus%2C_Feb_2024.jpg',
  'chicken-teriyaki.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Chicken_teriyaki.jpg',
  'tofu-veggie-bowl.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Rice_bowl_topped_with_tofu_%287960798384%29.jpg',
  'tuna-rice-bowl.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Spicy_tuna_rice_bowl_%2835032450572%29.jpg',
  'pancit-bihon.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Pancit_bihon_%28Philippines%29_04.jpg',
  'turon.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Turon_na_Saging.jpg',
  'cheese-lumpia.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Cheese_lumpia_%28Philippines%29.jpg'
};

const targetDir = path.join(__dirname, '..', 'assets', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

console.log('Downloading dishes to', targetDir);
for (const [filename, url] of Object.entries(dishUrls)) {
  const dest = path.join(targetDir, filename);
  try {
    console.log(`Downloading ${filename}...`);
    execFileSync('curl.exe', [
      '-s', '-L',
      '-A', 'SapatCanteenApp/1.0 (https://sapat.ph; contact@sapat.ph)',
      '-o', dest,
      url
    ]);
    const stats = fs.statSync(dest);
    if (stats.size < 5000) {
      console.warn(`WARNING: ${filename} is unusually small (${stats.size} bytes)`);
    } else {
      console.log(`[OK] ${filename} (${stats.size} bytes)`);
    }
    sleep(1200);
  } catch (err) {
    console.error(`[ERR] Error downloading ${filename}:`, err.message);
  }
}
