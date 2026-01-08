const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Progreso = sequelize.define(
  'Progreso',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    leccion_id: { type: DataTypes.INTEGER, allowNull: false },
    completado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    completado_en: { type: DataTypes.DATE }
  },
  { tableName: 'progress' }
);

module.exports = Progreso;
