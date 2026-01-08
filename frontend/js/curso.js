function obtenerQuery(nombre) {
  const params = new URLSearchParams(window.location.search);
  return params.get(nombre);
}

function renderUsuario() {
  const u = obtenerUsuario();
  const el = document.getElementById('usuarioActual');
  if (u && el) el.textContent = `${u.nombre} (${u.rol}) · Empresa ${u.empresa_id}`;

  // Ocultar panel "Crear lección" si no es admin/instructor
  if (u && u.rol !== 'admin' && u.rol !== 'instructor') {
    const form = document.getElementById('formCrearLeccion');
    if (form && form.closest('.panel')) form.closest('.panel').style.display = 'none';

    // Ocultar nota de admin en curso.html
    const nota = document.getElementById('notaAdmin');
    if (nota) nota.style.display = 'none';
  }
}

function esAdminOInstructor(u) {
  return u && (u.rol === 'admin' || u.rol === 'instructor');
}

let leccionesEstado = [];
let leccionArrastradaId = null;

/* =========================
   MODAL PROGRESO (ADMIN)
   ========================= */

function abrirModalProgreso() {
  const m = document.getElementById('modalProgreso');
  if (m) m.style.display = 'block';
}
function cerrarModalProgreso() {
  const m = document.getElementById('modalProgreso');
  if (m) m.style.display = 'none';
}

function renderTablaProgreso(data) {
  const cont = document.getElementById('contenidoModalProgreso');
  if (!cont) return;

  const cursoTitulo = data?.curso?.titulo || `Curso ${data?.curso?.id || ''}`;
  const total = Number(data?.total_lecciones || 0);
  const empleados = data?.empleados || [];

  const filas = empleados.map(e => {
    const u = e.usuario || {};
    const pct = Number(e.porcentaje || 0);
    return `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">
          <div><strong>${u.nombre || '—'}</strong></div>
          <div style="font-size:12px; opacity:.8;">${u.correo || ''}</div>
          <div style="font-size:12px; opacity:.8;">Rol: ${u.rol || ''}</div>
        </td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${e.completadas || 0}/${e.total || total}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${pct}%</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">
          <details>
            <summary style="cursor:pointer;">Ver detalle</summary>
            <div style="margin-top:8px;">
              ${(e.detalle || []).map(d => {
                const ok = d.completado ? '✅' : '⬜';
                const fecha = d.completado_en ? new Date(d.completado_en).toLocaleString() : '';
                return `<div style="padding:4px 0; border-bottom:1px dashed #eee;">
                  ${ok} <strong>${d.orden ?? ''}.</strong> ${d.titulo || ''} <span style="font-size:12px; opacity:.75;">${fecha}</span>
                </div>`;
              }).join('')}
            </div>
          </details>
        </td>
      </tr>
    `;
  }).join('');

  cont.innerHTML = `
    <div class="fila" style="justify-content:space-between; gap:12px; align-items:center;">
      <div>
        <div class="badge">Curso: ${cursoTitulo}</div>
      </div>
      <div class="badge">Lecciones: ${total}</div>
    </div>

    <div style="margin-top:10px; overflow:auto;">
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Empleado</th>
            <th style="text-align:center; padding:8px; border-bottom:1px solid #ddd;">Completadas</th>
            <th style="text-align:center; padding:8px; border-bottom:1px solid #ddd;">%</th>
            <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Detalle</th>
          </tr>
        </thead>
        <tbody>
          ${filas || `<tr><td colspan="4" style="padding:10px;">No hay inscripciones activas.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

async function verProgresoEmpleados(cursoId) {
  exigirSesion();
  const u = obtenerUsuario();
  if (!esAdminOInstructor(u)) return alert('No autorizado.');

  const estadoAccion = document.getElementById('estadoAccion');
  if (estadoAccion) {
    estadoAccion.className = 'estado';
    estadoAccion.textContent = 'Cargando progreso de empleados...';
  }

  try {
    const data = await apiFetch(`/progreso/curso/${cursoId}/resumen`);
    renderTablaProgreso(data);
    abrirModalProgreso();

    if (estadoAccion) {
      estadoAccion.className = 'estado ok';
      estadoAccion.textContent = 'Progreso cargado.';
    }
  } catch (err) {
    if (estadoAccion) {
      estadoAccion.className = 'estado error';
      estadoAccion.textContent = err.message || 'Error al cargar progreso';
    } else {
      alert(err.message || 'Error al cargar progreso');
    }
  }
}

function asegurarBotonProgresoAdmin(cursoId, modoAdmin) {
  const cont = document.getElementById('accionesAdminCurso');
  if (!cont) return;
  cont.innerHTML = '';

  if (!modoAdmin) return;

  const btn = document.createElement('button');
  btn.className = 'boton primario';
  btn.type = 'button';
  btn.textContent = 'Ver progreso de empleados';
  btn.addEventListener('click', () => verProgresoEmpleados(cursoId));
  cont.appendChild(btn);
}

/* =========================
   PROGRESO EMPLEADO (LOCAL)
   ========================= */

async function obtenerMapaCompletadas(cursoId) {
  const u = obtenerUsuario();
  const clave = `progreso_local_u${u?.id}_c${cursoId}`;
  try {
    const raw = localStorage.getItem(clave);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set((arr || []).map(Number));
  } catch {
    return new Set();
  }
}

function guardarCompletadaLocal(cursoId, leccionId) {
  const u = obtenerUsuario();
  const clave = `progreso_local_u${u?.id}_c${cursoId}`;
  let arr = [];
  try {
    arr = JSON.parse(localStorage.getItem(clave) || '[]');
    if (!Array.isArray(arr)) arr = [];
  } catch {
    arr = [];
  }
  if (!arr.includes(Number(leccionId))) arr.push(Number(leccionId));
  localStorage.setItem(clave, JSON.stringify(arr));
}

function actualizarResumenProgreso(total, completadas) {
  const el = document.getElementById('estadoProgreso');
  if (!el) return;
  el.className = 'estado ok';
  el.textContent = `Progreso: ${completadas}/${total} completadas`;
}

/* =========================
   UI LECCIONES
   ========================= */

function tarjetaLeccion(l, completada, modoAdmin) {
  const tipo = `<span class="badge">Tipo: ${l.tipo_contenido}</span>`;
  const orden = `<span class="badge">Orden: ${l.orden}</span>`;
  const idb = `<span class="badge">ID ${l.id}</span>`;

  const esArchivo = (l.tipo_contenido === 'archivo' && l.url_contenido);
  const verArchivo = esArchivo
    ? `<a class="boton" href="http://localhost:4000${l.url_contenido}" target="_blank" rel="noreferrer">Ver documento</a>`
    : '';

  // Admin/Instructor: NO mostrar "Marcar completado"
  const btnCompletar = modoAdmin
    ? ''
    : (completada
      ? `<button class="boton primario" type="button" disabled>Completado</button>`
      : `<button class="boton primario" type="button" data-completar="${l.id}">Marcar completado</button>`
    );

  const dragAttrs = modoAdmin ? `draggable="true"` : '';
  const dragIcono = modoAdmin ? `<span class="badge" title="Arrastrar para reordenar">↕</span>` : '';

  const controlesAdmin = modoAdmin
    ? `
      <button class="boton" type="button" data-adjuntar="${l.id}">Adjuntar documento</button>
      <input type="file" style="display:none;" data-archivo-input="${l.id}" />

      <button class="boton peligro" type="button" data-eliminar="${l.id}">
        Eliminar lección
      </button>
    `
    : '';

  return `
    <div class="tarjeta" ${dragAttrs} data-leccion-id="${l.id}">
      <div class="fila" style="justify-content:space-between; gap:12px;">
        <div style="min-width:0;">
          <h3 style="display:flex; gap:10px; align-items:center;">
            ${dragIcono}
            <span>${l.titulo}</span>
          </h3>

          <p>${
            esArchivo
              ? 'Lección con documento adjunto.'
              : ((l.url_contenido || '').toString().slice(0, 220) || 'Sin contenido')
          }</p>

          <div class="fila">${tipo}${orden}${idb}</div>
        </div>

        <div class="fila">
          ${verArchivo}
          ${controlesAdmin}
          ${btnCompletar}
        </div>
      </div>
    </div>
  `;
}

async function cargarLecciones() {
  exigirSesion();
  const u = obtenerUsuario();
  const modoAdmin = esAdminOInstructor(u);

  renderUsuario();

  const cursoId = Number(obtenerQuery('curso_id'));
  const estado = document.getElementById('estado');
  const cont = document.getElementById('listaLecciones');
  cont.innerHTML = '';

  estado.className = 'estado';
  estado.textContent = 'Cargando lecciones...';

  try {
    const lecciones = await apiFetch(`/lecciones/curso/${cursoId}`);
    leccionesEstado = lecciones;

    // Botón admin
    asegurarBotonProgresoAdmin(cursoId, modoAdmin);

    // Progreso empleado (para UI)
    const completadasSet = await obtenerMapaCompletadas(cursoId);

    cont.innerHTML = lecciones
      .map(l => tarjetaLeccion(l, completadasSet.has(Number(l.id)), modoAdmin))
      .join('');

    // Completar (solo empleado)
    cont.querySelectorAll('[data-completar]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const leccionId = Number(btn.getAttribute('data-completar'));
        await marcarCompletado(cursoId, leccionId, btn);
      });
    });

    if (modoAdmin) {
      // Adjuntar
      cont.querySelectorAll('[data-adjuntar]').forEach(btn => {
        btn.addEventListener('click', () => {
          const leccionId = Number(btn.getAttribute('data-adjuntar'));
          const input = cont.querySelector(`[data-archivo-input="${leccionId}"]`);
          input.click();

          input.onchange = async () => {
            if (!input.files || !input.files[0]) return;
            await subirArchivoLeccion(leccionId, input.files[0]);
            input.value = '';
            await cargarLecciones();
          };
        });
      });

      // Eliminar lección
      cont.querySelectorAll('[data-eliminar]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const leccionId = Number(btn.getAttribute('data-eliminar'));
          await eliminarLeccion(cursoId, leccionId);
        });
      });

      // Drag & drop (reordenar)
      habilitarDragDrop(cont, cursoId);
    }

    actualizarResumenProgreso(lecciones.length, completadasSet.size);

    estado.className = 'estado ok';
    estado.textContent = `Lecciones cargadas: ${lecciones.length}`;
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al cargar lecciones';
  }
}

function habilitarDragDrop(contenedor, cursoId) {
  const tarjetas = contenedor.querySelectorAll('[data-leccion-id]');
  tarjetas.forEach(t => {
    t.addEventListener('dragstart', () => {
      leccionArrastradaId = Number(t.getAttribute('data-leccion-id'));
      t.style.opacity = '0.6';
    });

    t.addEventListener('dragend', () => {
      leccionArrastradaId = null;
      t.style.opacity = '1';
    });

    t.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    t.addEventListener('drop', async (e) => {
      e.preventDefault();
      const destinoId = Number(t.getAttribute('data-leccion-id'));
      if (!leccionArrastradaId || leccionArrastradaId === destinoId) return;

      await reordenarEstadoYGuardar(cursoId, leccionArrastradaId, destinoId);
    });
  });
}

async function reordenarEstadoYGuardar(cursoId, origenId, destinoId) {
  const estadoAccion = document.getElementById('estadoAccion');
  if (estadoAccion) {
    estadoAccion.className = 'estado';
    estadoAccion.textContent = 'Guardando nuevo orden...';
  }

  const arr = [...leccionesEstado].sort((a, b) => (a.orden - b.orden) || (a.id - b.id));
  const idxOrigen = arr.findIndex(x => x.id === origenId);
  const idxDestino = arr.findIndex(x => x.id === destinoId);
  if (idxOrigen === -1 || idxDestino === -1) return;

  const [movida] = arr.splice(idxOrigen, 1);
  arr.splice(idxDestino, 0, movida);

  const payload = arr.map((l, i) => ({ id: l.id, orden: i + 1 }));

  try {
    await apiFetch('/lecciones/reordenar', {
      method: 'PUT',
      body: JSON.stringify({ curso_id: cursoId, lecciones: payload })
    });

    if (estadoAccion) {
      estadoAccion.className = 'estado ok';
      estadoAccion.textContent = 'Orden actualizado.';
    }
    await cargarLecciones();
  } catch (err) {
    if (estadoAccion) {
      estadoAccion.className = 'estado error';
      estadoAccion.textContent = err.message || 'Error al reordenar';
    }
  }
}

async function subirArchivoLeccion(leccionId, archivo) {
  const estadoAccion = document.getElementById('estadoAccion');
  if (estadoAccion) {
    estadoAccion.className = 'estado';
    estadoAccion.textContent = 'Subiendo documento...';
  }

  const fd = new FormData();
  fd.append('archivo', archivo);

  await apiFetch(`/lecciones/${leccionId}/archivo`, {
    method: 'POST',
    body: fd
  });

  if (estadoAccion) {
    estadoAccion.className = 'estado ok';
    estadoAccion.textContent = 'Documento adjuntado.';
  }
}

async function eliminarLeccion(cursoId, leccionId) {
  exigirSesion();
  const u = obtenerUsuario();
  if (!esAdminOInstructor(u)) return alert('No autorizado.');

  const leccion = (leccionesEstado || []).find(x => Number(x.id) === Number(leccionId));
  const titulo = leccion?.titulo || `ID ${leccionId}`;

  const ok = confirm(`¿Eliminar la lección "${titulo}"?\n\nEsta acción no se puede deshacer.`);
  if (!ok) return;

  const estadoAccion = document.getElementById('estadoAccion');
  if (estadoAccion) {
    estadoAccion.className = 'estado';
    estadoAccion.textContent = 'Eliminando lección...';
  }

  try {
    await apiFetch(`/lecciones/${leccionId}`, { method: 'DELETE' });

    if (estadoAccion) {
      estadoAccion.className = 'estado ok';
      estadoAccion.textContent = 'Lección eliminada.';
    }
    await cargarLecciones();

    const completadasSet = await obtenerMapaCompletadas(cursoId);
    actualizarResumenProgreso(leccionesEstado.length, completadasSet.size);
  } catch (err) {
    if (estadoAccion) {
      estadoAccion.className = 'estado error';
      estadoAccion.textContent = err.message || 'Error al eliminar lección';
    } else {
      alert(err.message || 'Error al eliminar lección');
    }
  }
}

async function marcarCompletado(cursoId, leccionId, btn) {
  const estado = document.getElementById('estadoAccion');
  if (estado) {
    estado.className = 'estado';
    estado.textContent = 'Registrando progreso...';
  }

  try {
    const data = await apiFetch('/progreso', {
      method: 'POST',
      body: JSON.stringify({ leccion_id: leccionId })
    });

    guardarCompletadaLocal(cursoId, leccionId);

    btn.textContent = 'Completado';
    btn.disabled = true;

    if (estado) {
      estado.className = 'estado ok';
      estado.textContent = `Progreso guardado (lección ${data.leccion_id}).`;
    }

    const completadasSet = await obtenerMapaCompletadas(cursoId);
    actualizarResumenProgreso(leccionesEstado.length, completadasSet.size);
  } catch (err) {
    if (estado) {
      estado.className = 'estado error';
      estado.textContent = err.message || 'Error al guardar progreso';
    }
  }
}

async function crearLeccion(e) {
  e.preventDefault();
  exigirSesion();

  const u = obtenerUsuario();
  if (!esAdminOInstructor(u)) return alert('No autorizado.');

  const cursoId = Number(obtenerQuery('curso_id'));
  const titulo = document.getElementById('titulo').value.trim();
  const tipo_contenido = document.getElementById('tipo_contenido').value;
  const url_contenido = document.getElementById('url_contenido').value.trim();
  const orden = Number(document.getElementById('orden').value || 0);

  const estado = document.getElementById('estadoCrear');
  estado.className = 'estado';
  estado.textContent = 'Creando lección...';

  try {
    await apiFetch('/lecciones', {
      method: 'POST',
      body: JSON.stringify({ curso_id: cursoId, titulo, tipo_contenido, url_contenido, orden })
    });
    estado.className = 'estado ok';
    estado.textContent = 'Lección creada.';
    document.getElementById('formCrearLeccion').reset();
    await cargarLecciones();
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al crear lección';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnCerrar').addEventListener('click', cerrarSesion);

  const btnVolver = document.getElementById('btnVolver');
  if (btnVolver) btnVolver.addEventListener('click', () => (window.location.href = 'cursos.html'));

  const formCrear = document.getElementById('formCrearLeccion');
  if (formCrear) formCrear.addEventListener('submit', crearLeccion);

  const btnCerrarModal = document.getElementById('btnCerrarModalProgreso');
  if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalProgreso);

  // click fuera cierra modal
  const modal = document.getElementById('modalProgreso');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModalProgreso();
    });
  }

  cargarLecciones();
});