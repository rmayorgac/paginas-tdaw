const sequelize = require('./config/bd');
const Empresa = require('./modelos/Empresa');
const Usuario = require('./modelos/Usuario');
const bcrypt = require('bcrypt');
const entorno = require('./config/entorno');

async function inicializar() {
  await sequelize.sync();
  const [empresa] = await Empresa.findOrCreate({ where: { nombre: 'EmpresaDemo' }, defaults: { nombre: 'EmpresaDemo' }});
  const adminExistente = await Usuario.findOne({ where: { correo: 'admin@demo.com' }});
  if (!adminExistente) {
    const hashed = await bcrypt.hash('admin123', entorno.rondasBcrypt);
    await Usuario.create({ empresa_id: empresa.id, nombre: 'Administrador', correo: 'admin@demo.com', clave: hashed, rol: 'admin' });
    console.log('Usuario admin creado: admin@demo.com / admin123');
  } else {
    console.log('Usuario admin ya existe');
  }
  process.exit();
}

inicializar();
