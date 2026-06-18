const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarouselSlide = sequelize.define('carousel_slides', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo:     { type: DataTypes.TEXT, allowNull: true },
  subtitulo:  { type: DataTypes.TEXT, allowNull: true },
  imagen_url: { type: DataTypes.TEXT, allowNull: true },
  enlace:     { type: DataTypes.TEXT, allowNull: true },
  orden:      { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  activo:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'carousel_slides',
  timestamps: true,
});

module.exports = CarouselSlide;
