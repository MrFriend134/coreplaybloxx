/**
 * Aplicación principal - CorePlayBlox
 *
 * Inicialización SPA, navegación, coordinación de módulos.
 */

(function () {
  'use strict';

  const pages = document.querySelectorAll('.page[data-page]');
  const navLinks = document.querySelectorAll('.nav-link, .logo[data-page]');
  const mainContent = document.getElementById('main-content');

  /**
   * Navega a una página por su data-page
   */
  function navigateTo(pageId) {
    pages.forEach((p) => {
      p.classList.toggle('active', p.dataset.page === pageId);
    });
    navLinks.forEach((l) => {
      l.classList.toggle('active', l.dataset.page === pageId);
    });
    document.body.dataset.currentPage = pageId;

    // Evento personalizado para que las páginas reaccionen
    window.dispatchEvent(new CustomEvent('page-changed', { detail: { page: pageId } }));
  }

  /**
   * Maneja clics en enlaces de navegación
   */
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) navigateTo(page);
    });
  });

  /**
   * Inicialización al cargar
   */
  async function init() {
    // Conectar WebSocket
    SocketClient.connect(State.getToken());

    // Intentar restaurar sesión
    try {
      const me = await API.getMe();
      if (me && me.id) {
        State.setUser(me);
        State.setToken(document.cookie.match(/token=([^;]+)/)?.[1] || '');
        SocketClient.setToken(State.getToken());
        if (typeof AuthUI !== 'undefined') AuthUI.setLoggedIn(me);
        if (typeof ChatUI !== 'undefined') ChatUI.enable();
      } else {
        if (typeof AuthUI !== 'undefined') AuthUI.setLoggedOut();
      }
    } catch (err) {
      if (typeof AuthUI !== 'undefined') AuthUI.setLoggedOut();
    }

    // Cargar juegos en home
    if (typeof HomePage !== 'undefined') HomePage.load();
    if (typeof GamesPage !== 'undefined') GamesPage.load();

    // Botón "Crear Juego" -> Editor
    const heroCreate = document.getElementById('hero-create');
    if (heroCreate) {
      heroCreate.addEventListener('click', () => {
        if (!State.isLoggedIn()) {
          if (typeof AuthUI !== 'undefined') AuthUI.showLogin();
          return;
        }
        navigateTo('editor');
      });
    }

    // Salir del juego / editor
    const btnExitGame = document.getElementById('btn-exit-game');
    if (btnExitGame) {
      btnExitGame.addEventListener('click', () => {
        if (typeof GameRuntime !== 'undefined') GameRuntime.destroy();
        navigateTo('games');
      });
    }

    const btnExitEditor = document.getElementById('btn-exit-editor');
    if (btnExitEditor) {
      btnExitEditor.addEventListener('click', () => {
        navigateTo('home');
      });
    }

    navigateTo('home');
  }

  // Exponer para uso global
  window.CorePlayBlox = {
    navigateTo,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
