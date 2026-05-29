const app = require('./app');
const { sequelize } = require('./models/index');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('Probando conexión con PostgreSQL en la base de datos reasons_db...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente con la base de datos PostgreSQL.');

    // Sincroniza los modelos con la base de datos (force: false evita recrear y borrar datos)
    await sequelize.sync({ force: false });
    console.log('✅ Modelos Sequelize sincronizados exitosamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose exitosamente en http://localhost:${PORT}`);
      console.log(`🌐 Endpoints de la API REST disponibles bajo http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error catastrófico al levantar el servidor backend:', error);
    process.exit(1);
  }
}

startServer();
