const express = require('express');
const router = express.Router();

const autenticacion = require('../middlewares/autenticacion.middleware');
const { exigirRol } = require('../middlewares/roles.middleware');

const { marcarCompletado, resumenCurso } = require('../controladores/progreso.controlador');

/**
 * POST /api/progreso
 * Empleado: marca completado (requiere estar inscrito)
 */
router.post('/', autenticacion, marcarCompletado);

/**
 * GET /api/progreso/curso/:curso_id/resumen
 * Admin/Instructor: ver progreso de empleados inscritos en un curso
 */
router.get(
  '/curso/:curso_id/resumen',
  autenticacion,
  exigirRol(['admin', 'instructor']),
  resumenCurso
);

module.exports = router;