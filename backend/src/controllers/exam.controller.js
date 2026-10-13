const examService = require('../services/exam.service');
const { successResponse } = require('../utils/response');

class ExamController {
  // Exams
  async getExams(req, res, next) {
    try {
      const exams = await examService.getExams(req.query.session);
      return successResponse(res, 'Exams retrieved successfully', exams);
    } catch (err) {
      next(err);
    }
  }

  async createExam(req, res, next) {
    try {
      const exam = await examService.createExam(req.body);
      return successResponse(res, 'Exam created successfully', exam, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateExam(req, res, next) {
    try {
      const exam = await examService.updateExam(req.params.id, req.body);
      return successResponse(res, 'Exam updated successfully', exam);
    } catch (err) {
      next(err);
    }
  }

  async deleteExam(req, res, next) {
    try {
      await examService.deleteExam(req.params.id);
      return successResponse(res, 'Exam deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Questions
  async getQuestions(req, res, next) {
    try {
      const filters = {
        exam_id: req.query.exam_id,
        class_id: req.query.class_id,
        subject_id: req.query.subject_id
      };
      const questions = await examService.getQuestions(filters);
      return successResponse(res, 'Questions retrieved successfully', questions);
    } catch (err) {
      next(err);
    }
  }

  async createQuestion(req, res, next) {
    try {
      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      const questionId = await examService.createQuestion(data);
      return successResponse(res, 'Question created successfully', { question_id: questionId }, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      await examService.deleteQuestion(req.params.id);
      return successResponse(res, 'Question deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Marks
  async getAllMarks(req, res, next) {
    try {
      const marks = await examService.getAllMarks();
      return successResponse(res, 'Marks retrieved successfully', marks);
    } catch (err) {
      next(err);
    }
  }

  async getMarkSheet(req, res, next) {
    try {
      const { exam_id, class_id, section_id, subject_id } = req.query;
      if (!exam_id || !class_id || !section_id || !subject_id) {
        return this.getAllMarks(req, res, next);
      }
      const markSheet = await examService.getMarkSheet(exam_id, class_id, section_id, subject_id);
      return successResponse(res, 'Mark sheet retrieved successfully', markSheet);
    } catch (err) {
      next(err);
    }
  }

  async saveMarks(req, res, next) {
    try {
      const { exam_id, class_id, section_id, subject_id, marks } = req.body;
      await examService.saveMarks(exam_id, class_id, section_id, subject_id, marks);
      return successResponse(res, 'Marks saved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getStudentResult(req, res, next) {
    try {
      const studentId = req.params.studentId || (req.user ? req.user.id : null);
      const { exam_id } = req.query;
      const report = await examService.getStudentResult(studentId, exam_id);
      return successResponse(res, 'Report card generated successfully', report);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExamController();
