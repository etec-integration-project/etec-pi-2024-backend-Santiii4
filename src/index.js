import express from "express";
import { createPool } from "mysql2/promise";
import { config } from "dotenv";

config();

const app = express();

const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    password: process.env.MYSQLDB_ROOT_PASSWORD,
    port: process.env.MYSQLDB_DOCKER_PORT,
    database: process.env.MYSQLDB_DATABASE
});

// Función para crear tablas
const createTables = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                contraseña VARCHAR(255) NOT NULL
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product VARCHAR(255) NOT NULL,
                quantity INT NOT NULL
            );
        `);

        console.log("Tables created successfully.");
        connection.release();
    } catch (err) {
        console.error("Error creating tables:", err);
    }
};

// Crear tablas al iniciar el servidor
setTimeout(createTables, 20000); // Esperar 20 segundos antes de intentar crear las tablas

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/ping", async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.json(result[0]);
});

app.listen(3000, () => {
    console.log("Server on port", 3000);
});
