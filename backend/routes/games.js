/**
 * Rutas de juegos
 * CorePlayBlox - Backend
 */

const express = require('express');
const gameController = require('../controllers/gameController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', gameController.list);
router.get('/my', requireAuth, gameController.getMyGames);
router.get('/:id', gameController.getById);
router.post('/', requireAuth, gameController.create);
router.put('/:id', requireAuth, gameController.update);
router.post('/:id/play', optionalAuth(), gameController.play);

module.exports = router;
