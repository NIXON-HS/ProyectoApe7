const { Contacto } = require('../models/index');

exports.crearContacto = async (req, res, next) => {
  try {
    const { nombre_completo, correo, asunto, mensaje } = req.body;
    const newItem = await Contacto.create({
      nombre_completo,
      correo,
      asunto,
      mensaje
    });
    res.status(201).json({
      success: true,
      message: '¡Mensaje de contacto registrado exitosamente!',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

exports.getContactos = async (req, res, next) => {
  try {
    const list = await Contacto.findAll({
      order: [['creado_en', 'DESC']]
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

exports.eliminarContacto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Contacto.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'El mensaje de contacto no existe o ya fue eliminado.'
      });
    }
    await item.destroy();
    res.status(200).json({
      success: true,
      message: 'Mensaje de contacto eliminado exitosamente.'
    });
  } catch (error) {
    next(error);
  }
};
