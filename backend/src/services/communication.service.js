const commRepo = require('../repositories/communication.repository');

class CommunicationService {
  async getNotices(audience) {
    return commRepo.getNotices(audience);
  }

  async createNotice(data) {
    return commRepo.createNotice(data);
  }

  async updateNotice(id, data) {
    return commRepo.updateNotice(id, data);
  }

  async deleteNotice(id) {
    return commRepo.deleteNotice(id);
  }

  async getCirculars() {
    return commRepo.getCirculars();
  }

  async createCircular(data) {
    return commRepo.createCircular(data);
  }

  async updateCircular(id, data) {
    return commRepo.updateCircular(id, data);
  }

  async deleteCircular(id) {
    return commRepo.deleteCircular(id);
  }

  async getEnquiryCategories() {
    return commRepo.getEnquiryCategories();
  }

  async getEnquiries(filters) {
    return commRepo.getEnquiries(filters);
  }

  async createEnquiry(data) {
    return commRepo.createEnquiry(data);
  }

  async updateEnquiry(id, data) {
    return commRepo.updateEnquiry(id, data);
  }

  async deleteEnquiry(id) {
    return commRepo.deleteEnquiry(id);
  }
}

module.exports = new CommunicationService();
