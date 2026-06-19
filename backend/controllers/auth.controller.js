const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { Usuario } = require('../models/index');

const JWT_SECRET = process.env.JWT_SECRET || 'reasons_secret_key_2026_uta';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const RESET_TOKEN_TTL_MINUTES = parseInt(process.env.RESET_TOKEN_TTL_MINUTES || '15', 10);

const createResetToken = () => crypto.randomBytes(32).toString('hex');
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createMailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    const error = new Error('La configuración SMTP no está completa en las variables de entorno.');
    error.statusCode = 500;
    throw error;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: SMTP_SECURE === 'true',
    requireTLS: SMTP_SECURE !== 'true',
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendResetPasswordEmail = async ({ correo, nombres, token }) => {
  const transporter = createMailTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(correo)}`;

  await transporter.sendMail({
    from,
    to: correo,
    subject: 'Recuperacion de contrasena - Portal REASONS',
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #00283c;">Recuperacion de contrasena</h2>
        <p>Hola ${nombres || 'usuario'},</p>
        <p>Recibimos una solicitud para restablecer la contrasena de tu cuenta en el portal REASONS.</p>
        <p>Haz clic en el siguiente boton para crear una nueva contrasena:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(90deg, #00283c, #3c9632); color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: bold;">
            Restablecer contrasena
          </a>
        </p>
        <p>Este enlace caduca en ${RESET_TOKEN_TTL_MINUTES} minutos y solo puede usarse una vez.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p style="font-size: 12px; color: #64748b;">Si el boton no funciona, copia y pega esta URL en tu navegador:<br />${resetUrl}</p>
      </div>
    `,
  });

};

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

exports.changePassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;
    const usuarioId = req.usuario.id;

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const esValido = await bcrypt.compare(passwordActual, usuario.password);
    if (!esValido) {
      return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta.' });
    }

    const hash = await bcrypt.hash(passwordNuevo, 10);
    await usuario.update({ password: hash });

    return res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente.' });
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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { correo } = req.body;
    const genericResponse = {
      success: true,
      message: 'Si el correo existe, se enviaron instrucciones para recuperar la contrasena.'
    };

    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(200).json(genericResponse);
    }

    const token = createResetToken();
    const hashedToken = hashResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    usuario.reset_password_token = hashedToken;
    usuario.reset_password_expires = expiresAt;
    await usuario.save();

    try {
      await sendResetPasswordEmail({
        correo: usuario.correo,
        nombres: usuario.nombres,
        token,
      });

      return res.status(200).json(genericResponse);
    } catch (mailError) {
      console.error('Error enviando correo de recuperación:', mailError);
      usuario.reset_password_token = null;
      usuario.reset_password_expires = null;
      await usuario.save();

      const error = new Error('No se pudo enviar el correo de recuperación. Verifique la configuración SMTP.');
      error.statusCode = 503;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.validateResetToken = async (req, res, next) => {
  try {
    const { correo, token } = req.body;
    const hashedToken = hashResetToken(token);

    const usuario = await Usuario.findOne({
      where: {
        correo,
        reset_password_token: hashedToken,
        reset_password_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'El enlace de recuperacion es invalido o ha expirado.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'El enlace de recuperacion es valido.'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { correo, token, password } = req.body;
    const hashedToken = hashResetToken(token);

    const usuario = await Usuario.findOne({
      where: {
        correo,
        reset_password_token: hashedToken,
        reset_password_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'El enlace de recuperacion es invalido o ha expirado.'
      });
    }

    usuario.password = await bcrypt.hash(password, 10);
    usuario.reset_password_token = null;
    usuario.reset_password_expires = null;
    await usuario.save();

    return res.status(200).json({
      success: true,
      message: 'La contrasena se actualizo correctamente.'
    });
  } catch (error) {
    next(error);
  }
};
