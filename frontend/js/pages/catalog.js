/**
 * Página Catálogo
 * CorePlayBlox - Frontend
 *
 * Lista de items, compra con CoreCoins.
 */

const CatalogPage = (function () {
  'use strict';

  const catalogGrid = document.getElementById('catalog-grid');
  const typeFilter = document.getElementById('catalog-type-filter');

  async function load() {
    const type = typeFilter ? typeFilter.value : '';
    try {
      const items = await API.getCatalog({ type, limit: 50 });
      if (!catalogGrid) return;
      catalogGrid.innerHTML = (items || []).map(renderItem).join('');
      catalogGrid.querySelectorAll('.btn-purchase').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.itemId;
          if (!id) return;
          if (!State.isLoggedIn()) {
            if (typeof AuthUI !== 'undefined') AuthUI.showLogin();
            return;
          }
          try {
            const res = await API.purchaseItem(id);
            State.setUser({ ...State.getUser(), core_coins: res.balance });
            if (typeof AuthUI !== 'undefined') AuthUI.setLoggedIn(State.getUser());
            alert('Compra realizada');
            load();
          } catch (err) {
            alert(err.message || 'Error al comprar');
          }
        });
      });
    } catch (err) {
      if (catalogGrid) catalogGrid.innerHTML = '<p class="empty-state">Error al cargar catálogo</p>';
    }
  }

  function renderItem(item) {
    const icon = { hat: '🎩', shirt: '👕', accessory: '👓', pants: '👖', face: '😀' }[item.type] || '🛍️';
    return `
      <div class="catalog-item">
        <div class="catalog-item-thumb">${icon}</div>
        <div class="catalog-item-name">${escapeHtml(item.name || '')}</div>
        <div class="catalog-item-price">${item.price_coins || 0} CoreCoins</div>
        <div class="catalog-item-desc">${escapeHtml(item.description || '')}</div>
        <button class="btn btn-primary btn-sm btn-purchase" data-item-id="${item.id}">Comprar</button>
      </div>
    `;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (typeFilter) typeFilter.addEventListener('change', load);

  window.addEventListener('page-changed', (e) => {
    if (e.detail && e.detail.page === 'catalog') load();
  });

  return { load };
})();
