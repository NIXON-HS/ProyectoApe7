const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Investigador, Proyecto, Publicacion, Usuario, sequelize } = require('../models/index');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const ACTIVATION_TTL_HOURS = parseInt(process.env.ACTIVATION_TTL_HOURS || '72', 10);

const createToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

const sendActivationEmail = async ({ correo, nombres, token }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: SMTP_SECURE === 'true',
    requireTLS: SMTP_SECURE !== 'true',
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const from = process.env.MAIL_FROM || SMTP_USER;
  const activationUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(correo)}`;

  await transporter.sendMail({
    from,
    to: correo,
    subject: 'Bienvenido al Portal REASONS — Activa tu cuenta',
    text: `Hola ${nombres},\n\nTu cuenta fue creada en el portal REASONS - UTA.\nPara activarla y crear tu contraseña entra al siguiente enlace (válido ${ACTIVATION_TTL_HOURS} horas):\n\n${activationUrl}\n\nSi no esperabas este correo, ignóralo.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00283c, #0a3246); padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Portal REASONS</h1>
          <p style="color: #7dd87a; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Universidad Técnica de Ambato</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #00283c; margin-top: 0;">Hola, ${nombres} 👋</h2>
          <p>Tu cuenta ha sido creada en el portal del <strong>Grupo de Investigación REASONS - UTA</strong>.</p>
          <p>Para poder ingresar al sistema necesitas <strong>crear tu contraseña</strong> haciendo clic aquí:</p>
          <p style="margin: 28px 0; text-align: center;">
            <a href="${activationUrl}"
               style="background: #00283c; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 15px;">
              Crear mi contraseña
            </a>
          </p>
          <p style="color: #64748b; font-size: 13px;">Este enlace es válido por <strong>${ACTIVATION_TTL_HOURS} horas</strong> y solo puede usarse una vez.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Si no esperabas esta invitación, puedes ignorar este correo de manera segura.<br/>
            Si el botón no funciona, copia este enlace: <a href="${activationUrl}" style="color: #3c9632;">${activationUrl}</a>
          </p>
        </div>
      </div>
    `,
  });
};

exports.getInvestigadores = async (req, res, next) => {
  try {
    const list = await Investigador.findAll({
      include: [
        { model: Proyecto,    as: 'proyectos',    through: { attributes: ['rol_proyecto'] } },
        { model: Publicacion, as: 'publicaciones', through: { attributes: ['rol_publicacion'] } }
      ],
      order: [
        [sequelize.literal("CASE WHEN posicion = 'Director' THEN 1 WHEN posicion = 'Subdirector' THEN 2 ELSE 3 END"), 'ASC'],
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
        { model: Proyecto,    as: 'proyectos',    through: { attributes: ['rol_proyecto'] } },
        { model: Publicacion, as: 'publicaciones', through: { attributes: ['rol_publicacion'] } }
      ]
    });
    if (!item) return res.status(404).json({ success: false, message: 'Investigador no encontrado' });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.crearInvestigador = async (req, res, next) => {
  try {
    const newItem = await Investigador.create(req.body);

    const correo = newItem.correo_institucional;

    // Crear cuenta de acceso si no existe ya una con ese correo
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (!usuarioExistente) {
      const token = createToken();
      const hashedToken = hashToken(token);
      const expiresAt = new Date(Date.now() + ACTIVATION_TTL_HOURS * 60 * 60 * 1000);
      const passwordPlaceholder = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

      await Usuario.create({
        nombres: newItem.nombres,
        correo,
        rol: 'investigador',
        password: passwordPlaceholder,
        reset_password_token: hashedToken,
        reset_password_expires: expiresAt,
      });

      // Enviar correo en background — no bloquea la respuesta si falla
      sendActivationEmail({ correo, nombres: newItem.nombres, token }).catch(err =>
        console.error('Activación email error:', err.message)
      );
    }

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

exports.actualizarInvestigador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [updated] = await Investigador.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ success: false, message: 'Investigador no encontrado o sin cambios' });
    const item = await Investigador.findByPk(id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.eliminarInvestigador = async (req, res, next) => {
  try {
    const { id } = req.params;

    const investigador = await Investigador.findByPk(id);
    if (!investigador) return res.status(404).json({ success: false, message: 'Investigador no encontrado' });

    // Eliminar cuenta de acceso asociada (si existe y no es el admin que hace la acción)
    const correo = investigador.correo_institucional;
    const usuarioAsociado = await Usuario.findOne({ where: { correo } });
    if (usuarioAsociado && usuarioAsociado.id !== req.usuario?.id) {
      await usuarioAsociado.destroy();
    }

    await investigador.destroy();
    res.status(200).json({ success: true, message: 'Investigador eliminado con éxito' });
  } catch (error) {
    next(error);
  }
};
