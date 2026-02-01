/**
 * Página Avatar
 * CorePlayBlox - Frontend
 *
 * Vista previa 3D, color de piel, accesorios.
 */

const AvatarPage = (function () {
  'use strict';

  const skinColorInput = document.getElementById('avatar-skin-color');
  const accessoriesList = document.getElementById('avatar-accessories-list');
  const btnSaveAvatar = document.getElementById('btn-save-avatar');
  const avatarCanvas = document.getElementById('avatar-canvas');

  let skinColor = '#E8BEAC';
  let accessories = [];

  function load() {
    if (!State.isLoggedIn()) return;
    API.getAvatar(State.getUser().id).then((avatar) => {
      skinColor = avatar.skinColor || '#E8BEAC';
      accessories = Array.isArray(avatar.accessories) ? avatar.accessories : [];
      if (skinColorInput) skinColorInput.value = skinColor;
      renderAccessories();
      renderPreview();
    }).catch(() => {
      renderPreview();
    });
  }

  function renderAccessories() {
    if (!accessoriesList) return;
    accessoriesList.innerHTML = accessories.length === 0
      ? '<p style="color:var(--text-secondary);font-size:0.9rem">Sin accesorios equipados</p>'
      : accessories.map((a) => `<span class="badge">${a.name || a.id}</span>`).join('');
  }

  function renderPreview() {
    if (!avatarCanvas) return;
    const ctx = avatarCanvas.getContext('2d');
    const w = avatarCanvas.width = avatarCanvas.offsetWidth;
    const h = avatarCanvas.height = avatarCanvas.offsetHeight;
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 20, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w / 2 - 25, h / 2 + 20, 50, 80);
    ctx.fillRect(w / 2 - 40, h / 2 + 40, 15, 50);
    ctx.fillRect(w / 2 + 25, h / 2 + 40, 15, 50);
  }

  if (skinColorInput) {
    skinColorInput.addEventListener('input', () => {
      skinColor = skinColorInput.value;
      renderPreview();
    });
  }

  if (btnSaveAvatar) {
    btnSaveAvatar.addEventListener('click', async () => {
      if (!State.isLoggedIn()) {
        if (typeof AuthUI !== 'undefined') AuthUI.showLogin();
        return;
      }
      try {
        const updated = await API.updateAvatar({ userId: State.getUser().id, skinColor, accessories });
        State.setUser({ ...State.getUser(), avatar_data: updated });
        if (typeof AuthUI !== 'undefined') AuthUI.setLoggedIn(State.getUser());
        alert('Avatar guardado');
      } catch (err) {
        alert(err.message || 'Error al guardar');
      }
    });
  }

  window.addEventListener('page-changed', (e) => {
    if (e.detail?.page === 'avatar') load();
  });
  window.addEventListener('resize', () => {
    if (document.body.dataset.currentPage === 'avatar') renderPreview();
  });

  return { load };
})();
