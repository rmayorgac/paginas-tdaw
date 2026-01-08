async function iniciarSesion(e) {
  e.preventDefault();

  const correo = document.getElementById('correo').value.trim();
  const clave = document.getElementById('clave').value.trim();
  const estado = document.getElementById('estado');

  estado.className = 'estado';
  estado.textContent = 'Procesando...';

  try {
    const data = await apiFetch('/auth/iniciar-sesion', {
      method: 'POST',
      body: JSON.stringify({ correo, clave })
    });

    guardarToken(data.token);
    guardarUsuario(data.usuario);

    estado.className = 'estado ok';
    estado.textContent = 'Sesión iniciada. Redirigiendo...';

    // Redirección inmediata al iniciar sesión
    window.location.href = 'cursos.html';
  } catch (err) {
    estado.className = 'estado error';
    estado.textContent = err.message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Si ya hay sesión, no tiene sentido mostrar login: redirige
  const token = obtenerToken();
  if (token) {
    window.location.href = 'cursos.html';
    return;
  }

  const form = document.getElementById('formLogin');
  form.addEventListener('submit', iniciarSesion);
});