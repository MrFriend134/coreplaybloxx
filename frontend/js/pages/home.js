/**
 * Página Home
 * CorePlayBlox - Frontend
 */

const HomePage = (function () {
  'use strict';

  const gamesGrid = document.getElementById('home-games-grid');

  async function load() {
    if (!gamesGrid) return;
    try {
      const res = await API.listGames({ limit: 8, sort: 'popular' });
      const games = res.games || [];
      gamesGrid.innerHTML = games.length === 0
        ? '<p class="empty-state">No hay juegos aún. ¡Crea el primero!</p>'
        : games.map(renderGameCard).join('');
      gamesGrid.querySelectorAll('.game-card').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.dataset.gameId;
          if (id) GamesPage.playGame(id);
        });
      });
    } catch (err) {
      gamesGrid.innerHTML = '<p class="empty-state">Error al cargar juegos</p>';
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

  window.addEventListener('page-changed', (e) => {
    if (e.detail?.page === 'home') load();
  });

  return { load };
})();
