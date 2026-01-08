const { Op } = require('sequelize');
const Progreso = require('../modelos/Progreso');
const Leccion = require('../modelos/Leccion');
const Inscripcion = require('../modelos/Inscripcion');
const Curso = require('../modelos/Curso');
const Usuario = require('../modelos/Usuario');

/**
 * POST /api/progreso
 * body: { leccion_id }
 */
async function marcarCompletado(req, res) {
  const { leccion_id } = req.body;

  if (!leccion_id) return res.status(400).json({ mensaje: 'leccion_id es obligatorio' });

  try {
    const leccion = await Leccion.findByPk(leccion_id);
    if (!leccion) return res.status(404).json({ mensaje: 'Lección no encontrada' });

    const inscripcion = await Inscripcion.findOne({
      where: { usuario_id: req.usuario.id, curso_id: leccion.curso_id }
    });

    if (!inscripcion) {
      return res.status(403).json({ mensaje: 'Usuario no inscrito en el curso' });
    }

    let progreso = await Progreso.findOne({
      where: { usuario_id: req.usuario.id, leccion_id: Number(leccion_id) }
    });

    if (!progreso) {
      progreso = await Progreso.create({
        usuario_id: req.usuario.id,
        leccion_id: Number(leccion_id),
        completado: true,
        completado_en: new Date()
      });
    } else {
      progreso.completado = true;
      progreso.completado_en = new Date();
      await progreso.save();
    }

    return res.json(progreso);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al registrar progreso' });
  }
}

/**
 * GET /api/progreso/curso/:curso_id/resumen
 * Admin/Instructor:
 * - valida empresa del curso
 * - lista empleados inscritos
 * - trae lecciones del curso
 * - arma resumen y detalle por empleado
 */
async function resumenCurso(req, res) {
  const cursoId = Number(req.params.curso_id);
  if (!cursoId) return res.status(400).json({ mensaje: 'curso_id inválido' });

  try {
    // 1) Validar curso dentro de la misma empresa del admin
    const curso = await Curso.findByPk(cursoId);
    if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

    if (curso.empresa_id !== req.usuario.empresa_id) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado' });
    }

    // 2) Obtener lecciones del curso (ordenadas)
    const lecciones = await Leccion.findAll({
      where: { curso_id: cursoId },
      order: [['orden', 'ASC'], ['id', 'ASC']]
    });

    const totalLecciones = lecciones.length;

    // 3) Obtener inscripciones del curso + datos de usuario
    const inscripciones = await Inscripcion.findAll({
      where: { curso_id: cursoId, estado: 'activo' },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'correo', 'rol', 'empresa_id']
      }],
      order: [['id', 'ASC']]
    });

    // Solo empleados/instructores inscritos (si quieres incluir admin inscritos también, elimina el filtro)
    const inscritos = (inscripciones || [])
      .map(i => ({
        id: i.id,
        usuario_id: i.usuario_id,
        estado: i.estado,
        usuario: i.Usuario
      }))
      .filter(x => x.usuario && x.usuario.empresa_id === req.usuario.empresa_id);

    const usuarioIds = inscritos.map(x => Number(x.usuario_id)).filter(Boolean);
    const leccionIds = lecciones.map(l => Number(l.id)).filter(Boolean);

    // 4) Traer progresos de esos usuarios en esas lecciones
    const progresos = await Progreso.findAll({
      where: {
        usuario_id: { [Op.in]: usuarioIds.length ? usuarioIds : [0] },
        leccion_id: { [Op.in]: leccionIds.length ? leccionIds : [0] }
      },
      attributes: ['usuario_id', 'leccion_id', 'completado', 'completado_en']
    });

    // index rápido: progresoPorUsuarioLeccion.get(`${u}-${l}`)
    const map = new Map();
    for (const p of (progresos || [])) {
      map.set(`${p.usuario_id}-${p.leccion_id}`, {
        completado: !!p.completado,
        completado_en: p.completado_en
      });
    }

    // 5) Armar respuesta por empleado
    const empleados = inscritos.map(x => {
      const detalle = lecciones.map(l => {
        const key = `${x.usuario_id}-${l.id}`;
        const pr = map.get(key);
        return {
          leccion_id: l.id,
          titulo: l.titulo,
          orden: l.orden,
          completado: pr ? !!pr.completado : false,
          completado_en: pr ? pr.completado_en : null
        };
      });

      const completadas = detalle.filter(d => d.completado).length;
      const porcentaje = totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0;

      return {
        usuario: {
          id: x.usuario.id,
          nombre: x.usuario.nombre,
          correo: x.usuario.correo,
          rol: x.usuario.rol
        },
        completadas,
        total: totalLecciones,
        porcentaje,
        detalle
      };
    });

    return res.json({
      curso: {
        id: curso.id,
        titulo: curso.titulo,
        empresa_id: curso.empresa_id
      },
      total_lecciones: totalLecciones,
      empleados
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al obtener resumen de progreso' });
  }
}

module.exports = { marcarCompletado, resumenCurso };