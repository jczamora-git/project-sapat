export function getImgFallback() {
  return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23005B36%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M18%208h1a4%204%200%200%201%200%208h-1%22%2F%3E%3Cpath%20d%3D%22M2%208h16v9a4%204%200%200%201-4%204H6a4%204%200%200%201-4-4V8z%22%2F%3E%3Cline%20x1%3D%226%22%20y1%3D%221%22%20x2%3D%226%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2210%22%20y1%3D%221%22%20x2%3D%2210%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2214%22%20y1%3D%221%22%20x2%3D%2214%22%20y2%3D%224%22%2F%3E%3C%2Fsvg%3E";
}

/**
 * 2-Column Food Card for Discovery Grids (Home & Menu)
 */
export function renderFeaturedMealCard(dish) {
  const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
  const isSoldOut = remaining <= 0;
  const percentFilled = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
  const tagClass = isSoldOut ? 'soldout' : (remaining <= 5 ? 'low' : 'available');
  const tagLabel = isSoldOut ? 'SOLD OUT' : `${remaining} left`;

  return `
    <div class="food-grid-card ${isSoldOut ? 'sold-out' : ''}" data-action="open-meal" data-dish-id="${dish.id}">
      <div class="grid-card-media">
        <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
        <span class="media-tag-pill ${tagClass}">${tagLabel}</span>
        <span class="media-stall-pill">${dish.vendorStall || 'Stall'}</span>
        ${isSoldOut ? '<div class="media-soldout-scrim"><span>Sold Out</span><small>Quota Hit</small></div>' : ''}
      </div>
      
      <div class="grid-card-body">
        <div class="grid-card-vendor">${dish.vendorName}</div>
        <h4 class="grid-card-title">${dish.name}</h4>
        
        <!-- Daily Preparation Quota Track -->
        <div class="quota-track-wrap">
          <div class="quota-track-bar">
            <div class="quota-track-fill ${isSoldOut ? 'soldout' : (remaining <= 5 ? 'warning' : '')}" style="width: ${percentFilled}%;"></div>
          </div>
        </div>

        <div class="grid-card-footer">
          <span class="grid-card-price">₱${dish.price}</span>
          <button class="grid-card-cta" 
            ${isSoldOut ? 'disabled' : ''} 
            data-action="quick-add" 
            data-dish-id="${dish.id}">
            ${isSoldOut ? 'Sold Out' : '+ Reserve'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Clean List Food Card (Image-Focused Listings)
 */
export function renderStudentFoodCard(dish) {
  const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
  const isSoldOut = remaining <= 0;
  const percentFilled = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));

  let gaugeClass = '';
  let statusTextClass = '';
  if (isSoldOut) {
    gaugeClass = 'soldout';
    statusTextClass = 'soldout';
  } else if (remaining <= 5) {
    gaugeClass = 'warning';
    statusTextClass = 'low';
  }

  return `
    <div class="food-row-card ${isSoldOut ? 'sold-out' : ''}" data-action="open-meal" data-dish-id="${dish.id}">
      <div class="food-row-thumb">
        <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
        <span class="food-stall-tag">${dish.vendorStall || 'Stall'}</span>
        ${isSoldOut ? '<div class="thumb-soldout-overlay">SOLD OUT</div>' : ''}
      </div>
      
      <div class="food-row-body">
        <div class="food-row-header">
          <div class="food-row-vendor">${dish.vendorName}</div>
          <span class="food-row-price">₱${dish.price}</span>
        </div>
        <h4 class="food-row-title">${dish.name}</h4>
        <p class="food-row-desc">${dish.description}</p>

        <!-- Preparation quota gauge -->
        <div class="row-quota-wrap">
          <div class="row-quota-meta">
            <span>Daily Kitchen Limit</span>
            <span class="quota-count ${statusTextClass}">${isSoldOut ? 'Quota Reached' : `${remaining} of ${dish.dailyLimit} left`}</span>
          </div>
          <div class="row-quota-track">
            <div class="row-quota-fill ${gaugeClass}" style="width: ${percentFilled}%;"></div>
          </div>
        </div>

        <div class="food-row-actions">
          <span class="food-cat-tag">${dish.categoryName || 'Ulam'}</span>
          <button class="btn-row-reserve" 
            ${isSoldOut ? 'disabled' : ''} 
            data-action="quick-add" 
            data-dish-id="${dish.id}">
            ${isSoldOut ? 'Sold Out' : '+ Reserve'}
          </button>
        </div>
      </div>
    </div>
  `;
}
