const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visita.controller');

router.get('/', visitaController.obtenerContador);
router.post('/registrar', visitaController.registrarVisita);
router.get('/analytics', visitaController.obtenerAnalytics);

module.exports = router;
