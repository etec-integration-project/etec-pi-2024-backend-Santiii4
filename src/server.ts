import express from "express"
import { createPool, Pool } from "mysql2/promise"
import { config } from "dotenv";

config();

const app =express();

const pool: Pool = createPool({
    host: process.env.MYSQLDB_HOST || '',
    user: 'root',
    password: process.env.MYSQLDB_ROOT_PASSWORD || '',
    port: parseInt(process.env.MYSQLDB_DOCKER_PORT || '3306', 10)
});


app.get ("/", (req, res) => {
    res.send("Hello World")
})

app.get ("/ping", async (req, res) => {
    const result = await pool.query('SELECT NOW()')
    res.json(result[0])
})


app.listen(3000);
console.log("Server on port", 3000);