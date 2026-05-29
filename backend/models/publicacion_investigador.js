const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicacionInvestigador = sequelize.define('publicacion_investigador', {
  publicacion_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'publicacion_id',
    references: {
      model: 'publicaciones',
      key: 'id'
    }
  },
  investigador_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'investigador_id',
    references: {
      model: 'investigadores',
      key: 'id'
    }
  },
  rol_publicacion: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'rol_publicacion'
  }
}, {
  tableName: 'publicacion_investigador',
});

module.exports = PublicacionInvestigador;
