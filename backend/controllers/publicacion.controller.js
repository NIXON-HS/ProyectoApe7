const { Publicacion, Investigador, LineaInvestigacion, Solicitud } = require('../models/index');

exports.getPublicaciones = async (req, res, next) => {
  try {
    const list = await Publicacion.findAll({
      include: [
        { 
          model: Investigador, 
          as: 'investigadores', 
          through: { attributes: ['rol_publicacion'] } 
        },
        { 
          model: LineaInvestigacion, 
          as: 'linea' 
        }
      ],
      order: [['id', 'DESC']]
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

exports.getPublicacionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Publicacion.findByPk(id, {
      include: [
        { 
          model: Investigador, 
          as: 'investigadores', 
          through: { attributes: ['rol_publicacion'] } 
        },
        { 
          model: LineaInvestigacion, 
          as: 'linea' 
        }
      ]
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.crearPublicacion = async (req, res, next) => {
  try {
    const { titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id, investigadores } = req.body;
    
    if (req.usuario && req.usuario.rol === 'investigador') {
      const solicitud = await Solicitud.create({
        usuario_id: req.usuario.id,
        tipo: 'publicacion',
        accion: 'crear',
        datos_nuevos: JSON.stringify(req.body),
        estado: 'pendiente'
      });
      return res.status(202).json({
        success: true,
        message: 'Tu solicitud de creación de publicación ha sido enviada al administrador para su aprobación.',
        data: solicitud,
        isPendingApproval: true
      });
    }

    const newItem = await Publicacion.create({ titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id });
    
    if (investigadores && Array.isArray(investigadores)) {
      await newItem.setInvestigadores(investigadores);
    }
    
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

exports.actualizarPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id, investigadores } = req.body;

    if (req.usuario && req.usuario.rol === 'investigador') {
      const solicitud = await Solicitud.create({
        usuario_id: req.usuario.id,
        tipo: 'publicacion',
        accion: 'editar',
        registro_id: id,
        datos_nuevos: JSON.stringify(req.body),
        estado: 'pendiente'
      });
      return res.status(202).json({
        success: true,
        message: 'Tu solicitud de modificación de publicación ha sido enviada al administrador para su aprobación.',
        data: solicitud,
        isPendingApproval: true
      });
    }

    const [updated] = await Publicacion.update(
      { titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id },
      { where: { id } }
    );
    
    const item = await Publicacion.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
    
    if (investigadores && Array.isArray(investigadores)) {
      await item.setInvestigadores(investigadores);
    }
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.eliminarPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Publicacion.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Publicación eliminada con éxito' });
  } catch (error) {
    next(error);
  }
};
