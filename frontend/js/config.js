/**
 * Configuración del cliente
 * CorePlayBlox - Frontend
 */

// URL base de la API (mismo origen en desarrollo)
const API_BASE = window.location.origin;
const WS_URL = window.location.origin;

const CONFIG = {
  API_BASE,
  WS_URL,
  API: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    USERS: {
      SEARCH: '/api/users/search',
      PROFILE: (id) => `/api/users/${id}`,
      UPDATE_USERNAME: (id) => `/api/users/${id}/username`,
    },
    FRIENDS: {
      LIST: '/api/friends',
      ADD: (id) => `/api/friends/${id}`,
      REMOVE: (id) => `/api/friends/${id}`,
    },
    GAMES: {
      LIST: '/api/games',
      GET: (id) => `/api/games/${id}`,
      CREATE: '/api/games',
      UPDATE: (id) => `/api/games/${id}`,
      PLAY: (id) => `/api/games/${id}/play`,
      MY: '/api/games/my',
    },
    AVATAR: {
      GET: (userId) => `/api/avatar/${userId || ''}`,
      UPDATE: '/api/avatar',
    },
    CATALOG: {
      LIST: '/api/catalog',
      INVENTORY: '/api/catalog/inventory',
      PURCHASE: '/api/catalog/purchase',
    },
    CODES: {
      REDEEM: '/api/codes/redeem',
    },
  },
};
