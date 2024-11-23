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

export const createDatabases = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            DROP DATABASE IF EXISTS ecommerce;
            CREATE DATABASE ecommerce;
            USE ecommerce;
        `);
  
        console.log("Databases created successfully.");
        connection.release();
    } catch (err) {
        console.error("Error creating Databases:", err);
    }
};

export const createTables = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
  
        await connection.query(`
          CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255),
                description TEXT,
                price DECIMAL(10, 2),
                stock INT          
          );
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cart_id VARCHAR(255) NOT NULL, -- Identificador único del carrito
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);
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
  
        console.log("Tables created successfully.");
        connection.release();
    } catch (err) {
        console.error("Error creating tables:", err);
    }
};
