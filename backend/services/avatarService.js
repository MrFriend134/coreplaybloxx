/**
 * Servicio de avatares
 * CorePlayBlox - Backend
 *
 * Maneja los datos de avatar (color piel, accesorios equipados).
 */

const { getDatabase } = require('../config/database');

const DEFAULT_AVATAR = {
  skinColor: '#E8BEAC',
  accessories: [],
};

/**
 * Obtiene el avatar de un usuario
 */
function getAvatar(userId) {
  const db = getDatabase();
  const row = db.prepare('SELECT avatar_data FROM users WHERE id = ?').get(userId);
  if (!row || !row.avatar_data) {
    return DEFAULT_AVATAR;
  }
  try {
    const data = JSON.parse(row.avatar_data);
    return { ...DEFAULT_AVATAR, ...data };
  } catch (e) {
    return DEFAULT_AVATAR;
  }
}

/**
 * Actualiza el avatar (solo el propio usuario)
 */
function updateAvatar(userId, avatarData) {
  const db = getDatabase();
  const current = getAvatar(userId);

  const merged = {
    skinColor: avatarData.skinColor ?? current.skinColor,
    accessories: Array.isArray(avatarData.accessories) ? avatarData.accessories : current.accessories,
  };

  db.prepare('UPDATE users SET avatar_data = ? WHERE id = ?')
    .run(JSON.stringify(merged), userId);

  return getAvatar(userId);
}

module.exports = {
  getAvatar,
  updateAvatar,
  DEFAULT_AVATAR,
};
