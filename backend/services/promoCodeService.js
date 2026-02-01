/**
 * Servicio de códigos promocionales
 * CorePlayBlox - Backend
 *
 * SOLO COMO EJEMPLO TÉCNICO - Moneda ficticia (CoreCoins).
 * NO hay pagos reales.
 */

const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');

/**
 * Canjea un código promocional
 */
function redeemCode(userId, code) {
  const db = getDatabase();
  const cleanCode = String(code).trim().toUpperCase();

  const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ?').get(cleanCode);
  if (!promo) {
    return { success: false, error: 'Código inválido' };
  }

  if (promo.uses_left <= 0) {
    return { success: false, error: 'Código agotado' };
  }

  if (promo.expires_at && promo.expires_at < Date.now()) {
    return { success: false, error: 'Código expirado' };
  }

  const alreadyRedeemed = db.prepare('SELECT id FROM promo_code_redemptions WHERE user_id = ? AND code = ?')
    .get(userId, cleanCode);
  if (alreadyRedeemed) {
    return { success: false, error: 'Ya has canjeado este código' };
  }

  db.prepare('UPDATE promo_codes SET uses_left = uses_left - 1 WHERE id = ?').run(promo.id);
  db.prepare('UPDATE users SET core_coins = core_coins + ? WHERE id = ?').run(promo.core_coins_amount, userId);
  db.prepare(`
    INSERT INTO promo_code_redemptions (id, user_id, code, redeemed_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), userId, cleanCode, Date.now());

  const newBalance = db.prepare('SELECT core_coins FROM users WHERE id = ?').get(userId).core_coins;
  return { success: true, coinsAdded: promo.core_coins_amount, balance: newBalance, error: null };
}

/**
 * Crea un código promocional (útil para tests/admin)
 */
function createCode(data) {
  const { code, core_coins_amount = 100, uses_total = 1, expires_at = null } = data;
  const db = getDatabase();
  const id = uuidv4();
  const cleanCode = String(code).trim().toUpperCase();

  db.prepare(`
    INSERT INTO promo_codes (id, code, core_coins_amount, uses_total, uses_left, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, cleanCode, core_coins_amount, uses_total, uses_total, expires_at, Date.now());

  return { id, code: cleanCode };
}

module.exports = {
  redeemCode,
  createCode,
};
