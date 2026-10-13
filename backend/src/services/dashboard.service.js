const dashboardRepo = require('../repositories/dashboard.repository');

class DashboardService {
  async getDashboardData(userContext) {
    const role = userContext ? (userContext.role || '').toLowerCase() : 'super_admin';
    const id = userContext ? userContext.id : 1;

    if (role === 'teacher') {
      return dashboardRepo.getTeacherDashboardMetrics(id);
    } else if (role === 'student') {
      return dashboardRepo.getStudentDashboardMetrics(id);
    } else if (role === 'parent') {
      return dashboardRepo.getParentDashboardMetrics(id);
    }

    // Default: Admin, Super Admin, Accountant, Principal, Staff
    return dashboardRepo.getAdminDashboardMetrics();
  }
}

module.exports = new DashboardService();
