/**
 * Middleware de autorización por rol.
 * Uso:
 *   permitir('admin', 'instructor')
 *   permitir('admin')
 */
function permitir(...rolesPermitidos) {
  // permitir también recibir array: permitir(['admin','instructor'])
  const roles = (rolesPermitidos.length === 1 && Array.isArray(rolesPermitidos[0]))
    ? rolesPermitidos[0]
    : rolesPermitidos;

  return (req, res, next) => {
    const rol = req.usuario?.rol;

    if (!rol) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }

    if (!roles || roles.length === 0) return next();

    if (!roles.includes(rol)) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    return next();
  };
}

/**
 * Alias para compatibilidad con el nombre usado en otras rutas.
 */
const exigirRol = (rolesArray) => permitir(rolesArray);

module.exports = permitir;
module.exports.permitir = permitir;
module.exports.exigirRol = exigirRol;