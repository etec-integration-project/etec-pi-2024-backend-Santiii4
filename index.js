import express from 'express';
import session from 'express-session';
import pool from './config/database.js'; // Configuración de la base de datos
import userRoutes from './routes/user.js';
import productRoutes from './routes/products.js';

const app = express();
app.use(express.json());

// Configuración de la sesión
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Función para inicializar la base de datos y crear las tablas
const initializeDatabase = async () => {
    const maxRetries = 2; // Reducido a 2 intentos
    let retries = 0;

    // Consulta SQL directamente en el código
    const sql = `
    
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cart_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            product_id INT,
            quantity INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        INSERT INTO products (name, description, price, stock) VALUES
        ('24 Pallets', '24 Pallets Description', 199.99, 10),
        ('12 Pallets', '12 Pallets Description', 149.99, 10);
    `;

    while (retries < maxRetries) {
        try {
            await pool.query(sql);
            console.log('Base de datos y tablas inicializadas.');
            break; // Sale del bucle si la conexión es exitosa
        } catch (error) {
            retries += 1;
            console.error(`Error al inicializar la base de datos (intento ${retries}/${maxRetries}):`, error.message);
            if (retries < maxRetries) {
                console.log('Reintentando conexión en 3 segundos...'); 
                await new Promise(res => setTimeout(res, 3000));
            } else {
                process.exit(1); // Sale si alcanzó el número máximo de reintentos
            }
        }
    }
};

// Inicializar la base de datos y luego iniciar el servidor
initializeDatabase().then(() => {
    app.use('/users', userRoutes(pool));
    app.use('/products', productRoutes(pool));

    app.listen(5000, () => {
        console.log('Servidor corriendo en http://localhost:5000');
    });
});













