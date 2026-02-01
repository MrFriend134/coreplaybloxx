/**
 * Estado global de la aplicación
 * CorePlayBlox - Frontend
 *
 * Almacena usuario actual y datos compartidos.
 */

let currentUser = null;
let token = null;

const State = {
  getUser() {
    return currentUser;
  },

  setUser(user) {
    currentUser = user;
    return currentUser;
  },

  getToken() {
    return token;
  },

  setToken(t) {
    token = t;
    return token;
  },

  clearUser() {
    currentUser = null;
    token = null;
    return null;
  },

  isLoggedIn() {
    return !!currentUser;
  },
};
