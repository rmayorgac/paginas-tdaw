const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');
const Curso = require('./Curso');

const Leccion = sequelize.define(
  'Leccion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    curso_id: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    tipo_contenido: {
      type: DataTypes.ENUM('video', 'texto', 'archivo', 'externo'),
      allowNull: false,
      defaultValue: 'texto'
    },
    url_contenido: { type: DataTypes.TEXT },
    orden: { type: DataTypes.INTEGER, defaultValue: 0 }
  },
  { tableName: 'lessons' }
);

Leccion.belongsTo(Curso, { foreignKey: 'curso_id' });

module.exports = Leccion;
