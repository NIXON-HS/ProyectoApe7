const { Visita, GeolocationCache, sequelize } = require('../models/index');
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
    const [totalRow] = await sequelize.query(`SELECT COUNT(*) as c FROM visitas`);
    const totalVisitas = parseInt(totalRow[0].c);

    const [hoyRow] = await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} = ${EC_TODAY} AND session_id IS NOT NULL`);
    const visitasHoyCount = parseInt(hoyRow[0].c);

    const [ayerRow] = await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} = (${EC_TODAY} - 1) AND session_id IS NOT NULL`);
    const visitasAyerCount = parseInt(ayerRow[0].c);

    const [semanaRow] = await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 7) AND session_id IS NOT NULL`);
    const visitasSemanaCount = parseInt(semanaRow[0].c);

    const [mesRow] = await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 30) AND session_id IS NOT NULL`);
    const visitasMesCount = parseInt(mesRow[0].c);

    const [sesionesRow] = await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 30) AND session_id IS NOT NULL`);
    const sesionesUnicas = parseInt(sesionesRow[0].c);

    const paginasRows = await sequelize.query(`
      SELECT page, COUNT(id) as count
      FROM visitas
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

exports.obtenerAnalyticsAvanzado = async (req, res, next) => {
  try {
    const periodos = {
      semanaActual: await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 7) AND ${EC_DATE} < ${EC_TODAY} AND session_id IS NOT NULL`, { type: sequelize.QueryTypes.SELECT }),
      semanaAnterior: await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 14) AND ${EC_DATE} < (${EC_TODAY} - 7) AND session_id IS NOT NULL`, { type: sequelize.QueryTypes.SELECT }),
      mesActual: await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 30) AND session_id IS NOT NULL`, { type: sequelize.QueryTypes.SELECT }),
      mesAnterior: await sequelize.query(`SELECT COUNT(DISTINCT session_id) as c FROM visitas WHERE ${EC_DATE} >= (${EC_TODAY} - 60) AND ${EC_DATE} < (${EC_TODAY} - 30) AND session_id IS NOT NULL`, { type: sequelize.QueryTypes.SELECT }),
    };

    const semanaActual = parseInt(periodos.semanaActual[0].c);
    const semanaAnterior = parseInt(periodos.semanaAnterior[0].c);
    const mesActual = parseInt(periodos.mesActual[0].c);
    const mesAnterior = parseInt(periodos.mesAnterior[0].c);

    const comparacionPeriodos = {
      semanaActual,
      semanaAnterior,
      mesActual,
      mesAnterior,
      semanaCrecimiento: semanaAnterior > 0
        ? Math.round(((semanaActual - semanaAnterior) / semanaAnterior) * 100)
        : (semanaActual > 0 ? 100 : 0),
      mesCrecimiento: mesAnterior > 0
        ? Math.round(((mesActual - mesAnterior) / mesAnterior) * 100)
        : (mesActual > 0 ? 100 : 0),
    };

    const calendario = await sequelize.query(`
      SELECT ${EC_DATE} as fecha, COUNT(DISTINCT session_id) as total
      FROM visitas
      WHERE ${EC_DATE} >= (${EC_TODAY} - 90) AND session_id IS NOT NULL
      GROUP BY ${EC_DATE}
      ORDER BY ${EC_DATE} ASC
    `, { type: sequelize.QueryTypes.SELECT });

    const mejoresPeores = await sequelize.query(`
      SELECT ${EC_DATE} as fecha, COUNT(DISTINCT session_id) as total
      FROM visitas
      WHERE ${EC_DATE} >= (${EC_TODAY} - 30) AND session_id IS NOT NULL
      GROUP BY ${EC_DATE}
      ORDER BY total DESC
    `, { type: sequelize.QueryTypes.SELECT });

    res.status(200).json({
      success: true,
      data: {
        comparacionPeriodos,
        calendario,
        mejoresDias: mejoresPeores.slice(0, 5),
        peoresDias: mejoresPeores.slice(-5).reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerMapaVisitas = async (req, res, next) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT DISTINCT ip_address FROM visitas
      WHERE ip_address IS NOT NULL AND ip_address != ''
        AND ip_address NOT LIKE '127.%'
        AND ip_address NOT LIKE '::1'
        AND ip_address NOT LIKE '::ffff:127.%'
    `);

    const ips = rows.map(r => r.ip_address).filter(ip => ip && ip.trim());

    const cache = await GeolocationCache.findAll({ raw: true });
    const cachedMap = {};
    cache.forEach(c => { cachedMap[c.ip_address] = c; });

    const uncached = ips.filter(ip => !cachedMap[ip]);
    if (uncached.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < uncached.length; i += batchSize) {
        const batch = uncached.slice(i, i + batchSize);
        try {
          const ipApiUrl = `http://ip-api.com/batch?fields=status,country,countryCode,regionName,city,lat,lon,timezone,isp`;
          const response = await fetch(ipApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch.map(ip => ({ query: ip }))),
          });
          const results = await response.json();

          for (let j = 0; j < results.length; j++) {
            const r = results[j];
            const ip = batch[j];
            if (r.status === 'success') {
              try {
                await GeolocationCache.create({
                  ip_address: ip,
                  country: r.country || null,
                  country_code: r.countryCode || null,
                  region: r.regionName || null,
                  city: r.city || null,
                  lat: r.lat || null,
                  lon: r.lon || null,
                  timezone: r.timezone || null,
                  isp: r.isp || null,
                });
                cachedMap[ip] = {
                  ip_address: ip,
                  country: r.country,
                  country_code: r.countryCode,
                  city: r.city,
                  lat: r.lat,
                  lon: r.lon,
                };
              } catch (e) {
                // duplicate key, ignore
              }
            }
          }
        } catch (e) {
          console.error('Error batch geolocating:', e.message);
        }
      }
    }

    const visitasPorIP = await sequelize.query(`
      SELECT ip_address, COUNT(*) as total
      FROM visitas
      WHERE ip_address IS NOT NULL AND ip_address != ''
        AND ip_address NOT LIKE '127.%'
        AND ip_address NOT LIKE '::1'
        AND ip_address NOT LIKE '::ffff:127.%'
      GROUP BY ip_address
    `, { type: sequelize.QueryTypes.SELECT });

    const locations = [];
    const aggregated = {};

    for (const v of visitasPorIP) {
      const geo = cachedMap[v.ip_address];
      if (geo && geo.lat && geo.lon) {
        const key = `${geo.lat},${geo.lon}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            lat: parseFloat(geo.lat),
            lon: parseFloat(geo.lon),
            city: geo.city || 'Desconocida',
            country: geo.country || 'Desconocido',
            country_code: geo.country_code || '',
            total: 0,
          };
        }
        aggregated[key].total += parseInt(v.total);
      }
    }

    for (const key of Object.keys(aggregated)) {
      locations.push(aggregated[key]);
    }

    locations.sort((a, b) => b.total - a.total);

    const porPais = {};
    for (const v of visitasPorIP) {
      const geo = cachedMap[v.ip_address];
      const pais = geo?.country || 'Desconocido';
      porPais[pais] = (porPais[pais] || 0) + parseInt(v.total);
    }

    const paises = Object.entries(porPais)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);

    res.status(200).json({
      success: true,
      data: {
        locations,
        paises,
        totalConUbicacion: locations.reduce((s, l) => s + l.total, 0),
        totalIPs: ips.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
