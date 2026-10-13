const BaseRepository = require('./base.repository');

class AuthRepository extends BaseRepository {
  constructor() {
    super('admin', 'admin_id');
  }

  async findAdminByEmail(identifier) {
    const sql = `
      SELECT a.*, r.name AS role_name, r.slug AS role_slug, r.permissions
      FROM admin a
      LEFT JOIN admin_role r ON a.admin_role_id = r.admin_role_id
      WHERE (a.email = ? OR a.email LIKE ? OR a.name = ? OR r.slug = ?) AND a.status = 'active'
      ORDER BY a.admin_id ASC
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [identifier, `${identifier}@%`, identifier, identifier]);
    return rows[0] || null;
  }

  async findTeacherByEmail(identifier) {
    const sql = `
      SELECT t.*, d.name AS department_name, des.name AS designation_name
      FROM teacher t
      LEFT JOIN department d ON t.department_id = d.department_id
      LEFT JOIN designation des ON t.designation_id = des.designation_id
      WHERE (t.email = ? OR t.email LIKE ? OR t.teacher_number = ? OR t.name = ?) AND t.status = 'active'
      ORDER BY t.teacher_id ASC
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [identifier, `${identifier}@%`, identifier, identifier]);
    return rows[0] || null;
  }

  async findParentByEmail(identifier) {
    const sql = `SELECT * FROM parent WHERE (email = ? OR email LIKE ? OR phone = ? OR name = ?) AND status = 'active' LIMIT 1`;
    const [rows] = await this.pool.query(sql, [identifier, `${identifier}@%`, identifier, identifier]);
    return rows[0] || null;
  }

  async findStudentByEmailOrAdmission(identifier) {
    const sql = `
      SELECT s.*, c.name AS class_name, sec.name AS section_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      WHERE (s.email = ? OR s.email LIKE ? OR s.admission_no = ? OR s.roll_no = ? OR s.name = ?) AND s.status = 'active'
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [identifier, `${identifier}@%`, identifier, identifier, identifier]);
    return rows[0] || null;
  }

  async updateLastLogin(table, idColumn, id) {
    if (table === 'admin') {
      await this.pool.query(`UPDATE admin SET last_login = NOW() WHERE admin_id = ?`, [id]);
    }
  }

  async updatePassword(table, idColumn, id, hashedPassword) {
    const sql = `UPDATE ${table} SET password = ? WHERE ${idColumn} = ?`;
    const [result] = await this.pool.query(sql, [hashedPassword, id]);
    return result.affectedRows > 0;
  }
}

module.exports = new AuthRepository();

