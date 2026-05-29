const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/publicacion.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

const publicacionValidador = [
  body('titulo')
    .notEmpty().withMessage('El título del artículo es requerido'),
  body('resumen')
    .notEmpty().withMessage('El resumen del artículo es requerido'),
  body('cita')
    .notEmpty().withMessage('La cita bibliográfica en formato APA/IEEE es requerida'),
  body('linea_id')
    .optional()
    .isInt().withMessage('El ID de línea debe ser un número entero válido'),
];

router.get('/', controller.getPublicaciones);
router.get('/:id', controller.getPublicacionById);
router.post('/', auth, publicacionValidador, validate, controller.crearPublicacion);
router.put('/:id', auth, controller.actualizarPublicacion);
router.delete('/:id', auth, controller.eliminarPublicacion);

module.exports = router;
