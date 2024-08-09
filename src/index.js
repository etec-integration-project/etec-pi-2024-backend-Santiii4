import express from 'express';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
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

// Configuración de passport con Google
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
        if (rows.length > 0) {
            return done(null, rows[0]);
        } else {
            const result = await pool.query('INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)', [profile.id, profile.displayName, profile.emails[0].value]);
            return done(null, { id: result.insertId, name: profile.displayName, email: profile.emails[0].value });
        }
    } catch (error) {
        console.error('Error during Google login:', error);
        return done(error, null);
    }
}));

// Configuración de passport con Apple
passport.use(new AppleStrategy({
    clientID: 'YOUR_APPLE_CLIENT_ID',
    teamID: 'YOUR_APPLE_TEAM_ID',
    keyID: 'YOUR_APPLE_KEY_ID',
    key: 'YOUR_PRIVATE_KEY_CONTENT',
    callbackURL: 'http://localhost:5000/auth/apple/callback',
    passReqToCallback: false
}, async (accessToken, refreshToken, idToken, profile, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE apple_id = ?', [profile.id]);
        if (rows.length > 0) {
            return done(null, rows[0]);
        } else {
            const result = await pool.query('INSERT INTO users (apple_id, name, email) VALUES (?, ?, ?)', [profile.id, profile.name, profile.email]);
            return done(null, { id: result.insertId, name: profile.name, email: profile.email });
        }
    } catch (error) {
        console.error('Error during Apple login:', error);
        return done(error, null);
    }
}));

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
    console.log('Server running on http://localhost:5000');
});


