const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academic.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const auditLogger = require('../middleware/audit.middleware');
const { uploadSyllabus, uploadAssignment, uploadMaterial } = require('../middleware/upload.middleware');

router.use(authenticate);

// Classes
router.get('/classes', academicController.getClasses);
router.post('/classes', authorizeRoles('super_admin', 'admin'), auditLogger('Classes', 'CREATE_CLASS'), academicController.createClass);
router.put('/classes/:id', authorizeRoles('super_admin', 'admin'), auditLogger('Classes', 'UPDATE_CLASS'), academicController.updateClass);
router.delete('/classes/:id', authorizeRoles('super_admin', 'admin'), auditLogger('Classes', 'DELETE_CLASS'), academicController.deleteClass);

// Sections
router.get('/sections', academicController.getSections);
router.post('/sections', authorizeRoles('super_admin', 'admin'), auditLogger('Sections', 'CREATE_SECTION'), academicController.createSection);
router.put('/sections/:id', authorizeRoles('super_admin', 'admin'), auditLogger('Sections', 'UPDATE_SECTION'), academicController.updateSection);
router.delete('/sections/:id', authorizeRoles('super_admin', 'admin'), auditLogger('Sections', 'DELETE_SECTION'), academicController.deleteSection);

// Subjects
router.get('/subjects', academicController.getSubjects);
router.post('/subjects', authorizeRoles('super_admin', 'admin'), auditLogger('Subjects', 'CREATE_SUBJECT'), academicController.createSubject);
router.put('/subjects/:id', authorizeRoles('super_admin', 'admin'), auditLogger('Subjects', 'UPDATE_SUBJECT'), academicController.updateSubject);
router.delete('/subjects/:id', authorizeRoles('super_admin', 'admin'), auditLogger('Subjects', 'DELETE_SUBJECT'), academicController.deleteSubject);

// Syllabus
router.get('/syllabus', academicController.getSyllabus);
router.post('/syllabus', authorizeRoles('super_admin', 'admin', 'teacher'), uploadSyllabus.single('file'), auditLogger('Syllabus', 'UPLOAD_SYLLABUS'), academicController.createSyllabus);
router.delete('/syllabus/:id', authorizeRoles('super_admin', 'admin', 'teacher'), auditLogger('Syllabus', 'DELETE_SYLLABUS'), academicController.deleteSyllabus);

// Assignments
router.get('/assignments', academicController.getAssignments);
router.post('/assignments', authorizeRoles('super_admin', 'admin', 'teacher'), uploadAssignment.single('file'), auditLogger('Assignments', 'CREATE_ASSIGNMENT'), academicController.createAssignment);
router.delete('/assignments/:id', authorizeRoles('super_admin', 'admin', 'teacher'), auditLogger('Assignments', 'DELETE_ASSIGNMENT'), academicController.deleteAssignment);

// Materials
router.get('/materials', academicController.getMaterials);
router.post('/materials', authorizeRoles('super_admin', 'admin', 'teacher'), uploadMaterial.single('file'), auditLogger('Materials', 'UPLOAD_MATERIAL'), academicController.createMaterial);
router.delete('/materials/:id', authorizeRoles('super_admin', 'admin', 'teacher'), auditLogger('Materials', 'DELETE_MATERIAL'), academicController.deleteMaterial);

module.exports = router;
