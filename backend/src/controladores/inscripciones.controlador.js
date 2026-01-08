const Inscripcion = require('../modelos/Inscripcion');
const Curso = require('../modelos/Curso');

/**
 * POST /api/inscripciones
 * body: { curso_id, usuario_id? }
 */
async function inscribir(req, res) {
  const { curso_id, usuario_id } = req.body;

  if (!curso_id) return res.status(400).json({ mensaje: 'curso_id es obligatorio' });

  try {
    const curso = await Curso.findByPk(curso_id);
    if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

    if (curso.empresa_id !== req.usuario.empresa_id) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado' });
    }

    // Por simplicidad:
    // - empleado/instructor se inscribe a sí mismo
    // - admin puede inscribir a otros si manda usuario_id
    const objetivoUsuarioId = (req.usuario.rol === 'admin' && usuario_id) ? Number(usuario_id) : req.usuario.id;

    const existente = await Inscripcion.findOne({
      where: { usuario_id: objetivoUsuarioId, curso_id: Number(curso_id) }
    });

    if (existente) {
      return res.status(200).json({ mensaje: 'Usuario ya inscrito', inscripcion: existente });
    }

    const inscripcion = await Inscripcion.create({
      usuario_id: objetivoUsuarioId,
      curso_id: Number(curso_id),
      estado: 'activo'
    });

    return res.status(201).json(inscripcion);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al inscribir' });
  }
}

/**
 * GET /api/inscripciones/mias
 */
async function listarMisInscripciones(req, res) {
  try {
    const inscripciones = await Inscripcion.findAll({ where: { usuario_id: req.usuario.id } });
    return res.json(inscripciones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar inscripciones' });
  }
}

module.exports = { inscribir, listarMisInscripciones };