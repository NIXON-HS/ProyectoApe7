const InfoGrupo = require('../models/info_grupo');

// GET /api/info-grupo — público
exports.getInfoGrupo = async (req, res, next) => {
  try {
    let info = await InfoGrupo.findByPk(1);
    if (!info) {
      // Auto-create row with defaults if it doesn't exist yet
      info = await InfoGrupo.create({ id: 1 });
    }
    res.status(200).json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};

// PUT /api/info-grupo — requiere auth (admin)
exports.actualizarInfoGrupo = async (req, res, next) => {
  try {
    const fields = [
      'logo_url',
      'hero_badge', 'hero_titulo', 'hero_nombre', 'hero_subtitulo', 'hero_cita', 'hero_card_nombre', 'hero_card_grupo',
      'descripcion', 'descripcion_json',
      'mision', 'mision_json',
      'objetivo_general', 'objetivo_general_json',
      'objetivos_especificos', 'objetivos_especificos_json',
      'dominio',
      'proyectos_badge', 'proyectos_titulo', 'proyectos_descripcion',
      'publicaciones_badge', 'publicaciones_titulo', 'publicaciones_descripcion',
      'contacto_badge', 'contacto_titulo', 'contacto_descripcion',
      'contacto_email', 'contacto_telefono', 'contacto_direccion',
      'equipo_badge', 'equipo_titulo', 'equipo_descripcion',
    ];

    const update = {};
    fields.forEach(f => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });

    await InfoGrupo.upsert({ id: 1, ...update });
    const info = await InfoGrupo.findByPk(1);
    res.status(200).json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};
