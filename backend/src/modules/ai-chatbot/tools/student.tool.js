const pool = require('../../../config/db');

class StudentTool {
  async getStudentProfile(params) {
    const studentId = typeof params === 'object' ? params?.studentId : params;
    if (!studentId) return null;
    const sql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name, s.email, s.phone,
        s.gender, s.birthday, s.blood_group, s.father_name, s.mother_name,
        s.session, s.admission_date, s.status,
        c.name AS class_name, c.name_numeric AS class_numeric,
        sec.name AS section_name,
        p.name AS parent_name, p.phone AS parent_phone, p.email AS parent_email
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE s.student_id = ?
    `;
    const [rows] = await pool.query(sql, [studentId]);
    return rows[0] || null;
  }

  async getStudentStats() {
    const [totalRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_students,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_students,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_students
      FROM student
    `);

    const [classRows] = await pool.query(`
      SELECT 
        c.name AS class_name,
        COUNT(s.student_id) AS student_count
      FROM class c
      LEFT JOIN student s ON c.class_id = s.class_id AND s.status = 'active'
      GROUP BY c.class_id, c.name
      ORDER BY c.name_numeric ASC, c.class_id ASC
    `);

    return {
      totals: totalRows[0],
      classBreakdown: classRows
    };
  }

  async getRecentAdmissions(limit = 5) {
    const sql = `
      SELECT 
        s.student_id, s.admission_no, s.name, s.admission_date, s.gender,
        c.name AS class_name, sec.name AS section_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      ORDER BY s.student_id DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  }

  async findStudentByNameOrAdmission(params) {
    const query = typeof params === 'object' ? params?.query : params;
    if (!query) return [];
    const trimmed = String(query).trim();
    const sql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name, s.gender,
        s.session, s.admission_date, s.status,
        c.name AS class_name, c.name_numeric AS class_numeric,
        sec.name AS section_name,
        p.name AS parent_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE s.name LIKE ? OR s.admission_no LIKE ? OR s.roll_no LIKE ?
      ORDER BY s.name ASC
      LIMIT 5
    `;
    const searchParam = `%${trimmed}%`;
    const [rows] = await pool.query(sql, [searchParam, searchParam, searchParam]);
    return rows;
  }
}

module.exports = new StudentTool();

