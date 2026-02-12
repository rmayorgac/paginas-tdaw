// Selecciono el párrafo por su id
const parrafo = document.getElementById('miParrafo');

// Selecciono el botón por su id
const boton = document.getElementById('changeBtn');

// Función que modifica el contenido del párrafo
function changeText() {
  parrafo.textContent = 'Texto cambiado con JavaScript'; // cambio el texto
}

// Asigno el evento click al botón usando addEventListener (recomendado)
boton.addEventListener('click', changeText);