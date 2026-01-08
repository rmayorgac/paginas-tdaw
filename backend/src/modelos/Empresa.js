const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Empresa = sequelize.define(
  'Empresa',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: 'companies' }
);

module.exports = Empresa;
