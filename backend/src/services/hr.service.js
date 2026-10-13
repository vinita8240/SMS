const hrRepo = require('../repositories/hr.repository');

class HRService {
  async getDepartments() {
    return hrRepo.getDepartments();
  }

  async createDepartment(data) {
    return hrRepo.createDepartment(data);
  }

  async updateDepartment(id, data) {
    return hrRepo.updateDepartment(id, data);
  }

  async deleteDepartment(id) {
    return hrRepo.deleteDepartment(id);
  }

  async getDesignations(departmentId) {
    return hrRepo.getDesignations(departmentId);
  }

  async createDesignation(data) {
    return hrRepo.createDesignation(data);
  }

  async updateDesignation(id, data) {
    return hrRepo.updateDesignation(id, data);
  }

  async deleteDesignation(id) {
    return hrRepo.deleteDesignation(id);
  }

  async getLeaveCategories() {
    return hrRepo.getLeaveCategories();
  }

  async getLeaves(filters) {
    return hrRepo.getLeaves(filters);
  }

  async applyLeave(data, teacherId) {
    return hrRepo.applyLeave(data, teacherId);
  }

  async updateLeaveStatus(leaveId, status, approverId) {
    return hrRepo.updateLeaveStatus(leaveId, status, approverId);
  }

  async deleteLeave(id) {
    return hrRepo.deleteLeave(id);
  }
}

module.exports = new HRService();
