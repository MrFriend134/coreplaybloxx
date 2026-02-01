/**
 * Página de Juegos
 * CorePlayBlox - Frontend
 *
 * Lista de juegos, búsqueda, reproducir.
 */

const GamesPage = (function () {
  'use strict';

  const gamesGrid = document.getElementById('games-grid');
  const gamesSearch = document.getElementById('games-search');
  const gamesSort = document.getElementById('games-sort');
  const gamesEmpty = document.getElementById('games-empty');
  const pageGameRuntime = document.getElementById('page-game-runtime');
  const runtimeGameTitle = document.getElementById('runtime-game-title');
  const gameCanvas = document.getElementById('game-canvas');
  const gameOverlay = document.getElementById('game-overlay');

  async function load() {
    const q = gamesSearch?.value?.trim() || '';
    const sort = gamesSort?.value || 'recent';
    try {
      const res = await API.listGames({ q, limit: 24, sort });
      const games = res.games || [];
      if (!gamesGrid) return;
      gamesGrid.innerHTML = games.length === 0
        ? ''
        : games.map(renderGameCard).join('');
      gamesEmpty.innerHTML = games.length === 0 ? '<p>No se encontraron juegos.</p>' : '';
      gamesEmpty.style.display = games.length === 0 ? 'block' : 'none';
      gamesGrid.querySelectorAll('.game-card').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.dataset.gameId;
          if (id) playGame(id);
        });
      });
    } catch (err) {
      if (gamesGrid) gamesGrid.innerHTML = '';
      if (gamesEmpty) {
        gamesEmpty.innerHTML = '<p>Error al cargar juegos.</p>';
        gamesEmpty.style.display = 'block';
      }
    }
  }

  function renderGameCard(game) {
    const thumb = game.thumbnail_url
      ? `<img src="${escapeHtml(game.thumbnail_url)}" alt="" style="width:100%;height:100%;object-fit:cover">`
      : '<span>🎮</span>';
    return `
      <div class="game-card" data-game-id="${escapeHtml(game.id)}">
        <div class="game-card-thumb">${thumb}</div>
        <div class="game-card-body">
          <div class="game-card-title">${escapeHtml(game.name || 'Sin nombre')}</div>
          <div class="game-card-meta">${game.plays_count || 0} jugadas · ${escapeHtml(game.creator_display_name || game.creator_username || '')}</div>
          <button class="btn btn-primary game-card-play">Jugar</button>
        </div>
      </div>
    `;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async function playGame(gameId) {
    try {
      const game = await API.getGame(gameId);
      await API.playGame(gameId);
      CorePlayBlox.navigateTo('game-runtime');
      if (runtimeGameTitle) runtimeGameTitle.textContent = game.name || 'Juego';
      if (gameOverlay) gameOverlay.classList.remove('hidden');
      if (gameCanvas) {
        const ctx = gameCanvas.getContext('2d');
        gameCanvas.width = gameCanvas.offsetWidth;
        gameCanvas.height = gameCanvas.offsetHeight;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.fillStyle = '#00c853';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Cargando juego...', gameCanvas.width / 2, gameCanvas.height / 2);
      }
      // TODO: Cargar Three.js y game_data real
      const gameData = typeof game.game_data === 'string' ? JSON.parse(game.game_data || '{}') : (game.game_data || {});
      GameRuntime.init(gameCanvas, gameData, gameId);
      if (gameOverlay) gameOverlay.classList.add('hidden');
    } catch (err) {
      alert(err.message || 'Error al cargar el juego');
    }
  }

  if (gamesSearch) {
    let searchTimeout;
    gamesSearch.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(load, 300);
    });
  }
  if (gamesSort) gamesSort.addEventListener('change', load);

  window.addEventListener('page-changed', (e) => {
    if (e.detail?.page === 'games') load();
  });

  return { load, playGame };
})();
