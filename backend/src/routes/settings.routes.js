const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const auditLogger = require('../middleware/audit.middleware');

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.post('/', authorizeRoles('super_admin', 'admin'), auditLogger('Settings', 'UPDATE_SETTINGS'), settingsController.updateSettings);
router.get('/metadata', settingsController.getMetadata);
router.get('/audit-logs', authorizeRoles('super_admin', 'admin'), settingsController.getAuditLogs);

module.exports = router;
