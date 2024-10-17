const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');
const Customer = require('./customerModel');
const Service = require('./serviceModel');
const Form = sequelize.define('Form', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    cid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Customer,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    sid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Service,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
}, {
    timestamps: true,
    tableName: 'forms',
});

module.exports = Form;
