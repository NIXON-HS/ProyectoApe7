const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/proyecto.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

const proyectoValidador = [
  body('titulo')
    .notEmpty().withMessage('El título del proyecto es requerido'),
  body('descripcion')
    .notEmpty().withMessage('La descripción del proyecto es requerida'),
  body('objetivos')
    .notEmpty().withMessage('Los objetivos son requeridos'),
  body('resultados')
    .notEmpty().withMessage('Los resultados son requeridos'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Finalizado', 'Propuesta']).withMessage('Estado de proyecto inválido'),
  body('linea_id')
    .notEmpty().withMessage('El ID de la línea de investigación es requerido')
    .isInt().withMessage('Debe ser un número entero de ID de línea válido'),
];

router.get('/', controller.getProyectos);
router.get('/:id', controller.getProyectoById);
router.post('/', auth, proyectoValidador, validate, controller.crearProyecto);
router.put('/:id', auth, controller.actualizarProyecto);
router.delete('/:id', auth, controller.eliminarProyecto);

module.exports = router;
