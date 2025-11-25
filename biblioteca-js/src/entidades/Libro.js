import { formatearFechaFlecha } from '../helpers/Funciones.js';

export class Libro {
  constructor(titulo, autor, isbn) {
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn;
    this.disponible = true;
    this.fechaRegistro = new Date();
  }

  // Método tradicional
  prestar() {
    if (this.disponible) {
      this.disponible = false;
      return true;
    }
    return false;
  }

  // Método flecha asignado a propiedad
  devolver = () => {
    this.disponible = true;
    console.log(`Libro devuelto: ${this.titulo}`);
  };

  // Método que usa función helper flecha
  infoRegistro() {
    return `Registrado el: ${formatearFechaFlecha(this.fechaRegistro)}`;
  }

  // Getter tradicional
  get descripcion() {
    return `${this.titulo} - ${this.autor}`;
  }

  // NUEVO: Método flecha para cálculo condicional
  diasPrestamo = () => this.disponible ? 0 : 15;

  // NUEVO: Método tradicional de consulta
  estaDisponible() {
    return this.disponible;
  }

  // Método estático existente
  static crearLibroDemo = () => new Libro("Libro Demo", "Autor Demo", "000000");

  // NUEVO: Método estático flecha con Regex
  static validarISBN = (isbn) => /^\d{6}$/.test(isbn);
}