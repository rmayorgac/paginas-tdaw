const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { exigirAutenticacion } = require('../middlewares/autenticacion.middleware');
const { exigirRol } = require('../middlewares/roles.middleware');

const ctrl = require('../controladores/capacitacion.controlador');

// --- Multer: evidencia ---
const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const nombreSeguro = (file.originalname || 'evidencia').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${nombreSeguro}`);
  }
});

const upload = multer({
  storage: almacenamiento,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * GET /api/capacitaciones-externas
 * - admin: ve todas las de su empresa + datos del empleado (nombre/correo)
 * - empleado: ve sólo las suyas
 */
router.get('/', exigirAutenticacion, ctrl.listar);

/**
 * POST /api/capacitaciones-externas
 * multipart/form-data:
 * - titulo
 * - proveedor
 * - evidencia (opcional)
 */
router.post('/', exigirAutenticacion, upload.single('evidencia'), ctrl.crear);

/**
 * PUT /api/capacitaciones-externas/:id/estado
 * body: { estado: 'pendiente' | 'aprobado' | 'rechazado' }
 * solo admin
 */
router.put(
  '/:id/estado',
  exigirAutenticacion,
  exigirRol(['admin']),
  ctrl.cambiarEstado
);

/**
 * DELETE /api/capacitaciones-externas/:id
 * - admin: puede eliminar cualquiera de su empresa
 * - empleado: sólo las suyas
 */
router.delete('/:id', exigirAutenticacion, ctrl.eliminar);

module.exports = router;