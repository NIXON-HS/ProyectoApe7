const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarouselSlide = sequelize.define('carousel_slides', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo:         { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'standard' },
  titulo:       { type: DataTypes.TEXT, allowNull: true },
  subtitulo:    { type: DataTypes.TEXT, allowNull: true },
  descripcion:  { type: DataTypes.TEXT, allowNull: true },
  imagen_url:   { type: DataTypes.TEXT, allowNull: true },
  enlace:       { type: DataTypes.TEXT, allowNull: true },
  boton1_texto: { type: DataTypes.STRING(120), allowNull: true, defaultValue: 'Ver más' },
  boton2_texto: { type: DataTypes.STRING(120), allowNull: true },
  boton2_url:   { type: DataTypes.TEXT, allowNull: true },
  color_overlay:{ type: DataTypes.STRING(80), allowNull: true },
  alineacion:   { type: DataTypes.STRING(10), allowNull: true, defaultValue: 'left' },
  texto_oscuro: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  orden:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  activo:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'carousel_slides',
  timestamps: true,
});

module.exports = CarouselSlide;
