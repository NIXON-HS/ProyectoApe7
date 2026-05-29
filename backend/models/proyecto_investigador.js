const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProyectoInvestigador = sequelize.define('proyecto_investigador', {
  proyecto_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'proyecto_id',
    references: {
      model: 'proyectos',
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
  rol_proyecto: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'rol_proyecto'
  }
}, {
  tableName: 'proyecto_investigador',
});

module.exports = ProyectoInvestigador;
