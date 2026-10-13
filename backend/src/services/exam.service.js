const examRepo = require('../repositories/exam.repository');

class ExamService {
  async getExams(session) {
    return examRepo.getExams(session);
  }

  async createExam(data) {
    return examRepo.createExam(data);
  }

  async updateExam(id, data) {
    return examRepo.updateExam(id, data);
  }

  async deleteExam(id) {
    return examRepo.deleteExam(id);
  }

  async getQuestions(filters) {
    return examRepo.getQuestions(filters);
  }

  async createQuestion(data) {
    return examRepo.createQuestion(data);
  }

  async deleteQuestion(id) {
    return examRepo.deleteQuestion(id);
  }

  async getAllMarks() {
    return examRepo.getAllMarks();
  }

  async getMarkSheet(examId, classId, sectionId, subjectId) {
    return examRepo.getMarkSheet(examId, classId, sectionId, subjectId);
  }

  async saveMarks(examId, classId, sectionId, subjectId, markEntries) {
    return examRepo.saveMarksBatch(examId, classId, sectionId, subjectId, markEntries);
  }

  async getStudentResult(studentId, examId) {
    return examRepo.getStudentReportCard(studentId, examId);
  }
}

module.exports = new ExamService();
