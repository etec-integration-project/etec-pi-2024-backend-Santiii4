import { Router } from 'express';

const router = Router();

export default (pool) => {
  router.get("/", async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  });

  router.post("/", async (req, res) => {
    const { name, price } = req.body;
    const result = await pool.query('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);
    res.json({ id: result.insertId, name, price });
  });

  router.get("/:id", async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  });

  router.put("/:id", async (req, res) => {
    const { name, price } = req.body;
    await pool.query('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, req.params.id]);
    res.json({ message: "Product updated" });
  });

  router.delete("/:id", async (req, res) => {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: "Product deleted" });
  });

  return router;
}
