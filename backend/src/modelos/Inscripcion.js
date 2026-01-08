const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Inscripcion = sequelize.define(
  'Inscripcion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    curso_id: { type: DataTypes.INTEGER, allowNull: false },
    estado: {
      type: DataTypes.ENUM('activo', 'completado'),
      allowNull: false,
      defaultValue: 'activo'
    }
  },
  { tableName: 'enrollments' }
);

module.exports = Inscripcion;
