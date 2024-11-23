import Contact from '../models/Contact.js';
import Opinion from '../models/Opinion.js';

// Agregar un contacto
export const addContact = async (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const contact = await Contact.create({ name, phone });
        res.status(201).json({ message: 'Contacto registrado con éxito', contact });
    } catch (error) {
        console.error('Error al registrar el contacto:', error);
        res.status(500).json({ message: 'Error al registrar el contacto' });
    }
};

// Agregar una opinión
export const addOpinion = async (req, res) => {
    const { name, opinion } = req.body;
    if (!name || !opinion) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const opinionRecord = await Opinion.create({ name, opinion });
        res.status(201).json({ message: 'Opinión registrada con éxito', opinion: opinionRecord });
    } catch (error) {
        console.error('Error al registrar la opinión:', error);
        res.status(500).json({ message: 'Error al registrar la opinión' });
    }
};
