const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const CapacitacionExterna = sequelize.define(
  'CapacitacionExterna',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(200) },
    proveedor: { type: DataTypes.STRING(200) },
    url_evidencia: { type: DataTypes.TEXT },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    aprobado_por: { type: DataTypes.INTEGER },
    aprobado_en: { type: DataTypes.DATE }
  },
  { tableName: 'external_trainings' }
);

module.exports = CapacitacionExterna;
