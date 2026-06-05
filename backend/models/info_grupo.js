const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InfoGrupo = sequelize.define('info_grupo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },

  logo_url: { type: DataTypes.TEXT, allowNull: true },

  descripcion:      { type: DataTypes.TEXT, allowNull: true },
  descripcion_json: { type: DataTypes.TEXT, allowNull: true },

  mision:      { type: DataTypes.TEXT, allowNull: true },
  mision_json: { type: DataTypes.TEXT, allowNull: true },

  objetivo_general:      { type: DataTypes.TEXT, allowNull: true },
  objetivo_general_json: { type: DataTypes.TEXT, allowNull: true },

  objetivos_especificos:      { type: DataTypes.TEXT, allowNull: true },
  objetivos_especificos_json: { type: DataTypes.TEXT, allowNull: true },

  dominio: { type: DataTypes.TEXT, allowNull: true },

  proyectos_titulo:       { type: DataTypes.TEXT, allowNull: true },
  proyectos_descripcion:  { type: DataTypes.TEXT, allowNull: true },

  publicaciones_titulo:       { type: DataTypes.TEXT, allowNull: true },
  publicaciones_descripcion:  { type: DataTypes.TEXT, allowNull: true },

  contacto_titulo:      { type: DataTypes.TEXT, allowNull: true },
  contacto_descripcion: { type: DataTypes.TEXT, allowNull: true },
  contacto_email:       { type: DataTypes.TEXT, allowNull: true },
  contacto_telefono:    { type: DataTypes.TEXT, allowNull: true },
  contacto_direccion:   { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'info_grupo',
  timestamps: false,
});

module.exports = InfoGrupo;
