const Curso = require('../modelos/Curso');

async function crearCurso(req, res) {
  const { titulo, descripcion, publicado } = req.body;

  if (!titulo) return res.status(400).json({ mensaje: 'El título es obligatorio' });

  try {
    const curso = await Curso.create({
      empresa_id: req.usuario.empresa_id,
      titulo,
      descripcion: descripcion || null,
      publicado: typeof publicado !== 'undefined' ? Boolean(publicado) : false,
      creado_por: req.usuario.id
    });
    return res.status(201).json(curso);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al crear el curso' });
  }
}

async function listarCursos(req, res) {
  try {
    const cursos = await Curso.findAll({ where: { empresa_id: req.usuario.empresa_id } });
    return res.json(cursos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al obtener cursos' });
  }
}

async function actualizarCurso(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, publicado } = req.body;

  try {
    const curso = await Curso.findByPk(id);
    if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

    if (curso.empresa_id !== req.usuario.empresa_id) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado' });
    }

    await curso.update({
      titulo: typeof titulo !== 'undefined' ? titulo : curso.titulo,
      descripcion: typeof descripcion !== 'undefined' ? descripcion : curso.descripcion,
      publicado: typeof publicado !== 'undefined' ? Boolean(publicado) : curso.publicado
    });

    return res.json(curso);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al actualizar curso' });
  }
}

async function eliminarCurso(req, res) {
  const { id } = req.params;

  try {
    const curso = await Curso.findByPk(id);
    if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

    if (curso.empresa_id !== req.usuario.empresa_id) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado' });
    }

    await curso.destroy();
    return res.json({ mensaje: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al eliminar curso' });
  }
}

module.exports = { crearCurso, listarCursos, actualizarCurso, eliminarCurso };