// controllers/userController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Asegúrate de que este modelo esté bien configurado

// Registro de usuario
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ msg: 'Usuario ya registrado' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error en el registro de usuario:', error);
        res.status(500).json({ msg: 'Error al registrar usuario', error: error.message });
    }
};

// Login de usuario
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.cookie('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 día
        });

        res.status(200).json({ msg: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ msg: 'Error en el inicio de sesión', error: error.message });
    }
};

// Logout de usuario
export const logoutUser = (req, res) => {
    res.clearCookie('auth-token');
    res.status(200).json({ msg: 'Sesión cerrada exitosamente' });
};
