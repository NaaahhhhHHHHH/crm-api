const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        },
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    formData: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
          notEmpty: true,
      },
    },
    blueprint: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        checked: false,
        listE: []
      },
      validate: {
          notEmpty: true,
      },
    },
    maintain: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
            checked: false,
            period: null,
            date: null,
            remind: null,
            listE: [],
        },
        validate: {
            notEmpty: true,
        },
    }
}, {
    timestamps: true,
    tableName: 'services',
});

module.exports = Service;
