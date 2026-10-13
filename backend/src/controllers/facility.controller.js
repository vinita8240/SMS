const facilityService = require('../services/facility.service');
const { successResponse } = require('../utils/response');

class FacilityController {
  // Hostel
  async getHostelCategories(req, res, next) {
    try {
      const data = await facilityService.getHostelCategories();
      return successResponse(res, 'Hostels retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async createHostel(req, res, next) {
    try {
      const data = await facilityService.createHostel(req.body);
      return successResponse(res, 'Hostel created successfully', data, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateHostel(req, res, next) {
    try {
      const data = await facilityService.updateHostel(req.params.id, req.body);
      return successResponse(res, 'Hostel updated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteHostel(req, res, next) {
    try {
      await facilityService.deleteHostel(req.params.id);
      return successResponse(res, 'Hostel deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getHostelRooms(req, res, next) {
    try {
      const data = await facilityService.getHostelRooms();
      return successResponse(res, 'Hostel rooms retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async createRoom(req, res, next) {
    try {
      const data = await facilityService.createRoom(req.body);
      return successResponse(res, 'Room created successfully', data, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const data = await facilityService.updateRoom(req.params.id, req.body);
      return successResponse(res, 'Room updated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteRoom(req, res, next) {
    try {
      await facilityService.deleteRoom(req.params.id);
      return successResponse(res, 'Room deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getDormitories(req, res, next) {
    try {
      const data = await facilityService.getDormitories();
      return successResponse(res, 'Dormitories retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  // Transport
  async getTransportRoutes(req, res, next) {
    try {
      const data = await facilityService.getTransportRoutes();
      return successResponse(res, 'Transport routes retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async createRoute(req, res, next) {
    try {
      const data = await facilityService.createRoute(req.body);
      return successResponse(res, 'Route created successfully', data, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRoute(req, res, next) {
    try {
      const data = await facilityService.updateRoute(req.params.id, req.body);
      return successResponse(res, 'Route updated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteRoute(req, res, next) {
    try {
      await facilityService.deleteRoute(req.params.id);
      return successResponse(res, 'Route deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getVehicles(req, res, next) {
    try {
      const data = await facilityService.getVehicles();
      return successResponse(res, 'Vehicles retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async createVehicle(req, res, next) {
    try {
      const data = await facilityService.createVehicle(req.body);
      return successResponse(res, 'Vehicle created successfully', data, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateVehicle(req, res, next) {
    try {
      const data = await facilityService.updateVehicle(req.params.id, req.body);
      return successResponse(res, 'Vehicle updated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteVehicle(req, res, next) {
    try {
      await facilityService.deleteVehicle(req.params.id);
      return successResponse(res, 'Vehicle deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getTransports(req, res, next) {
    try {
      const data = await facilityService.getTransports();
      return successResponse(res, 'Transport services retrieved', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FacilityController();
