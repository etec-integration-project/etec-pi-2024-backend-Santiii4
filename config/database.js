import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';

config(); // Cargar variables de entorno

export const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    password: process.env.MYSQLDB_ROOT_PASSWORD,
    port: process.env.MYSQLDB_DOCKER_PORT,
    database: process.env.MYSQLDB_DATABASE,
    multipleStatements: true // Habilitar múltiples declaraciones
});

// Crear la base de datos y la tabla de compras
export const createDatabases = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            DROP DATABASE IF EXISTS ecommerce;
            CREATE DATABASE ecommerce;
            USE ecommerce;
        `);

        console.log("Base de datos creada correctamente.");
        connection.release();
    } catch (err) {
        console.error("Error al crear la base de datos:", err);
    }
};

// Crear las tablas necesarias, incluida la tabla de compras
export const createTables = async () => {
    try {
        const connection = await pool.getConnection();

        // Crear la tabla de productos
        await connection.query(`
          CREATE TABLE IF NOT EXISTS products (
              id INT PRIMARY KEY AUTO_INCREMENT,
              name VARCHAR(255),
              description TEXT,
              price DECIMAL(10, 2),
              stock INT
          );
        `);

        // Crear la tabla de usuarios
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);

        // Crear la tabla de items en el carrito
        await connection.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cart_id VARCHAR(255) NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);

        // Crear un índice único en la columna cart_id para permitir la referencia en la tabla purchases
        await connection.query(`
            CREATE UNIQUE INDEX idx_cart_id ON cart_items(cart_id);
        `);

        // Crear la nueva tabla de compras **sin clave foránea**
        await connection.query(`
            CREATE TABLE IF NOT EXISTS purchases (
                id_compra INT AUTO_INCREMENT PRIMARY KEY,
                cart_id VARCHAR(255) NOT NULL,
                fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
                total DECIMAL(10, 2) NOT NULL,
                productos JSON NOT NULL
            );
        `);

        // Insertar algunos productos de ejemplo si no existen
        await connection.query(`
            INSERT INTO products (name, description, price, stock)
            SELECT * FROM (SELECT '24 Pallets', '24 Pallets Description', 199.99, 10) AS tmp
            WHERE NOT EXISTS (
                SELECT name FROM products WHERE name = '24 Pallets'
            ) LIMIT 1;

            INSERT INTO products (name, description, price, stock)
            SELECT * FROM (SELECT '12 Pallets', '12 Pallets Description', 149.99, 10) AS tmp
            WHERE NOT EXISTS (
                SELECT name FROM products WHERE name = '12 Pallets'
            ) LIMIT 1;
        `);

        console.log("Tablas creadas correctamente.");
        connection.release();
    } catch (err) {
        console.error("Error al crear las tablas:", err);
    }
};






