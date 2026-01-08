const express = require('express');
const router = express.Router();

const autenticacion = require('../middlewares/autenticacion.middleware');
const permitir = require('../middlewares/roles.middleware');

const controladorCursos = require('../controladores/cursos.controlador');

if (typeof autenticacion !== 'function') {
  throw new Error('autenticacion.middleware no exporta una función');
}
if (typeof permitir !== 'function') {
  throw new Error('roles.middleware no exporta una función');
}
if (typeof controladorCursos.crearCurso !== 'function') {
  throw new Error('cursos.controlador no exporta crearCurso como función');
}

/**
 * POST /api/cursos
 */
router.post('/', autenticacion, permitir('admin', 'instructor'), controladorCursos.crearCurso);

/**
 * GET /api/cursos
 */
router.get('/', autenticacion, controladorCursos.listarCursos);

/**
 * PUT /api/cursos/:id
 */
router.put('/:id', autenticacion, permitir('admin', 'instructor'), controladorCursos.actualizarCurso);

/**
 * DELETE /api/cursos/:id
 */
router.delete('/:id', autenticacion, permitir('admin'), controladorCursos.eliminarCurso);

module.exports = router;