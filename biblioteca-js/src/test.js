import { BibliotecaService } from './servicios/BibliotecaService.js';
import { strict as assert } from 'assert';

console.log("Iniciando pruebas básicas del sistema...");

try {
    const servicio = new BibliotecaService();

    // Prueba 1: Agregar Libro y verificar conteo
    const libro = servicio.agregarLibro("El Principito", "Antoine de Saint-Exupéry", "999");
    assert.equal(servicio.libros.length, 1, "Error: El libro no se agregó correctamente al array.");
    assert.equal(libro.titulo, "El Principito", "Error: El título del libro no coincide.");
    console.log("✓ Prueba 1: Agregar libro pasada.");

    // Prueba 2: Registrar Usuario y verificar conteo
    const usuario = servicio.registrarUsuario("Test User", "T01");
    assert.equal(servicio.usuarios.length, 1, "Error: El usuario no se registró correctamente.");
    console.log("✓ Prueba 2: Registrar usuario pasada.");

    // Prueba 3: Préstamo de libro y cambio de disponibilidad
    const prestamoExitoso = usuario.tomarPrestado(libro);
    assert.equal(prestamoExitoso, true, "Error: El préstamo debería ser exitoso.");
    assert.equal(libro.disponible, false, "Error: El libro debería marcarse como no disponible.");
    assert.equal(usuario.librosPrestados.length, 1, "Error: El libro no se agregó a la lista de prestados del usuario.");
    console.log("✓ Prueba 3: Préstamo de libro pasada.");
    
    // Prueba 4: Devolución de libro y cambio de disponibilidad
    const devolucionExitosa = usuario.devolverLibro(libro);
    assert.equal(devolucionExitosa, true, "Error: La devolución debería ser exitosa.");
    assert.equal(libro.disponible, true, "Error: El libro debería marcarse como disponible después de la devolución.");
    assert.equal(usuario.librosPrestados.length, 0, "Error: El libro no se eliminó de la lista de prestados del usuario.");
    console.log("✓ Prueba 4: Devolución de libro pasada.");
    
    // Prueba 5: Verificación del historial del usuario (debe tener 2 entradas)
    assert.equal(usuario.historial.length, 2, "Error: El historial debe tener 2 acciones (préstamo y devolución).");
    console.log("✓ Prueba 5: Verificación de historial pasada.");

    console.log("\nTodas las pruebas básicas pasaron correctamente. (Se usó el módulo 'assert')");

} catch (error) {
    console.error("\n✕ ¡Falló una prueba!", error.message);
    process.exit(1);
}