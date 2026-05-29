const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/investigador.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

const investigadorValidador = [
  body('nombres')
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  body('correo_institucional')
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido'),
  body('biografia')
    .notEmpty().withMessage('La biografía es requerida'),
  body('posicion')
    .notEmpty().withMessage('La posición es requerida')
    .isIn(['Director', 'Subdirector', 'Investigador']).withMessage('La posición debe ser Director, Subdirector o Investigador'),
];

router.get('/', controller.getInvestigadores);
router.get('/:id', controller.getInvestigadorById);
router.post('/', auth, investigadorValidador, validate, controller.crearInvestigador);
router.put('/:id', auth, controller.actualizarInvestigador);
router.delete('/:id', auth, controller.eliminarInvestigador);

module.exports = router;
