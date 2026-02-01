/**
 * Página Amigos
 * CorePlayBlox - Frontend
 *
 * Lista de amigos, buscar jugadores, añadir.
 */

const FriendsPage = (function () {
  'use strict';

  const friendsList = document.getElementById('friends-list');
  const searchResults = document.getElementById('search-results');
  const friendsSearch = document.getElementById('friends-search');
  const btnSearchUsers = document.getElementById('btn-search-users');

  async function loadFriends() {
    if (!State.isLoggedIn()) {
      if (friendsList) friendsList.innerHTML = '<p class="empty-state">Inicia sesión para ver tus amigos</p>';
      return;
    }
    try {
      const friends = await API.getFriends();
      if (!friendsList) return;
      friendsList.innerHTML = (friends || []).length === 0
        ? '<p class="empty-state">No tienes amigos aún. Busca jugadores para añadirlos.</p>'
        : (friends || []).map(renderFriend).join('');
      friendsList.querySelectorAll('.btn-remove-friend').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.friendId;
          if (!id) return;
          try {
            await API.removeFriend(id);
            loadFriends();
          } catch (err) {
            alert(err.message);
          }
        });
      });
    } catch (err) {
      if (friendsList) friendsList.innerHTML = '<p class="empty-state">Error al cargar amigos</p>';
    }
  }

  function renderFriend(f) {
    return `
      <div class="friend-item">
        <div class="friend-item-avatar" style="background:var(--color-primary)"></div>
        <div class="friend-item-info">
          <div class="friend-item-name">${escapeHtml(f.display_name || f.username || '')}</div>
          <div class="friend-item-username">@${escapeHtml(f.username || '')}</div>
        </div>
        <button class="btn btn-sm btn-secondary btn-remove-friend" data-friend-id="${f.id}">Eliminar</button>
      </div>
    `;
  }

  async function searchUsers() {
    const q = friendsSearch ? friendsSearch.value.trim() : '';
    if (!q || q.length < 2) {
      if (searchResults) searchResults.innerHTML = '<p class="empty-state">Escribe al menos 2 caracteres</p>';
      return;
    }
    if (!State.isLoggedIn()) {
      if (searchResults) searchResults.innerHTML = '<p class="empty-state">Inicia sesión para buscar</p>';
      return;
    }
    try {
      const users = await API.searchUsers(q);
      const me = State.getUser();
      const filtered = (users || []).filter((u) => u.id !== me.id);
      if (!searchResults) return;
      searchResults.innerHTML = filtered.length === 0
        ? '<p class="empty-state">No se encontraron jugadores</p>'
        : filtered.map((u) => renderSearchResult(u)).join('');
      searchResults.querySelectorAll('.btn-add-friend').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.userId;
          if (!id) return;
          try {
            await API.addFriend(id);
            alert('Solicitud enviada');
            searchUsers();
          } catch (err) {
            alert(err.message);
          }
        });
      });
    } catch (err) {
      if (searchResults) searchResults.innerHTML = '<p class="empty-state">Error al buscar</p>';
    }
  }

  function renderSearchResult(u) {
    return `
      <div class="search-result-item">
        <div class="search-result-avatar"></div>
        <div class="search-result-info">
          <div class="search-result-name">${escapeHtml(u.display_name || u.username || '')}</div>
          <div class="search-result-username">@${escapeHtml(u.username || '')}</div>
        </div>
        <button class="btn btn-sm btn-primary btn-add-friend" data-user-id="${u.id}">Añadir</button>
      </div>
    `;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (btnSearchUsers) btnSearchUsers.addEventListener('click', searchUsers);
  if (friendsSearch) {
    friendsSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchUsers();
    });
  }

  window.addEventListener('page-changed', (e) => {
    if (e.detail && e.detail.page === 'friends') {
      loadFriends();
      if (searchResults) searchResults.innerHTML = '';
    }
  });

  return { loadFriends, searchUsers };
})();
