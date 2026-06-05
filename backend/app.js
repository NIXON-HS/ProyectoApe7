const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes/index');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
require('dotenv').config();

const app = express();

// 1. Cabeceras de seguridad con Helmet (Protección XSS, clickjacking, etc., permitiendo CORP para APIs cruzadas)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS restringido al dominio del frontend (admite localhost en cualquier puerto para desarrollo local robusto)
const corsOptions = {
  origin: function (origin, callback) {
    // Si no hay origin (como llamadas internas, curl o postman), lo permitimos
    if (!origin) return callback(null, true);
    
    // Admitimos cualquier puerto de localhost o 127.0.0.1 para evitar bloqueos durante el desarrollo
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    const allowed = process.env.CORS_ORIGIN || 'http://localhost:4200';
    if (origin === allowed) {
      return callback(null, true);
    }
    
    return callback(new Error('No permitido por la política CORS del servidor REASONS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Serialización de payloads JSON y URL-encoded con límites extendidos para subida de fotos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir de manera estática y en vivo las imágenes de equipo escritas en el frontend
app.use('/assets/images/team', express.static(path.join(__dirname, '..', 'frontend', 'src', 'assets', 'images', 'team')));

// Servir archivos del editor de bloques (imágenes y PDFs subidos)
app.use('/assets/uploads/media', express.static(path.join(__dirname, '..', 'frontend', 'src', 'assets', 'uploads', 'media')));

// 4. Integración del enrutador maestro bajo el prefijo /api/
app.use('/api', routes);

// 5. Gestión de rutas inexistentes (404 Not Found)
app.use(notFoundHandler);

// 6. Manejo global centralizado de excepciones y errores (500 Internal Server Error)
app.use(errorHandler);

module.exports = app;
