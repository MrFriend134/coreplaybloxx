/**
 * Middleware de autenticación
 * CorePlayBlox - Backend
 *
 * Verifica JWT en cookies o headers para rutas protegidas.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'coreplayblox-dev-secret-change-in-production';

/**
 * Extrae el token de la cookie o del header Authorization
 * @param {Request} req - Request de Express
 * @returns {string|null} Token JWT o null
 */
function extractToken(req) {
  // Prioridad: cookie > Authorization header
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

/**
 * Middleware: requiere usuario autenticado
 * Añade req.user con los datos del usuario
 */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Middleware: opcional autenticación
 * Si hay token válido, añade req.user. Si no, sigue sin él.
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // Ignorar token inválido
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  extractToken,
  JWT_SECRET,
};
