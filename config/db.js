// config/db.js
import { Sequelize } from 'sequelize';

// Configuración correcta de la base de datos
const sequelize = new Sequelize('ecommerce', 'root', '123456', {
    host: 'mysqldb',  // Usa el nombre del servicio definido en docker-compose
    dialect: 'mysql',
    logging: false,
});

export default sequelize;


