const pool = require('../../../config/db');

class MaterialTool {
  async getStudentMaterials(params) {
    const classId = typeof params === 'object' ? params?.classId : params;
    const subjectId = typeof params === 'object' ? (params?.subjectId || null) : null;
    const limit = typeof params === 'object' ? (params?.limit || 10) : 10;
    if (!classId) return [];

    let sql = `
      SELECT 
        m.document_id, m.title, m.description, m.file_name, m.file_type, m.created_at,
        s.name AS subject_name,
        c.name AS class_name
      FROM material m
      JOIN class c ON m.class_id = c.class_id
      LEFT JOIN subject s ON m.subject_id = s.subject_id
      WHERE m.class_id = ?
    `;
    const sqlParams = [classId];

    if (subjectId) {
      sql += ' AND m.subject_id = ?';
      sqlParams.push(subjectId);
    }

    sql += ' ORDER BY m.document_id DESC LIMIT ?';
    sqlParams.push(limit);

    const [rows] = await pool.query(sql, sqlParams);
    return rows;
  }

  async getAcademicSyllabus(params) {
    const classId = typeof params === 'object' ? params?.classId : params;
    const subjectId = typeof params === 'object' ? (params?.subjectId || null) : null;
    if (!classId) return [];

    let sql = `
      SELECT 
        syl.academic_syllabus_id, syl.academic_syllabus_code, syl.title, syl.description,
        syl.file_name, syl.session, syl.year,
        s.name AS subject_name,
        c.name AS class_name
      FROM academic_syllabus syl
      JOIN class c ON syl.class_id = c.class_id
      LEFT JOIN subject s ON syl.subject_id = s.subject_id
      WHERE syl.class_id = ?
    `;
    const sqlParams = [classId];

    if (subjectId) {
      sql += ' AND syl.subject_id = ?';
      sqlParams.push(subjectId);
    }

    sql += ' ORDER BY syl.academic_syllabus_id DESC';

    const [rows] = await pool.query(sql, sqlParams);
    return rows;
  }
}

module.exports = new MaterialTool();
