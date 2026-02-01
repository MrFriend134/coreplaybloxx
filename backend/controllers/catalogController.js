/**
 * Controlador del catálogo
 * CorePlayBlox - Backend
 */

const catalogService = require('../services/catalogService');

function list(req, res) {
  const type = req.query.type || '';
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = Math.max(0, parseInt(req.query.offset, 10));
  const items = catalogService.listItems({ type, limit, offset });
  res.json(items);
}

function getInventory(req, res) {
  const items = catalogService.getUserInventory(req.user.id);
  res.json(items);
}

function purchase(req, res) {
  const { itemId } = req.body;
  if (!itemId) {
    return res.status(400).json({ error: 'itemId requerido' });
  }
  const { success, balance, error } = catalogService.purchaseItem(req.user.id, itemId);
  if (!success) {
    return res.status(400).json({ error });
  }
  res.json({ success: true, balance });
}

module.exports = {
  list,
  getInventory,
  purchase,
};
