const pool = require('../../../config/db');

class PermissionService {
  /**
   * Verify if user has permission to access student data
   */
  async canAccessStudent(user, requestedStudentId) {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    const userType = (user.userType || '').toLowerCase();
    const userId = user.id || user.student_id || user.parent_id || user.teacher_id || user.admin_id;

    // Super Admin & Admin have full access
    if (role === 'super_admin' || role === 'admin' || userType === 'admin') {
      return true;
    }

    // Student can only access their own record
    if (userType === 'student' || role === 'student') {
      return parseInt(userId, 10) === parseInt(requestedStudentId, 10);
    }

    // Parent can only access their linked children
    if (userType === 'parent' || role === 'parent') {
      const [rows] = await pool.query(
        'SELECT student_id FROM student WHERE parent_id = ? AND student_id = ?',
        [userId, requestedStudentId]
      );
      return rows.length > 0;
    }

    // Teacher can access students in their class or subjects
    if (userType === 'teacher' || role === 'teacher') {
      const [rows] = await pool.query(`
        SELECT s.student_id 
        FROM student s
        LEFT JOIN class c ON s.class_id = c.class_id
        LEFT JOIN subject sub ON s.class_id = sub.class_id
        WHERE (c.teacher_id = ? OR sub.teacher_id = ?) AND s.student_id = ?
        LIMIT 1
      `, [userId, userId, requestedStudentId]);
      return rows.length > 0;
    }

    return false;
  }

  /**
   * Resolve children linked to an authenticated parent
   */
  async getLinkedChildren(parentId) {
    if (!parentId) return [];
    const sql = `
      SELECT 
        s.student_id, s.name, s.admission_no, s.roll_no, s.class_id, s.section_id,
        c.name AS class_name, sec.name AS section_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      WHERE s.parent_id = ? AND s.status = 'active'
    `;
    const [rows] = await pool.query(sql, [parentId]);
    return rows;
  }

  /**
   * Find specific child of parent by name or default to first child
   */
  async resolveChildForParent(parentId, childName = null) {
    const children = await this.getLinkedChildren(parentId);
    if (children.length === 0) return null;

    if (childName) {
      const matched = children.find(c => c.name.toLowerCase().includes(childName.toLowerCase()));
      if (matched) return matched;
    }

    return children[0];
  }

  /**
   * Check if user is an authorized admin
   */
  isAdmin(user) {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    const userType = (user.userType || '').toLowerCase();
    return role === 'super_admin' || role === 'admin' || userType === 'admin';
  }

  /**
   * Check if user is an authorized teacher
   */
  isTeacher(user) {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    const userType = (user.userType || '').toLowerCase();
    return this.isAdmin(user) || role === 'teacher' || userType === 'teacher';
  }
}

module.exports = new PermissionService();
