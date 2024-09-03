import express from 'express';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import userRoutes from '../routes/user.js';
import productRoutes from '../routes/products.js';

config();

const app = express();
app.use(express.json());

// Configuración de la sesión
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de la conexión a la base de datos
const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    password: process.env.MYSQLDB_ROOT_PASSWORD,
    port: process.env.MYSQLDB_DOCKER_PORT,
    database: process.env.MYSQLDB_DATABASE
});

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, rows[0]);
    } catch (error) {
        done(error, null);
    }
});

// Otras rutas ya existentes
app.use('/users', userRoutes(pool));
app.use('/products', productRoutes(pool));

// Iniciar el servidor
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});



