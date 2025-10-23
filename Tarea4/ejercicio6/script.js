// Referencias a elementos del DOM
const form = document.getElementById('miFormulario'); // formulario
const inputNombre = document.getElementById('nombre'); // campo nombre
const mensaje = document.getElementById('msg');       // contenedor de mensajes

// Muestra un mensaje (texto + clase) en el contenedor
function mostrarMensaje(texto, clase) {
  mensaje.textContent = texto;     // asigna el texto
  mensaje.className = clase || ''; // aplica la clase (error / success)
}

// Maneja el envío del formulario con validación simple
function validarYEnviar(e) {
  e.preventDefault();                 // evita el envío real del formulario
  const nombre = inputNombre.value.trim(); // obtiene y limpia el valor

  if (nombre === '') {
    mostrarMensaje('El nombre es obligatorio.', 'error'); // mensaje de error
    inputNombre.focus();               // foco en el campo
    return;
  }

  mostrarMensaje('Formulario enviado correctamente.', 'success'); // éxito
  // opcional: limpiar el campo tras envío correcto
  inputNombre.value = '';
}

// Evento submit (forma recomendada)
form.addEventListener('submit', validarYEnviar);