// config/db.js
import { Sequelize } from 'sequelize';

// Configuración correcta de la base de datos
const sequelize = new Sequelize(
    process.env.MYSQLDB_DATABASE || 'ecommerce',
    process.env.MYSQLDB_USER || 'root',
    process.env.MYSQLDB_ROOT_PASSWORD || '123456',
    {
        host: process.env.MYSQLDB_HOST || 'mysqldb', 
        port: process.env.MYSQLDB_PORT || 3306,      
        dialect: 'mysql',
        logging: false,
    }
);

export default sequelize;