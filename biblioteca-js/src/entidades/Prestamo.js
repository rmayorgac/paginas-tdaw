import { formatearFechaFlecha } from '../helpers/Funciones.js';

export class Prestamo {
    /**
     * @constructor
     * @param {object} libro - Instancia de la clase Libro.
     * @param {object} usuario - Instancia de la clase Usuario.
     */
    constructor(libro, usuario) {
        this.libro = libro;
        this.usuario = usuario;
        this.fechaPrestamo = new Date();
        this.fechaDevolucion = null; // Se establecerá al devolver
        this.multa = 0;              // Inicialmente sin multa
    }

    // Función tradicional privada (simulada con convención _)
    _diasTranscurridos(fechaInicio, fechaFin) {
        const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
        // 1000 ms * 60 s * 60 min * 24 h = milisegundos en un día
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Método tradicional
    registrarDevolucion() {
        if (!this.fechaDevolucion) {
            this.fechaDevolucion = new Date();
            this.multa = this.calcularMulta(); // Calcula la multa al registrar
            this.libro.devolver();
            return true;
        }
        return false;
    }

    // Método arrow function para cálculo
    calcularMulta = () => {
        // Solo calcula si ya hay una fecha de devolución
        if (!this.fechaDevolucion) return 0;

        const diasTranscurridos = this._diasTranscurridos(this.fechaPrestamo, this.fechaDevolucion);
        const diasBase = this.libro.diasPrestamo(); // 15 días desde Libro.js
        const diasRetraso = Math.max(0, diasTranscurridos - diasBase);

        // Multa de $2 por día de retraso
        return diasRetraso * 2;
    }

    // Método con arrow function interna
    infoPrestamo() {
        const estadoPrestamo = () => this.fechaDevolucion 
            ? `DEVUELTO el ${formatearFechaFlecha(this.fechaDevolucion)}.`
            : 'ACTIVO (pendiente de devolución).';

        return `
--- DETALLE DEL PRÉSTAMO ---
Libro: ${this.libro.descripcion} (${this.libro.isbn})
Usuario: ${this.usuario.nombre} (ID: ${this.usuario.id})
Fecha Préstamo: ${formatearFechaFlecha(this.fechaPrestamo)}
Estado: ${estadoPrestamo()}
Multa Calculada: $${this.multa}
-----------------------------
        `.trim();
    }
}