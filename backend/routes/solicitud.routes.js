const express = require('express');
const controller = require('../controllers/solicitud.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, controller.getSolicitudes);
router.put('/:id/procesar', auth, controller.procesarSolicitud);
router.delete('/:id', auth, controller.eliminarSolicitud);

module.exports = router;
