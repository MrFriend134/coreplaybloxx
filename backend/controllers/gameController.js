/**
 * Controlador de juegos
 * CorePlayBlox - Backend
 */

const gameService = require('../services/gameService');

function list(req, res) {
  const q = req.query.q || '';
  const limit = Math.min(parseInt(req.query.limit, 10) || 24, 100);
  const offset = Math.max(0, parseInt(req.query.offset, 10));
  const sort = req.query.sort || 'recent';
  const { games, total } = gameService.listGames({ q, limit, offset, sort });
  res.json({ games, total });
}

function getById(req, res) {
  const game = gameService.getGameById(req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Juego no encontrado' });
  }
  res.json(game);
}

function create(req, res) {
  const { game, error } = gameService.createGame(req.user.id, req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  res.status(201).json(game);
}

function update(req, res) {
  const { game, error } = gameService.updateGame(req.params.id, req.user.id, req.body);
  if (error) {
    return res.status(error === 'No autorizado' ? 403 : 400).json({ error });
  }
  res.json(game);
}

function play(req, res) {
  const game = gameService.getGameById(req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Juego no encontrado' });
  }
  gameService.incrementPlays(req.params.id);
  res.json(game);
}

function getMyGames(req, res) {
  const games = gameService.getGamesByUser(req.user.id);
  res.json(games);
}

module.exports = {
  list,
  getById,
  create,
  update,
  play,
  getMyGames,
};
