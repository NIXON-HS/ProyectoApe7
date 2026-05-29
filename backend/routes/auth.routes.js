const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

const loginValidador = [
  body('correo')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

router.post('/login', loginValidador, validate, controller.login);
// Verifica JWT existente sin bcrypt — usado para reloads instantáneos
router.get('/verify', controller.verify);

module.exports = router;
