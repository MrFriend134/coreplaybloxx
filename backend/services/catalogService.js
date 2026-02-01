/**
 * Servicio del catálogo
 * CorePlayBlox - Backend
 *
 * Items del catálogo, compras con CoreCoins.
 */

const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');

/**
 * Lista items del catálogo
 */
function listItems(options = {}) {
  const { type = '', limit = 50, offset = 0 } = options;
  const db = getDatabase();

  const typeFilter = type ? 'WHERE type = ?' : '';
  const params = type ? [type, limit, offset] : [limit, offset];

  const items = db.prepare(`
    SELECT id, name, type, description, price_coins, asset_url, asset_data
    FROM catalog_items
    ${typeFilter}
    ORDER BY type, name
    LIMIT ? OFFSET ?
  `).all(...params);

  return items;
}

/**
 * Obtiene un item por ID
 */
function getItemById(itemId) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM catalog_items WHERE id = ?').get(itemId) || null;
}

/**
 * Compra un item con CoreCoins
 */
function purchaseItem(userId, itemId) {
  const db = getDatabase();
  const item = getItemById(itemId);
  if (!item) {
    return { success: false, error: 'Item no encontrado' };
  }

  const user = db.prepare('SELECT core_coins FROM users WHERE id = ?').get(userId);
  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  if (user.core_coins < item.price_coins) {
    return { success: false, error: 'CoreCoins insuficientes' };
  }

  const existing = db.prepare('SELECT id FROM user_inventory WHERE user_id = ? AND catalog_item_id = ?')
    .get(userId, itemId);
  if (existing) {
    return { success: false, error: 'Ya tienes este item' };
  }

  const now = Date.now();
  db.prepare('UPDATE users SET core_coins = core_coins - ? WHERE id = ?').run(item.price_coins, userId);
  db.prepare(`
    INSERT INTO user_inventory (id, user_id, catalog_item_id, purchased_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), userId, itemId, now);

  const newBalance = db.prepare('SELECT core_coins FROM users WHERE id = ?').get(userId).core_coins;
  return { success: true, balance: newBalance, error: null };
}

/**
 * Inventario del usuario
 */
function getUserInventory(userId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT ci.id, ci.name, ci.type, ci.asset_url, ci.asset_data, ui.purchased_at
    FROM user_inventory ui
    JOIN catalog_items ci ON ci.id = ui.catalog_item_id
    WHERE ui.user_id = ?
    ORDER BY ui.purchased_at DESC
  `).all(userId);
}

module.exports = {
  listItems,
  getItemById,
  purchaseItem,
  getUserInventory,
};
