const { Proyecto, Investigador, LineaInvestigacion } = require('../models/index');

exports.getProyectos = async (req, res, next) => {
  try {
    const list = await Proyecto.findAll({
      include: [
        { 
          model: Investigador, 
          as: 'investigadores', 
          through: { attributes: ['rol_proyecto'] } 
        },
        { 
          model: LineaInvestigacion, 
          as: 'linea' 
        }
      ],
      order: [['id', 'ASC']]
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

exports.getProyectoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Proyecto.findByPk(id, {
      include: [
        { 
          model: Investigador, 
          as: 'investigadores', 
          through: { attributes: ['rol_proyecto'] } 
        },
        { 
          model: LineaInvestigacion, 
          as: 'linea' 
        }
      ]
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.crearProyecto = async (req, res, next) => {
  try {
    const { titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado, linea_id, investigadores } = req.body;
    const newItem = await Proyecto.create({ titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado, linea_id });
    
    if (investigadores && Array.isArray(investigadores)) {
      await newItem.setInvestigadores(investigadores);
    }
    
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

exports.actualizarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado, linea_id, investigadores } = req.body;

    const [updated] = await Proyecto.update(
      { titulo, descripcion, objetivos, resultados, descripcion_json, objetivos_json, resultados_json, estado, linea_id },
      { where: { id } }
    );
    
    const item = await Proyecto.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    
    if (investigadores && Array.isArray(investigadores)) {
      await item.setInvestigadores(investigadores);
    }
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.eliminarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Proyecto.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Proyecto eliminado con éxito' });
  } catch (error) {
    next(error);
  }
};
