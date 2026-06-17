const { Visita, sequelize } = require('../models/index');
const { Op, fn, col, literal } = require('sequelize');

exports.registrarVisita = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;
    const ua = req.headers['user-agent'] || null;
    const sessionId = req.body.session_id || null;
    const page = req.body.page || '/';

    if (sessionId) {
      const existente = await Visita.findOne({
        where: {
          session_id: sessionId,
          created_at: { [Op.gte]: literal("CURRENT_DATE") },
        },
        order: [['created_at', 'DESC']],
      });
      if (existente) {
        const total = await Visita.count();
        return res.status(200).json({ success: true, data: { contador: total } });
      }
    }

    const registro = await Visita.create({
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

    const visitasHoy = await Visita.count({
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE") } }
    });
    const visitasAyer = await Visita.count({
      where: {
        [Op.and]: [
          { created_at: { [Op.gte]: literal("CURRENT_DATE - INTERVAL '1 day'") } },
          { created_at: { [Op.lt]: literal("CURRENT_DATE") } }
        ]
      }
    });
    const visitasSemana = await Visita.count({
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE - INTERVAL '7 days'") } }
    });
    const visitasMes = await Visita.count({
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE - INTERVAL '30 days'") } }
    });

    const sesionesUnicas = await Visita.count({
      col: 'session_id',
      distinct: true,
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE - INTERVAL '30 days'") } },
    });

    const paginasRows = await Visita.findAll({
      attributes: ['page', [fn('COUNT', col('id')), 'count']],
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE - INTERVAL '30 days'") } },
      group: ['page'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const usuariosUnicos = await Visita.count({
      col: 'ip_address',
      distinct: true,
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE - INTERVAL '30 days'") } },
    });

    const usuariosUnicosHoy = await Visita.count({
      col: 'ip_address',
      distinct: true,
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE") } },
    });

    const visitasPorDia = await Visita.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'fecha'],
        [fn('COUNT', fn('DISTINCT', col('session_id'))), 'total'],
      ],
      where: { created_at: { [Op.gte]: literal("CURRENT_DATE - INTERVAL '30 days'") }, session_id: { [Op.ne]: null } },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    });

    const ultimasVisitas = await Visita.findAll({
      attributes: ['id', 'session_id', 'ip_address', 'page', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 15,
      raw: true,
    });

    const promedioDiario = visitasMes / 30;

    let avgDuration = 0;
    try {
      const duracionResult = await sequelize.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (v2.created_at - v1.created_at))) as segundos
        FROM visitas v1
        INNER JOIN visitas v2 ON v1.session_id = v2.session_id AND v2.created_at = (
          SELECT MIN(v3.created_at) FROM visitas v3 WHERE v3.session_id = v1.session_id AND v3.created_at > v1.created_at
        )
        WHERE v1.created_at >= CURRENT_DATE - INTERVAL '7 days' AND v1.session_id IS NOT NULL
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
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
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
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
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
        visitasHoy,
        visitasAyer,
        visitasSemana,
        visitasMes,
        sesionesUnicas,
        usuariosUnicos,
        usuariosUnicosHoy,
        promedioDiario: Math.round(promedioDiario),
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
