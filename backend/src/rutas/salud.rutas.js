const express = require('express');
const router = express.Router();

/**
 * GET /api/salud
 * Verificación de estado del backend
 */
router.get('/', (req, res) => {
  res.status(200).json({
    estado: 'ok',
    mensaje: 'Servidor operativo',
    fecha: new Date().toISOString()
  });
});

module.exports = router;