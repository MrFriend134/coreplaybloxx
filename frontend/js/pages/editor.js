/**
 * Página Editor
 * CorePlayBlox - Frontend
 *
 * Integra EditorCore, botones de objetos, publicar.
 */

const EditorPage = (function () {
  'use strict';

  const editorCanvas = document.getElementById('editor-canvas');
  const objectButtons = document.querySelectorAll('.object-btn');
  const btnPublish = document.getElementById('btn-publish-game');
  let currentGameId = null;

  function load() {
    if (!State.isLoggedIn()) {
      if (typeof AuthUI !== 'undefined') AuthUI.showLogin();
      CorePlayBlox.navigateTo('home');
      return;
    }
    if (editorCanvas && typeof EditorCore !== 'undefined') {
      EditorCore.init(editorCanvas);
    }
    currentGameId = null;
  }

  if (objectButtons) {
    objectButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type || 'cube';
        if (typeof EditorCore !== 'undefined') EditorCore.addObject(type);
      });
    });
  }

  if (btnPublish) {
    btnPublish.addEventListener('click', async () => {
      if (!State.isLoggedIn()) return;
      const name = prompt('Nombre del juego:', 'Mi Juego');
      if (!name) return;
      const gameData = typeof EditorCore !== 'undefined' ? EditorCore.getGameData() : { objects: [] };
      try {
        if (currentGameId) {
          await API.updateGame(currentGameId, { name, game_data: gameData });
          alert('Juego actualizado');
        } else {
          const game = await API.createGame({ name, description: '', game_data: gameData });
          currentGameId = game.id;
          alert('Juego publicado');
        }
        CorePlayBlox.navigateTo('games');
      } catch (err) {
        alert(err.message || 'Error al publicar');
      }
    });
  }

  window.addEventListener('page-changed', (e) => {
    if (e.detail?.page === 'editor') load();
  });

  return { load };
})();
