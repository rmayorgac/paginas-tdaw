const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');
const Empresa = require('./Empresa');

const Usuario = sequelize.define(
  'Usuario',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    correo: { type: DataTypes.STRING(190), allowNull: false, unique: true },
    clave: { type: DataTypes.STRING(255), allowNull: false },
    rol: {
      type: DataTypes.ENUM('admin', 'instructor', 'empleado'),
      allowNull: false,
      defaultValue: 'empleado'
    },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: 'users' }
);

Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });

module.exports = Usuario;
