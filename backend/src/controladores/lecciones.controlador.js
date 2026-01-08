const { Leccion, Curso, sequelize } = require('../modelos');

function obtenerEmpresaIdDesdeReq(req) {
  return req.usuario?.empresa_id;
}

module.exports = {
  async listarPorCurso(req, res) {
    try {
      const cursoId = Number(req.params.curso_id);
      const empresaId = obtenerEmpresaIdDesdeReq(req);

      const curso = await Curso.findOne({ where: { id: cursoId, empresa_id: empresaId } });
      if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

      const lecciones = await Leccion.findAll({
        where: { curso_id: cursoId },
        order: [['orden', 'ASC'], ['id', 'ASC']]
      });

      return res.json(lecciones);
    } catch (err) {
      console.error('Error listarPorCurso:', err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  async crear(req, res) {
    try {
      const empresaId = obtenerEmpresaIdDesdeReq(req);
      const { curso_id, titulo, tipo_contenido, url_contenido, orden } = req.body;

      const curso = await Curso.findOne({ where: { id: curso_id, empresa_id: empresaId } });
      if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

      if (!titulo || !titulo.trim()) {
        return res.status(400).json({ mensaje: 'El título es obligatorio' });
      }

      const ordenNum = Number(orden || 0);
      const leccion = await Leccion.create({
        curso_id: Number(curso_id),
        titulo: titulo.trim(),
        tipo_contenido: (tipo_contenido || 'texto').trim(),
        url_contenido: url_contenido || null,
        orden: Number.isFinite(ordenNum) ? ordenNum : 0
      });

      return res.status(201).json(leccion);
    } catch (err) {
      console.error('Error crear lección:', err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  async actualizar(req, res) {
    try {
      const empresaId = obtenerEmpresaIdDesdeReq(req);
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({ mensaje: 'ID inválido' });
      }

      const leccion = await Leccion.findByPk(id);
      if (!leccion) return res.status(404).json({ mensaje: 'Lección no encontrada' });

      const curso = await Curso.findOne({ where: { id: leccion.curso_id, empresa_id: empresaId } });
      if (!curso) return res.status(403).json({ mensaje: 'Sin permiso' });

      const { titulo, tipo_contenido, url_contenido, orden } = req.body;

      if (titulo !== undefined) leccion.titulo = (titulo || '').trim();
      if (tipo_contenido !== undefined) leccion.tipo_contenido = (tipo_contenido || '').trim();
      if (url_contenido !== undefined) leccion.url_contenido = url_contenido || null;
      if (orden !== undefined) {
        const ordenNum = Number(orden || 0);
        leccion.orden = Number.isFinite(ordenNum) ? ordenNum : 0;
      }

      await leccion.save();
      return res.json(leccion);
    } catch (err) {
      console.error('Error actualizar lección:', err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  async eliminar(req, res) {
    try {
      const empresaId = obtenerEmpresaIdDesdeReq(req);
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({ mensaje: 'ID inválido' });
      }

      const leccion = await Leccion.findByPk(id);
      if (!leccion) return res.status(404).json({ mensaje: 'Lección no encontrada' });

      const curso = await Curso.findOne({ where: { id: leccion.curso_id, empresa_id: empresaId } });
      if (!curso) return res.status(403).json({ mensaje: 'Sin permiso' });

      await leccion.destroy();
      return res.json({ mensaje: 'Lección eliminada' });
    } catch (err) {
      console.error('Error eliminar lección:', err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  // --- Reordenar lecciones (drag & drop) ---
  async reordenar(req, res) {
    let t;
    try {
      const empresaId = obtenerEmpresaIdDesdeReq(req);
      const { curso_id, lecciones } = req.body;

      if (!curso_id || !Array.isArray(lecciones) || lecciones.length === 0) {
        return res.status(400).json({ mensaje: 'Datos inválidos para reordenar' });
      }

      const cursoIdNum = Number(curso_id);
      if (!Number.isFinite(cursoIdNum)) {
        return res.status(400).json({ mensaje: 'curso_id inválido' });
      }

      // Validar payload: [{id, orden}]
      const normalizadas = lecciones
        .map(x => ({ id: Number(x.id), orden: Number(x.orden) }))
        .filter(x => Number.isFinite(x.id) && Number.isFinite(x.orden));

      if (normalizadas.length !== lecciones.length) {
        return res.status(400).json({ mensaje: 'Payload de lecciones inválido (id/orden)' });
      }

      t = await sequelize.transaction();

      const curso = await Curso.findOne({
        where: { id: cursoIdNum, empresa_id: empresaId },
        transaction: t
      });
      if (!curso) {
        await t.rollback();
        return res.status(404).json({ mensaje: 'Curso no encontrado' });
      }

      const ids = normalizadas.map(x => x.id);
      const existentes = await Leccion.findAll({
        where: { id: ids, curso_id: cursoIdNum },
        transaction: t
      });

      if (existentes.length !== ids.length) {
        await t.rollback();
        return res.status(400).json({ mensaje: 'Una o más lecciones no pertenecen al curso' });
      }

      for (const item of normalizadas) {
        await Leccion.update(
          { orden: item.orden },
          { where: { id: item.id, curso_id: cursoIdNum }, transaction: t }
        );
      }

      await t.commit();
      return res.json({ mensaje: 'Orden actualizado' });
    } catch (err) {
      console.error('Error reordenar lecciones:', err);
      try {
        if (t) await t.rollback();
      } catch {}
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  // --- Adjuntar archivo ---
  async adjuntarArchivo(req, res) {
    try {
      const empresaId = obtenerEmpresaIdDesdeReq(req);
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({ mensaje: 'ID inválido' });
      }

      const leccion = await Leccion.findByPk(id);
      if (!leccion) return res.status(404).json({ mensaje: 'Lección no encontrada' });

      const curso = await Curso.findOne({ where: { id: leccion.curso_id, empresa_id: empresaId } });
      if (!curso) return res.status(403).json({ mensaje: 'Sin permiso' });

      if (!req.file) return res.status(400).json({ mensaje: 'Falta archivo (campo: archivo)' });

      leccion.tipo_contenido = 'archivo';
      leccion.url_contenido = `/uploads/${req.file.filename}`;
      await leccion.save();

      return res.json(leccion);
    } catch (err) {
      console.error('Error adjuntarArchivo:', err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }
};