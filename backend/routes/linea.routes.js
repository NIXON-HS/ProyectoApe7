const express = require('express');
const controller = require('../controllers/linea.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/',       controller.getLineas);
router.get('/:id',    controller.getLineaById);
router.post('/',   auth, controller.crearLinea);
router.put('/:id', auth, controller.actualizarLinea);
router.delete('/:id', auth, controller.eliminarLinea);

module.exports = router;
