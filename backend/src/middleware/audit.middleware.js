const pool = require('../config/db');

function auditLogger(moduleName, actionName) {
  return async (req, res, next) => {
    // Intercept response finish
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 400 && req.method !== 'GET') {
        try {
          const userId = req.user ? req.user.id : null;
          const userType = req.user ? req.user.role : 'guest';
          const userName = req.user ? req.user.name : 'Unknown';
          const recordId = req.params.id || (req.body && (req.body.id || req.body.student_id || req.body.invoice_id)) || null;
          const ipAddress = req.ip || req.connection.remoteAddress;
          const newValues = JSON.stringify(req.body || {});

          await pool.query(
            `INSERT INTO audit_logs (user_id, user_type, user_name, action, module, record_id, ip_address, new_values)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, userType, userName, actionName || req.method, moduleName, recordId ? String(recordId) : null, ipAddress, newValues]
          );
        } catch (err) {
          console.error('[AuditLog] Failed to record audit log:', err.message);
        }
      }
    });

    next();
  };
}

module.exports = auditLogger;
