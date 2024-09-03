import express from 'express';
import session from 'express-session';
import pool from './config/database.js'; // Configuración de la base de datos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import productRoutes from './routes/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Configuración de la sesión
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Función para inicializar la base de datos y crear las tablas con menos intentos
const initializeDatabase = async () => {
    const maxRetries = 2; // Reducido a 2 intentos
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const sql = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
            await pool.query(sql);
            console.log('Base de datos y tablas inicializadas.');
            break; // Sale del bucle si la conexión es exitosa
        } catch (error) {
            retries += 1;
            console.error(`Error al inicializar la base de datos (intento ${retries}/${maxRetries}):`, error.message);
            if (retries < maxRetries) {
                console.log('Reintentando conexión en 3 segundos...'); // Reducción del tiempo de espera a 3 segundos
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












