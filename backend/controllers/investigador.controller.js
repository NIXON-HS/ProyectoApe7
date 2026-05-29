const { Investigador, Proyecto, Publicacion, sequelize } = require('../models/index');

exports.getInvestigadores = async (req, res, next) => {
  try {
    const list = await Investigador.findAll({
      include: [
        { 
          model: Proyecto, 
          as: 'proyectos', 
          through: { attributes: ['rol_proyecto'] } 
        },
        { 
          model: Publicacion, 
          as: 'publicaciones', 
          through: { attributes: ['rol_publicacion'] } 
        }
      ],
      order: [
        [
          sequelize.literal("CASE WHEN posicion = 'Director' THEN 1 WHEN posicion = 'Subdirector' THEN 2 ELSE 3 END"),
          'ASC'
        ],
        ['nombres', 'ASC']
      ]
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

exports.getInvestigadorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Investigador.findByPk(id, {
      include: [
        { 
          model: Proyecto, 
          as: 'proyectos', 
          through: { attributes: ['rol_proyecto'] } 
        },
        { 
          model: Publicacion, 
          as: 'publicaciones', 
          through: { attributes: ['rol_publicacion'] } 
        }
      ]
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Investigador no encontrado' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.crearInvestigador = async (req, res, next) => {
  try {
    const newItem = await Investigador.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

exports.actualizarInvestigador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [updated] = await Investigador.update(req.body, { where: { id } });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Investigador no encontrado o sin cambios' });
    }
    const item = await Investigador.findByPk(id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.eliminarInvestigador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Investigador.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Investigador no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Investigador eliminado con éxito' });
  } catch (error) {
    next(error);
  }
};
