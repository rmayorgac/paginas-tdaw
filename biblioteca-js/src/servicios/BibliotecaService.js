import { Libro } from '../entidades/Libro.js';
import { Usuario } from '../entidades/Usuario.js';
import { Prestamo } from '../entidades/Prestamo.js'; // Importar nueva clase
import { formatearFechaTradicional } from '../helpers/Funciones.js';

export class BibliotecaService {
  constructor() {
    this.libros = [];
    this.usuarios = [];
    this.prestamos = []; // NUEVO: Array de préstamos
    this.inicioSistema = new Date();
  }

  // Función tradicional
  agregarLibro(titulo, autor, isbn) {
    const libro = new Libro(titulo, autor, isbn);
    this.libros.push(libro);
    return libro;
  }

  // Función flecha asignada a propiedad
  registrarUsuario = (nombre, id) => {
    const usuario = new Usuario(nombre, id);
    this.usuarios.push(usuario);
    return usuario;
  };

  // Método que usa función tradicional externa
  infoSistema() {
    return `Sistema iniciado el: ${formatearFechaTradicional(this.inicioSistema)}`;
  }

  // Método con callback tradicional
  buscarLibroPorTitulo(titulo, callback) {
    const resultado = this.libros.filter(function(libro) {
      return libro.titulo.toLowerCase().includes(titulo.toLowerCase());
    });
    callback(resultado);
  }

  // Método con callback flecha
  buscarUsuarioPorNombre(nombre, callback) {
    const resultado = this.usuarios.filter(user => 
      user.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
    callback(resultado);
  }

  // NUEVO (Parte 3): Registrar préstamo (Arrow Function)
  registrarPrestamo = (libroId, usuarioId) => {
    const libro = this.libros.find(l => l.isbn === libroId);
    const usuario = this.usuarios.find(u => u.id === usuarioId);

    if (libro && usuario && libro.estaDisponible()) {
      const nuevoPrestamo = new Prestamo(libro, usuario);
      this.prestamos.push(nuevoPrestamo);
      usuario.tomarPrestado(libro); // Actualiza estado del usuario y libro
      return nuevoPrestamo; // Retorna el objeto préstamo
    }
    return null;
  };

  // NUEVO (Parte 3): Buscar préstamos (Tradicional con Callback)
  buscarPrestamosPorUsuario(usuarioId, callback) {
    const resultados = this.prestamos.filter(p => p.usuario.id === usuarioId);
    callback(resultados);
  }

  // NUEVO (Parte 3): Calcular multas (Arrow Function con Reduce)
  calcularMultasPendientes = () => 
    this.prestamos.reduce((total, prestamo) => total + prestamo.multa, 0);
}