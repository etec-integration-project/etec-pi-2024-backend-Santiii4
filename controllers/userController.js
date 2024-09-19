// userController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Asumiendo que tendrás un modelo User adecuado

// Registro de usuario
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Verificar si el usuario ya existe
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ msg: 'Usuario ya registrado' });

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Guardar nuevo usuario
        user = await User.create({ name, email, password: hashedPassword });

        // Generar token
        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error en el registro de usuario:', error);  // Agrega detalles del error en los logs
        res.status(500).json({ msg: 'Error al registrar usuario', error: error.message });  // Devuelve el mensaje de error
    }
};

// Login de usuario
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

        // Generar token
        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);  // Agrega detalles del error en los logs
        res.status(500).json({ msg: 'Error en el inicio de sesión', error: error.message });  // Devuelve el mensaje de error
    }
};

