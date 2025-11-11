const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
      model: DataTypes.STRING,
      before: DataTypes.JSON,
      after: DataTypes.JSON,
      operation: DataTypes.STRING,
      documentId: DataTypes.INTEGER,
      user: DataTypes.JSON,
      text: DataTypes.STRING,
      change: DataTypes.JSON,
    }, {
      tableName: 'AuditLog',
      timestamps: true,
    });

const logger = async (model, operation, object, req) => {
  auditObj = {
    model: model,
    before: operation == "update" || operation == "delete" ? object._previousDataValues : null,
    after: operation == "delete" ? null : object.dataValues,
    operation: operation,
    documentId: object.id,
    change: object.changed(),
    user: req.user,
    text: `${req.user?.name } ${operation} ${model} #${object.id}`,
  }

  if (operation == 'update') {
    if (!auditObj.change?.length) {
      return;
    }
  }
  AuditLog.create(auditObj)
}
module.exports = {AuditLog, logger};
