/**
 * Rutas de avatar
 * CorePlayBlox - Backend
 */

const express = require('express');
const avatarController = require('../controllers/avatarController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId?', avatarController.getAvatar);
router.put('/', requireAuth, avatarController.updateAvatar);

module.exports = router;
