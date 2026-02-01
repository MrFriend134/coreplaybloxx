/**
 * Controlador de autenticación
 * CorePlayBlox - Backend
 */

const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES = '7d';

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  const { username, email, password } = req.body;
  const { user, error } = await userService.register({ username, email, password });
  if (error) {
    return res.status(400).json({ error });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/',
  });

  res.status(201).json({
    user: { id: user.id, username: user.username, display_name: user.display_name, core_coins: user.core_coins, avatar_data: user.avatar_data },
    token,
  });
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const { usernameOrEmail, password } = req.body;
  const { user, error } = await userService.login({ usernameOrEmail, password });
  if (error) {
    return res.status(401).json({ error });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/',
  });

  res.json({
    user: { id: user.id, username: user.username, display_name: user.display_name, core_coins: user.core_coins, avatar_data: user.avatar_data },
    token,
  });
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true });
}

/**
 * GET /api/auth/me
 */
function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const user = userService.getUserById(req.user.id);
  if (!user) {
    res.clearCookie('token', { path: '/' });
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }
  res.json(user);
}

module.exports = {
  register,
  login,
  logout,
  me,
};
