const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proyecto = sequelize.define('proyectos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  objetivos: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resultados: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('Activo', 'Finalizado', 'Propuesta'),
    defaultValue: 'Activo',
    allowNull: false,
  },
  linea_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'linea_id'
  },
}, {
  tableName: 'proyectos',
});

module.exports = Proyecto;
