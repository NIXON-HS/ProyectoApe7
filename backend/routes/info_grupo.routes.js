const express = require('express');
const controller = require('../controllers/info_grupo.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/',    controller.getInfoGrupo);
router.put('/', auth, controller.actualizarInfoGrupo);

module.exports = router;
