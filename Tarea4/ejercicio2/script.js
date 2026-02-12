// Referencias a elementos clave del DOM
const input = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const lista = document.getElementById('lista');

// Crea y añade un nuevo <li> con el texto del input
function addItem() {
  const texto = input.value.trim();
  if (texto === '') return;

  const li = document.createElement('li');
  li.textContent = texto;
  lista.appendChild(li);

  input.value = '';
  input.focus();
}

// Evento click en el botón (forma recomendada)
addBtn.addEventListener('click', addItem);

// Permitir agregar con Enter para mejor experiencia
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addItem();
});