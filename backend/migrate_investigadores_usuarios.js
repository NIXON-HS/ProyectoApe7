require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const ACTIVATION_TTL_HOURS = parseInt(process.env.ACTIVATION_TTL_HOURS || '72', 10);

const createToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  requireTLS: process.env.SMTP_SECURE !== 'true',
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendActivationEmail = async (transporter, { correo, nombres, token }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const activationUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(correo)}`;

  await transporter.sendMail({
    from,
    to: correo,
    subject: 'Bienvenido al Portal REASONS — Activa tu cuenta',
    text: `Hola ${nombres},\n\nTu cuenta fue creada en el portal REASONS - UTA.\nPara activarla y crear tu contraseña entra a este enlace (válido ${ACTIVATION_TTL_HOURS} horas):\n\n${activationUrl}\n\nSi no esperabas este correo, ignóralo.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: #00283c; padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Portal REASONS</h1>
          <p style="color: #7dd87a; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Universidad Técnica de Ambato</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #00283c; margin-top: 0;">Hola, ${nombres} 👋</h2>
          <p>Tu cuenta ha sido creada en el portal del <strong>Grupo de Investigación REASONS - UTA</strong>.</p>
          <p>Para poder ingresar al sistema necesitas <strong>crear tu contraseña</strong> haciendo clic aquí:</p>
          <p style="margin: 28px 0; text-align: center;">
            <a href="${activationUrl}" style="background: #00283c; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 15px;">
              Crear mi contraseña
            </a>
          </p>
          <p style="color: #64748b; font-size: 13px;">Este enlace es válido por <strong>${ACTIVATION_TTL_HOURS} horas</strong> y solo puede usarse una vez.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Si no esperabas esta invitación, puedes ignorar este correo.<br/>
            Si el botón no funciona, copia este enlace:<br/>
            <a href="${activationUrl}" style="color: #3c9632;">${activationUrl}</a>
          </p>
        </div>
      </div>
    `,
  });
};

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Conectado a la base de datos.\n');

  // Verificar SMTP antes de empezar
  const smtpOk = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  let transporter = null;
  if (smtpOk) {
    transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP verificado OK.\n');
  } else {
    console.warn('SMTP no configurado — se crearán los usuarios pero NO se enviarán correos.\n');
  }

  // Obtener todos los investigadores
  const { rows: investigadores } = await client.query(
    `SELECT id, nombres, correo_institucional FROM investigadores ORDER BY id`
  );
  console.log(`Investigadores encontrados: ${investigadores.length}\n`);

  let creados = 0;
  let omitidos = 0;
  let errores = 0;

  for (const inv of investigadores) {
    const { nombres, correo_institucional: correo } = inv;

    // Verificar si ya tiene cuenta
    const { rows: existing } = await client.query(
      `SELECT id FROM usuarios WHERE correo = $1`,
      [correo]
    );

    if (existing.length > 0) {
      console.log(`  OMITIDO  ${correo} (ya tiene cuenta)`);
      omitidos++;
      continue;
    }

    try {
      // Crear usuario con contraseña inutilizable y token de activación
      const token = createToken();
      const hashedToken = hashToken(token);
      const expiresAt = new Date(Date.now() + ACTIVATION_TTL_HOURS * 60 * 60 * 1000);
      const passwordPlaceholder = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

      await client.query(
        `INSERT INTO usuarios (nombres, correo, password, rol, reset_password_token, reset_password_expires)
         VALUES ($1, $2, $3, 'investigador', $4, $5)`,
        [nombres, correo, passwordPlaceholder, hashedToken, expiresAt]
      );

      // Enviar correo de activación
      if (transporter) {
        try {
          await sendActivationEmail(transporter, { correo, nombres, token });
          console.log(`  CREADO   ${correo} — correo de activación enviado`);
        } catch (mailErr) {
          console.warn(`  CREADO   ${correo} — usuario creado pero correo FALLÓ: ${mailErr.message}`);
        }
      } else {
        console.log(`  CREADO   ${correo} — sin correo (SMTP no configurado)`);
      }

      creados++;
    } catch (err) {
      console.error(`  ERROR    ${correo}: ${err.message}`);
      errores++;
    }
  }

  await client.end();

  console.log('\n========================================');
  console.log(`Usuarios creados  : ${creados}`);
  console.log(`Omitidos (ya existían): ${omitidos}`);
  console.log(`Errores           : ${errores}`);
  console.log('========================================');
  console.log('Migración completada.');
}

migrate().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
