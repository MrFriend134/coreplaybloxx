/**
 * Cliente API REST
 * CorePlayBlox - Frontend
 *
 * Encapsula las llamadas HTTP a la API del backend.
 */

const API = {
  /**
   * Realiza una petición HTTP
   * @param {string} url - URL relativa o absoluta
   * @param {Object} options - fetch options
   * @returns {Promise<Object>}
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : CONFIG.API_BASE + url;
    const opts = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      opts.body = JSON.stringify(options.body);
    }
    const res = await fetch(fullUrl, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  },

  get(url) {
    return this.request(url, { method: 'GET' });
  },

  post(url, body) {
    return this.request(url, { method: 'POST', body });
  },

  put(url, body) {
    return this.request(url, { method: 'PUT', body });
  },

  patch(url, body) {
    return this.request(url, { method: 'PATCH', body });
  },

  delete(url) {
    return this.request(url, { method: 'DELETE' });
  },

  // Auth
  async register(data) {
    return this.post(CONFIG.API.AUTH.REGISTER, data);
  },

  async login(data) {
    return this.post(CONFIG.API.AUTH.LOGIN, data);
  },

  async logout() {
    return this.post(CONFIG.API.AUTH.LOGOUT);
  },

  async getMe() {
    return this.get(CONFIG.API.AUTH.ME);
  },

  // Users
  async searchUsers(q) {
    return this.get(CONFIG.API.USERS.SEARCH + '?q=' + encodeURIComponent(q || ''));
  },

  async getUserProfile(id) {
    return this.get(CONFIG.API.USERS.PROFILE(id));
  },

  async updateUsername(id, displayName) {
    return this.patch(CONFIG.API.USERS.UPDATE_USERNAME(id), { displayName });
  },

  // Friends
  async getFriends() {
    return this.get(CONFIG.API.FRIENDS.LIST);
  },

  async addFriend(id) {
    return this.post(CONFIG.API.FRIENDS.ADD(id));
  },

  async removeFriend(id) {
    return this.delete(CONFIG.API.FRIENDS.REMOVE(id));
  },

  // Games
  async listGames(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(CONFIG.API.GAMES.LIST + (qs ? '?' + qs : ''));
  },

  async getGame(id) {
    return this.get(CONFIG.API.GAMES.GET(id));
  },

  async createGame(data) {
    return this.post(CONFIG.API.GAMES.CREATE, data);
  },

  async updateGame(id, data) {
    return this.put(CONFIG.API.GAMES.UPDATE(id), data);
  },

  async playGame(id) {
    return this.post(CONFIG.API.GAMES.PLAY(id));
  },

  async getMyGames() {
    return this.get(CONFIG.API.GAMES.MY);
  },

  // Avatar
  async getAvatar(userId) {
    return this.get(CONFIG.API.AVATAR.GET(userId));
  },

  async updateAvatar(data) {
    return this.put(CONFIG.API.AVATAR.UPDATE, data);
  },

  // Catalog
  async getCatalog(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(CONFIG.API.CATALOG.LIST + (qs ? '?' + qs : ''));
  },

  async getInventory() {
    return this.get(CONFIG.API.CATALOG.INVENTORY);
  },

  async purchaseItem(itemId) {
    return this.post(CONFIG.API.CATALOG.PURCHASE, { itemId });
  },

  // Promo codes
  async redeemCode(code) {
    return this.post(CONFIG.API.CODES.REDEEM, { code });
  },
};
