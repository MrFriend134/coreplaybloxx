/**
 * Rutas principales
 * CorePlayBlox - Backend
 *
 * Agrupa todas las rutas de la API REST.
 */

const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const friendRoutes = require('./friends');
const gameRoutes = require('./games');
const avatarRoutes = require('./avatar');
const catalogRoutes = require('./catalog');
const promoCodeRoutes = require('./promoCodes');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas que pueden ser públicas o con auth opcional
router.use('/users', optionalAuth(), userRoutes);
router.use('/avatar', optionalAuth(), avatarRoutes);

// Rutas protegidas
router.use('/friends', requireAuth, friendRoutes);
router.use('/games', gameRoutes); // list y get son públicas, create/update requieren auth
router.use('/catalog', catalogRoutes); // list pública, purchase requiere auth
router.use('/codes', requireAuth, promoCodeRoutes);

module.exports = router;
