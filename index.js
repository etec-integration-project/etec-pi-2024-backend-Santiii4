import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { createDatabases, createTables, pool } from './config/database.js'; // Asegúrate de exportar 'pool' en database.js
import userRoutes from './routes/user.js'; // Sin pool
import productRoutes from './routes/products.js'; // Con pool
import cartRoutes from './routes/cart.js'; // Con pool
import sequelize from './config/db.js';

const app = express();
app.use(express.json());

// Configuración de CORS para permitir solicitudes desde cualquier origen (para producción)
app.use(cors({
    origin: '*',  // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Si necesitas enviar cookies o sesiones
}));

// Configuración de la sesión
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));


app.get('/', (req, res) => {
  res.send('Bienvenido a la API');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes(pool));
app.use('/api/cart', cartRoutes(pool));


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
