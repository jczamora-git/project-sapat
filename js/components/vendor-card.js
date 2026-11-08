export function getCanteenBrandMark(vendorId) {
  const marks = {
    'all': {
      class: 'brand-mark-all',
      bg: 'linear-gradient(135deg, #005B36 0%, #004528 100%)',
      color: '#FFFFFF',
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l2-5h14l2 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path><path d="M3 9h18"></path><path d="M9 22V12h6v10"></path></svg>'
    },
    'vendor-lita': {
      class: 'brand-mark-lita',
      bg: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      color: '#FFFFFF',
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z"></path><path d="M2 13h2M20 13h2"></path><path d="M4 11l1.5-2.5a2 2 0 0 1 1.7-1h9.6a2 2 0 0 1 1.7 1L20 11"></path><line x1="12" y1="4.5" x2="12" y2="7.5"></line><path d="M9 4.5c.6-.8 1.4-.8 2 0"></path></svg>'
    },
    'vendor-ben': {
      class: 'brand-mark-ben',
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#FFFFFF',
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="12" r="7"></circle><circle cx="10" cy="12" r="3.2" fill="currentColor" fill-opacity="0.3"></circle><line x1="16.5" y1="13.5" x2="22" y2="18"></line></svg>'
    },
    'vendor-cora': {
      class: 'brand-mark-cora',
      bg: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
      color: '#FFFFFF',
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18"></path><path d="M5 10c0 6.5 2.5 10.5 7 10.5s7-4 7-10.5"></path><path d="M8 7c-.5-1.5.5-2.5 1.5-3"></path><path d="M12 7c-.5-1.8.5-2.8 1.5-3.5"></path><path d="M16 7c-.5-1.5.5-2.5 1.5-3"></path></svg>'
    },
    'vendor-green': {
      class: 'brand-mark-green',
      bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      color: '#FFFFFF',
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c0 5 4 8.5 9 8.5s9-3.5 9-8.5H3z"></path><path d="M12 12V6a4 4 0 0 1 4-4c0 3-1.5 5-4 5"></path><path d="M12 9c-2 0-3.5-1.5-3.5-3.5 2 0 3.5 1.5 3.5 3.5"></path></svg>'
    },
    'vendor-tess': {
      class: 'brand-mark-tess',
      bg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      color: '#FFFFFF',
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"></path><path d="M3 8h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="2" x2="6" y2="5"></line><line x1="10" y1="2" x2="10" y2="5"></line><line x1="14" y1="2" x2="14" y2="5"></line></svg>'
    }
  };

  const mark = marks[vendorId] || marks['all'];
  return `
    <div class="canteen-brand-mark ${mark.class}" style="background: ${mark.bg}; color: ${mark.color};" aria-hidden="true">
      ${mark.svg}
    </div>
  `;
}

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
