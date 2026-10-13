const BaseRepository = require('./base.repository');

class TeacherRepository extends BaseRepository {
  constructor() {
    super('teacher', 'teacher_id');
  }

  async getFilteredTeachers(filters = {}) {
    const { page = 1, limit = 20, search = '', department_id, designation_id, status } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(t.name LIKE ? OR t.email LIKE ? OR t.phone LIKE ? OR t.teacher_number LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (department_id) {
      conditions.push('t.department_id = ?');
      params.push(department_id);
    }

    if (designation_id) {
      conditions.push('t.designation_id = ?');
      params.push(designation_id);
    }

    if (status) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM teacher t ${whereClause}`;
    const [countRows] = await this.pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        t.teacher_id, t.teacher_number, t.name, t.email, t.phone, t.gender, t.qualification,
        t.basic_salary, t.status, t.joining_date, t.file_name, t.created_at,
        d.name AS department_name, d.department_id,
        des.name AS designation_name, des.designation_id,
        b.bank_name, b.account_number, b.ifsc_code
      FROM teacher t
      LEFT JOIN department d ON t.department_id = d.department_id
      LEFT JOIN designation des ON t.designation_id = des.designation_id
      LEFT JOIN bank b ON t.bank_id = b.bank_id
      ${whereClause}
      ORDER BY t.teacher_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this.pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return {
      teachers: rows,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  async getTeacherProfile(teacherId) {
    const sql = `
      SELECT 
        t.*,
        d.name AS department_name,
        des.name AS designation_name,
        b.bank_name, b.account_name, b.account_number, b.branch, b.ifsc_code
      FROM teacher t
      LEFT JOIN department d ON t.department_id = d.department_id
      LEFT JOIN designation des ON t.designation_id = des.designation_id
      LEFT JOIN bank b ON t.bank_id = b.bank_id
      WHERE t.teacher_id = ?
    `;
    const [rows] = await this.pool.query(sql, [teacherId]);
    return rows[0] || null;
  }

  async getTeacherAssignedClasses(teacherId) {
    const classSql = `
      SELECT c.class_id, c.name AS class_name, 'Class Teacher' AS role_type
      FROM class c WHERE c.teacher_id = ?
      UNION
      SELECT s.class_id, c.name AS class_name, CONCAT('Section Teacher (', s.name, ')') AS role_type
      FROM section s 
      JOIN class c ON s.class_id = c.class_id
      WHERE s.teacher_id = ?
    `;
    const [classes] = await this.pool.query(classSql, [teacherId, teacherId]);

    const subjectSql = `
      SELECT sub.subject_id, sub.name AS subject_name, sub.code, c.name AS class_name, c.class_id
      FROM subject sub
      JOIN class c ON sub.class_id = c.class_id
      WHERE sub.teacher_id = ?
    `;
    const [subjects] = await this.pool.query(subjectSql, [teacherId]);

    return {
      classes,
      subjects
    };
  }
}

module.exports = new TeacherRepository();
