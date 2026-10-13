const frontOfficeService = require('../services/frontoffice.service');
const { successResponse } = require('../utils/response');

class FrontOfficeController {
  // Enquiries
  async getEnquiries(req, res, next) {
    try {
      const data = await frontOfficeService.getEnquiries(req.query);
      return successResponse(res, 'Enquiries retrieved', data);
    } catch (err) { next(err); }
  }

  async createEnquiry(req, res, next) {
    try {
      const data = await frontOfficeService.createEnquiry(req.body);
      return successResponse(res, 'Enquiry recorded successfully', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateEnquiry(req, res, next) {
    try {
      const data = await frontOfficeService.updateEnquiry(req.params.id, req.body);
      return successResponse(res, 'Enquiry updated successfully', data);
    } catch (err) { next(err); }
  }

  async deleteEnquiry(req, res, next) {
    try {
      await frontOfficeService.deleteEnquiry(req.params.id);
      return successResponse(res, 'Enquiry deleted successfully');
    } catch (err) { next(err); }
  }

  // Visitors
  async getVisitors(req, res, next) {
    try {
      const data = await frontOfficeService.getVisitors(req.query);
      return successResponse(res, 'Visitors retrieved', data);
    } catch (err) { next(err); }
  }

  async createVisitor(req, res, next) {
    try {
      const data = await frontOfficeService.createVisitor(req.body);
      return successResponse(res, 'Visitor entry logged', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateVisitor(req, res, next) {
    try {
      const data = await frontOfficeService.updateVisitor(req.params.id, req.body);
      return successResponse(res, 'Visitor entry updated', data);
    } catch (err) { next(err); }
  }

  async deleteVisitor(req, res, next) {
    try {
      await frontOfficeService.deleteVisitor(req.params.id);
      return successResponse(res, 'Visitor entry deleted');
    } catch (err) { next(err); }
  }

  // Call Logs
  async getCallLogs(req, res, next) {
    try {
      const data = await frontOfficeService.getCallLogs(req.query);
      return successResponse(res, 'Call logs retrieved', data);
    } catch (err) { next(err); }
  }

  async createCallLog(req, res, next) {
    try {
      const data = await frontOfficeService.createCallLog(req.body);
      return successResponse(res, 'Call log saved', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateCallLog(req, res, next) {
    try {
      const data = await frontOfficeService.updateCallLog(req.params.id, req.body);
      return successResponse(res, 'Call log updated', data);
    } catch (err) { next(err); }
  }

  async deleteCallLog(req, res, next) {
    try {
      await frontOfficeService.deleteCallLog(req.params.id);
      return successResponse(res, 'Call log removed');
    } catch (err) { next(err); }
  }

  // Dispatches
  async getDispatches(req, res, next) {
    try {
      const data = await frontOfficeService.getDispatches(req.query);
      return successResponse(res, 'Dispatches retrieved', data);
    } catch (err) { next(err); }
  }

  async createDispatch(req, res, next) {
    try {
      const data = await frontOfficeService.createDispatch(req.body);
      return successResponse(res, 'Postal dispatch saved', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateDispatch(req, res, next) {
    try {
      const data = await frontOfficeService.updateDispatch(req.params.id, req.body);
      return successResponse(res, 'Postal dispatch updated', data);
    } catch (err) { next(err); }
  }

  async deleteDispatch(req, res, next) {
    try {
      await frontOfficeService.deleteDispatch(req.params.id);
      return successResponse(res, 'Postal dispatch deleted');
    } catch (err) { next(err); }
  }

  // Receives
  async getReceives(req, res, next) {
    try {
      const data = await frontOfficeService.getReceives(req.query);
      return successResponse(res, 'Receives retrieved', data);
    } catch (err) { next(err); }
  }

  async createReceive(req, res, next) {
    try {
      const data = await frontOfficeService.createReceive(req.body);
      return successResponse(res, 'Postal receive recorded', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateReceive(req, res, next) {
    try {
      const data = await frontOfficeService.updateReceive(req.params.id, req.body);
      return successResponse(res, 'Postal receive updated', data);
    } catch (err) { next(err); }
  }

  async deleteReceive(req, res, next) {
    try {
      await frontOfficeService.deleteReceive(req.params.id);
      return successResponse(res, 'Postal receive deleted');
    } catch (err) { next(err); }
  }

  // Complaints
  async getComplaints(req, res, next) {
    try {
      const data = await frontOfficeService.getComplaints(req.query);
      return successResponse(res, 'Complaints retrieved', data);
    } catch (err) { next(err); }
  }

  async createComplaint(req, res, next) {
    try {
      const data = await frontOfficeService.createComplaint(req.body);
      return successResponse(res, 'Complaint filed successfully', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateComplaint(req, res, next) {
    try {
      const data = await frontOfficeService.updateComplaint(req.params.id, req.body);
      return successResponse(res, 'Complaint updated', data);
    } catch (err) { next(err); }
  }

  async deleteComplaint(req, res, next) {
    try {
      await frontOfficeService.deleteComplaint(req.params.id);
      return successResponse(res, 'Complaint removed');
    } catch (err) { next(err); }
  }

  // Setup
  async getSetups(req, res, next) {
    try {
      const data = await frontOfficeService.getSetups(req.query.type);
      return successResponse(res, 'Front office setups retrieved', data);
    } catch (err) { next(err); }
  }

  async createSetup(req, res, next) {
    try {
      const data = await frontOfficeService.createSetup(req.body);
      return successResponse(res, 'Setup item created', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateSetup(req, res, next) {
    try {
      const data = await frontOfficeService.updateSetup(req.params.id, req.body);
      return successResponse(res, 'Setup item updated', data);
    } catch (err) { next(err); }
  }

  async deleteSetup(req, res, next) {
    try {
      await frontOfficeService.deleteSetup(req.params.id);
      return successResponse(res, 'Setup item deleted');
    } catch (err) { next(err); }
  }
}

module.exports = new FrontOfficeController();
