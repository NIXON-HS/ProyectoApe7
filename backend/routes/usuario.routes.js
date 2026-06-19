const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/usuario.controller');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { checkAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

const crearValidador = [
  body('nombres').notEmpty().withMessage('El nombre es requerido').isLength({ min: 3 }).withMessage('Mínimo 3 caracteres'),
  body('correo').notEmpty().withMessage('El correo es requerido').isEmail().withMessage('Debe ser un correo válido'),
  body('rol').notEmpty().withMessage('El rol es requerido').isIn(['admin', 'investigador']).withMessage('Rol inválido'),
];

const actualizarValidador = [
  body('nombres').optional().isLength({ min: 3 }).withMessage('Mínimo 3 caracteres'),
  body('correo').optional().isEmail().withMessage('Debe ser un correo válido'),
  body('rol').optional().isIn(['admin', 'investigador']).withMessage('Rol inválido'),
];

router.get('/', authMiddleware, checkAdmin, controller.getUsuarios);
router.post('/', authMiddleware, checkAdmin, crearValidador, validate, controller.crearUsuario);
router.post('/:id/reenviar-activacion', authMiddleware, checkAdmin, controller.reenviarActivacion);
router.put('/:id', authMiddleware, checkAdmin, actualizarValidador, validate, controller.actualizarUsuario);
router.delete('/:id', authMiddleware, checkAdmin, controller.eliminarUsuario);

module.exports = router;
