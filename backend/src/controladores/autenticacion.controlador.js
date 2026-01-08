const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const entorno = require('../config/entorno');
const Usuario = require('../modelos/Usuario');

/**
 * POST /api/auth/registrar
 * body: { nombre, correo, clave, empresa_id, rol }
 */
async function registrar(req, res) {
  const { nombre, correo, clave, empresa_id, rol } = req.body;

  if (!correo || !clave || !empresa_id) {
    return res.status(400).json({ mensaje: 'Datos incompletos' });
  }

  try {
    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res.status(409).json({ mensaje: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(clave, entorno.rondasBcrypt);

    const usuario = await Usuario.create({
      nombre: nombre || 'Usuario',
      correo,
      clave: hash,
      empresa_id,
      rol: rol || 'empleado'
    });

    // 🔐 TOKEN CON ROL Y EMPRESA (NECESARIO PARA AUTORIZACIÓN)
    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id
      },
      entorno.secretoJwt,
      { expiresIn: '8h' }
    );

    return res.status(201).json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id
      },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
}

/**
 * POST /api/auth/iniciar-sesion
 * body: { correo, clave }
 */
async function iniciarSesion(req, res) {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ mensaje: 'Datos incompletos' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const valido = await bcrypt.compare(clave, usuario.clave);
    if (!valido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // 🔐 TOKEN CON ROL Y EMPRESA (NECESARIO PARA TODAS LAS RUTAS)
    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id
      },
      entorno.secretoJwt,
      { expiresIn: '8h' }
    );

    return res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id
      },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
}

module.exports = { registrar, iniciarSesion };