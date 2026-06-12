const express = require('express');
const fs = require('fs');
const path = require('path');
const investigadorRoutes = require('./investigador.routes');
const proyectoRoutes = require('./proyecto.routes');
const publicacionRoutes = require('./publicacion.routes');
const contactoRoutes = require('./contacto.routes');
const authRoutes = require('./auth.routes');
const infoGrupoRoutes = require('./info_grupo.routes');
const lineaRoutes = require('./linea.routes');
const noticiaRoutes = require('./noticia.routes');

const router = express.Router();

// Rutas agrupadas bajo el prefijo /api/
router.use('/auth', authRoutes);
router.use('/investigadores', investigadorRoutes);
router.use('/proyectos', proyectoRoutes);
router.use('/publicaciones', publicacionRoutes);
router.use('/contacto', contactoRoutes);
router.use('/info-grupo', infoGrupoRoutes);
router.use('/lineas', lineaRoutes);
router.use('/noticias', noticiaRoutes);

// Endpoint liviano para subida de fotos de investigadores en Base64
router.post('/upload', (req, res) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ success: false, message: 'Faltan datos de archivo para subir.' });
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // Ruta física del directorio de imágenes de equipo en el frontend
    const targetDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'images', 'team');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Normalizar nombre de archivo para evitar Path Traversal y caracteres raros
    const safeName = Date.now() + '_' + path.basename(fileName).replace(/[^a-zA-Z0-9.\-_]/g, '');
    const finalPath = path.join(targetDir, safeName);

    fs.writeFileSync(finalPath, buffer);

    res.status(200).json({
      success: true,
      message: '¡Imagen de perfil guardada con éxito!',
      url: `assets/images/team/${safeName}`
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al procesar la imagen.' });
  }
});

// Endpoint para subida de imágenes y PDFs del editor de bloques
router.post('/upload/media', (req, res) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ success: false, message: 'Faltan datos de archivo.' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const ext = path.extname(fileName).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    if (!allowed.includes(ext)) {
      return res.status(400).json({ success: false, message: 'Tipo de archivo no permitido.' });
    }

    const targetDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'uploads', 'media');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeName = Date.now() + '_' + path.basename(fileName).replace(/[^a-zA-Z0-9.\-_]/g, '');
    fs.writeFileSync(path.join(targetDir, safeName), buffer);

    res.status(200).json({
      success: true,
      url: `assets/uploads/media/${safeName}`,
      fileName: fileName
    });
  } catch (error) {
    console.error('Error al subir media:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el archivo.' });
  }
});

module.exports = router;
