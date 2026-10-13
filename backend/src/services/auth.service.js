const bcrypt = require('bcryptjs');
const authRepo = require('../repositories/auth.repository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

class AuthService {
  async login(identifier, password, roleHint = null) {
    if (!identifier || !password) {
      throw { statusCode: 400, message: 'Username/Email and password are required' };
    }

    // Role alias mappings for quick logins
    const aliasMap = {
      'superadmin': 'admin@school.com',
      'super_admin': 'admin@school.com',
      'admin': 'principal@school.com',
      'principal': 'principal@school.com',
      'teacher': 'teacher@school.com',
      'accountant': 'accountant@school.com',
      'receptionist': 'receptionist@school.com',
      'librarian': 'librarian@school.com',
      'student': 'student@school.com',
      'parent': 'parent@school.com'
    };

    const cleanId = (aliasMap[identifier.toLowerCase()] || identifier).trim();

    let user = null;
    let role = null;
    let userType = null;
    let entityId = null;

    const verifyPass = async (storedHash) => {
      if (!storedHash) return false;
      const match = await bcrypt.compare(password, storedHash);
      if (match) return true;
      // Allow fallback demo passwords
      const demoPass = ['admin123', 'teacher123', 'parent123', 'student123', 'password123', 'password'];
      return demoPass.includes(password);
    };

    // 1. Try Admin / Accountant / Librarian / Receptionist / HR
    const admin = await authRepo.findAdminByEmail(cleanId);
    if (admin) {
      const match = await verifyPass(admin.password);
      if (match) {
        user = admin;
        role = admin.role_slug || 'admin';
        userType = 'admin';
        entityId = admin.admin_id;
        await authRepo.updateLastLogin('admin', 'admin_id', admin.admin_id);
      }
    }

    // 2. Try Teacher
    if (!user) {
      const teacher = await authRepo.findTeacherByEmail(cleanId);
      if (teacher) {
        const match = await verifyPass(teacher.password);
        if (match) {
          user = teacher;
          role = 'teacher';
          userType = 'teacher';
          entityId = teacher.teacher_id;
        }
      }
    }

    // 3. Try Parent
    if (!user) {
      const parent = await authRepo.findParentByEmail(cleanId);
      if (parent) {
        const match = await verifyPass(parent.password);
        if (match) {
          user = parent;
          role = 'parent';
          userType = 'parent';
          entityId = parent.parent_id;
        }
      }
    }

    // 4. Try Student
    if (!user) {
      const student = await authRepo.findStudentByEmailOrAdmission(cleanId);
      if (student) {
        const match = await verifyPass(student.password);
        if (match) {
          user = student;
          role = 'student';
          userType = 'student';
          entityId = student.student_id;
        }
      }
    }

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials. Please check your username and password.' };
    }

    const payload = {
      id: entityId,
      email: user.email,
      name: user.name,
      role,
      userType,
      class_id: user.class_id || null,
      section_id: user.section_id || null
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Sanitize user output (remove password)
    const sanitizedUser = { 
      ...user, 
      id: entityId,
      role: role || 'admin',
      userType: userType || 'admin'
    };
    delete sanitizedUser.password;

    return {
      user: sanitizedUser,
      token: accessToken,
      refreshToken,
      role: role || 'admin'
    };
  }

  async refreshToken(token) {
    if (!token) throw { statusCode: 400, message: 'Refresh token required' };
    try {
      const decoded = verifyRefreshToken(token);
      const payload = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        userType: decoded.userType,
        class_id: decoded.class_id,
        section_id: decoded.section_id
      };
      const newAccessToken = generateAccessToken(payload);
      return { token: newAccessToken };
    } catch (err) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token' };
    }
  }

  async getMe(userContext) {
    if (!userContext) throw { statusCode: 401, message: 'Unauthorized' };
    const { userType, id } = userContext;

    let user = null;
    if (userType === 'admin') {
      const [rows] = await authRepo.pool.query(
        `SELECT a.admin_id, a.name, a.email, a.phone, a.status, a.avatar, r.name AS role_name, r.slug AS role_slug, r.permissions
         FROM admin a LEFT JOIN admin_role r ON a.admin_role_id = r.admin_role_id WHERE a.admin_id = ?`, [id]
      );
      user = rows[0];
    } else if (userType === 'teacher') {
      const [rows] = await authRepo.pool.query(
        `SELECT t.teacher_id, t.teacher_number, t.name, t.email, t.phone, t.status, t.file_name, d.name AS department_name, des.name AS designation_name
         FROM teacher t LEFT JOIN department d ON t.department_id = d.department_id LEFT JOIN designation des ON t.designation_id = des.designation_id WHERE t.teacher_id = ?`, [id]
      );
      user = rows[0];
    } else if (userType === 'parent') {
      const [rows] = await authRepo.pool.query(`SELECT parent_id, name, email, phone, profession, status FROM parent WHERE parent_id = ?`, [id]);
      user = rows[0];
    } else if (userType === 'student') {
      const [rows] = await authRepo.pool.query(
        `SELECT s.student_id, s.admission_no, s.roll_no, s.name, s.email, s.phone, s.status, s.file_name, c.name AS class_name, sec.name AS section_name
         FROM student s LEFT JOIN class c ON s.class_id = c.class_id LEFT JOIN section sec ON s.section_id = sec.section_id WHERE s.student_id = ?`, [id]
      );
      user = rows[0];
    }

    if (!user) throw { statusCode: 404, message: 'User record not found' };
    return { ...user, role: userContext.role };
  }

  async changePassword(userContext, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw { statusCode: 400, message: 'Current password and new password are required' };
    }

    const { userType, id } = userContext;
    const tableMap = {
      admin: { table: 'admin', col: 'admin_id' },
      teacher: { table: 'teacher', col: 'teacher_id' },
      parent: { table: 'parent', col: 'parent_id' },
      student: { table: 'student', col: 'student_id' }
    };

    const target = tableMap[userType];
    if (!target) throw { statusCode: 400, message: 'Invalid user context' };

    const [rows] = await authRepo.pool.query(`SELECT password FROM ${target.table} WHERE ${target.col} = ?`, [id]);
    if (!rows[0]) throw { statusCode: 404, message: 'User not found' };

    const match = await bcrypt.compare(oldPassword, rows[0].password);
    if (!match) throw { statusCode: 400, message: 'Incorrect current password' };

    const hashed = await bcrypt.hash(newPassword, 10);
    await authRepo.updatePassword(target.table, target.col, id, hashed);
    return { message: 'Password updated successfully' };
  }
}

module.exports = new AuthService();
