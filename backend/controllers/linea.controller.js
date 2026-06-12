const { LineaInvestigacion, Proyecto, Publicacion } = require('../models/index');

exports.getLineas = async (req, res, next) => {
  try {
    const list = await LineaInvestigacion.findAll({ order: [['id', 'ASC']] });
    res.status(200).json({ success: true, data: list });
  } catch (error) { next(error); }
};

exports.getLineaById = async (req, res, next) => {
  try {
    const item = await LineaInvestigacion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Línea no encontrada' });
    res.status(200).json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.crearLinea = async (req, res, next) => {
  try {
    const { nombre, abreviatura, descripcion, descripcion_larga, descripcion_larga_json } = req.body;
    const item = await LineaInvestigacion.create({ nombre, abreviatura, descripcion: descripcion || '', descripcion_larga, descripcion_larga_json });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.actualizarLinea = async (req, res, next) => {
  try {
    const { nombre, abreviatura, descripcion, descripcion_larga, descripcion_larga_json } = req.body;
    await LineaInvestigacion.update(
      { nombre, abreviatura, descripcion, descripcion_larga, descripcion_larga_json },
      { where: { id: req.params.id } }
    );
    const item = await LineaInvestigacion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Línea no encontrada' });
    res.status(200).json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.eliminarLinea = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Check for associated projects
    const proyectosCount = await Proyecto.count({ where: { linea_id: id } });
    if (proyectosCount > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: esta línea tiene ${proyectosCount} proyecto(s) asociado(s). Reasigna o elimina esos proyectos primero.`
      });
    }

    // Check for associated publications
    const pubsCount = await Publicacion.count({ where: { linea_id: id } });
    if (pubsCount > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: esta línea tiene ${pubsCount} publicación(es) asociada(s). Reasigna o elimina esas publicaciones primero.`
      });
    }

    const deleted = await LineaInvestigacion.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ success: false, message: 'Línea no encontrada' });
    res.status(200).json({ success: true, message: 'Línea eliminada correctamente' });
  } catch (error) { next(error); }
};
