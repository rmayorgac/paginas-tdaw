const jwt = require('jsonwebtoken');

/**
 * Middleware: exige sesión con JWT en header:
 * Authorization: Bearer <token>
 */
function exigirAutenticacion(req, res, next) {
  try {
    const encabezado = req.headers.authorization || '';
    const token = encabezado.startsWith('Bearer ')
      ? encabezado.slice(7).trim()
      : null;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token faltante' });
    }

    const secreto = process.env.JWT_SECRET;
    if (!secreto) {
      return res.status(500).json({ mensaje: 'JWT_SECRET no configurado' });
    }

    const payload = jwt.verify(token, secreto);
    req.usuario = payload;

    return next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

/**
 * Compatibilidad:
 * - Algunas rutas esperan: const auth = require('...') (función)
 * - Otras esperan: const { exigirAutenticacion } = require('...')
 */
module.exports = exigirAutenticacion;
module.exports.exigirAutenticacion = exigirAutenticacion;