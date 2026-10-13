const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const auditLogger = require('../middleware/audit.middleware');
const { uploadPhoto, uploadImport } = require('../middleware/upload.middleware');

router.use(authenticate);

// Special sub-routes (must come before /:id)
// Student Bulk Import & Download Sample
router.get('/import/sample', studentController.downloadImportSample);
router.post(
  '/import',
  authorizeRoles('super_admin', 'admin'),
  uploadImport.single('file'),
  auditLogger('Students', 'IMPORT_STUDENTS'),
  studentController.importStudents
);

router.get('/categories', studentController.getCategories);
router.post('/categories', authorizeRoles('super_admin', 'admin'), studentController.createCategory);
router.put('/categories/:id', authorizeRoles('super_admin', 'admin'), studentController.updateCategory);
router.delete('/categories/:id', authorizeRoles('super_admin', 'admin'), studentController.deleteCategory);

router.get('/houses', studentController.getHouses);
router.post('/houses', authorizeRoles('super_admin', 'admin'), studentController.createHouse);
router.put('/houses/:id', authorizeRoles('super_admin', 'admin'), studentController.updateHouse);
router.delete('/houses/:id', authorizeRoles('super_admin', 'admin'), studentController.deleteHouse);

router.get('/disable-reasons', studentController.getDisableReasons);
router.post('/disable-reasons', authorizeRoles('super_admin', 'admin'), studentController.createDisableReason);
router.put('/disable-reasons/:id', authorizeRoles('super_admin', 'admin'), studentController.updateDisableReason);
router.delete('/disable-reasons/:id', authorizeRoles('super_admin', 'admin'), studentController.deleteDisableReason);

router.get('/online-admissions', studentController.getOnlineAdmissions);
router.put('/online-admissions/:id', authorizeRoles('super_admin', 'admin'), studentController.updateOnlineAdmission);
router.post('/online-admissions/:id/enroll', authorizeRoles('super_admin', 'admin'), studentController.enrollOnlineAdmission);

router.post('/bulk-delete', authorizeRoles('super_admin', 'admin'), studentController.bulkDelete);
router.post('/bulk-disable', authorizeRoles('super_admin', 'admin'), studentController.bulkDisable);
router.put('/:id/reactivate', authorizeRoles('super_admin', 'admin'), studentController.reactivateStudent);

router.post(
  '/promote',
  authorizeRoles('super_admin', 'admin'),
  auditLogger('Students', 'PROMOTE_STUDENTS'),
  studentController.promoteStudents
);

// General student CRUD
router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);

router.post(
  '/',
  authorizeRoles('super_admin', 'admin'),
  uploadPhoto.single('photo'),
  auditLogger('Students', 'CREATE_STUDENT'),
  studentController.createStudent
);

router.put(
  '/:id',
  authorizeRoles('super_admin', 'admin'),
  uploadPhoto.single('photo'),
  auditLogger('Students', 'UPDATE_STUDENT'),
  studentController.updateStudent
);

router.delete(
  '/:id',
  authorizeRoles('super_admin', 'admin'),
  auditLogger('Students', 'DELETE_STUDENT'),
  studentController.deleteStudent
);

module.exports = router;
