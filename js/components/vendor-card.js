export function renderCanteenCard(v, menu) {
  const vendorDishes = menu.filter(d => d.vendorId === v.id && d.isAvailable);
  const vLimit = vendorDishes.reduce((s, d) => s + d.dailyLimit, 0);
  const vReserved = vendorDishes.reduce((s, d) => s + d.reservedServings, 0);
  const vRemaining = Math.max(0, vLimit - vReserved);

  return `
    <div class="canteen-card" data-action="select-vendor" data-vendor-id="${v.id}">
      <div class="canteen-card-cover" style="background-image: url('${v.bannerImage}');">
        <div class="canteen-cover-overlay"></div>
        <span class="canteen-stall-badge">${v.stallNumber}</span>
        <span class="canteen-status-pill ${v.isOpen ? 'open' : 'closed'}">
          <span class="status-indicator ${v.isOpen ? 'online' : 'offline'}"></span> ${v.isOpen ? 'Open Now' : 'Closed'}
        </span>
        <div class="canteen-cover-caption">
          <h4 class="canteen-cover-name">${v.name}</h4>
          <span class="canteen-cover-category">${v.category}</span>
        </div>
      </div>
      <div class="canteen-card-body">
        <p class="canteen-desc">${v.description}</p>
        <div class="canteen-footer-row">
          <span class="canteen-portions-left">
            <span class="quota-dot"></span>
            <strong>${vRemaining}</strong> portions left
          </span>
          <span class="canteen-cta-link">
            <span>Browse</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </span>
        </div>
      </div>
    </div>
  `;
}

export function renderVendorAccountBar(currentVendorId, vendors) {
  return `
    <div class="v-account-selector-wrap">
      <div class="v-account-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
        <span>Stall Management Account:</span>
      </div>
      <select class="v-account-select" data-action="switch-vendor-account">
        ${vendors.map(v => `
          <option value="${v.id}" ${v.id === currentVendorId ? 'selected' : ''}>
            ${v.stallNumber}: ${v.name}
          </option>
        `).join('')}
      </select>
    </div>
  `;
}

export function renderModalVendorItem(v, isActive) {
  return `
    <div class="modal-vendor-item ${isActive ? 'active' : ''}" 
         data-action="switch-role-vendor" 
         data-vendor-id="${v.id}">
      <div class="m-vendor-avatar" style="background: ${v.avatarColor};">${v.avatar}</div>
      <div class="m-vendor-info">
        <div class="m-vendor-name">${v.name}</div>
        <div class="m-vendor-sub">${v.stallNumber} &bull; ${v.category}</div>
      </div>
      <span class="m-vendor-pill">${isActive ? 'Active' : 'Select'}</span>
    </div>
  `;
}
