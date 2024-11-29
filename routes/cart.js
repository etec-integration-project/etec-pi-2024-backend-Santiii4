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

  // Función para obtener el carrito
  const getCartItems = async (cart_id) => {
    const [rows] = await pool.query(
      'SELECT product_id, quantity FROM cart_items WHERE cart_id = ?',
      [cart_id]
    );
    return rows;
  };

  // Función para obtener un producto
  const getProduct = async (product_id) => {
    const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    return product.length ? product[0] : null;
  };

  // Obtener el contenido del carrito
  router.get('/', async (req, res) => {
    const { cart_id } = req.cookies;
    try {
      console.log('Obteniendo carrito para cart_id:', cart_id);
      const cartItems = await getCartItems(cart_id);
      res.json(cartItems);
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      res.status(500).json({ message: 'Error al obtener el carrito' });
    }
  });

  // Agregar un producto al carrito
  router.post('/add', async (req, res) => {
    const { cart_id } = req.cookies;
    const { id, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor que 0' });
    }

    try {
      const product = await getProduct(id);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [cart_id, id, quantity]
      );

      console.log('Producto agregado al carrito:', { cart_id, product_id: id, quantity });
      res.json({ message: 'Producto agregado al carrito' });
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
  });

  // Confirmar la compra
  router.post('/confirm', async (req, res) => {
    const { cart_id } = req.cookies;

    try {
      console.log("Iniciando transacción para cart_id:", cart_id);
      
      // Validar si el carrito tiene productos
      const cartItems = await getCartItems(cart_id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'El carrito está vacío.' });
      }

      // Iniciar transacción
      await pool.query('START TRANSACTION');

      // Verificar que el cart_id exista en cart_items antes de proceder
      const [cartExists] = await pool.query('SELECT 1 FROM cart_items WHERE cart_id = ?', [cart_id]);
      if (cartExists.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: 'El cart_id no existe en cart_items' });
      }

      // Verificar stock
      const productStocks = await Promise.all(cartItems.map(async (item) => {
        const product = await getProduct(item.product_id);
        return { product, quantity: item.quantity };
      }));

      for (const { product, quantity } of productStocks) {
        if (!product || product.stock < quantity) {
          console.log('Stock insuficiente para producto:', product.id);
          await pool.query('ROLLBACK');
          return res.status(400).json({ message: `No hay suficiente stock para el producto con id ${product.id}` });
        }

        // Actualizar stock de producto
        await pool.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [quantity, product.id]
        );
      }

      // Insertar compra en la tabla purchases
      const productos = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const total = productStocks.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

      // Depuración: Imprimir los datos antes de la inserción
      console.log('Datos de la compra a insertar:');
      console.log('cart_id:', cart_id);
      console.log('total:', total);
      console.log('productos:', productos);

      const [result] = await pool.query(
        'INSERT INTO purchases (cart_id, total, productos) VALUES (?, ?, ?)',
        [cart_id, total, JSON.stringify(productos)]
      );

      console.log('Compra registrada en la base de datos con id:', result.insertId);

      // Eliminar items del carrito después de la compra
      await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cart_id]);
      console.log('Items del carrito eliminados.');

      // Confirmar transacción
      await pool.query('COMMIT');
      console.log('Compra realizada con éxito para cart_id:', cart_id);
      res.json({ message: 'Compra realizada con éxito' });
    } catch (error) {
      console.error('Error al confirmar la compra:', error);
      await pool.query('ROLLBACK');
      console.log('Transacción revertida por error.');
      res.status(500).json({ message: 'Error al confirmar la compra' });
    }
  });

  return router;
};









