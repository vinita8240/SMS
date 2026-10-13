const attendanceService = require('../services/attendance.service');
const { successResponse } = require('../utils/response');

class AttendanceController {
  async getClassAttendance(req, res, next) {
    try {
      const { class_id, section_id, date } = req.query;
      const records = await attendanceService.getClassAttendance(class_id, section_id, date);
      return successResponse(res, 'Attendance sheet retrieved', records);
    } catch (err) {
      next(err);
    }
  }

  async saveAttendance(req, res, next) {
    try {
      const { class_id, section_id, date, records } = req.body;
      await attendanceService.saveAttendance(class_id, section_id, date, records);
      return successResponse(res, 'Attendance saved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getStudentMonthly(req, res, next) {
    try {
      const { student_id, year, month } = req.query;
      const targetStudent = student_id || (req.user && req.user.role === 'student' ? req.user.id : null);
      const data = await attendanceService.getStudentMonthly(targetStudent, year, month);
      return successResponse(res, 'Student monthly attendance retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceReport(req, res, next) {
    try {
      const { class_id, section_id, start_date, end_date } = req.query;
      const report = await attendanceService.getAttendanceReport(class_id, section_id, start_date, end_date);
      return successResponse(res, 'Attendance report generated', report);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AttendanceController();
