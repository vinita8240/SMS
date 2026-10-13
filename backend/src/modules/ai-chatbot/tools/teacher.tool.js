const pool = require('../../../config/db');

class TeacherTool {
  async getTeacherProfile(params) {
    const teacherId = typeof params === 'object' ? params?.teacherId : params;
    if (!teacherId) return null;
    const sql = `
      SELECT 
        t.teacher_id, t.name, t.email, t.phone, t.address, t.gender,
        d.name AS designation, dept.name AS department
      FROM teacher t
      LEFT JOIN designation d ON t.designation_id = d.designation_id
      LEFT JOIN department dept ON t.department_id = dept.department_id
      WHERE t.teacher_id = ?
    `;
    const [rows] = await pool.query(sql, [teacherId]);
    return rows[0] || null;
  }

  async getTeacherSubjects(params) {
    const teacherId = typeof params === 'object' ? params?.teacherId : params;
    if (!teacherId) return [];
    const sql = `
      SELECT 
        s.subject_id, s.name AS subject_name,
        c.class_id, c.name AS class_name, c.name_numeric
      FROM subject s
      JOIN class c ON s.class_id = c.class_id
      WHERE s.teacher_id = ?
      ORDER BY c.name_numeric ASC, s.name ASC
    `;
    const [rows] = await pool.query(sql, [teacherId]);
    return rows;
  }

  async getTeacherCount() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total_teachers FROM teacher');
    return rows[0] ? rows[0].total_teachers : 0;
  }
}

module.exports = new TeacherTool();
