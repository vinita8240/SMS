const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Departments
router.get('/departments', hrController.getDepartments);
router.post('/departments', hrController.createDepartment);
router.put('/departments/:id', hrController.updateDepartment);
router.delete('/departments/:id', hrController.deleteDepartment);

// Designations
router.get('/designations', hrController.getDesignations);
router.post('/designations', hrController.createDesignation);
router.put('/designations/:id', hrController.updateDesignation);
router.delete('/designations/:id', hrController.deleteDesignation);

// Leaves & Categories
router.get('/leave-categories', hrController.getLeaveCategories);
router.get('/leaves', hrController.getLeaves);
router.post('/leaves', hrController.applyLeave);
router.post('/leaves/apply', hrController.applyLeave);
router.put('/leaves/:id/status', hrController.updateLeaveStatus);
router.delete('/leaves/:id', hrController.deleteLeave);

module.exports = router;
