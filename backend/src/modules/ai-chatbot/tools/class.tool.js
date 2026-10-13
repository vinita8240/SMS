const pool = require('../../../config/db');

class ClassTool {
  async getClassList() {
    const sql = `
      SELECT 
        c.class_id, c.teacher_id, c.name AS name, c.name AS class_name, c.name_numeric,
        t.name AS teacher_name, t.email AS teacher_email,
        COUNT(s.student_id) AS student_count
      FROM class c
      LEFT JOIN teacher t ON c.teacher_id = t.teacher_id
      LEFT JOIN student s ON c.class_id = s.class_id AND s.status = 'active'
      GROUP BY c.class_id, c.teacher_id, c.name, c.name_numeric, t.name, t.email
      ORDER BY c.name_numeric ASC, c.class_id ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  async getClassStudents(params) {
    const classId = typeof params === 'object' ? params?.classId : params;
    const sectionId = typeof params === 'object' ? params?.sectionId : null;
    if (!classId) return [];
    let sql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name, s.gender, s.phone,
        sec.name AS section_name
      FROM student s
      LEFT JOIN section sec ON s.section_id = sec.section_id
      WHERE s.class_id = ? AND s.status = 'active'
    `;
    const queryParams = [classId];

    if (sectionId) {
      sql += ' AND s.section_id = ?';
      queryParams.push(sectionId);
    }

    sql += ' ORDER BY CAST(s.roll_no AS UNSIGNED) ASC, s.name ASC';
    const [rows] = await pool.query(sql, queryParams);
    return rows;
  }

  async getClassStudentCount(params) {
    const classId = typeof params === 'object' ? params?.classId : params;
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM student WHERE class_id = ? AND status = "active"',
      [classId]
    );
    return rows[0] ? rows[0].total : 0;
  }
}

module.exports = new ClassTool();
