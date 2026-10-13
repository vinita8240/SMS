const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const auditLogger = require('../middleware/audit.middleware');

router.use(authenticate);

router.get('/', attendanceController.getClassAttendance);
router.get('/student-monthly', attendanceController.getStudentMonthly);
router.get('/report', attendanceController.getAttendanceReport);

router.post(
  '/bulk',
  authorizeRoles('super_admin', 'admin', 'teacher'),
  auditLogger('Attendance', 'SAVE_ATTENDANCE'),
  attendanceController.saveAttendance
);

module.exports = router;
