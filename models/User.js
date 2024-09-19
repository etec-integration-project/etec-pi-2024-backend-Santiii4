import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // Asumiendo que tienes un archivo de configuración de la base de datos

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Users',  // Forzar el uso de la tabla 'Users' con mayúscula inicial
    timestamps: false    // Si no estás usando createdAt y updatedAt, puedes deshabilitar timestamps
});

export default User;

