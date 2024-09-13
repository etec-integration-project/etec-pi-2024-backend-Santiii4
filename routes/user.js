import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = Router();

// Ruta de registro
router.post('/register', registerUser);

// Ruta de login
router.post('/login', loginUser);

export default router;


