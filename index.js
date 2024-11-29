import express from 'express';
import contactRoutes from './routes/contact.js';
import session from 'express-session';
import cors from 'cors';
import { createDatabases, createTables, pool } from './config/database.js'; // Asegúrate de exportar 'pool' en database.js
import userRoutes from './routes/user.js'; // Sin pool
import productRoutes from './routes/products.js'; // Con pool
import cartRoutes from './routes/cart.js'; // Con pool
import sequelize from './config/db.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());

// Configuración de CORS para permitir solicitudes desde cualquier origen (para producción)
app.use(cors({
    origin: '*',  // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Necesario para cookies
}));
app.use(cookieParser()); // Parser para cookies

// Configuración de la sesión
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false // Seguridad para evitar cookies no inicializadas
}));

app.get('/', (req, res) => {
  res.send('Bienvenido a la API');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes(pool));
app.use('/api/cart', cartRoutes(pool));
app.use('/api', contactRoutes);

const port = 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function initializeDatabase() {
    try {
        await createDatabases(); 
        await sequelize.sync(); 
        console.log("Tablas sincronizadas correctamente");
        await createTables(); 
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initializeDatabase();


