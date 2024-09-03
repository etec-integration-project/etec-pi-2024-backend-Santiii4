// routes/cart.js

import { Router } from 'express';

const router = Router();
let cart = [];

router.get('/', (req, res) => {
  res.json(cart);
});

router.post('/add', (req, res) => {
  const { id, quantity } = req.body;
  const existingProduct = cart.find(item => item.id === id);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.push({ id, quantity });
  }
  res.json(cart);
});

router.put('/update', (req, res) => {
  const { id, quantity } = req.body;
  cart = cart.map(item => item.id === id ? { ...item, quantity } : item);
  res.json(cart);
});

router.delete('/remove/:id', (req, res) => {
  const { id } = req.params;
  cart = cart.filter(item => item.id !== parseInt(id));
  res.json(cart);
});

export default router;
