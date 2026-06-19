const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

const loginValidador = [
  body('correo')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

const changePasswordValidador = [
  body('passwordActual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('passwordNuevo')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

router.post('/login', loginValidador, validate, controller.login);
router.put('/change-password', authMiddleware, changePasswordValidador, validate, controller.changePassword);
// Verifica JWT existente sin bcrypt — usado para reloads instantáneos
router.get('/verify', controller.verify);

module.exports = router;
