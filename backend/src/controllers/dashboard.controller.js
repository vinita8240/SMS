const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDashboardData(req.user);
      return successResponse(res, 'Dashboard metrics retrieved', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
