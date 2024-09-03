import express from 'express';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import session from 'express-session';
import userRoutes from '../routes/user.js';
import productRoutes from '../routes/products.js';

config();

const app = express();
app.use(express.json());

// Configuración de la sesión
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// Configuración de la conexión a la base de datos
const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    password: process.env.MYSQLDB_ROOT_PASSWORD,
    port: process.env.MYSQLDB_DOCKER_PORT,
    database: process.env.MYSQLDB_DATABASE
});

// Función para inicializar la base de datos y crear las tablas
const initializeDatabase = async () => {
    try {
        console.log('Conectando a MySQL...');
        const connection = await pool.getConnection();
        console.log('Conexión a MySQL exitosa.');

        console.log('Verificando la creación de la base de datos si no existe...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQLDB_DATABASE}`);
        console.log(`Base de datos ${process.env.MYSQLDB_DATABASE} creada o ya existe.`);

        console.log(`Usando la base de datos ${process.env.MYSQLDB_DATABASE}...`);
        await connection.query(`USE ${process.env.MYSQLDB_DATABASE}`);

        console.log('Creando la tabla "users" si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla "users" creada o ya existe.');

        console.log('Creando la tabla "products" si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                stock INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla "products" creada o ya existe.');

        console.log('Creando la tabla "cart_items" si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                product_id INT,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabla "cart_items" creada o ya existe.');

        // Poblar la tabla de productos con datos iniciales si está vacía
        console.log('Verificando si existen productos en la tabla...');
        const [rows] = await connection.query('SELECT COUNT(*) AS count FROM products');
        if (rows[0].count === 0) {
            console.log('Tabla "products" está vacía. Insertando datos iniciales...');
            await connection.query(`
                INSERT INTO products (name, description, price, stock) VALUES
                ('24 Pallets', '24 Pallets Description', 199.99, 10),
                ('12 Pallets', '12 Pallets Description', 149.99, 10)
            `);
            console.log('Productos iniciales añadidos.');
        } else {
            console.log('Productos ya existentes en la base de datos.');
        }

        console.log('Configuración de la base de datos y las tablas completada.');
        connection.release();  // Liberar la conexión
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error.message);
        process.exit(1);  // Salir si hay un error en la inicialización de la base de datos
    }
};


// Llamada a la función para inicializar la base de datos y las tablas
initializeDatabase().then(() => {
    // Una vez que la base de datos está lista, iniciar el servidor
    app.use('/users', userRoutes(pool));
    app.use('/products', productRoutes(pool));

    app.listen(5000, () => {
        console.log('Servidor corriendo en http://localhost:5000');
    });
});





