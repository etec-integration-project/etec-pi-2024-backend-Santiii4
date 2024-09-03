import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';

config(); // Cargar variables de entorno

const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    password: process.env.MYSQLDB_ROOT_PASSWORD,
    port: process.env.MYSQLDB_DOCKER_PORT,
    database: process.env.MYSQLDB_DATABASE
});

export default pool;

