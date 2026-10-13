const facilityRepo = require('../repositories/facility.repository');

class FacilityService {
  // Hostel
  async getHostelCategories() {
    return facilityRepo.getHostelCategories();
  }

  async createHostel(data) {
    return facilityRepo.createHostel(data);
  }

  async updateHostel(id, data) {
    return facilityRepo.updateHostel(id, data);
  }

  async deleteHostel(id) {
    return facilityRepo.deleteHostel(id);
  }

  async getHostelRooms() {
    return facilityRepo.getHostelRooms();
  }

  async createRoom(data) {
    return facilityRepo.createRoom(data);
  }

  async updateRoom(id, data) {
    return facilityRepo.updateRoom(id, data);
  }

  async deleteRoom(id) {
    return facilityRepo.deleteRoom(id);
  }

  async getDormitories() {
    return facilityRepo.getDormitories();
  }

  // Transport
  async getTransportRoutes() {
    return facilityRepo.getTransportRoutes();
  }

  async createRoute(data) {
    return facilityRepo.createRoute(data);
  }

  async updateRoute(id, data) {
    return facilityRepo.updateRoute(id, data);
  }

  async deleteRoute(id) {
    return facilityRepo.deleteRoute(id);
  }

  async getVehicles() {
    return facilityRepo.getVehicles();
  }

  async createVehicle(data) {
    return facilityRepo.createVehicle(data);
  }

  async updateVehicle(id, data) {
    return facilityRepo.updateVehicle(id, data);
  }

  async deleteVehicle(id) {
    return facilityRepo.deleteVehicle(id);
  }

  async getTransports() {
    return facilityRepo.getTransports();
  }
}

module.exports = new FacilityService();
