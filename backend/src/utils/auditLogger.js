const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createAuditLog = async (userId, action, details, ipAddress, userAgent) => {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: userId,
        action: action,
        details: details || {},
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      }
    });
    console.log('✅ Audit log created:', action);
    return log;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error.message);
    return null;
  }
};

module.exports = { createAuditLog };