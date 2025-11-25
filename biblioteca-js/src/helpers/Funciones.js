// Función tradicional
export function formatearFechaTradicional(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Función flecha equivalente
export const formatearFechaFlecha = fecha => 
  new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

// Función tradicional con this
function mostrarInfoTradicional() {
  return `Ejecutado el: ${new Date().toLocaleString()}`;
}

// Función flecha que llama a tradicional
const mostrarInfoFlecha = () => mostrarInfoTradicional();

export{mostrarInfoTradicional, mostrarInfoFlecha};