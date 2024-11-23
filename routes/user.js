import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/userController.js';

const router = Router();

// Ruta de registro
router.post('/register', registerUser);

// Ruta de login
router.post('/login', loginUser);

// Ruta de logout
router.post('/logout', logoutUser); // Nueva ruta para logout

export default router;

