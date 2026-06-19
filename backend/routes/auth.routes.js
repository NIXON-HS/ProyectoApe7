const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

const forgotPasswordWindowMinutes = parseInt(process.env.FORGOT_PASSWORD_WINDOW_MINUTES || '15', 10);
const forgotPasswordMaxAttempts = parseInt(process.env.FORGOT_PASSWORD_MAX_ATTEMPTS || '3', 10);

const forgotPasswordLimiter = rateLimit({
  windowMs: forgotPasswordWindowMinutes * 60 * 1000,
  max: forgotPasswordMaxAttempts,
  keyGenerator: (req) => {
    const correo = typeof req.body?.correo === 'string' ? req.body.correo.trim().toLowerCase() : '';
    return `${req.ip}:${correo || 'sin-correo'}`;
  },
  message: {
    success: false,
    status: 429,
    message: `Has alcanzado el máximo de ${forgotPasswordMaxAttempts} solicitudes de recuperación. Intenta nuevamente en ${forgotPasswordWindowMinutes} minutos.`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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


const forgotPasswordValidador = [
  body('correo')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
];

const resetPasswordValidador = [
  body('correo')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido'),
  body('token')
    .notEmpty().withMessage('El token de recuperación es requerido'),
  body('password')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

const validateResetTokenValidador = [
  body('correo')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido'),
  body('token')
    .notEmpty().withMessage('El token de recuperación es requerido')
];



router.post('/login', loginValidador, validate, controller.login);
router.put('/change-password', authMiddleware, changePasswordValidador, validate, controller.changePassword);
router.post('/forgot-password', forgotPasswordValidador, validate, forgotPasswordLimiter, controller.forgotPassword);
router.post('/validate-reset-token', validateResetTokenValidador, validate, controller.validateResetToken);
router.post('/reset-password', resetPasswordValidador, validate, controller.resetPassword);
// Verifica JWT existente sin bcrypt — usado para reloads instantáneos
router.get('/verify', controller.verify);

module.exports = router;
