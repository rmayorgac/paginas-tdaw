const { Sequelize } = require('sequelize');
const entorno = require('./entorno');

const sequelize = new Sequelize(entorno.bd.nombre, entorno.bd.usuario, entorno.bd.clave, {
  host: entorno.bd.host,
  port: entorno.bd.puerto,
  dialect: 'mysql',
  logging: false,
  define: { timestamps: false }
});

module.exports = sequelize;
