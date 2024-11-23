import { Router } from 'express';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;

export default (pool) => {
  const router = Router();

  // Middleware para asegurar cart_id único
  router.use((req, res, next) => {
      if (!req.cookies.cart_id) {
          const cartId = uuidv4();
          res.cookie('cart_id', cartId, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
          });
          req.cookies.cart_id = cartId;
      }
      next();
  });

  // Obtener el contenido del carrito
  router.get('/', async (req, res) => {
      const { cart_id } = req.cookies;
      try {
          console.log('Obteniendo carrito para cart_id:', cart_id); // Log adicional
          const [rows] = await pool.query(
              'SELECT product_id, quantity FROM cart_items WHERE cart_id = ?',
              [cart_id]
          );
          res.json(rows);
      } catch (error) {
          console.error('Error al obtener el carrito:', error); // Log detallado
          res.status(500).json({ message: "Error al obtener el carrito" });
      }
  });

  // Agregar un producto al carrito
  router.post('/add', async (req, res) => {
      const { cart_id } = req.cookies;
      const { id, quantity } = req.body;

      console.log('Intentando agregar al carrito:', { cart_id, product_id: id, quantity }); // Log detallado

      if (quantity <= 0) {
          console.log('Cantidad inválida:', quantity); // Log adicional
          return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
      }

      try {
          const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
          if (product.length === 0) {
              console.log('Producto no encontrado:', id); // Log adicional
              return res.status(404).json({ message: "Producto no encontrado" });
          }

          await pool.query(
              'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?) ' +
              'ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
              [cart_id, id, quantity]
          );

          console.log('Producto agregado con éxito al carrito:', { cart_id, product_id: id, quantity }); // Log adicional
          res.json({ message: "Producto agregado al carrito" });
      } catch (error) {
          console.error('Error interno al agregar al carrito:', error); // Log detallado
          res.status(500).json({ message: "Error al agregar el producto al carrito" });
      }
  });

  // Confirmar la compra
  router.post('/confirm', async (req, res) => {
      const { cart_id } = req.cookies;

      console.log('Confirmando compra para cart_id:', cart_id); // Log adicional

      try {
          await pool.query('START TRANSACTION');

          const [cartItems] = await pool.query(
              'SELECT product_id, quantity FROM cart_items WHERE cart_id = ?',
              [cart_id]
          );

          console.log('Items en el carrito:', cartItems); // Log adicional

          for (const item of cartItems) {
              const [product] = await pool.query('SELECT stock FROM products WHERE id = ?', [item.product_id]);

              if (!product || product[0].stock < item.quantity) {
                  console.log('Stock insuficiente para producto:', item.product_id); // Log adicional
                  await pool.query('ROLLBACK');
                  return res.status(400).json({ message: `No hay suficiente stock para el producto con id ${item.product_id}` });
              }

              await pool.query(
                  'UPDATE products SET stock = stock - ? WHERE id = ?',
                  [item.quantity, item.product_id]
              );
          }

          await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cart_id]);
          await pool.query('COMMIT');

          console.log('Compra confirmada con éxito para cart_id:', cart_id); // Log adicional
          res.json({ message: "Compra realizada con éxito" });
      } catch (error) {
          console.error('Error interno al confirmar la compra:', error); // Log detallado
          await pool.query('ROLLBACK');
          res.status(500).json({ message: "Error al confirmar la compra" });
      }
  });

  return router;
};

