import { Router } from 'express';

const router = Router();
let cart = []; // Almacenamiento temporal del carrito

export default (pool) => {
  // Obtener todos los productos
  router.get("/", async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  });

  // Crear un nuevo producto
  router.post("/", async (req, res) => {
    const { name, price } = req.body;
    const result = await pool.query('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);
    res.json({ id: result.insertId, name, price });
  });

  // Obtener un producto por ID
  router.get("/:id", async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  });

  // Actualizar un producto por ID
  router.put("/:id", async (req, res) => {
    const { name, price } = req.body;
    await pool.query('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, req.params.id]);
    res.json({ message: "Product updated" });
  });

  // Eliminar un producto por ID
  router.delete("/:id", async (req, res) => {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: "Product deleted" });
  });

  // ===============================
  // Funcionalidad del Carrito
  // ===============================

  // Obtener el contenido del carrito
  router.get('/cart', (req, res) => {
    res.json(cart);
  });

  // Agregar un producto al carrito
  router.post('/cart/add', (req, res) => {
    const { id, quantity } = req.body;
    const existingProduct = cart.find(item => item.id === id);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.push({ id, quantity });
    }
    res.json(cart);
  });

  // Actualizar la cantidad de un producto en el carrito
  router.put('/cart/update', (req, res) => {
    const { id, quantity } = req.body;
    cart = cart.map(item => item.id === id ? { ...item, quantity } : item);
    res.json(cart);
  });

  // Eliminar un producto del carrito
  router.delete('/cart/remove/:id', (req, res) => {
    const { id } = req.params;
    cart = cart.filter(item => item.id !== parseInt(id));
    res.json(cart);
  });

  return router;
}

