const express = require('express');
const router = express.Router();
const frontOfficeController = require('../controllers/frontoffice.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Sanitize empty strings to null to prevent MySQL errors on DATE/INT columns
router.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (req.body[key] === '') {
        req.body[key] = null;
      }
    }
  }
  next();
});

// Enquiries
router.get('/enquiries', frontOfficeController.getEnquiries);
router.post('/enquiries', frontOfficeController.createEnquiry);
router.put('/enquiries/:id', frontOfficeController.updateEnquiry);
router.delete('/enquiries/:id', frontOfficeController.deleteEnquiry);

// Visitors
router.get('/visitors', frontOfficeController.getVisitors);
router.post('/visitors', frontOfficeController.createVisitor);
router.put('/visitors/:id', frontOfficeController.updateVisitor);
router.delete('/visitors/:id', frontOfficeController.deleteVisitor);

// Phone Call Logs
router.get('/calls', frontOfficeController.getCallLogs);
router.post('/calls', frontOfficeController.createCallLog);
router.put('/calls/:id', frontOfficeController.updateCallLog);
router.delete('/calls/:id', frontOfficeController.deleteCallLog);

// Postal Dispatch
router.get('/dispatch', frontOfficeController.getDispatches);
router.post('/dispatch', frontOfficeController.createDispatch);
router.put('/dispatch/:id', frontOfficeController.updateDispatch);
router.delete('/dispatch/:id', frontOfficeController.deleteDispatch);

// Postal Receive
router.get('/receive', frontOfficeController.getReceives);
router.post('/receive', frontOfficeController.createReceive);
router.put('/receive/:id', frontOfficeController.updateReceive);
router.delete('/receive/:id', frontOfficeController.deleteReceive);

// Complaints
router.get('/complaints', frontOfficeController.getComplaints);
router.post('/complaints', frontOfficeController.createComplaint);
router.put('/complaints/:id', frontOfficeController.updateComplaint);
router.delete('/complaints/:id', frontOfficeController.deleteComplaint);

// Setups
router.get('/setup', frontOfficeController.getSetups);
router.post('/setup', frontOfficeController.createSetup);
router.put('/setup/:id', frontOfficeController.updateSetup);
router.delete('/setup/:id', frontOfficeController.deleteSetup);

module.exports = router;
