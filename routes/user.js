import { Router } from 'express';

const router = Router();

export default (pool) => {
  router.get("/", async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  });

  router.post("/", async (req, res) => {
    const { name, email } = req.body;
    const result = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    res.json({ id: result.insertId, name, email });
  });

  router.get("/:id", async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  });

  router.put("/:id", async (req, res) => {
    const { name, email } = req.body;
    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
    res.json({ message: "User updated" });
  });

  router.delete("/:id", async (req, res) => {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: "User deleted" });
  });

  return router;
}

