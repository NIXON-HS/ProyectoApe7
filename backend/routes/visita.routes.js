const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visita.controller');

router.get('/', visitaController.obtenerContador);
router.post('/registrar', visitaController.registrarVisita);
router.get('/analytics', visitaController.obtenerAnalytics);
router.get('/analytics/advanced', visitaController.obtenerAnalyticsAvanzado);
router.get('/analytics/map', visitaController.obtenerMapaVisitas);

module.exports = router;
