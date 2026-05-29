const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Investigador = sequelize.define('investigadores', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombres: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  orcid: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
  },
  correo_institucional: {
    type: DataTypes.STRING(150),
    unique: true,
    allowNull: false,
  },
  biografia: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  posicion: {
    type: DataTypes.ENUM('Director', 'Subdirector', 'Investigador'),
    allowNull: false,
  },
  foto_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  red_facebook: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  red_linkedin: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  red_instagram: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  red_telegram: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'investigadores',
});

module.exports = Investigador;
