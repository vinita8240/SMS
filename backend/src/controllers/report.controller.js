const reportService = require('../services/report.service');
const { successResponse } = require('../utils/response');

class ReportController {
  async getStudentReport(req, res, next) {
    try {
      const data = await reportService.getStudentReport(req.query);
      return successResponse(res, 'Student report generated', data);
    } catch (err) {
      next(err);
    }
  }

  async getFeeCollectionReport(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const data = await reportService.getFeeCollectionReport(start_date, end_date);
      return successResponse(res, 'Fee collection report generated', data);
    } catch (err) {
      next(err);
    }
  }

  async getOutstandingFeeReport(req, res, next) {
    try {
      const { class_id } = req.query;
      const data = await reportService.getOutstandingFeeReport(class_id);
      return successResponse(res, 'Outstanding fee report generated', data);
    } catch (err) {
      next(err);
    }
  }

  async getExamResultsReport(req, res, next) {
    try {
      const { exam_id, class_id, section_id } = req.query;
      const data = await reportService.getExamResultsReport(exam_id, class_id, section_id);
      return successResponse(res, 'Exam results report generated', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
