import { Router } from 'express';

const router = Router();
let cart = []; // Almacenamiento temporal del carrito

export default (pool) => {
  // Obtener el contenido del carrito
  router.get('/', (req, res) => {
    res.json(cart);
  });

  router.post('/add', async (req, res) => {
    const { id, quantity } = req.body;
    console.log(req.body);  // <-- Añade esto para depurar la solicitud
    
    if (quantity <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
    }
  
    try {
      const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      if (product.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
  
      const existingProduct = cart.find(item => item.id === id);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.push({ id, quantity });
      }
  
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error al agregar el producto al carrito" });
    }
  });
  
  // Actualizar la cantidad de un producto en el carrito
  router.put('/update', (req, res) => {
    const { id, quantity } = req.body;
    if (quantity <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
    }

    cart = cart.map(item => item.id === id ? { ...item, quantity } : item);
    res.json(cart);
  });

  // Eliminar un producto del carrito
  router.delete('/remove/:id', (req, res) => {
    const { id } = req.params;
    cart = cart.filter(item => item.id !== parseInt(id));
    res.json(cart);
  });

  return router;
};

