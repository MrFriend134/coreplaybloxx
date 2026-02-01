/**
 * Rutas de amigos
 * CorePlayBlox - Backend
 */

const express = require('express');
const friendController = require('../controllers/friendController');

const router = express.Router();

router.get('/', friendController.list);
router.post('/:id', friendController.add);
router.delete('/:id', friendController.remove);

module.exports = router;
