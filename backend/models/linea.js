const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LineaInvestigacion = sequelize.define('lineas_investigacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  abreviatura: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  descripcion_larga: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  descripcion_larga_json: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'lineas_investigacion',
});

module.exports = LineaInvestigacion;
