const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');
const Customer = require('./customerModel');
const Service = require('./serviceModel');
const Form = require('./formModel');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    // additionalprice: {
    //     type: DataTypes.FLOAT,
    //     allowNull: false,
    //     defaultValue: 0,
    //     comment: 'Additional service fee'
    // },
    // monthlyprice: {
    //     type: DataTypes.FLOAT,
    //     allowNull: false,
    //     defaultValue: 0,
    //     comment: 'Monthly service fee'
    // },
    cid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Customer,
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
    budget: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    currentbudget: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    // progress: {
    //     type: DataTypes.FLOAT,
    //     allowNull: false,
    //     defaultValue: 0.0,
    //     validate: {
    //         min: 0,
    //         max: 100,
    //     },
    //     comment: 'Progress percentage of job'
    // },
    formid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Form,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    // startdate: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    //     comment: 'The start date of the job',
    // },
    // enddate: {
    //     type: DataTypes.DATE,
    //     allowNull: true,
    //     comment: 'The end date of the job. Can be null if the job is ongoing.',
    //     validate: {
    //         isAfterStartDate(value) {
    //             if (value && this.startdate && value < this.startdate) {
    //                 throw new Error('End date must be after the start date.');
    //             }
    //         }
    //     }
    // }
    status: {
        type: DataTypes.ENUM('Pending', 'Preparing', 'Running', 'Complete', 'Maintain'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: 'The current status of the job',
    },
}, {
    timestamps: true,
    tableName: 'jobs'
});

module.exports = Job;
