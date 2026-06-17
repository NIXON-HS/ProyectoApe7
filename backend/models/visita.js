const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visita = sequelize.define('visitas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  session_id: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.STRING(512),
    allowNull: true,
  },
  page: {
    type: DataTypes.STRING(255),
    defaultValue: '/',
    allowNull: false,
  },
}, {
  tableName: 'visitas',
  timestamps: true,
});

module.exports = Visita;
