/**
 * Servicio de usuarios
 * CorePlayBlox - Backend
 *
 * Lógica de negocio para registro, login, búsqueda, amigos.
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const { getDatabase } = require('../config/database');
const { LIMITS, FRIEND_STATUS } = require('../../shared/constants');

const SALT_ROUNDS = 10;

/**
 * Crea un nuevo usuario
 * @param {Object} data - { username, email, password }
 * @returns {{ user, error }}
 */
async function register(data) {
  const { username, email, password } = data;

  if (!username || !email || !password) {
    return { user: null, error: 'Faltan campos requeridos' };
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();

  if (cleanUsername.length < LIMITS.USERNAME_MIN || cleanUsername.length > LIMITS.USERNAME_MAX) {
    return { user: null, error: `Usuario debe tener entre ${LIMITS.USERNAME_MIN} y ${LIMITS.USERNAME_MAX} caracteres` };
  }
  if (!validator.isEmail(cleanEmail)) {
    return { user: null, error: 'Email inválido' };
  }
  if (password.length < LIMITS.PASSWORD_MIN) {
    return { user: null, error: `Contraseña debe tener al menos ${LIMITS.PASSWORD_MIN} caracteres` };
  }

  // Solo alfanuméricos y guión bajo para username
  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return { user: null, error: 'Usuario solo puede contener letras, números y guión bajo' };
  }

  const db = getDatabase();
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?')
    .get(cleanUsername, cleanEmail);
  if (existingUser) {
    return { user: null, error: 'Usuario o email ya existe' };
  }

  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = Date.now();

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, created_at, display_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, cleanUsername, cleanEmail, passwordHash, now, cleanUsername);

  const user = db.prepare('SELECT id, username, display_name, core_coins, avatar_data, created_at FROM users WHERE id = ?').get(id);
  return { user, error: null };
}

/**
 * Autentica un usuario
 * @param {Object} data - { usernameOrEmail, password }
 * @returns {{ user, error }}
 */
async function login(data) {
  const { usernameOrEmail, password } = data;

  if (!usernameOrEmail || !password) {
    return { user: null, error: 'Faltan credenciales' };
  }

  const db = getDatabase();
  const identifier = String(usernameOrEmail).trim().toLowerCase();
  const isEmail = validator.isEmail(identifier);

  const user = db.prepare(
    'SELECT id, username, display_name, password_hash, core_coins, avatar_data FROM users WHERE ' +
    (isEmail ? 'email = ?' : 'username = ?')
  ).get(identifier);

  if (!user) {
    return { user: null, error: 'Credenciales inválidas' };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { user: null, error: 'Credenciales inválidas' };
  }

  db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(Date.now(), user.id);

  delete user.password_hash;
  return { user, error: null };
}

/**
 * Busca usuarios por nombre
 * @param {string} query - Texto de búsqueda
 * @param {number} limit - Máximo resultados
 * @returns {Array}
 */
function searchUsers(query, limit = 20) {
  if (!query || query.length < 2) {
    return [];
  }
  const db = getDatabase();
  const q = `%${String(query).trim()}%`;
  const users = db.prepare(`
    SELECT id, username, display_name, core_coins, avatar_data
    FROM users
    WHERE (username LIKE ? OR display_name LIKE ?)
    LIMIT ?
  `).all(q, q, limit);
  return users;
}

/**
 * Obtiene un usuario por ID
 * @param {string} userId
 * @returns {Object|null}
 */
function getUserById(userId) {
  const db = getDatabase();
  const user = db.prepare(`
    SELECT id, username, display_name, core_coins, avatar_data, created_at
    FROM users WHERE id = ?
  `).get(userId);
  return user || null;
}

/**
 * Actualiza el nombre de display
 * @param {string} userId
 * @param {string} newDisplayName
 * @returns {{ success, error }}
 */
function updateDisplayName(userId, newDisplayName) {
  const name = String(newDisplayName).trim();
  if (name.length < LIMITS.USERNAME_MIN || name.length > LIMITS.USERNAME_MAX) {
    return { success: false, error: `Nombre debe tener entre ${LIMITS.USERNAME_MIN} y ${LIMITS.USERNAME_MAX} caracteres` };
  }

  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM users WHERE display_name = ? AND id != ?').get(name, userId);
  if (existing) {
    return { success: false, error: 'Ese nombre ya está en uso' };
  }

  db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(name, userId);
  return { success: true, error: null };
}

/**
 * Lista amigos de un usuario
 * @param {string} userId
 * @returns {Array}
 */
function getFriends(userId) {
  const db = getDatabase();
  const friends = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_data, f.status
    FROM friendships f
    JOIN users u ON (u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
    WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = ?
  `).all(userId, userId, userId, FRIEND_STATUS.ACCEPTED);
  return friends;
}

/**
 * Envía solicitud de amistad
 * @param {string} userId
 * @param {string} friendId
 * @returns {{ success, error }}
 */
function addFriend(userId, friendId) {
  if (userId === friendId) {
    return { success: false, error: 'No puedes añadirte a ti mismo' };
  }

  const db = getDatabase();
  const friend = getUserById(friendId);
  if (!friend) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  const id1 = userId < friendId ? userId : friendId;
  const id2 = userId < friendId ? friendId : userId;

  const existing = db.prepare('SELECT id, status FROM friendships WHERE user_id = ? AND friend_id = ?')
    .get(id1, id2);

  if (existing) {
    if (existing.status === FRIEND_STATUS.ACCEPTED) {
      return { success: false, error: 'Ya sois amigos' };
    }
    if (existing.status === FRIEND_STATUS.PENDING) {
      return { success: false, error: 'Solicitud ya enviada' };
    }
    return { success: false, error: 'No se puede añadir' };
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO friendships (id, user_id, friend_id, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, id1, id2, FRIEND_STATUS.PENDING, Date.now());

  return { success: true, error: null };
}

/**
 * Acepta solicitud de amistad
 * @param {string} userId
 * @param {string} friendId
 * @returns {{ success, error }}
 */
function acceptFriend(userId, friendId) {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id FROM friendships
    WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
  `).get(userId, friendId, friendId, userId);

  if (!row) {
    return { success: false, error: 'Solicitud no encontrada' };
  }

  db.prepare('UPDATE friendships SET status = ? WHERE id = ?').run(FRIEND_STATUS.ACCEPTED, row.id);
  return { success: true, error: null };
}

/**
 * Elimina amistad
 * @param {string} userId
 * @param {string} friendId
 * @returns {{ success, error }}
 */
function removeFriend(userId, friendId) {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id FROM friendships
    WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
  `).get(userId, friendId, friendId, userId);

  if (!row) {
    return { success: false, error: 'Amistad no encontrada' };
  }

  db.prepare('DELETE FROM friendships WHERE id = ?').run(row.id);
  return { success: true, error: null };
}

module.exports = {
  register,
  login,
  searchUsers,
  getUserById,
  updateDisplayName,
  getFriends,
  addFriend,
  acceptFriend,
  removeFriend,
};
