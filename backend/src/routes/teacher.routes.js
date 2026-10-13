const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const auditLogger = require('../middleware/audit.middleware');
const { uploadPhoto } = require('../middleware/upload.middleware');

router.use(authenticate);

router.get('/', teacherController.getTeachers);
router.get('/:id', teacherController.getTeacherById);

router.post(
  '/',
  authorizeRoles('super_admin', 'admin', 'hr_staff'),
  uploadPhoto.single('photo'),
  auditLogger('Teachers', 'CREATE_TEACHER'),
  teacherController.createTeacher
);

router.put(
  '/:id',
  authorizeRoles('super_admin', 'admin', 'hr_staff'),
  uploadPhoto.single('photo'),
  auditLogger('Teachers', 'UPDATE_TEACHER'),
  teacherController.updateTeacher
);

router.delete(
  '/:id',
  authorizeRoles('super_admin', 'admin', 'hr_staff'),
  auditLogger('Teachers', 'DELETE_TEACHER'),
  teacherController.deleteTeacher
);

module.exports = router;
