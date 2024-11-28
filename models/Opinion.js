import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Opinion = sequelize.define('Opinion', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    opinion: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'opinions'
});

export default Opinion;
