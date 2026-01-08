const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const sequelize = require('./config/bd');
const entorno = require('./config/entorno');

const app = express();

// Middlewares base
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Archivos estáticos: evidencia subida
app.use('/uploads', express.static(path.join(__dirname, '..', entorno.carpetaSubidas || 'uploads')));

// Rutas
const rutasSalud = require('./rutas/salud.rutas');
const rutasAutenticacion = require('./rutas/autenticacion.rutas');
const rutasCursos = require('./rutas/cursos.rutas');
const rutasLecciones = require('./rutas/lecciones.rutas');
const rutasInscripciones = require('./rutas/inscripciones.rutas');
const rutasProgreso = require('./rutas/progreso.rutas');
const rutasCapacitacion = require('./rutas/capacitacion.rutas');

app.use('/api/salud', rutasSalud);
app.use('/api/auth', rutasAutenticacion);
app.use('/api/cursos', rutasCursos);
app.use('/api/lecciones', rutasLecciones);
app.use('/api/inscripciones', rutasInscripciones);
app.use('/api/progreso', rutasProgreso);
app.use('/api/capacitaciones-externas', rutasCapacitacion);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('ERROR GLOBAL:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = { app, sequelize };