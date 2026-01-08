function renderUsuario() {
  const u = obtenerUsuario();
  const el = document.getElementById('usuarioActual');
  if (u && el) el.textContent = `${u.nombre} (${u.rol}) · Empresa ${u.empresa_id}`;

  // Ocultar panel de creación si NO es admin/instructor
  if (u && u.rol !== 'admin' && u.rol !== 'instructor') {
    const form = document.getElementById('formCrearCurso');
    if (form && form.closest('.panel')) form.closest('.panel').style.display = 'none';
  }
}

function esAdminOInstructor(u) {
  return u && (u.rol === 'admin' || u.rol === 'instructor');
}

async function obtenerMapaInscripciones() {
  // Devuelve Set de curso_id inscritos por el usuario actual
  try {
    const ins = await apiFetch('/inscripciones/mias');
    return new Set((ins || []).map(x => Number(x.curso_id)));
  } catch {
    return new Set();
  }
}

/* =========================
   TARJETAS
   ========================= */

function tarjetaCursoAdmin(c) {
  const publicado = c.publicado
    ? '<span class="badge ok">Publicado</span>'
    : '<span class="badge warn">Borrador</span>';

  const tituloEnc = encodeURIComponent(c.titulo || '');
  const descEnc = encodeURIComponent(c.descripcion || '');
  const pubEnc = c.publicado ? '1' : '0';

  return `
    <div class="tarjeta">
      <div class="fila" style="justify-content:space-between; gap:12px;">
        <div>
          <h3>${c.titulo}</h3>
          <p>${c.descripcion || 'Sin descripción'}</p>
          <div class="fila">
            ${publicado}
            <span class="badge">ID ${c.id}</span>
          </div>
        </div>
        <div class="fila">
          <a class="boton" href="curso.html?curso_id=${c.id}">Abrir</a>

          <button class="boton" type="button"
            onclick="editarCurso(${c.id}, '${tituloEnc}', '${descEnc}', '${pubEnc}')">
            Editar
          </button>

          <button class="boton peligro" type="button"
            onclick="eliminarCurso(${c.id}, '${tituloEnc}')">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function tarjetaCursoEmpleado(c, inscrito) {
  const btn = inscrito
    ? `<a class="boton primario" href="curso.html?curso_id=${c.id}">Continuar</a>`
    : `<button class="boton primario" type="button" onclick="inscribirme(${c.id})">Inscribirme</button>`;

  return `
    <div class="tarjeta">
      <div class="fila" style="justify-content:space-between; gap:12px;">
        <div>
          <h3>${c.titulo}</h3>
          <p>${c.descripcion || 'Sin descripción'}</p>
          <div class="fila">
            <span class="badge ok">Publicado</span>
            <span class="badge">ID ${c.id}</span>
          </div>
        </div>
        <div class="fila">
          ${btn}
        </div>
      </div>
    </div>
  `;
}

/* =========================
   CARGA / CRUD
   ========================= */

async function cargarCursos() {
  exigirSesion();
  const u = obtenerUsuario();
  renderUsuario();

  const cont = document.getElementById('listaCursos');
  const estado = document.getElementById('estado');
  cont.innerHTML = '';
  estado.className = 'estado';
  estado.textContent = 'Cargando cursos...';

  try {
    const [cursos, inscritosSet] = await Promise.all([
      apiFetch('/cursos'),
      obtenerMapaInscripciones()
    ]);

    const admin = esAdminOInstructor(u);

    // Empleado: mostrar SOLO publicados
    const lista = admin ? (cursos || []) : (cursos || []).filter(x => !!x.publicado);

    if (admin) {
      cont.innerHTML = lista.map(tarjetaCursoAdmin).join('');
    } else {
      cont.innerHTML = lista.map(c => tarjetaCursoEmpleado(c, inscritosSet.has(Number(c.id)))).join('');
    }

    estado.className = 'estado ok';
    estado.textContent = `Cursos cargados: ${lista.length}`;
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al cargar cursos';
  }
}

async function crearCurso(e) {
  e.preventDefault();
  exigirSesion();

  const titulo = document.getElementById('titulo').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const publicado = document.getElementById('publicado').checked;
  const estado = document.getElementById('estadoCrear');

  estado.className = 'estado';
  estado.textContent = 'Creando...';

  try {
    await apiFetch('/cursos', {
      method: 'POST',
      body: JSON.stringify({ titulo, descripcion, publicado })
    });
    estado.className = 'estado ok';
    estado.textContent = 'Curso creado.';
    document.getElementById('formCrearCurso').reset();
    await cargarCursos();
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al crear curso';
  }
}

/**
 * Empleado: inscribirse
 */
async function inscribirme(cursoId) {
  exigirSesion();
  try {
    await apiFetch('/inscripciones', {
      method: 'POST',
      body: JSON.stringify({ curso_id: Number(cursoId) })
    });
    alert('Inscripción realizada.');
    await cargarCursos();
  } catch (err) {
    alert(err.message || 'Error al inscribirse');
  }
}

/**
 * Admin/Instructor: eliminar curso (confirmación)
 * Nota: el backend usualmente restringe a admin.
 */
async function eliminarCurso(id, tituloEnc) {
  exigirSesion();

  const u = obtenerUsuario();
  if (!esAdminOInstructor(u)) return alert('No autorizado.');

  const titulo = decodeURIComponent(tituloEnc || '');
  const ok = confirm(
    `¿Eliminar el curso "${titulo}"?\n\nEsta acción no se puede deshacer.`
  );
  if (!ok) return;

  try {
    await apiFetch(`/cursos/${id}`, { method: 'DELETE' });
    alert('Curso eliminado.');
    await cargarCursos();
  } catch (err) {
    alert(err.message || 'Error al eliminar curso');
  }
}

/**
 * Admin: editar curso usando prompts
 * Los textos vienen URL-encoded para no romper el onclick.
 */
async function editarCurso(id, tituloEnc, descripcionEnc, publicadoEnc) {
  exigirSesion();

  const tituloActual = decodeURIComponent(tituloEnc || '');
  const descripcionActual = decodeURIComponent(descripcionEnc || '');
  const publicadoActual = publicadoEnc === '1';

  const nuevoTitulo = prompt('Nuevo título:', tituloActual);
  if (nuevoTitulo === null) return;
  const titulo = nuevoTitulo.trim();
  if (!titulo) return alert('El título es obligatorio.');

  const nuevaDesc = prompt('Nueva descripción:', descripcionActual);
  if (nuevaDesc === null) return;
  const descripcion = nuevaDesc.trim();

  const publicado = confirm(
    `Estado actual: ${publicadoActual ? 'Publicado' : 'Borrador'}\n\nAceptar = Publicado\nCancelar = Borrador`
  );

  try {
    await apiFetch(`/cursos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ titulo, descripcion, publicado })
    });
    alert('Curso actualizado correctamente.');
    await cargarCursos();
  } catch (err) {
    alert(err.message || 'Error al actualizar curso');
  }
}

/* =========================
   INIT
   ========================= */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnCerrar').addEventListener('click', cerrarSesion);

  // Ambos botones visibles en ambas vistas
  const btnInternas = document.getElementById('btnInternas');
  if (btnInternas) {
    btnInternas.addEventListener('click', () => {
      window.location.href = 'cursos.html';
    });
  }

  const btnExternas = document.getElementById('btnExternas');
  if (btnExternas) {
    btnExternas.addEventListener('click', () => {
      window.location.href = 'capacitaciones-externas.html';
    });
  }

  const form = document.getElementById('formCrearCurso');
  if (form) form.addEventListener('submit', crearCurso);

  cargarCursos();
});