/**
 * Página Ajustes
 * CorePlayBlox - Frontend
 *
 * Cambio de nombre, códigos promocionales.
 */

const SettingsPage = (function () {
  'use strict';

  const displayNameInput = document.getElementById('settings-display-name');
  const btnSaveDisplayName = document.getElementById('btn-save-display-name');
  const promoCodeInput = document.getElementById('settings-promo-code');
  const btnRedeemCode = document.getElementById('btn-redeem-code');

  function load() {
    const user = State.getUser();
    if (user && displayNameInput) {
      displayNameInput.value = user.display_name || user.username || '';
    }
  }

  if (btnSaveDisplayName) {
    btnSaveDisplayName.addEventListener('click', async () => {
      if (!State.isLoggedIn()) {
        if (typeof AuthUI !== 'undefined') AuthUI.showLogin();
        return;
      }
      const name = displayNameInput?.value?.trim();
      if (!name) {
        alert('Introduce un nombre');
        return;
      }
      try {
        await API.updateUsername(State.getUser().id, name);
        State.setUser({ ...State.getUser(), display_name: name });
        if (typeof AuthUI !== 'undefined') AuthUI.setLoggedIn(State.getUser());
        alert('Nombre guardado');
      } catch (err) {
        alert(err.message || 'Error al guardar');
      }
    });
  }

  if (btnRedeemCode) {
    btnRedeemCode.addEventListener('click', async () => {
      if (!State.isLoggedIn()) {
        if (typeof AuthUI !== 'undefined') AuthUI.showLogin();
        return;
      }
      const code = promoCodeInput?.value?.trim();
      if (!code) {
        alert('Introduce un código');
        return;
      }
      try {
        const res = await API.redeemCode(code);
        State.setUser({ ...State.getUser(), core_coins: res.balance });
        if (typeof AuthUI !== 'undefined') AuthUI.setLoggedIn(State.getUser());
        alert(`Código canjeado. +${res.coinsAdded} CoreCoins. Total: ${res.balance}`);
        promoCodeInput.value = '';
      } catch (err) {
        alert(err.message || 'Error al canjear');
      }
    });
  }

  window.addEventListener('page-changed', (e) => {
    if (e.detail?.page === 'settings') load();
  });

  return { load };
})();
