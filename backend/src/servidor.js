const { app, sequelize } = require('./aplicacion');
const entorno = require('./config/entorno');

// Importar modelos para registrarlos en Sequelize
require('./modelos/Empresa');
require('./modelos/Usuario');
require('./modelos/Curso');
require('./modelos/Leccion');
require('./modelos/Inscripcion');
require('./modelos/Progreso');
require('./modelos/CapacitacionExterna');

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a BD exitosa');

    await sequelize.sync(); // crea tablas si no existen
    app.listen(entorno.puerto, () => {
      console.log(`Servidor ejecutándose en puerto ${entorno.puerto}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor', error);
    process.exit(1);
  }
}

iniciar();