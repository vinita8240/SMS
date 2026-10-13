const commService = require('../services/communication.service');
const { successResponse } = require('../utils/response');

class CommunicationController {
  // Notices
  async getNotices(req, res, next) {
    try {
      const audience = req.query.audience || (req.user ? req.user.role : 'all');
      const notices = await commService.getNotices(audience);
      return successResponse(res, 'Notices retrieved successfully', notices);
    } catch (err) {
      next(err);
    }
  }

  async createNotice(req, res, next) {
    try {
      const notice = await commService.createNotice(req.body);
      return successResponse(res, 'Notice published successfully', notice, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateNotice(req, res, next) {
    try {
      const notice = await commService.updateNotice(req.params.id, req.body);
      return successResponse(res, 'Notice updated successfully', notice);
    } catch (err) {
      next(err);
    }
  }

  async deleteNotice(req, res, next) {
    try {
      await commService.deleteNotice(req.params.id);
      return successResponse(res, 'Notice deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Circulars
  async getCirculars(req, res, next) {
    try {
      const circulars = await commService.getCirculars();
      return successResponse(res, 'Circulars retrieved successfully', circulars);
    } catch (err) {
      next(err);
    }
  }

  async createCircular(req, res, next) {
    try {
      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      const circular = await commService.createCircular(data);
      return successResponse(res, 'Circular created successfully', circular, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateCircular(req, res, next) {
    try {
      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      const circular = await commService.updateCircular(req.params.id, data);
      return successResponse(res, 'Circular updated successfully', circular);
    } catch (err) {
      next(err);
    }
  }

  async deleteCircular(req, res, next) {
    try {
      await commService.deleteCircular(req.params.id);
      return successResponse(res, 'Circular deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Enquiries
  async getEnquiryCategories(req, res, next) {
    try {
      const data = await commService.getEnquiryCategories();
      return successResponse(res, 'Enquiry categories retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async getEnquiries(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        enquiry_category_id: req.query.enquiry_category_id
      };
      const enquiries = await commService.getEnquiries(filters);
      return successResponse(res, 'Enquiries retrieved successfully', enquiries);
    } catch (err) {
      next(err);
    }
  }

  async createEnquiry(req, res, next) {
    try {
      const enquiry = await commService.createEnquiry(req.body);
      return successResponse(res, 'Enquiry submitted successfully', enquiry, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateEnquiry(req, res, next) {
    try {
      const enquiry = await commService.updateEnquiry(req.params.id, req.body);
      return successResponse(res, 'Enquiry updated successfully', enquiry);
    } catch (err) {
      next(err);
    }
  }

  async deleteEnquiry(req, res, next) {
    try {
      await commService.deleteEnquiry(req.params.id);
      return successResponse(res, 'Enquiry deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommunicationController();
