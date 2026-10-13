const pool = require('../../../config/db');

class ExamTool {
  async getUpcomingExams({ classId = null, limit = 10 }) {
    let sql = `
      SELECT 
        exam_id, name, date, comment
      FROM exam
      WHERE date >= CURDATE() OR date IS NULL
      ORDER BY date ASC, exam_id DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  }

  async getAllExams() {
    const [rows] = await pool.query('SELECT exam_id, name, date, comment FROM exam ORDER BY exam_id DESC');
    return rows;
  }

  async getExamDetails(examId) {
    const [rows] = await pool.query('SELECT * FROM exam WHERE exam_id = ?', [examId]);
    return rows[0] || null;
  }
}

module.exports = new ExamTool();
