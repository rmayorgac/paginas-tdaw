const { CapacitacionExterna, Usuario } = require('../modelos');

function esAdmin(req) {
  return req.usuario && req.usuario.rol === 'admin';
}

function tieneCampo(modelo, campo) {
  return !!(modelo && modelo.rawAttributes && modelo.rawAttributes[campo]);
}

/**
 * GET /api/capacitaciones-externas
 */
async function listar(req, res) {
  try {
    if (esAdmin(req)) {
      // Admin: ver todas las capacitaciones de empleados de SU empresa
      const items = await CapacitacionExterna.findAll({
        include: [{
          model: Usuario,
          attributes: ['id', 'nombre', 'correo', 'rol', 'empresa_id'],
          where: { empresa_id: req.usuario.empresa_id }
        }],
        order: [['id', 'DESC']]
      });
      return res.json(items);
    }

    // Empleado: sólo las suyas
    const items = await CapacitacionExterna.findAll({
      where: { usuario_id: req.usuario.id },
      order: [['id', 'DESC']]
    });

    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error al listar capacitaciones externas' });
  }
}

/**
 * POST /api/capacitaciones-externas
 */
async function crear(req, res) {
  try {
    const titulo = (req.body.titulo || '').trim();
    const proveedor = (req.body.proveedor || '').trim();

    if (!titulo) return res.status(400).json({ mensaje: 'El título es obligatorio' });
    if (!proveedor) return res.status(400).json({ mensaje: 'El proveedor es obligatorio' });

    const url_evidencia = req.file ? `/uploads/${req.file.filename}` : null;

    const payload = {
      usuario_id: req.usuario.id,
      titulo,
      proveedor,
      url_evidencia,
      estado: 'pendiente'
    };

    // Si tu modelo tiene estos campos, los inicializamos; si no, no pasa nada.
    if (tieneCampo(CapacitacionExterna, 'aprobado_por')) payload.aprobado_por = null;
    if (tieneCampo(CapacitacionExterna, 'aprobado_en')) payload.aprobado_en = null;

    const item = await CapacitacionExterna.create(payload);
    return res.status(201).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error al crear capacitación externa' });
  }
}

/**
 * PUT /api/capacitaciones-externas/:id/estado
 * (solo admin)
 */
async function cambiarEstado(req, res) {
  try {
    const id = Number(req.params.id);
    const estado = (req.body.estado || '').trim();

    if (!['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido (pendiente|aprobado|rechazado)' });
    }

    const item = await CapacitacionExterna.findByPk(id);
    if (!item) return res.status(404).json({ mensaje: 'Registro no encontrado' });

    // Validar que el registro pertenece a un usuario de la misma empresa que el admin
    const dueño = await Usuario.findByPk(item.usuario_id);
    if (!dueño || dueño.empresa_id !== req.usuario.empresa_id) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado' });
    }

    item.estado = estado;

    // Si existen los campos, guardamos quién aprobó y cuándo
    if (tieneCampo(CapacitacionExterna, 'aprobado_por')) {
      item.aprobado_por = (estado === 'pendiente') ? null : req.usuario.id;
    }
    if (tieneCampo(CapacitacionExterna, 'aprobado_en')) {
      item.aprobado_en = (estado === 'pendiente') ? null : new Date();
    }

    await item.save();
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
}

/**
 * DELETE /api/capacitaciones-externas/:id
 */
async function eliminar(req, res) {
  try {
    const id = Number(req.params.id);

    const item = await CapacitacionExterna.findByPk(id);
    if (!item) return res.status(404).json({ mensaje: 'Registro no encontrado' });

    if (esAdmin(req)) {
      const dueño = await Usuario.findByPk(item.usuario_id);
      if (!dueño || dueño.empresa_id !== req.usuario.empresa_id) {
        return res.status(403).json({ mensaje: 'Acceso no autorizado' });
      }
      await item.destroy();
      return res.json({ mensaje: 'Registro eliminado' });
    }

    // Empleado: sólo sus registros
    if (item.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado' });
    }

    await item.destroy();
    return res.json({ mensaje: 'Registro eliminado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error al eliminar registro' });
  }
}

module.exports = { listar, crear, cambiarEstado, eliminar };