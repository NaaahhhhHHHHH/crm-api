const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OAuthClient = sequelize.define('OAuthClient', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    client_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    client_secret: {
        type: DataTypes.STRING,
        allowNull: true
    },

    client_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    redirect_uris: {
        type: DataTypes.JSON, 
        allowNull: false,
        // Example: ["https://app.com/callback", "https://app.com/auth"]
    },

    grant_types: {
        type: DataTypes.JSON,
        allowNull: false,
        // Example: ["authorization_code", "refresh_token"]
    },

    scope: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "read write"
    },

    client_type: {
        type: DataTypes.ENUM("public", "confidential"),
        allowNull: false,
        defaultValue: "confidential"
    },

    access_token_lifetime: {
        type: DataTypes.INTEGER,
        defaultValue: 3600
    },

    refresh_token_lifetime: {
        type: DataTypes.INTEGER,
        defaultValue: 604800
    }
}, {
    timestamps: true,
    tableName: "oauth_clients"
});

module.exports = OAuthClient;
