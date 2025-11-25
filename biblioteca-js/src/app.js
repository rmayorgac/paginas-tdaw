import { BibliotecaService } from './servicios/BibliotecaService.js';

const biblioteca = new BibliotecaService();

console.log("--- SISTEMA DE BIBLIOTECA: SIMULACIÓN DE PRÉSTAMOS ---");

// 1. Configuración Inicial (Datos semilla)
biblioteca.agregarLibro("Cien años de soledad", "García Márquez", "123456");
biblioteca.registrarUsuario("Ana Torres", "001");

// 2. Simular Préstamo (Uso de Arrow Function del Service)
console.log("\n> 1. Registrando préstamo...");
const prestamo = biblioteca.registrarPrestamo("123456", "001");

if (prestamo) {
    // Mostrar detalles con infoPrestamo (Arrow function interna)
    console.log(prestamo.infoPrestamo());

    console.log("\n> 2. Simulando el paso de 20 días (Espere 2 segundos)...");

    // 3. Simulación de devolución asíncrona
    setTimeout(() => {
        // MANIPULACIÓN TEMPORAL: Retrocedemos la fecha de préstamo 20 días
        // para que la matemática de _diasTranscurridos genere retraso real.
        const fechaSimulada = new Date();
        fechaSimulada.setDate(fechaSimulada.getDate() - 20);
        prestamo.fechaPrestamo = fechaSimulada;

        // Registrar Devolución (Método Tradicional)
        console.log("\n> 3. Ejecutando devolución...");
        prestamo.registrarDevolucion();
        
        // Mostrar nuevo estado con multa calculada
        console.log(prestamo.infoPrestamo());

        // 4. Buscar Préstamos por Usuario (Callback Tradicional)
        console.log("\n> 4. Auditoría de usuario '001'...");
        biblioteca.buscarPrestamosPorUsuario("001", function(resultados) {
            console.log(`   Préstamos en historial: ${resultados.length}`);
            resultados.forEach(p => {
                console.log(`   - Libro: ${p.libro.titulo} | Multa generada: $${p.multa}`);
            });
        });

        // 5. Calcular Multas Totales (Arrow Function con Reduce)
        const totalMultas = biblioteca.calcularMultasPendientes();
        console.log(`\n> 5. Balance Financiero: Total multas pendientes en sistema: $${totalMultas}`);
        
        console.log("\n--- FIN DE SIMULACIÓN ---");

    }, 2000); // 2000ms = 2 segundos de espera
} else {
    console.error("Error: No se pudo generar el préstamo (Libro no disponible o datos inválidos).");
}
