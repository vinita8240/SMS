const pool = require('../../../config/db');

/**
 * Staff Tool – queries teacher/staff records for chatbot responses
 */
class StaffTool {
  /**
   * Find a teacher/staff by name
   */
  async findTeacherByName(params) {
    const name = typeof params === 'object' ? params?.name : params;
    if (!name) return [];
    const term = `%${String(name).trim()}%`;
    const sql = `
      SELECT 
        t.teacher_id, t.name, t.email, t.phone, t.gender, t.status,
        d.name AS designation, dept.name AS department
      FROM teacher t
      LEFT JOIN designation d ON t.designation_id = d.designation_id
      LEFT JOIN department dept ON t.department_id = dept.department_id
      WHERE t.name LIKE ?
      ORDER BY t.name ASC
      LIMIT 5
    `;
    const [rows] = await pool.query(sql, [term]);
    return rows;
  }

  /**
   * Get list of all active staff/teachers
   */
  async getAllStaff(params) {
    const departmentId = typeof params === 'object' ? (params?.departmentId || null) : null;
    let sql = `
      SELECT 
        t.teacher_id, t.name, t.email, t.phone, t.gender, t.status,
        d.name AS designation, dept.name AS department
      FROM teacher t
      LEFT JOIN designation d ON t.designation_id = d.designation_id
      LEFT JOIN department dept ON t.department_id = dept.department_id
      WHERE t.status = 'active'
    `;
    const queryParams = [];
    if (departmentId) {
      sql += ' AND t.department_id = ?';
      queryParams.push(departmentId);
    }
    sql += ' ORDER BY dept.name ASC, t.name ASC LIMIT 30';
    const [rows] = await pool.query(sql, queryParams);
    return rows;
  }

  /**
   * Get staff count by department
   */
  async getStaffStats() {
    const [total] = await pool.query(`
      SELECT 
        COUNT(*) AS total_staff,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_staff,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_staff,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_staff
      FROM teacher
    `);
    const [byDept] = await pool.query(`
      SELECT 
        dept.name AS department,
        COUNT(t.teacher_id) AS staff_count
      FROM department dept
      LEFT JOIN teacher t ON dept.department_id = t.department_id AND t.status = 'active'
      GROUP BY dept.department_id, dept.name
      ORDER BY dept.name ASC
    `);
    return {
      totals: total[0] || {},
      byDepartment: byDept
    };
  }

  /**
   * Get departments list
   */
  async getDepartments() {
    const [rows] = await pool.query(`
      SELECT 
        d.department_id, d.name AS department,
        COUNT(t.teacher_id) AS staff_count
      FROM department d
      LEFT JOIN teacher t ON d.department_id = t.department_id AND t.status = 'active'
      GROUP BY d.department_id, d.name
      ORDER BY d.name ASC
    `);
    return rows;
  }
}

module.exports = new StaffTool();
