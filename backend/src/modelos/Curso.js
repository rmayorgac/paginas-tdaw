const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Curso = sequelize.define(
  'Curso',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    publicado: { type: DataTypes.BOOLEAN, defaultValue: false },
    creado_por: { type: DataTypes.INTEGER },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: 'courses' }
);

module.exports = Curso;
