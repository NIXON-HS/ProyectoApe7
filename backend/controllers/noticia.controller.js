const { Noticia } = require('../models/index');

exports.getNoticias = async (req, res, next) => {
  try {
    const list = await Noticia.findAll({
      order: [['fecha', 'DESC']]
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

exports.getNoticiaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Noticia.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.crearNoticia = async (req, res, next) => {
  try {
    const { titulo, resumen, contenido, contenido_json, imagen_url, fecha, categoria, activo } = req.body;
    const newItem = await Noticia.create({
      titulo,
      resumen,
      contenido,
      contenido_json,
      imagen_url,
      fecha: fecha || new Date(),
      categoria: categoria || 'General',
      activo: activo !== undefined ? activo : true
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

exports.actualizarNoticia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, resumen, contenido, contenido_json, imagen_url, fecha, categoria, activo } = req.body;

    const [updated] = await Noticia.update(
      { titulo, resumen, contenido, contenido_json, imagen_url, fecha, categoria, activo },
      { where: { id } }
    );

    const item = await Noticia.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.eliminarNoticia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Noticia.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Noticia eliminada con éxito' });
  } catch (error) {
    next(error);
  }
};
