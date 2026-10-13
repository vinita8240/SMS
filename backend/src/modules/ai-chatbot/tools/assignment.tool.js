const pool = require('../../../config/db');

class AssignmentTool {
  async getStudentAssignments(studentIdOrParams, classIdArg = null, pendingOnlyArg = false, limitArg = 10) {
    const classId = typeof studentIdOrParams === 'object' ? (studentIdOrParams?.classId || classIdArg) : classIdArg;
    const pendingOnly = typeof studentIdOrParams === 'object' ? (studentIdOrParams?.pendingOnly || pendingOnlyArg) : pendingOnlyArg;
    const limit = typeof studentIdOrParams === 'object' ? (studentIdOrParams?.limit || limitArg) : limitArg;
    if (!classId) return [];

    let sql = `
      SELECT 
        a.assignment_id, a.assignment_code, a.title, a.description,
        a.due_date, a.file_name, a.created_at,
        s.name AS subject_name,
        t.name AS teacher_name,
        c.name AS class_name
      FROM assignment a
      JOIN subject s ON a.subject_id = s.subject_id
      LEFT JOIN teacher t ON a.teacher_id = t.teacher_id
      JOIN class c ON a.class_id = c.class_id
      WHERE a.class_id = ?
    `;
    const sqlParams = [classId];

    if (pendingOnly) {
      sql += ' AND a.due_date >= CURDATE()';
    }

    sql += ' ORDER BY a.due_date ASC, a.assignment_id DESC LIMIT ?';
    sqlParams.push(limit);

    const [rows] = await pool.query(sql, sqlParams);
    return rows;
  }

  async getTeacherAssignments(params, classIdArg = null, limitArg = 15) {
    const teacherId = typeof params === 'object' ? params?.teacherId : params;
    const classId = typeof params === 'object' ? (params?.classId || classIdArg) : classIdArg;
    const limit = typeof params === 'object' ? (params?.limit || limitArg) : limitArg;
    if (!teacherId) return [];

    let sql = `
      SELECT 
        a.assignment_id, a.assignment_code, a.title, a.description,
        a.due_date, a.file_name, a.created_at,
        s.name AS subject_name,
        c.name AS class_name
      FROM assignment a
      JOIN subject s ON a.subject_id = s.subject_id
      JOIN class c ON a.class_id = c.class_id
      WHERE a.teacher_id = ?
    `;
    const sqlParams = [teacherId];

    if (classId) {
      sql += ' AND a.class_id = ?';
      sqlParams.push(classId);
    }

    sql += ' ORDER BY a.due_date DESC LIMIT ?';
    sqlParams.push(limit);

    const [rows] = await pool.query(sql, sqlParams);
    return rows;
  }
}

module.exports = new AssignmentTool();
