const express = require('express');
const router = express.Router();

const autenticacion = require('../middlewares/autenticacion.middleware');
const { inscribir, listarMisInscripciones } = require('../controladores/inscripciones.controlador');

/**
 * POST /api/inscripciones
 */
router.post('/', autenticacion, inscribir);

/**
 * GET /api/inscripciones/mias
 */
router.get('/mias', autenticacion, listarMisInscripciones);

module.exports = router;