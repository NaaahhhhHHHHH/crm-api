const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');
const Customer = require('./customerModel');
const Service = require('./serviceModel');
const Form = require('./formModel');
const Job = require('./jobModel');

const Ticket = sequelize.define('Job', {
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
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    jid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Job,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    sid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Service,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    formid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Form,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Complete', 'Closed'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: 'The current status of the ticket',
    },
}, {
    timestamps: true,
    tableName: 'tickets'
});

module.exports = Ticket;
