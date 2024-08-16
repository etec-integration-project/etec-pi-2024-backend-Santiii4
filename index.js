import express from 'express';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
import userRoutes from '../routes/user.js';
import productRoutes from '../routes/products.js';

// Cargar variables de entorno desde .env (opcional si estás usando Docker Compose)
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
    host: process.env.MYSQLDB_HOST || 'localhost',
    user: process.env.MYSQLDB_USER || 'root',
    password: process.env.MYSQLDB_ROOT_PASSWORD || '123456',
    port: process.env.MYSQLDB_DOCKER_PORT || 3306,
    database: process.env.MYSQLDB_DATABASE || 'ecommerce'
});

// Función para crear la base de datos y las tablas
const initializeDatabase = async () => {
    try {
        console.log('Verificando la creación de la base de datos si no existe...');
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQLDB_DATABASE}`);
        console.log(`Base de datos ${process.env.MYSQLDB_DATABASE} creada o ya existe.`);

        console.log(`Conectando a la base de datos ${process.env.MYSQLDB_DATABASE}...`);
        await pool.query(`USE ${process.env.MYSQLDB_DATABASE}`);

        console.log('Creando la tabla "usuarios" si no existe...');
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                google_id VARCHAR(255),
                apple_id VARCHAR(255),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createUsersTable);
        console.log('Tabla "usuarios" creada o ya existe.');

        console.log('Creando la tabla "productos" si no existe...');
        const createProductsTable = `
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createProductsTable);
        console.log('Tabla "productos" creada o ya existe.');

        console.log('Configuración de la base de datos y las tablas completada.');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error.message);
    }
};

// Llamada a la función para inicializar la base de datos y las tablas
initializeDatabase();

// Configuración de passport con Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE google_id = ?', [profile.id]);
        if (rows.length > 0) {
            return done(null, rows[0]);
        } else {
            const result = await pool.query('INSERT INTO usuarios (google_id, name, email) VALUES (?, ?, ?)', [profile.id, profile.displayName, profile.emails[0].value]);
            return done(null, { id: result.insertId, name: profile.displayName, email: profile.emails[0].value });
        }
    } catch (error) {
        console.error('Error durante el inicio de sesión con Google:', error);
        return done(error, null);
    }
}));

// Configuración de passport con Apple
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    key: process.env.APPLE_PRIVATE_KEY,
    callbackURL: 'http://localhost:5000/auth/apple/callback',
    passReqToCallback: false
}, async (accessToken, refreshToken, idToken, profile, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE apple_id = ?', [profile.id]);
        if (rows.length > 0) {
            return done(null, rows[0]);
        } else {
            const result = await pool.query('INSERT INTO usuarios (apple_id, name, email) VALUES (?, ?, ?)', [profile.id, profile.name, profile.email]);
            return done(null, { id: result.insertId, name: profile.name, email: profile.email });
        }
    } catch (error) {
        console.error('Error durante el inicio de sesión con Apple:', error);
        return done(error, null);
    }
}));

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        done(null, rows[0]);
    } catch (error) {
        done(error, null);
    }
});

// Rutas de autenticación de Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/home');
    }
);

// Rutas de autenticación de Apple
app.get('/auth/apple', passport.authenticate('apple'));

app.post('/auth/apple/callback',
    passport.authenticate('apple', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/home');
    }
);

// Otras rutas ya existentes
app.use('/users', userRoutes(pool));
app.use('/products', productRoutes(pool));

// Iniciar el servidor
app.listen(5000, () => {
    console.log('Servidor corriendo en http://localhost:5000');
});



