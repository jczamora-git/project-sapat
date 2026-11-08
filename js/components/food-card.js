export function getImgFallback() {
  return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23087F5B%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M18%208h1a4%204%200%200%201%200%208h-1%22%2F%3E%3Cpath%20d%3D%22M2%208h16v9a4%204%200%200%201-4%204H6a4%204%200%200%201-4-4V8z%22%2F%3E%3Cline%20x1%3D%226%22%20y1%3D%221%22%20x2%3D%226%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2210%22%20y1%3D%221%22%20x2%3D%2210%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2214%22%20y1%3D%221%22%20x2%3D%2214%22%20y2%3D%224%22%2F%3E%3C%2Fsvg%3E";
}

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
    <div class="food-card ${isSoldOut ? 'sold-out' : ''}" data-action="open-meal" data-dish-id="${dish.id}">
      <div class="food-card-thumb">
        <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
        ${isSoldOut ? '<div class="sold-out-overlay">SOLD OUT<br><span style="font-size:9px; font-weight:500;">Limit Reached</span></div>' : ''}
        <span class="food-stall-pill">${dish.vendorStall || 'Stall'}</span>
      </div>
      
      <div class="food-card-details">
        <div>
          <div class="food-vendor-sub">${dish.vendorName}</div>
          <div class="food-header-line">
            <h4 class="food-title">${dish.name}</h4>
            <span class="food-price">₱${dish.price}</span>
          </div>
          <p class="food-desc">${dish.description}</p>
        </div>

        <div class="servings-gauge">
          <div class="gauge-labels">
            <span>Daily Prep Quota</span>
            <span class="highlight-servings ${statusTextClass}">
              ${isSoldOut ? '0 servings left (Quota hit)' : `${remaining} of ${dish.dailyLimit} left`}
            </span>
          </div>
          <div class="gauge-bar-track">
            <div class="gauge-bar-fill ${gaugeClass}" style="width: ${percentFilled}%;"></div>
          </div>
        </div>

        <div class="food-card-actions">
          <span class="food-tag-pill">${dish.categoryName || 'Ulam'}</span>
          <button class="btn-add-cart" 
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

export function renderFeaturedMealCard(dish) {
  const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
  const isSoldOut = remaining <= 0;
  const tagClass = isSoldOut ? 'soldout' : (remaining <= 5 ? 'low' : 'available');
  const tagLabel = isSoldOut ? 'SOLD OUT' : `${remaining} left`;

  return `
    <div class="featured-card" data-action="open-meal" data-dish-id="${dish.id}">
      <div class="featured-img-wrap">
        <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
        <span class="stock-tag-pill ${tagClass}">${tagLabel}</span>
        <span class="featured-stall-tag">${dish.vendorStall || 'Stall'}</span>
      </div>
      <div class="featured-content">
        <div class="featured-vendor-line">${dish.vendorName}</div>
        <h4>${dish.name}</h4>
        <div class="item-cat">${dish.categoryName || 'Ulam'}</div>
        <div class="featured-bottom">
          <span class="featured-price">₱${dish.price}</span>
          <button class="btn-mini-add" 
            ${isSoldOut ? 'disabled' : ''} 
            data-action="quick-add" 
            data-dish-id="${dish.id}">
            ${isSoldOut ? 'Sold Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  `;
}
