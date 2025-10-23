// Referencias a los elementos del DOM
const boton = document.getElementById('clickBtn'); // botón principal
const contador = document.getElementById('contador'); // texto del contador

// Variable que guarda el número de clics
let clics = 0;

// Incrementa el contador y actualiza el texto en pantalla
function contarClic() {
  clics++;                                  // aumenta el conteo
  contador.textContent = `Clics: ${clics}`; // actualiza el párrafo
}

// Evento click en el botón
boton.addEventListener('click', contarClic);