const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/noticia.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

const noticiaValidador = [
  body('titulo')
    .notEmpty().withMessage('El título de la noticia es requerido'),
  body('resumen')
    .notEmpty().withMessage('El resumen es requerido'),
  body('contenido')
    .notEmpty().withMessage('El contenido es requerido'),
  body('categoria')
    .notEmpty().withMessage('La categoría es requerida'),
];

router.get('/', controller.getNoticias);
router.get('/:id', controller.getNoticiaById);
router.post('/', auth, noticiaValidador, validate, controller.crearNoticia);
router.put('/:id', auth, controller.actualizarNoticia);
router.delete('/:id', auth, controller.eliminarNoticia);

module.exports = router;
