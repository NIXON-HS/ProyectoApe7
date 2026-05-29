const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/index');

const JWT_SECRET = process.env.JWT_SECRET || 'reasons_secret_key_2026_uta';

exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione un correo electrónico y una contraseña.'
      });
    }

    // Buscar al usuario por correo
    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Correo o contraseña incorrectos.'
      });
    }

    // Validar contraseña
    const esPasswordValido = await bcrypt.compare(password, usuario.password);

    if (!esPasswordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Correo o contraseña incorrectos.'
      });
    }

    // Generar JWT Token
    const token = jwt.sign(
      {
        id: usuario.id,
        nombres: usuario.nombres,
        correo: usuario.correo,
        rol: usuario.rol
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      message: '¡Inicio de sesión exitoso!',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombres: usuario.nombres,
          correo: usuario.correo,
          rol: usuario.rol
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verifica un JWT token existente sin bcrypt (para reloads instantáneos)
exports.verify = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({
      success: true,
      data: {
        usuario: {
          id: decoded.id,
          nombres: decoded.nombres,
          correo: decoded.correo,
          rol: decoded.rol
        }
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};
