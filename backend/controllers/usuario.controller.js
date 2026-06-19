const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Usuario } = require('../models/index');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const ACTIVATION_TTL_HOURS = parseInt(process.env.ACTIVATION_TTL_HOURS || '72', 10);

const createToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    const err = new Error('La configuración SMTP no está completa.');
    err.statusCode = 500;
    throw err;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: SMTP_SECURE === 'true',
    requireTLS: SMTP_SECURE !== 'true',
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const sendActivationEmail = async ({ correo, nombres, token, isResend }) => {
  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const activationUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(correo)}`;
  const subject = isResend
    ? 'Reenvío: Activa tu cuenta - Portal REASONS'
    : 'Bienvenido al Portal REASONS — Activa tu cuenta';

  await transporter.sendMail({
    from,
    to: correo,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 640px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00283c, #0a3246); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Portal REASONS</h1>
          <p style="color: #7dd87a; margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Universidad Técnica de Ambato</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #00283c; margin-top: 0;">Hola, ${nombres || 'nuevo usuario'} 👋</h2>
          <p>Tu cuenta ha sido creada en el portal del <strong>Grupo de Investigación REASONS - UTA</strong>.</p>
          <p>Para poder ingresar al sistema, necesitas <strong>crear tu contraseña</strong> haciendo clic en el siguiente botón:</p>
          <p style="margin: 28px 0; text-align: center;">
            <a href="${activationUrl}"
               style="background: linear-gradient(90deg, #00283c, #3c9632); color: white; text-decoration: none;
                      padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 15px;">
              Crear mi contraseña
            </a>
          </p>
          <p style="color: #64748b; font-size: 13px;">
            Este enlace es válido por <strong>${ACTIVATION_TTL_HOURS} horas</strong> y solo puede usarse una vez.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            Si no esperabas esta invitación, puedes ignorar este correo de manera segura.<br />
            Si el botón no funciona, copia y pega esta URL en tu navegador:<br />
            <a href="${activationUrl}" style="color: #3c9632;">${activationUrl}</a>
          </p>
        </div>
      </div>
    `,
  });
};

exports.getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombres', 'correo', 'rol', 'reset_password_expires', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ success: true, data: usuarios });
  } catch (error) {
    next(error);
  }
};

exports.crearUsuario = async (req, res, next) => {
  try {
    const { nombres, correo, rol } = req.body;

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese correo electrónico.' });
    }

    // Contraseña inutilizable — el usuario la define vía email de activación
    const passwordPlaceholder = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    const token = createToken();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + ACTIVATION_TTL_HOURS * 60 * 60 * 1000);

    const nuevoUsuario = await Usuario.create({
      nombres,
      correo,
      rol: rol || 'investigador',
      password: passwordPlaceholder,
      reset_password_token: hashedToken,
      reset_password_expires: expiresAt,
    });

    try {
      await sendActivationEmail({ correo, nombres, token, isResend: false });
    } catch (mailError) {
      console.error('Error enviando correo de activación:', mailError);
      await nuevoUsuario.destroy();
      const err = new Error('No se pudo enviar el correo de activación. Verifique la configuración SMTP.');
      err.statusCode = 503;
      throw err;
    }

    return res.status(201).json({
      success: true,
      message: `Usuario creado. Se envió un correo de activación a ${correo}.`,
      data: { id: nuevoUsuario.id, nombres, correo, rol: nuevoUsuario.rol },
    });
  } catch (error) {
    next(error);
  }
};

exports.reenviarActivacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const token = createToken();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + ACTIVATION_TTL_HOURS * 60 * 60 * 1000);

    await usuario.update({
      reset_password_token: hashedToken,
      reset_password_expires: expiresAt,
    });

    await sendActivationEmail({ correo: usuario.correo, nombres: usuario.nombres, token, isResend: true });

    return res.status(200).json({ success: true, message: `Correo de activación reenviado a ${usuario.correo}.` });
  } catch (error) {
    next(error);
  }
};

exports.actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombres, correo, rol } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    if (correo && correo !== usuario.correo) {
      const existe = await Usuario.findOne({ where: { correo } });
      if (existe) {
        return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese correo.' });
      }
    }

    await usuario.update({ nombres, correo, rol });
    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado.',
      data: { id: usuario.id, nombres: usuario.nombres, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (error) {
    next(error);
  }
};

exports.eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta.' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    await usuario.destroy();
    return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};
