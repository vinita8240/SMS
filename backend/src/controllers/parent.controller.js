const parentService = require('../services/parent.service');
const { successResponse } = require('../utils/response');

class ParentController {
  async getParents(req, res, next) {
    try {
      const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        search: req.query.search || '',
        status: req.query.status
      };
      const result = await parentService.getParents(filters);
      return successResponse(res, 'Parents retrieved successfully', result.parents, {
        page: result.page,
        limit: result.limit,
        total: result.total
      });
    } catch (err) {
      next(err);
    }
  }

  async getParentById(req, res, next) {
    try {
      const parent = await parentService.getParentById(req.params.id);
      return successResponse(res, 'Parent details retrieved', parent);
    } catch (err) {
      next(err);
    }
  }

  async createParent(req, res, next) {
    try {
      const parent = await parentService.createParent(req.body);
      return successResponse(res, 'Parent created successfully', parent, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateParent(req, res, next) {
    try {
      const parent = await parentService.updateParent(req.params.id, req.body);
      return successResponse(res, 'Parent updated successfully', parent);
    } catch (err) {
      next(err);
    }
  }

  async deleteParent(req, res, next) {
    try {
      await parentService.deleteParent(req.params.id);
      return successResponse(res, 'Parent deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ParentController();
