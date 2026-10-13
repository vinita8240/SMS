const attendanceRepo = require('../repositories/attendance.repository');

class AttendanceService {
  async getClassAttendance(classId, sectionId, date) {
    if (!classId || !sectionId || !date) {
      throw { statusCode: 400, message: 'Class ID, Section ID, and Date are required' };
    }
    return attendanceRepo.getClassAttendance(classId, sectionId, date);
  }

  async saveAttendance(classId, sectionId, date, records) {
    if (!classId || !sectionId || !date || !Array.isArray(records)) {
      throw { statusCode: 400, message: 'Invalid attendance submission payload' };
    }
    return attendanceRepo.saveBulkAttendance(classId, sectionId, date, records);
  }

  async getStudentMonthly(studentId, year, month) {
    if (!studentId || !year || !month) {
      throw { statusCode: 400, message: 'Student ID, year, and month are required' };
    }
    return attendanceRepo.getStudentMonthlyAttendance(studentId, year, month);
  }

  async getAttendanceReport(classId, sectionId, startDate, endDate) {
    if (!classId || !sectionId || !startDate || !endDate) {
      throw { statusCode: 400, message: 'Class, Section, Start Date, and End Date are required' };
    }
    return attendanceRepo.getAttendanceReport(classId, sectionId, startDate, endDate);
  }
}

module.exports = new AttendanceService();
