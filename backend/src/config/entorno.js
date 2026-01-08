require('dotenv').config();

module.exports = {
  puerto: process.env.PORT || 4000,
  bd: {
    host: process.env.DB_HOST,
    puerto: process.env.DB_PORT,
    nombre: process.env.DB_NAME,
    usuario: process.env.DB_USER,
    clave: process.env.DB_PASS
  },
  secretoJwt: process.env.JWT_SECRET,
  rondasBcrypt: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  carpetaSubidas: process.env.UPLOAD_DIR || 'uploads'
};
