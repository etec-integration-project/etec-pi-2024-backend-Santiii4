import { Router } from 'express';
import { addContact, addOpinion } from '../controllers/contactController.js';

const router = Router();

// Ruta para agregar contactos
router.post('/contact/add', addContact);
router.post('/opinion/add', addOpinion);


export default router;
