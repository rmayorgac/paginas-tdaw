const express = require('express');
const router = express.Router();
const { registrar, iniciarSesion } = require('../controladores/autenticacion.controlador');

/**
 * POST /api/auth/registrar
 */
router.post('/registrar', registrar);

/**
 * POST /api/auth/iniciar-sesion
 */
router.post('/iniciar-sesion', iniciarSesion);

module.exports = router;
