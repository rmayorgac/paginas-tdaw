const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { exigirAutenticacion } = require('../middlewares/autenticacion.middleware');
const { exigirRol } = require('../middlewares/roles.middleware');

const leccionesControlador = require('../controladores/lecciones.controlador');

// --- Multer: subida de archivos para lecciones ---
const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const nombreSeguro = (file.originalname || 'archivo').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${nombreSeguro}`);
  }
});

const upload = multer({
  storage: almacenamiento,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- Rutas ---

// Listar por curso
router.get(
  '/curso/:curso_id',
  exigirAutenticacion,
  leccionesControlador.listarPorCurso
);

// Crear
router.post(
  '/',
  exigirAutenticacion,
  exigirRol(['admin', 'instructor']),
  leccionesControlador.crear
);

// ✅ IMPORTANTE: Reordenar DEBE ir antes que "/:id" para que no lo capture la ruta dinámica
router.put(
  '/reordenar',
  exigirAutenticacion,
  exigirRol(['admin', 'instructor']),
  leccionesControlador.reordenar
);

// Adjuntar documento a una lección
router.post(
  '/:id/archivo',
  exigirAutenticacion,
  exigirRol(['admin', 'instructor']),
  upload.single('archivo'),
  leccionesControlador.adjuntarArchivo
);

// Actualizar
router.put(
  '/:id',
  exigirAutenticacion,
  exigirRol(['admin', 'instructor']),
  leccionesControlador.actualizar
);

// Eliminar
router.delete(
  '/:id',
  exigirAutenticacion,
  exigirRol(['admin', 'instructor']),
  leccionesControlador.eliminar
);

module.exports = router;