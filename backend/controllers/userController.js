/**
 * Controlador de usuarios
 * CorePlayBlox - Backend
 */

const userService = require('../services/userService');

/**
 * PATCH /api/users/:id/username
 * Cambiar nombre de display (solo el propio usuario)
 */
function updateUsername(req, res) {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const { displayName } = req.body;
  const { success, error } = userService.updateDisplayName(req.params.id, displayName);
  if (!success) {
    return res.status(400).json({ error });
  }
  const user = userService.getUserById(req.params.id);
  res.json(user);
}

/**
 * GET /api/users/search?q=query
 * Buscar jugadores
 */
function search(req, res) {
  const q = req.query.q || '';
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const users = userService.searchUsers(q, limit);
  res.json(users);
}

/**
 * GET /api/users/:id
 * Obtener perfil de usuario público
 */
function getProfile(req, res) {
  const user = userService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  // No exponer datos sensibles
  res.json({
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    avatar_data: user.avatar_data,
    created_at: user.created_at,
  });
}

module.exports = {
  updateUsername,
  search,
  getProfile,
};
