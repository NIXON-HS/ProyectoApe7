const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Publicacion = sequelize.define('publicaciones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  resumen: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cita: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  revista_portada_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  doi_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  linea_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'linea_id'
  },
}, {
  tableName: 'publicaciones',
});

module.exports = Publicacion;
