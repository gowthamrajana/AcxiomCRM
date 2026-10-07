const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  userId,
  action,
  entityName,
  recordId,
  oldValue,
  newValue,
  ipAddress
}) => {
  return await AuditLog.create({
    userId,
    action,
    entityName,
    recordId,
    oldValue,
    newValue,
    ipAddress
  });
};

module.exports = createAuditLog;