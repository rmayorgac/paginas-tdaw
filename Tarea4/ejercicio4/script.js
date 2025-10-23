// Referencias a elementos del DOM
const parrafo = document.getElementById('colorParrafo'); // párrafo objetivo
const boton = document.getElementById('colorBtn');      // botón para cambiar

// Lista de colores a alternar
const colores = ['red', 'green', 'blue']; 

// Índice actual en la lista de colores
let indice = 0;

// Cambia el color del texto del párrafo al siguiente color
function cambiarColor() {
  parrafo.style.color = colores[indice];         // aplica el color
  indice = (indice + 1) % colores.length;       // avanza y envuelve el índice
}

// Evento click en el botón (forma recomendada)
boton.addEventListener('click', cambiarColor);