const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/contacto.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

// Configuración del rate limiter específico para el formulario de contacto:
// Máximo 5 solicitudes de la misma IP por cada 15 minutos.
const contactoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite
  message: {
    success: false,
    status: 429,
    message: 'Demasiadas solicitudes de contacto desde esta IP. Por favor, intente de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactoValidador = [
  body('nombre_completo')
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  body('correo')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido'),
  body('asunto')
    .notEmpty().withMessage('El asunto es requerido'),
  body('mensaje')
    .notEmpty().withMessage('El mensaje es requerido')
    .isLength({ min: 10 }).withMessage('El mensaje debe tener al menos 10 caracteres'),
];

router.post('/', contactoLimiter, contactoValidador, validate, controller.crearContacto);
router.get('/', auth, controller.getContactos);
router.delete('/:id', auth, controller.eliminarContacto);

module.exports = router;
