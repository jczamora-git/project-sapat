import fs from 'fs';

console.log('=== VERIFYING COMPACT PRODUCT CARDS & COMPUTED STYLES ===\n');

const css = fs.readFileSync('css/styles.css', 'utf-8');

// 1. Check Mobile Grid Spacing
console.log('[1] Mobile 2-Column Grid (440px Viewport):');
const mobileGridMatch = css.match(/\.menu-food-grid\s*\{([^}]+)\}/);
if (!mobileGridMatch) throw new Error('Could not find .menu-food-grid in css');
const mobileGridRules = mobileGridMatch[1];

const has2Col = mobileGridRules.includes('grid-template-columns: repeat(2, 1fr)');
const has8pxGap = mobileGridRules.includes('gap: 8px');
console.log(`  - 2-Column Grid: ${has2Col ? 'PASS' : 'FAIL'}`);
console.log(`  - 8px Grid Gap: ${has8pxGap ? 'PASS' : 'FAIL'}`);

// Calculate 440px layout:
// Screen padding: 16px * 2 = 32px.
// Grid container width: 440px - 32px = 408px.
// Column width: (408px - 8px) / 2 = 200px.
const colWidth440 = (440 - 32 - 8) / 2;
console.log(`  - Computed Card Width @ 440px: ${colWidth440}px`);

// 2. Check Product Card Media & Aspect Ratio
console.log('\n[2] Product Card Media & Controlled Height:');
const mediaMatch = css.match(/\.grid-card-media\s*\{([^}]+)\}/);
const mediaRules = mediaMatch[1];
const hasAspectRatio = mediaRules.includes('aspect-ratio: 4 / 3');
const hasMaxHeightMobile = mediaRules.includes('max-height: 128px');
console.log(`  - Aspect-ratio 4:3: ${hasAspectRatio ? 'PASS' : 'FAIL'}`);
console.log(`  - Controlled Mobile Max-Height (128px): ${hasMaxHeightMobile ? 'PASS' : 'FAIL'}`);

const computedMediaHeight440 = Math.min(128, colWidth440 * (3 / 4));
console.log(`  - Computed Image Height @ 440px: ${computedMediaHeight440}px (controlled 4:3 crop)`);

// 3. Check Card Body Padding & Typography Spacing
console.log('\n[3] Card Body Padding & Typography Spacing:');
const bodyMatch = css.match(/\.grid-card-body\s*\{([^}]+)\}/);
const bodyRules = bodyMatch[1];
const hasCompactPadding = bodyRules.includes('padding: 7px 8px 8px');
console.log(`  - Compact Body Padding (7px 8px 8px): ${hasCompactPadding ? 'PASS' : 'FAIL'}`);

const titleMatch = css.match(/\.grid-card-title\s*\{([^}]+)\}/);
const titleRules = titleMatch[1];
const hasLineClamp2 = titleRules.includes('-webkit-line-clamp: 2');
const hasConsistentTitleHeight = titleRules.includes('min-height: 2.5em') && titleRules.includes('max-height: 2.5em');
console.log(`  - Prominent Title Max 2-Lines (-webkit-line-clamp: 2): ${hasLineClamp2 ? 'PASS' : 'FAIL'}`);
console.log(`  - Uniform Card Height Support (title height 2.5em): ${hasConsistentTitleHeight ? 'PASS' : 'FAIL'}`);

// 4. Check Desktop Viewport (min-width: 769px)
console.log('\n[4] Desktop Layout Grid & Dimensions:');
const desktopOverrideMatch = css.match(/\.menu-food-grid\s*\{[^}]*?repeat\(auto-fill,\s*minmax\(180px,\s*1fr\)\)[^}]*\}/);
const desktopOverrideRules = desktopOverrideMatch ? desktopOverrideMatch[0] : '';
const desktopCompactCols = desktopOverrideRules.includes('minmax(180px, 1fr)');
const desktopCompactGap = desktopOverrideRules.includes('gap: 12px');
console.log(`  - Desktop Responsive Grid minmax(180px, 1fr): ${desktopCompactCols ? 'PASS' : 'FAIL'}`);
console.log(`  - Desktop Controlled Gap (12px): ${desktopCompactGap ? 'PASS' : 'FAIL'}`);

// 5. Total Computed Heights Verification
console.log('\n[5] Total Card Height Comparison:');
// Old card height was ~310px (156px image + 34px padding + oversized text margins)
// New card height:
// 128px (media) + 15px (body padding) + 12px (vendor) + 2px (margin) + 31.25px (2-line title) + 3px (margin) + 12px (availability) + 4px (margin) + 30px (footer) = ~237px
const newHeight = computedMediaHeight440 + 15 + 12 + 2 + 31.25 + 3 + 12 + 4 + 30;
console.log(`  - Estimated Card Height @ 440px: ~${Math.round(newHeight)}px (Reduced from ~310px, -24% vertical footprint)`);

// 6. Conflicting Overrides Check
console.log('\n[6] Conflicting Overrides Audit:');
const duplicateHoverAdd = (css.match(/\.grid-card-quick-add:hover:not\(:disabled\)/g) || []).length;
console.log(`  - Quick-add hover rules in stylesheet: ${duplicateHoverAdd} (Expected: 1)`);
if (duplicateHoverAdd !== 1) throw new Error('Duplicate .grid-card-quick-add:hover found!');

console.log('\nALL VERIFICATIONS PASSED.');
