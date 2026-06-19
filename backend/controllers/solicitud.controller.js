const { Solicitud, Usuario, Proyecto, Publicacion } = require('../models/index');

exports.getSolicitudes = async (req, res, next) => {
  try {
    const esAdmin = req.usuario.rol === 'admin';
    const where = esAdmin ? {} : { usuario_id: req.usuario.id };
    
    const list = await Solicitud.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombres', 'correo', 'rol']
        }
      ],
      order: [['id', 'DESC']]
    });
    
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

exports.procesarSolicitud = async (req, res, next) => {
  try {
    // Only admins can approve/reject
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo administradores pueden procesar solicitudes.' });
    }
    
    const { id } = req.params;
    const { estado, motivo_rechazo } = req.body; // 'aprobado' | 'rechazado'
    
    if (!['aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido. Debe ser aprobado o rechazado.' });
    }
    
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }
    
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'Esta solicitud ya ha sido procesada.' });
    }
    
    if (estado === 'rechazado') {
      solicitud.estado = 'rechazado';
      solicitud.motivo_rechazo = motivo_rechazo || 'No se especificó motivo.';
      solicitud.procesado_en = new Date();
      await solicitud.save();
      return res.status(200).json({ success: true, message: 'Solicitud rechazada correctamente.', data: solicitud });
    }
    
    // Si es aprobado, aplicar cambios
    const datos = JSON.parse(solicitud.datos_nuevos);
    
    if (solicitud.tipo === 'proyecto') {
      if (solicitud.accion === 'crear') {
        const { titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado: estadoProy, linea_id, investigadores } = datos;
        const nuevoProy = await Proyecto.create({ titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado: estadoProy, linea_id });
        if (investigadores && Array.isArray(investigadores)) {
          await nuevoProy.setInvestigadores(investigadores);
        }
      } else if (solicitud.accion === 'editar') {
        const { titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado: estadoProy, linea_id, investigadores } = datos;
        await Proyecto.update(
          { titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado: estadoProy, linea_id },
          { where: { id: solicitud.registro_id } }
        );
        const proy = await Proyecto.findByPk(solicitud.registro_id);
        if (proy && investigadores && Array.isArray(investigadores)) {
          await proy.setInvestigadores(investigadores);
        }
      }
    } else if (solicitud.tipo === 'publicacion') {
      if (solicitud.accion === 'crear') {
        const { titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id, investigadores } = datos;
        const nuevaPub = await Publicacion.create({ titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id });
        if (investigadores && Array.isArray(investigadores)) {
          await nuevaPub.setInvestigadores(investigadores);
        }
      } else if (solicitud.accion === 'editar') {
        const { titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id, investigadores } = datos;
        await Publicacion.update(
          { titulo, resumen, resumen_json, cita, revista_portada_url, doi_url, linea_id },
          { where: { id: solicitud.registro_id } }
        );
        const pub = await Publicacion.findByPk(solicitud.registro_id);
        if (pub && investigadores && Array.isArray(investigadores)) {
          await pub.setInvestigadores(investigadores);
        }
      }
    }
    
    solicitud.estado = 'aprobado';
    solicitud.procesado_en = new Date();
    await solicitud.save();
    
    res.status(200).json({ success: true, message: 'Solicitud aprobada y cambios aplicados con éxito.', data: solicitud });
  } catch (error) {
    next(error);
  }
};

exports.eliminarSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }
    
    // Check if the user is admin OR the creator of the request
    if (req.usuario.rol !== 'admin' && solicitud.usuario_id !== req.usuario.id) {
      return res.status(403).json({ success: false, message: 'Acceso denegado. No tienes permisos para cancelar esta solicitud.' });
    }
    
    const isPending = solicitud.estado === 'pendiente';
    await solicitud.destroy();
    
    res.status(200).json({ 
      success: true, 
      message: isPending ? 'Solicitud cancelada y eliminada con éxito.' : 'Registro de solicitud eliminado con éxito.' 
    });
  } catch (error) {
    next(error);
  }
};
