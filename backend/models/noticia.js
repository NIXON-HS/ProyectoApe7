const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Noticia = sequelize.define('noticias', {
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
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contenido_json: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING(100),
    defaultValue: 'General',
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  }
}, {
  tableName: 'noticias',
  timestamps: false,
});

module.exports = Noticia;
