/**
 * Rutas de códigos promocionales
 * CorePlayBlox - Backend
 *
 * SOLO EJEMPLO TÉCNICO - CoreCoins ficticios
 */

const express = require('express');
const promoCodeController = require('../controllers/promoCodeController');

const router = express.Router();

router.post('/redeem', promoCodeController.redeem);

module.exports = router;
