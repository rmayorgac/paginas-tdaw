const sequelize = require('../config/bd');

const Empresa = require('./Empresa');
const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Leccion = require('./Leccion');
const Inscripcion = require('./Inscripcion');
const Progreso = require('./Progreso');
const CapacitacionExterna = require('./CapacitacionExterna');

// --- Relaciones básicas ---
Empresa.hasMany(Usuario, { foreignKey: 'empresa_id' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Empresa.hasMany(Curso, { foreignKey: 'empresa_id' });
Curso.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Curso.hasMany(Leccion, { foreignKey: 'curso_id' });
Leccion.belongsTo(Curso, { foreignKey: 'curso_id' });

Usuario.hasMany(Inscripcion, { foreignKey: 'usuario_id' });
Inscripcion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Curso.hasMany(Inscripcion, { foreignKey: 'curso_id' });
Inscripcion.belongsTo(Curso, { foreignKey: 'curso_id' });

Usuario.hasMany(Progreso, { foreignKey: 'usuario_id' });
Progreso.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Leccion.hasMany(Progreso, { foreignKey: 'leccion_id' });
Progreso.belongsTo(Leccion, { foreignKey: 'leccion_id' });

Usuario.hasMany(CapacitacionExterna, { foreignKey: 'usuario_id' });
CapacitacionExterna.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = {
  sequelize,
  Empresa,
  Usuario,
  Curso,
  Leccion,
  Inscripcion,
  Progreso,
  CapacitacionExterna
};