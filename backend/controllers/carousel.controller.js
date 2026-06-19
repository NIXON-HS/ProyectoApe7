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
    const {
      tipo, titulo, subtitulo, descripcion,
      imagen_url, enlace,
      boton1_texto, boton2_texto, boton2_url,
      color_overlay, alineacion, texto_oscuro,
      orden, activo
    } = req.body;
    const slide = await CarouselSlide.create({
      tipo: tipo || 'standard',
      titulo, subtitulo, descripcion,
      imagen_url, enlace,
      boton1_texto: boton1_texto || 'Ver más',
      boton2_texto, boton2_url,
      color_overlay, alineacion: alineacion || 'left',
      texto_oscuro: texto_oscuro ?? false,
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
    const {
      tipo, titulo, subtitulo, descripcion,
      imagen_url, enlace,
      boton1_texto, boton2_texto, boton2_url,
      color_overlay, alineacion, texto_oscuro,
      orden, activo
    } = req.body;
    await slide.update({
      ...(tipo !== undefined && { tipo }),
      ...(titulo !== undefined && { titulo }),
      ...(subtitulo !== undefined && { subtitulo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(imagen_url !== undefined && { imagen_url }),
      ...(enlace !== undefined && { enlace }),
      ...(boton1_texto !== undefined && { boton1_texto }),
      ...(boton2_texto !== undefined && { boton2_texto }),
      ...(boton2_url !== undefined && { boton2_url }),
      ...(color_overlay !== undefined && { color_overlay }),
      ...(alineacion !== undefined && { alineacion }),
      ...(texto_oscuro !== undefined && { texto_oscuro }),
      ...(orden !== undefined && { orden }),
      ...(activo !== undefined && { activo }),
    });
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
