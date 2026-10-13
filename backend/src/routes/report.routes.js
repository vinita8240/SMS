const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/students', reportController.getStudentReport);
router.get('/fee-collection', authorizeRoles('super_admin', 'admin', 'accountant'), reportController.getFeeCollectionReport);
router.get('/fee-outstanding', authorizeRoles('super_admin', 'admin', 'accountant'), reportController.getOutstandingFeeReport);
router.get('/exam-results', reportController.getExamResultsReport);

module.exports = router;
