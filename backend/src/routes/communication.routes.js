const express = require('express');
const router = express.Router();
const commController = require('../controllers/communication.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');

// Public enquiry submission
router.post('/enquiries/submit', commController.createEnquiry);
router.get('/enquiry-categories/public', commController.getEnquiryCategories);

// Authenticated routes
router.use(authenticate);

// Notices
router.get('/notices', commController.getNotices);
router.post('/notices', commController.createNotice);
router.put('/notices/:id', commController.updateNotice);
router.delete('/notices/:id', commController.deleteNotice);

// Circulars
router.get('/circulars', commController.getCirculars);
router.post('/circulars', uploadDocument.single('file'), commController.createCircular);
router.put('/circulars/:id', uploadDocument.single('file'), commController.updateCircular);
router.delete('/circulars/:id', commController.deleteCircular);

// Enquiries
router.get('/enquiries', commController.getEnquiries);
router.post('/enquiries', commController.createEnquiry);
router.put('/enquiries/:id', commController.updateEnquiry);
router.put('/enquiries/:id/respond', commController.updateEnquiry);
router.delete('/enquiries/:id', commController.deleteEnquiry);
router.get('/enquiry-categories', commController.getEnquiryCategories);

module.exports = router;
