const sequelize = require('../config/database');
const Investigador = require('./investigador');
const LineaInvestigacion = require('./linea');
const Proyecto = require('./proyecto');
const Publicacion = require('./publicacion');
const Contacto = require('./contacto');
const Usuario = require('./usuario');
const Noticia = require('./noticia');
const ProyectoInvestigador = require('./proyecto_investigador');
const PublicacionInvestigador = require('./publicacion_investigador');
const Visita = require('./visita');
const CarouselSlide = require('./carousel_slide');
const GeolocationCache = require('./geolocation_cache');

// ==========================================
// CONFIGURACIÓN DE RELACIONES (ASOCIACIONES)
// ==========================================

// 1. Relación 1:N entre Líneas de Investigación y Proyectos
LineaInvestigacion.hasMany(Proyecto, {
  foreignKey: 'linea_id',
  as: 'proyectos',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Proyecto.belongsTo(LineaInvestigacion, {
  foreignKey: 'linea_id',
  as: 'linea'
});

// 2. Relación 1:N entre Líneas de Investigación y Publicaciones (Opcional)
LineaInvestigacion.hasMany(Publicacion, {
  foreignKey: 'linea_id',
  as: 'publicaciones',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Publicacion.belongsTo(LineaInvestigacion, {
  foreignKey: 'linea_id',
  as: 'linea'
});

// 3. Relación N:M entre Investigadores y Proyectos
Investigador.belongsToMany(Proyecto, {
  through: ProyectoInvestigador,
  foreignKey: 'investigador_id',
  otherKey: 'proyecto_id',
  as: 'proyectos'
});
Proyecto.belongsToMany(Investigador, {
  through: ProyectoInvestigador,
  foreignKey: 'proyecto_id',
  otherKey: 'investigador_id',
  as: 'investigadores'
});

// 4. Relación N:M entre Investigadores y Publicaciones
Investigador.belongsToMany(Publicacion, {
  through: PublicacionInvestigador,
  foreignKey: 'investigador_id',
  otherKey: 'publicacion_id',
  as: 'publicaciones'
});
Publicacion.belongsToMany(Investigador, {
  through: PublicacionInvestigador,
  foreignKey: 'publicacion_id',
  otherKey: 'investigador_id',
  as: 'investigadores'
});

module.exports = {
  sequelize,
  Investigador,
  LineaInvestigacion,
  Proyecto,
  Publicacion,
  Contacto,
  Usuario,
  Noticia,
  ProyectoInvestigador,
  PublicacionInvestigador,
  Visita,
  CarouselSlide,
  GeolocationCache
};
