const { Visita, sequelize } = require('../models/index');
const { Op, fn, col, literal } = require('sequelize');

const EC = "created_at AT TIME ZONE 'America/Guayaquil'";
const EC_DATE = `(${EC})::date`;
const EC_TODAY = "(NOW() AT TIME ZONE 'America/Guayaquil')::date";

exports.registrarVisita = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;
    const ua = req.headers['user-agent'] || null;
    const sessionId = req.body.session_id || null;
    const page = req.body.page || '/';

    if (sessionId) {
      const existente = await Visita.findOne({
        where: { session_id: sessionId },
        attributes: ['id', 'created_at'],
        order: [['created_at', 'DESC']],
      });
      if (existente) {
        const [{ es_hoy }] = await sequelize.query(
          `SELECT ${EC_DATE} = ${EC_TODAY} as es_hoy FROM visitas WHERE id = :id`,
          { replacements: { id: existente.id }, type: sequelize.QueryTypes.SELECT }
        );
        if (es_hoy) {
          const total = await Visita.count();
          return res.status(200).json({ success: true, data: { contador: total } });
        }
      }
    }

    await Visita.create({
      session_id: sessionId,
      ip_address: ip ? ip.substring(0, 45) : null,
      user_agent: ua ? ua.substring(0, 512) : null,
      page,
    });

    const total = await Visita.count();
    res.status(201).json({ success: true, data: { contador: total } });
  } catch (error) {
    next(error);
  }
};

exports.obtenerContador = async (req, res, next) => {
  try {
    const total = await Visita.count();
    res.status(200).json({ success: true, data: { contador: total } });
  } catch (error) {
    next(error);
  }
};

exports.obtenerAnalytics = async (req, res, next) => {
  try {
    const totalVisitas = await Visita.count();

    const [vh] = await sequelize.query(`SELECT COUNT(*) as c FROM visitas WHERE ${EC_DATE} = ${EC_TODAY}`);
    const [va] = await sequelize.query(`SELECT COUNT(*) as c FROM visitas WHERE ${EC_DATE} = (${EC_TODAY} - 1)`);
    const [vs] = await sequelize.query(`SELECT COUNT(*) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 7)`);
    const [vm] = await sequelize.query(`SELECT COUNT(*) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 30)`);

    const visitasHoyCount = parseInt(vh[0].c);
    const visitasAyerCount = parseInt(va[0].c);
    const visitasSemanaCount = parseInt(vs[0].c);
    const visitasMesCount = parseInt(vm[0].c);

    const [su] = await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 30)`);
    const sesionesUnicas = parseInt(su[0].c);

    const paginasRows = await sequelize.query(`
      SELECT page, COUNT(id) as count FROM visitas
      WHERE ${EC_DATE} >= (${EC_TODAY} - 30)
      GROUP BY page ORDER BY count DESC LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });

    const [uu] = await sequelize.query(`SELECT COUNT(DISTINCT ip_address) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 30)`);
    const usuariosUnicos = parseInt(uu[0].c);

    const [uuh] = await sequelize.query(`SELECT COUNT(DISTINCT ip_address) as c FROM visitas WHERE ${EC_DATE} = ${EC_TODAY}`);
    const usuariosUnicosHoy = parseInt(uuh[0].c);

    const visitasPorDia = await sequelize.query(`
      SELECT ${EC_DATE} as fecha, COUNT(DISTINCT session_id) as total
      FROM visitas
      WHERE ${EC_DATE} >= (${EC_TODAY} - 30) AND session_id IS NOT NULL
      GROUP BY ${EC_DATE}
      ORDER BY ${EC_DATE} ASC
    `, { type: sequelize.QueryTypes.SELECT });

    const ultimasVisitas = await Visita.findAll({
      attributes: ['id', 'session_id', 'ip_address', 'page', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 15,
      raw: true,
    });

    const promedioDiario = Math.round(visitasMesCount / 30);

    let avgDuration = 0;
    try {
      const duracionResult = await sequelize.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (v2.created_at - v1.created_at))) as segundos
        FROM visitas v1
        INNER JOIN visitas v2 ON v1.session_id = v2.session_id AND v2.created_at = (
          SELECT MIN(v3.created_at) FROM visitas v3 WHERE v3.session_id = v1.session_id AND v3.created_at > v1.created_at
        )
        WHERE (v1.created_at AT TIME ZONE 'America/Guayaquil')::date >= (${EC_TODAY} - 7)
          AND v1.session_id IS NOT NULL
      `, { type: sequelize.QueryTypes.SELECT });
      avgDuration = parseFloat(duracionResult[0]?.segundos) || 0;
    } catch (e) {
      avgDuration = 0;
    }
    const bounceRate = totalVisitas > 0 ? Math.round(((1 - (sesionesUnicas / totalVisitas)) * 100) || 0) : 0;

    let browserRows = [];
    try {
      browserRows = await sequelize.query(`
        SELECT 
          CASE 
            WHEN user_agent ILIKE '%chrome%' AND user_agent NOT ILIKE '%edg%' THEN 'Chrome'
            WHEN user_agent ILIKE '%firefox%' THEN 'Firefox'
            WHEN user_agent ILIKE '%safari%' AND user_agent NOT ILIKE '%chrome%' THEN 'Safari'
            WHEN user_agent ILIKE '%edg%' THEN 'Edge'
            ELSE 'Otro'
          END as browser,
          COUNT(id) as count
        FROM visitas
        WHERE ${EC_DATE} >= (${EC_TODAY} - 30)
        GROUP BY browser
        ORDER BY count DESC
      `, { type: sequelize.QueryTypes.SELECT });
    } catch (e) {
      browserRows = [];
    }

    let mobileRows = [];
    try {
      mobileRows = await sequelize.query(`
        SELECT 
          CASE 
            WHEN user_agent ILIKE '%mobile%' OR user_agent ILIKE '%android%' THEN 'Móvil'
            ELSE 'Escritorio'
          END as tipo,
          COUNT(id) as count
        FROM visitas
        WHERE ${EC_DATE} >= (${EC_TODAY} - 30)
        GROUP BY tipo
        ORDER BY count DESC
      `, { type: sequelize.QueryTypes.SELECT });
    } catch (e) {
      mobileRows = [];
    }

    res.status(200).json({
      success: true,
      data: {
        totalVisitas,
        visitasHoy: visitasHoyCount,
        visitasAyer: visitasAyerCount,
        visitasSemana: visitasSemanaCount,
        visitasMes: visitasMesCount,
        sesionesUnicas,
        usuariosUnicos,
        usuariosUnicosHoy,
        promedioDiario,
        avgDuration: Math.round(avgDuration),
        bounceRate,
        paginasMasVistas: paginasRows,
        visitasPorDia,
        ultimasVisitas,
        navegadores: browserRows,
        dispositivos: mobileRows,
      },
    });
  } catch (error) {
    next(error);
  }
};
