import express from 'express';
import session from 'express-session';
import pool from './config/database.js'; // Configuración de la base de datos (para SQL directo)
import userRoutes from './routes/user.js'; // Sin pool
import productRoutes from './routes/products.js'; // Si estos usan pool, lo mantenemos
import cartRoutes from './routes/cart.js'; // Importar las rutas del carrito
import cors from 'cors'; // Importamos CORS
import sequelize from './config/db.js'; // Importar Sequelize

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

// Función para inicializar la base de datos con Sequelize y crear las tablas usando SQL directo (pool)
const initializeDatabase = async () => {
    const maxRetries = 2;
    let retries = 0;

    // Sincronizar los modelos con la base de datos usando Sequelize
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente con Sequelize.');
        await sequelize.sync({ force: false }); // Sincroniza los modelos sin eliminar las tablas
        console.log('Modelos sincronizados con Sequelize.');
    } catch (error) {
        console.error('Error al sincronizar los modelos con Sequelize:', error);
    }

    // Consulta SQL directamente en el código (utilizando pool)
    const sql = `
    -- Eliminar tablas existentes si ya existen
    DROP TABLE IF EXISTS cart_items;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS orders;

    -- Crear la tabla de productos
    CREATE TABLE products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        description TEXT,
        price DECIMAL(10, 2),
        stock INT
    );

    -- Crear la tabla del carrito
    CREATE TABLE cart_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT,
        quantity INT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Solo inserta productos si no existen
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
`;

    while (retries < maxRetries) {
        try {
            await pool.query(sql); // Utiliza pool para las consultas directas
            console.log('Base de datos y tablas inicializadas (con pool).');
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
    // No pasar 'pool' a userRoutes ya que no lo necesita
    app.use('/users', userRoutes); 

    // Si 'productRoutes' y 'cartRoutes' necesitan 'pool', mantenemos esto
    app.use('/products', productRoutes(pool));
    app.use('/cart', cartRoutes(pool)); 

    app.listen(5000, '0.0.0.0', () => {
        console.log('Servidor corriendo en http://0.0.0.0:5000');
    });
});


















