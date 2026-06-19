const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeolocationCache = sequelize.define('geolocation_cache', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  country_code: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  lat: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  lon: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isp: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
}, {
  tableName: 'geolocation_cache',
  timestamps: true,
});

module.exports = GeolocationCache;
