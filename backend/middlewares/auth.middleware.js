const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'reasons_secret_key_2026_uta';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Acceso denegado. No se proporcionó un token de seguridad válido.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Acceso denegado. El token de seguridad está vacío.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // Adjuntar datos decodificados al request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Token de seguridad inválido o expirado.',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
