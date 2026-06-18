const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/carousel.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', ctrl.getSlides);
router.get('/all', auth, ctrl.getAllSlides);
router.post('/', auth, ctrl.crearSlide);
router.put('/:id', auth, ctrl.actualizarSlide);
router.delete('/:id', auth, ctrl.eliminarSlide);

module.exports = router;
