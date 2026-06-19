const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false, // 'proyecto' | 'publicacion'
  },
  accion: {
    type: DataTypes.STRING(50),
    allowNull: false, // 'crear' | 'editar'
  },
  registro_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  datos_nuevos: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pendiente', // 'pendiente' | 'aprobado' | 'rechazado'
  },
  motivo_rechazo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  procesado_en: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'solicitudes',
  timestamps: false
});

module.exports = Solicitud;
