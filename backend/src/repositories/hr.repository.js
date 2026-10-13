const BaseRepository = require('./base.repository');

class HRRepository extends BaseRepository {
  constructor() {
    super('leave', 'leave_id');
  }

  // --- Departments ---
  async getDepartments() {
    const sql = `
      SELECT 
        d.department_id AS id,
        d.department_id,
        d.name,
        d.description,
        (SELECT COUNT(*) FROM designation des WHERE des.department_id = d.department_id) AS total_designations,
        (SELECT COUNT(*) FROM teacher t WHERE t.department_id = d.department_id AND t.status = 'active') AS total_staff
      FROM department d
      ORDER BY d.name ASC
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  async createDepartment(data) {
    const [res] = await this.pool.query(
      `INSERT INTO department (name, description) VALUES (?, ?)`,
      [data.name, data.description || '']
    );
    return { id: res.insertId, ...data };
  }

  async updateDepartment(id, data) {
    await this.pool.query(
      `UPDATE department SET name = ?, description = ? WHERE department_id = ?`,
      [data.name, data.description || '', id]
    );
    return { id, ...data };
  }

  async deleteDepartment(id) {
    await this.pool.query(`DELETE FROM department WHERE department_id = ?`, [id]);
    return true;
  }

  // --- Designations ---
  async getDesignations(departmentId) {
    const sql = `
      SELECT 
        des.designation_id AS id,
        des.designation_id,
        des.name,
        des.description,
        des.department_id,
        d.name AS department_name,
        (SELECT COUNT(*) FROM teacher t WHERE t.designation_id = des.designation_id AND t.status = 'active') AS total_staff
      FROM designation des
      LEFT JOIN department d ON des.department_id = d.department_id
      ${departmentId ? 'WHERE des.department_id = ?' : ''}
      ORDER BY des.name ASC
    `;
    const params = departmentId ? [departmentId] : [];
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createDesignation(data) {
    const [res] = await this.pool.query(
      `INSERT INTO designation (department_id, name, description) VALUES (?, ?, ?)`,
      [data.department_id || 1, data.name, data.description || '']
    );
    return { id: res.insertId, ...data };
  }

  async updateDesignation(id, data) {
    await this.pool.query(
      `UPDATE designation SET name = ?, description = ? WHERE designation_id = ?`,
      [data.name, data.description || '', id]
    );
    return { id, ...data };
  }

  async deleteDesignation(id) {
    await this.pool.query(`DELETE FROM designation WHERE designation_id = ?`, [id]);
    return true;
  }

  // --- Leave Categories ---
  async getLeaveCategories() {
    return [
      { id: 1, leave_category_id: 1, name: 'Casual Leave', max_days: 12 },
      { id: 2, leave_category_id: 2, name: 'Medical Leave', max_days: 15 },
      { id: 3, leave_category_id: 3, name: 'Maternity / Paternity', max_days: 90 },
      { id: 4, leave_category_id: 4, name: 'Earned / Paid Leave', max_days: 20 },
      { id: 5, leave_category_id: 5, name: 'Duty / Official Leave', max_days: 10 }
    ];
  }

  // --- Staff Leaves ---
  async getLeaves(filters = {}) {
    const { teacher_id, status } = filters;
    const conditions = [];
    const params = [];

    if (teacher_id) {
      conditions.push('l.teacher_id = ?');
      params.push(teacher_id);
    }
    if (status) {
      conditions.push('l.status = ?');
      params.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        l.leave_id AS id,
        l.leave_id,
        l.teacher_id,
        l.leave_code,
        l.leave_type,
        l.leave_type AS category_name,
        l.start_date,
        l.end_date,
        l.reason,
        l.attachment,
        l.status,
        l.approved_by,
        l.approved_at,
        l.created_at,
        t.name AS applicant_name, t.name AS teacher_name, t.teacher_number, t.email AS teacher_email,
        d.name AS department_name,
        des.name AS designation_name
      FROM \`leave\` l
      LEFT JOIN teacher t ON l.teacher_id = t.teacher_id
      LEFT JOIN department d ON t.department_id = d.department_id
      LEFT JOIN designation des ON t.designation_id = des.designation_id
      ${where}
      ORDER BY l.leave_id DESC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async applyLeave(data, teacherId) {
    const tid = teacherId || data.teacher_id || 1;
    const leaveType = data.leave_type || data.category_name || 'Casual Leave';
    const leaveCode = 'LV-' + Math.floor(1000 + Math.random() * 9000);
    const [res] = await this.pool.query(
      `INSERT INTO \`leave\` (teacher_id, leave_code, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [tid, leaveCode, leaveType, data.start_date, data.end_date, data.reason || '']
    );
    return { id: res.insertId, ...data, leave_code: leaveCode, status: 'pending' };
  }

  async updateLeaveStatus(leaveId, status, approverId) {
    const sql = `
      UPDATE \`leave\`
      SET status = ?, approved_by = ?, approved_at = NOW()
      WHERE leave_id = ?
    `;
    const [res] = await this.pool.query(sql, [status, approverId || 1, leaveId]);
    return res.affectedRows > 0;
  }

  async deleteLeave(id) {
    await this.pool.query(`DELETE FROM \`leave\` WHERE leave_id = ?`, [id]);
    return true;
  }
}

module.exports = new HRRepository();
