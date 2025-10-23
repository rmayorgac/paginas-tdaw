// Referencias a elementos del DOM
const toggleBtn = document.getElementById('toggleBtn'); // botón alternar
const bloque = document.getElementById('bloque');       // bloque a mostrar/ocultar

// Alterna la visibilidad del bloque
function toggleVisibility() {
  // Si tiene la clase 'oculto', se quita para mostrar; si no, se agrega para ocultar
  bloque.classList.toggle('oculto');
  // Actualiza el texto del botón según el estado
  const visible = !bloque.classList.contains('oculto'); // true si visible
  toggleBtn.textContent = visible ? 'Ocultar' : 'Mostrar';
}

// Evento click en el botón (forma recomendada)
toggleBtn.addEventListener('click', toggleVisibility);

// Inicializa el texto del botón acorde al estado inicial
(function init() {
  const visible = !bloque.classList.contains('oculto');
  toggleBtn.textContent = visible ? 'Ocultar' : 'Mostrar';
})();