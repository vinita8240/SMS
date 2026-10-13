const hrService = require('../services/hr.service');
const { successResponse } = require('../utils/response');

class HRController {
  async getDepartments(req, res, next) {
    try {
      const data = await hrService.getDepartments();
      return successResponse(res, 'Departments retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async createDepartment(req, res, next) {
    try {
      const data = await hrService.createDepartment(req.body);
      return successResponse(res, 'Department created successfully', data, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateDepartment(req, res, next) {
    try {
      const data = await hrService.updateDepartment(req.params.id, req.body);
      return successResponse(res, 'Department updated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteDepartment(req, res, next) {
    try {
      await hrService.deleteDepartment(req.params.id);
      return successResponse(res, 'Department deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getDesignations(req, res, next) {
    try {
      const data = await hrService.getDesignations(req.query.department_id);
      return successResponse(res, 'Designations retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async createDesignation(req, res, next) {
    try {
      const data = await hrService.createDesignation(req.body);
      return successResponse(res, 'Designation created successfully', data, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateDesignation(req, res, next) {
    try {
      const data = await hrService.updateDesignation(req.params.id, req.body);
      return successResponse(res, 'Designation updated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteDesignation(req, res, next) {
    try {
      await hrService.deleteDesignation(req.params.id);
      return successResponse(res, 'Designation deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getLeaveCategories(req, res, next) {
    try {
      const data = await hrService.getLeaveCategories();
      return successResponse(res, 'Leave categories retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async getLeaves(req, res, next) {
    try {
      const filters = {
        teacher_id: req.query.teacher_id,
        status: req.query.status
      };
      const data = await hrService.getLeaves(filters);
      return successResponse(res, 'Staff leaves retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async applyLeave(req, res, next) {
    try {
      const teacherId = req.user?.id || req.body.teacher_id;
      const data = await hrService.applyLeave(req.body, teacherId);
      return successResponse(res, 'Leave applied successfully', data, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateLeaveStatus(req, res, next) {
    try {
      const { status } = req.body;
      const approverId = req.user?.id;
      await hrService.updateLeaveStatus(req.params.id, status, approverId);
      return successResponse(res, `Leave ${status} successfully`);
    } catch (err) {
      next(err);
    }
  }

  async deleteLeave(req, res, next) {
    try {
      await hrService.deleteLeave(req.params.id);
      return successResponse(res, 'Leave deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HRController();
