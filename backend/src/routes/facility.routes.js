const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Hostel (both singular & plural alias endpoints)
router.get('/hostels', facilityController.getHostelCategories);
router.post('/hostels', facilityController.createHostel);
router.put('/hostels/:id', facilityController.updateHostel);
router.delete('/hostels/:id', facilityController.deleteHostel);

router.get('/hostel/categories', facilityController.getHostelCategories);
router.post('/hostel/categories', facilityController.createHostel);
router.put('/hostel/categories/:id', facilityController.updateHostel);
router.delete('/hostel/categories/:id', facilityController.deleteHostel);

router.get('/rooms', facilityController.getHostelRooms);
router.post('/rooms', facilityController.createRoom);
router.put('/rooms/:id', facilityController.updateRoom);
router.delete('/rooms/:id', facilityController.deleteRoom);

router.get('/hostel/rooms', facilityController.getHostelRooms);
router.post('/hostel/rooms', facilityController.createRoom);
router.put('/hostel/rooms/:id', facilityController.updateRoom);
router.delete('/hostel/rooms/:id', facilityController.deleteRoom);

router.get('/hostel/dormitories', facilityController.getDormitories);

// Transport
router.get('/routes', facilityController.getTransportRoutes);
router.post('/routes', facilityController.createRoute);
router.put('/routes/:id', facilityController.updateRoute);
router.delete('/routes/:id', facilityController.deleteRoute);

router.get('/transport/routes', facilityController.getTransportRoutes);
router.post('/transport/routes', facilityController.createRoute);
router.put('/transport/routes/:id', facilityController.updateRoute);
router.delete('/transport/routes/:id', facilityController.deleteRoute);

router.get('/vehicles', facilityController.getVehicles);
router.post('/vehicles', facilityController.createVehicle);
router.put('/vehicles/:id', facilityController.updateVehicle);
router.delete('/vehicles/:id', facilityController.deleteVehicle);

router.get('/transport/vehicles', facilityController.getVehicles);
router.post('/transport/vehicles', facilityController.createVehicle);
router.put('/transport/vehicles/:id', facilityController.updateVehicle);
router.delete('/transport/vehicles/:id', facilityController.deleteVehicle);

router.get('/transport', facilityController.getTransports);

module.exports = router;
