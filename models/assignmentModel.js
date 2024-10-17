const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Employee = require('./employeeModel');
const Service = require('./serviceModel');
const Job = require('./jobModel');
const { JoinSQLFragmentsError } = require('sequelize/lib/utils/join-sql-fragments');

const Assignment = sequelize.define('Assignment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    sid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Service,
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE'
    },
    payment: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
    },
    // pay2: {
    //     type: DataTypes.FLOAT,
    //     allowNull: false,
    //     defaultValue: 0.0,
    //     comment: 'Fixed additional payment (not including percentage pay)'
    // },
    jid: {
        type: DataTypes.INTEGER,
        references: {
          model: Job,
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE'
    },
    reassignment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    expire: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    eid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id',
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('Accepted', 'Decline', 'Waiting'),
        allowNull: false,
        defaultValue: 'Waiting',
        comment: 'The current status of the assignment',
    },
    assignby: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Employee,
            key: 'id',
        },
        onDelete: 'CASCADE'
    },
}, {
    tableName: 'assignments',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['jid', 'eid']
        }
    ]
});

Assignment.belongsTo(Employee, { foreignKey: 'eid' });
Assignment.belongsTo(Job, { foreignKey: 'jid' });
module.exports = Assignment;
