const { CarouselSlide } = require('../models/index');

exports.getSlides = async (req, res, next) => {
  try {
    const list = await CarouselSlide.findAll({
      where: { activo: true },
      order: [['orden', 'ASC'], ['createdAt', 'ASC']],
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) { next(error); }
};

exports.getAllSlides = async (req, res, next) => {
  try {
    const list = await CarouselSlide.findAll({
      order: [['orden', 'ASC'], ['createdAt', 'ASC']],
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) { next(error); }
};

exports.crearSlide = async (req, res, next) => {
  try {
    const { titulo, subtitulo, imagen_url, enlace, orden, activo } = req.body;
    const slide = await CarouselSlide.create({
      titulo, subtitulo, imagen_url, enlace,
      orden: orden ?? 0,
      activo: activo !== undefined ? activo : true,
    });
    res.status(201).json({ success: true, data: slide });
  } catch (error) { next(error); }
};

exports.actualizarSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await CarouselSlide.findByPk(id);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide no encontrado' });
    const { titulo, subtitulo, imagen_url, enlace, orden, activo } = req.body;
    await slide.update({ titulo, subtitulo, imagen_url, enlace, orden, activo });
    res.status(200).json({ success: true, data: slide });
  } catch (error) { next(error); }
};

exports.eliminarSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await CarouselSlide.findByPk(id);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide no encontrado' });
    await slide.destroy();
    res.status(200).json({ success: true, message: 'Slide eliminado correctamente' });
  } catch (error) { next(error); }
};
