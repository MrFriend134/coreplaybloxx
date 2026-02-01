/**
 * Rutas del catálogo
 * CorePlayBlox - Backend
 */

const express = require('express');
const catalogController = require('../controllers/catalogController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', catalogController.list);
router.get('/inventory', requireAuth, catalogController.getInventory);
router.post('/purchase', requireAuth, catalogController.purchase);

module.exports = router;
