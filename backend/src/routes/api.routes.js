const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const teacherRoutes = require('./teacher.routes');
const parentRoutes = require('./parent.routes');
const academicRoutes = require('./academic.routes');
const attendanceRoutes = require('./attendance.routes');
const examRoutes = require('./exam.routes');
const financeRoutes = require('./finance.routes');
const libraryRoutes = require('./library.routes');
const facilityRoutes = require('./facility.routes');
const hrRoutes = require('./hr.routes');
const commRoutes = require('./communication.routes');
const settingsRoutes = require('./settings.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const searchRoutes = require('./search.routes');
const cmsRoutes = require('./cms.routes');
const publicRoutes = require('./public.routes');
const aiRoutes = require('../modules/ai-chatbot/routes/chatbot.routes');
const frontOfficeRoutes = require('./frontoffice.routes');

router.use('/auth', authRoutes);
router.use('/front-office', frontOfficeRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/parents', parentRoutes);
router.use('/academics', academicRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/finance', financeRoutes);
router.use('/library', libraryRoutes);
router.use('/facility', facilityRoutes);
router.use('/facilities', facilityRoutes);
router.use('/hr', hrRoutes);
router.use('/communication', commRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/search', searchRoutes);
router.use('/cms', cmsRoutes);
router.use('/public', publicRoutes);
router.use('/ai', aiRoutes);

module.exports = router;

