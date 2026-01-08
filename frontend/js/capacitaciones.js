function renderUsuario() {
  const u = obtenerUsuario();
  const el = document.getElementById('usuarioActual');
  if (u && el) el.textContent = `${u.nombre} (${u.rol}) · Empresa ${u.empresa_id}`;
}

function esAdmin(u) {
  return u && u.rol === 'admin';
}

function badgeEstado(estado) {
  if (estado === 'aprobado') return '<span class="badge ok">Aprobado</span>';
  if (estado === 'rechazado') return '<span class="badge warn">Rechazado</span>';
  return '<span class="badge warn">Pendiente</span>';
}

function tarjetaCapacitacion(c, modoAdmin) {
  const estadoBadge = badgeEstado(c.estado);

  const evidencia = c.url_evidencia
    ? `<a class="boton" href="http://localhost:4000${c.url_evidencia}" target="_blank" rel="noreferrer">Ver evidencia</a>`
    : '<span class="badge">Sin evidencia</span>';

  // Admin recibe include del Usuario -> normalmente viene en c.Usuario
  const u = c.Usuario || null;
  const quien = modoAdmin
    ? `
      <p style="margin:6px 0 0 0;">
        Registrado por: <strong>${u ? u.nombre : `Usuario ${c.usuario_id}`}</strong>
        ${u ? `· ${u.correo} (ID ${u.id})` : ''}
      </p>
    `
    : '';

  const accionesAdmin = modoAdmin
    ? `
      <button class="boton primario" type="button" onclick="cambiarEstado(${c.id}, 'aprobado')">Aprobar</button>
      <button class="boton" type="button" onclick="cambiarEstado(${c.id}, 'rechazado')">Rechazar</button>
      <button class="boton" type="button" onclick="cambiarEstado(${c.id}, 'pendiente')">Marcar pendiente</button>
    `
    : '';

  // Ambos (admin y empleado) pueden eliminar
  const btnEliminar = `<button class="boton peligro" type="button" onclick="eliminarRegistro(${c.id})">Eliminar</button>`;

  return `
    <div class="tarjeta">
      <div class="fila" style="justify-content:space-between; gap:12px;">
        <div style="min-width:0;">
          <h3>${c.titulo || 'Capacitación externa'}</h3>
          <p>Proveedor: ${c.proveedor || 'N/D'}</p>
          ${quien}
          <div class="fila">
            ${estadoBadge}
            <span class="badge">ID ${c.id}</span>
          </div>
        </div>

        <div class="fila" style="flex-wrap:wrap;">
          ${evidencia}
          ${accionesAdmin}
          ${btnEliminar}
        </div>
      </div>
    </div>
  `;
}

async function cargarCapacitaciones() {
  exigirSesion();
  renderUsuario();

  const usuario = obtenerUsuario();
  const modoAdmin = esAdmin(usuario);

  const cont = document.getElementById('listaCapacitaciones');
  const estado = document.getElementById('estado');
  cont.innerHTML = '';

  estado.className = 'estado';
  estado.textContent = 'Cargando capacitaciones...';

  try {
    const items = await apiFetch('/capacitaciones-externas');
    cont.innerHTML = (items || []).map(c => tarjetaCapacitacion(c, modoAdmin)).join('');

    estado.className = 'estado ok';
    estado.textContent = `Registros: ${(items || []).length}`;
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al cargar';
  }
}

async function subirCapacitacion(e) {
  e.preventDefault();
  exigirSesion();

  const estado = document.getElementById('estadoSubida');
  estado.className = 'estado';
  estado.textContent = 'Subiendo...';

  try {
    const titulo = document.getElementById('titulo').value.trim();
    const proveedor = document.getElementById('proveedor').value.trim();
    const archivo = document.getElementById('evidencia').files[0];

    const fd = new FormData();
    fd.append('titulo', titulo);
    fd.append('proveedor', proveedor);
    if (archivo) fd.append('evidencia', archivo);

    await apiFetch('/capacitaciones-externas', {
      method: 'POST',
      body: fd
    });

    estado.className = 'estado ok';
    estado.textContent = 'Registro creado.';
    document.getElementById('formSubida').reset();
    await cargarCapacitaciones();
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al crear registro';
  }
}

async function cambiarEstado(id, nuevoEstado) {
  exigirSesion();

  if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

  const estado = document.getElementById('estado');
  estado.className = 'estado';
  estado.textContent = 'Actualizando estado...';

  try {
    await apiFetch(`/capacitaciones-externas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });

    estado.className = 'estado ok';
    estado.textContent = 'Estado actualizado.';
    await cargarCapacitaciones();
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al actualizar estado';
  }
}

async function eliminarRegistro(id) {
  exigirSesion();

  if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;

  const estado = document.getElementById('estado');
  estado.className = 'estado';
  estado.textContent = 'Eliminando...';

  try {
    await apiFetch(`/capacitaciones-externas/${id}`, {
      method: 'DELETE'
    });

    estado.className = 'estado ok';
    estado.textContent = 'Registro eliminado.';
    await cargarCapacitaciones();
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message || 'Error al eliminar';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnCerrar').addEventListener('click', cerrarSesion);

  document.getElementById('btnInternas').addEventListener('click', () => {
    window.location.href = 'cursos.html';
  });

  document.getElementById('btnExternas').addEventListener('click', () => {
    window.location.href = 'capacitaciones-externas.html';
  });

  document.getElementById('formSubida').addEventListener('submit', subirCapacitacion);
  cargarCapacitaciones();
});