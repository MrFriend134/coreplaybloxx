/**
 * Rutas de usuarios
 * CorePlayBlox - Backend
 */

const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/search', userController.search);
router.get('/:id', userController.getProfile);
router.patch('/:id/username', requireAuth, userController.updateUsername);

module.exports = router;
