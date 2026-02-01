/**
 * Servicio de juegos
 * CorePlayBlox - Backend
 */

const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const { LIMITS } = require('../../shared/constants');

/**
 * Lista juegos públicos con paginación y búsqueda
 */
function listGames(options = {}) {
  const { q = '', limit = 24, offset = 0, sort = 'recent' } = options;
  const db = getDatabase();

  let orderBy = 'g.created_at DESC';
  if (sort === 'popular') orderBy = 'g.plays_count DESC';
  if (sort === 'likes') orderBy = 'g.likes_count DESC';

  const searchFilter = q ? 'AND (g.name LIKE ? OR g.description LIKE ?)' : '';
  const params = q ? [`%${q}%`, `%${q}%`, limit, offset] : [limit, offset];

  const games = db.prepare(`
    SELECT g.id, g.creator_id, g.name, g.description, g.thumbnail_url,
           g.plays_count, g.likes_count, g.created_at, g.updated_at,
           u.username as creator_username, u.display_name as creator_display_name
    FROM games g
    JOIN users u ON u.id = g.creator_id
    WHERE g.is_public = 1 ${searchFilter}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params);

  const countRow = db.prepare(`
    SELECT COUNT(*) as total FROM games g WHERE g.is_public = 1 ${searchFilter}
  `).get(...(q ? [`%${q}%`, `%${q}%`] : []));

  return { games, total: countRow.total };
}

/**
 * Obtiene un juego por ID
 */
function getGameById(gameId) {
  const db = getDatabase();
  const game = db.prepare(`
    SELECT g.*, u.username as creator_username, u.display_name as creator_display_name
    FROM games g
    JOIN users u ON u.id = g.creator_id
    WHERE g.id = ?
  `).get(gameId);
  return game || null;
}

/**
 * Crea un juego
 */
function createGame(userId, data) {
  const { name, description = '', thumbnail_url = '', game_data } = data;

  if (!name || name.length > LIMITS.GAME_NAME_MAX) {
    return { game: null, error: 'Nombre inválido' };
  }

  if (!game_data) {
    return { game: null, error: 'Datos del juego requeridos' };
  }

  const db = getDatabase();
  const id = uuidv4();
  const now = Date.now();

  db.prepare(`
    INSERT INTO games (id, creator_id, name, description, thumbnail_url, game_data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, name, String(description).slice(0, LIMITS.GAME_DESC_MAX), thumbnail_url, JSON.stringify(game_data), now, now);

  const game = getGameById(id);
  return { game, error: null };
}

/**
 * Actualiza un juego (solo creador)
 */
function updateGame(gameId, userId, data) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id, creator_id FROM games WHERE id = ?').get(gameId);
  if (!existing) {
    return { game: null, error: 'Juego no encontrado' };
  }
  if (existing.creator_id !== userId) {
    return { game: null, error: 'No autorizado' };
  }

  const { name, description, thumbnail_url, game_data } = data;

  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(String(name).slice(0, LIMITS.GAME_NAME_MAX));
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(String(description).slice(0, LIMITS.GAME_DESC_MAX));
  }
  if (thumbnail_url !== undefined) {
    updates.push('thumbnail_url = ?');
    params.push(thumbnail_url);
  }
  if (game_data !== undefined) {
    updates.push('game_data = ?');
    params.push(typeof game_data === 'string' ? game_data : JSON.stringify(game_data));
  }

  if (updates.length === 0) {
    return { game: getGameById(gameId), error: null };
  }

  params.push(Date.now(), gameId);
  db.prepare(`UPDATE games SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`).run(...params);

  return { game: getGameById(gameId), error: null };
}

/**
 * Incrementa plays_count cuando alguien juega
 */
function incrementPlays(gameId) {
  const db = getDatabase();
  db.prepare('UPDATE games SET plays_count = plays_count + 1 WHERE id = ?').run(gameId);
}

/**
 * Lista juegos del usuario
 */
function getGamesByUser(userId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, name, description, thumbnail_url, plays_count, likes_count, created_at, updated_at
    FROM games
    WHERE creator_id = ?
    ORDER BY updated_at DESC
  `).all(userId);
}

module.exports = {
  listGames,
  getGameById,
  createGame,
  updateGame,
  incrementPlays,
  getGamesByUser,
};
