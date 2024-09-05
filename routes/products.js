import { Router } from 'express';

const router = Router();

export default (pool) => {
  // Obtener todos los productos
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM products');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los productos" });
    }
  });

  // Crear un nuevo producto
  router.post("/", async (req, res) => {
    const { name, price } = req.body;
    try {
      const result = await pool.query('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);
      res.json({ id: result.insertId, name, price });
    } catch (error) {
      res.status(500).json({ message: "Error al crear el producto" });
    }
  });

  // Obtener un producto por ID
  router.get("/:id", async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el producto" });
    }
  });

  // Actualizar un producto por ID
  router.put("/:id", async (req, res) => {
    const { name, price } = req.body;
    try {
      await pool.query('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, req.params.id]);
      res.json({ message: "Producto actualizado" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el producto" });
    }
  });

  // Eliminar un producto por ID
  router.delete("/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
      res.json({ message: "Producto eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el producto" });
    }
  });

  return router;
};




