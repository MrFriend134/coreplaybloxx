/**
 * Componente de autenticación
 * CorePlayBlox - Frontend
 *
 * Modales de login/registro, botones, actualización UI.
 */

const AuthUI = (function () {
  'use strict';

  const modalOverlay = document.getElementById('modal-overlay');
  const modalAuth = document.getElementById('modal-auth');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const userAreaGuest = document.getElementById('user-area-guest');
  const userAreaLogged = document.getElementById('user-area-logged');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const btnLogout = document.getElementById('btn-logout');
  const userDisplayName = document.getElementById('user-display-name');
  const userCoins = document.getElementById('user-coins');
  const userAvatarPreview = document.getElementById('user-avatar-preview');
  const modalTabs = modalAuth?.querySelectorAll('.modal-tab');
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  function showModal() {
    if (modalOverlay) modalOverlay.classList.remove('hidden');
    showTab('login');
  }

  function hideModal() {
    if (modalOverlay) modalOverlay.classList.add('hidden');
  }

  function showTab(tabId) {
    if (!modalTabs) return;
    modalTabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabId));
    if (loginForm) loginForm.classList.toggle('hidden', tabId !== 'login');
    if (registerForm) registerForm.classList.toggle('hidden', tabId !== 'register');
  }

  function setLoggedIn(user) {
    if (userAreaGuest) userAreaGuest.classList.add('hidden');
    if (userAreaLogged) userAreaLogged.classList.remove('hidden');
    if (userDisplayName) userDisplayName.textContent = user.display_name || user.username || 'Usuario';
    if (userCoins) userCoins.textContent = (user.core_coins || 0) + ' CoreCoins';
    if (userAvatarPreview) {
      const avatar = typeof user.avatar_data === 'string' ? JSON.parse(user.avatar_data || '{}') : (user.avatar_data || {});
      userAvatarPreview.style.background = avatar.skinColor || '#E8BEAC';
    }
  }

  function setLoggedOut() {
    if (userAreaGuest) userAreaGuest.classList.remove('hidden');
    if (userAreaLogged) userAreaLogged.classList.add('hidden');
    State.clearUser();
    SocketClient.setToken('');
    if (typeof ChatUI !== 'undefined') ChatUI.disable();
  }

  function showLogin() {
    showModal();
    showTab('login');
  }

  function showRegister() {
    showModal();
    showTab('register');
  }

  // Event listeners
  if (btnLogin) btnLogin.addEventListener('click', showLogin);
  if (btnRegister) btnRegister.addEventListener('click', showRegister);
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await API.logout();
      } catch (e) {}
      setLoggedOut();
      CorePlayBlox.navigateTo('home');
    });
  }

  if (modalTabs) {
    modalTabs.forEach((tab) => {
      tab.addEventListener('click', () => showTab(tab.dataset.tab));
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideModal();
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameOrEmail = document.getElementById('login-username')?.value?.trim();
      const password = document.getElementById('login-password')?.value;
      if (!usernameOrEmail || !password) return;
      if (loginError) loginError.textContent = '';
      try {
        const res = await API.login({ usernameOrEmail, password });
        State.setUser(res.user);
        State.setToken(res.token);
        SocketClient.setToken(res.token);
        setLoggedIn(res.user);
        hideModal();
        formLogin.reset();
        if (typeof ChatUI !== 'undefined') ChatUI.enable();
      } catch (err) {
        if (loginError) loginError.textContent = err.message || 'Error al iniciar sesión';
      }
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username')?.value?.trim();
      const email = document.getElementById('register-email')?.value?.trim();
      const password = document.getElementById('register-password')?.value;
      if (!username || !email || !password) return;
      if (registerError) registerError.textContent = '';
      try {
        const res = await API.register({ username, email, password });
        State.setUser(res.user);
        State.setToken(res.token);
        SocketClient.setToken(res.token);
        setLoggedIn(res.user);
        hideModal();
        formRegister.reset();
        if (typeof ChatUI !== 'undefined') ChatUI.enable();
      } catch (err) {
        if (registerError) registerError.textContent = err.message || 'Error al registrarse';
      }
    });
  }

  return {
    showModal,
    hideModal,
    showLogin,
    showRegister,
    setLoggedIn,
    setLoggedOut,
  };
})();
