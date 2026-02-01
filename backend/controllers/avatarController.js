/**
 * Controlador de avatares
 * CorePlayBlox - Backend
 */

const avatarService = require('../services/avatarService');

function getAvatar(req, res) {
  const userId = req.params.userId || req.user?.id;
  if (!userId) {
    return res.status(400).json({ error: 'userId requerido' });
  }
  const avatar = avatarService.getAvatar(userId);
  res.json(avatar);
}

function updateAvatar(req, res) {
  if (req.user.id !== req.body.userId) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const avatar = avatarService.updateAvatar(req.user.id, req.body);
  res.json(avatar);
}

module.exports = {
  getAvatar,
  updateAvatar,
};
