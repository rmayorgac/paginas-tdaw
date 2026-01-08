const API_BASE = 'http://localhost:4000/api';

function guardarToken(token) {
  localStorage.setItem('token', token);
}
function obtenerToken() {
  return localStorage.getItem('token');
}
function guardarUsuario(usuario) {
  localStorage.setItem('usuario', JSON.stringify(usuario));
}
function obtenerUsuario() {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

function exigirSesion() {
  const token = obtenerToken();
  if (!token) window.location.href = 'login.html';
  return token;
}

async function apiFetch(ruta, opciones = {}) {
  const token = obtenerToken();
  const headers = opciones.headers ? { ...opciones.headers } : {};

  if (!headers['Content-Type'] && !(opciones.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });
  const texto = await res.text();

  let data;
  try { data = texto ? JSON.parse(texto) : null; }
  catch { data = { mensaje: texto }; }

  if (!res.ok) {
    const mensaje = data?.mensaje || `Error HTTP ${res.status}`;
    throw new Error(mensaje);
  }
  return data;
}