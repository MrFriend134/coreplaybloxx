/**
 * Controlador de códigos promocionales
 * CorePlayBlox - Backend
 *
 * SOLO EJEMPLO TÉCNICO - Moneda ficticia CoreCoins
 */

const promoCodeService = require('../services/promoCodeService');

function redeem(req, res) {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Código requerido' });
  }
  const { success, coinsAdded, balance, error } = promoCodeService.redeemCode(req.user.id, code);
  if (!success) {
    return res.status(400).json({ error });
  }
  res.json({ success: true, coinsAdded, balance });
}

module.exports = {
  redeem,
};
