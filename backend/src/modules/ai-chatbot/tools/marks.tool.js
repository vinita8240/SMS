const pool = require('../../../config/db');

class MarksTool {
  async getStudentMarks(params) {
    const studentId = typeof params === 'object' ? params?.studentId : params;
    const examId = typeof params === 'object' ? (params?.examId || null) : null;
    const subjectName = typeof params === 'object' ? (params?.subjectName || null) : null;
    const year = typeof params === 'object' ? (params?.year || null) : null;
    if (!studentId) return null;

    let sql = `
      SELECT 
        m.mark_id, m.mark_obtained, m.mark_total, m.grade_point, m.grade, m.comment, m.year,
        s.name AS subject_name,
        e.name AS exam_name, e.exam_id,
        c.name AS class_name
      FROM mark m
      JOIN subject s ON m.subject_id = s.subject_id
      JOIN exam e ON m.exam_id = e.exam_id
      JOIN class c ON m.class_id = c.class_id
      WHERE m.student_id = ?
    `;
    const sqlParams = [studentId];

    if (examId) {
      sql += ' AND m.exam_id = ?';
      sqlParams.push(examId);
    }
    if (subjectName) {
      sql += ' AND s.name LIKE ?';
      sqlParams.push(`%${subjectName}%`);
    }
    if (year) {
      sql += ' AND m.year = ?';
      sqlParams.push(year);
    }

    sql += ' ORDER BY e.exam_id DESC, s.name ASC';

    const [rows] = await pool.query(sql, sqlParams);
    if (rows.length === 0) {
      return {
        studentId,
        marks: [],
        summary: null
      };
    }

    const totalObtained = rows.reduce((acc, curr) => acc + parseFloat(curr.mark_obtained || 0), 0);
    const totalMax = rows.reduce((acc, curr) => acc + parseFloat(curr.mark_total || 100), 0);
    const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

    return {
      studentId,
      marks: rows,
      summary: {
        totalObtained: parseFloat(totalObtained.toFixed(2)),
        totalMaximum: parseFloat(totalMax.toFixed(2)),
        overallPercentage: parseFloat(overallPercentage),
        subjectCount: rows.length
      }
    };
  }

  async getSubjectAverageMarks(params) {
    const classId = typeof params === 'object' ? params?.classId : params;
    const subjectId = typeof params === 'object' ? (params?.subjectId || null) : null;
    const examId = typeof params === 'object' ? (params?.examId || null) : null;
    const subjectName = typeof params === 'object' ? (params?.subjectName || null) : null;
    let sql = `
      SELECT 
        s.name AS subject_name,
        e.name AS exam_name,
        COUNT(m.mark_id) AS student_count,
        ROUND(AVG(m.mark_obtained), 2) AS average_marks,
        MAX(m.mark_obtained) AS highest_marks,
        MIN(m.mark_obtained) AS lowest_marks,
        m.mark_total
      FROM mark m
      JOIN subject s ON m.subject_id = s.subject_id
      JOIN exam e ON m.exam_id = e.exam_id
      WHERE 1=1
    `;
    const sqlParams = [];

    if (classId) {
      sql += ' AND m.class_id = ?';
      sqlParams.push(classId);
    }
    if (subjectId) {
      sql += ' AND m.subject_id = ?';
      sqlParams.push(subjectId);
    } else if (subjectName) {
      sql += ' AND s.name LIKE ?';
      sqlParams.push(`%${subjectName}%`);
    }
    if (examId) {
      sql += ' AND m.exam_id = ?';
      sqlParams.push(examId);
    }

    sql += ' GROUP BY s.subject_id, s.name, e.exam_id, e.name, m.mark_total';

    const [rows] = await pool.query(sql, sqlParams);
    return rows;
  }
}

module.exports = new MarksTool();
