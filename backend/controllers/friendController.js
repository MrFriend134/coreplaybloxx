/**
 * Controlador de amigos
 * CorePlayBlox - Backend
 */

const userService = require('../services/userService');

/**
 * GET /api/friends
 * Lista de amigos
 */
function list(req, res) {
  const friends = userService.getFriends(req.user.id);
  res.json(friends);
}

/**
 * POST /api/friends/:id
 * Enviar solicitud de amistad o aceptar
 */
function add(req, res) {
  const { success, error } = userService.addFriend(req.user.id, req.params.id);
  if (!success) {
    return res.status(400).json({ error });
  }
  res.json({ success: true });
}

/**
 * DELETE /api/friends/:id
 * Eliminar amigo
 */
function remove(req, res) {
  const { success, error } = userService.removeFriend(req.user.id, req.params.id);
  if (!success) {
    return res.status(400).json({ error });
  }
  res.json({ success: true });
}

module.exports = {
  list,
  add,
  remove,
};
