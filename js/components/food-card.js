export function getImgFallback() {
  return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23005B36%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M18%208h1a4%204%200%200%201%200%208h-1%22%2F%3E%3Cpath%20d%3D%22M2%208h16v9a4%204%200%200%201-4%204H6a4%204%200%200%201-4-4V8z%22%2F%3E%3Cline%20x1%3D%226%22%20y1%3D%221%22%20x2%3D%226%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2210%22%20y1%3D%221%22%20x2%3D%2210%22%20y2%3D%224%22%2F%3E%3Cline%20x1%3D%2214%22%20y1%3D%221%22%20x2%3D%2214%22%20y2%3D%224%22%2F%3E%3C%2Fsvg%3E";
}

/**
 * 2-Column Food Discovery Product Card
 * Inspired by modern premium food delivery apps (DoorDash/Deliveroo/GrabFood)
 */
export function renderFeaturedMealCard(dish) {
  const remaining = Math.max(0, dish.dailyLimit - dish.reservedServings);
  const isSoldOut = remaining <= 0;
  const percentFilled = Math.min(100, Math.round((dish.reservedServings / dish.dailyLimit) * 100));
  const tagClass = isSoldOut ? 'soldout' : (remaining <= 5 ? 'low' : 'available');
  const tagLabel = isSoldOut ? 'Sold Out' : `${remaining} left`;

  return `
    <div class="food-grid-card ${isSoldOut ? 'sold-out' : ''}" data-action="open-meal" data-dish-id="${dish.id}">
      <div class="grid-card-media">
        <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.onerror=null; this.src='${getImgFallback()}';">
        <span class="media-tag-pill ${tagClass}">${tagLabel}</span>
        <span class="media-stall-pill">${dish.vendorStall || 'Stall'}</span>
        <button class="grid-card-heart" type="button" aria-label="Save to favorites" title="Favorite">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        ${isSoldOut ? '<div class="media-soldout-scrim"><span>Sold Out</span><small>Quota Reached</small></div>' : ''}
      </div>
      
      <div class="grid-card-body">
        <div class="grid-card-vendor-rating">
          <span class="grid-card-vendor">${dish.vendorName}</span>
          <span class="grid-card-rating">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FF8A24" stroke="#FF8A24" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>4.8</span>
          </span>
        </div>
        <h4 class="grid-card-title">${dish.name}</h4>
        
        <!-- Daily Preparation Quota Track -->
        <div class="quota-track-wrap" title="${dish.reservedServings} of ${dish.dailyLimit} portions booked">
          <div class="quota-track-bar">
            <div class="quota-track-fill ${isSoldOut ? 'soldout' : (remaining <= 5 ? 'warning' : '')}" style="width: ${percentFilled}%;"></div>
          </div>
        </div>

        <div class="grid-card-footer">
          <div class="grid-card-price-wrap">
            <span class="grid-card-price">₱${dish.price}</span>
          </div>
          <button class="grid-card-cta" 
            ${isSoldOut ? 'disabled' : ''} 
            data-action="quick-add" 
            data-dish-id="${dish.id}"
            title="${isSoldOut ? 'Sold out today' : 'Add 1 to pre-order tray'}">
            ${isSoldOut ? 'Sold Out' : `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Reserve</span>
            `}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Clean Row Food Card (Image-Focused Listings)
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
