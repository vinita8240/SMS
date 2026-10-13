const bcrypt = require('bcryptjs');
const teacherRepo = require('../repositories/teacher.repository');

class TeacherService {
  async getTeachers(filters) {
    return teacherRepo.getFilteredTeachers(filters);
  }

  async getTeacherById(id) {
    const teacher = await teacherRepo.getTeacherProfile(id);
    if (!teacher) throw { statusCode: 404, message: 'Teacher not found' };
    delete teacher.password;
    const assignments = await teacherRepo.getTeacherAssignedClasses(id);
    return {
      ...teacher,
      assignments
    };
  }

  async createTeacher(data) {
    if (!data.name || !data.email) {
      throw { statusCode: 400, message: 'Name and email are required' };
    }

    if (!data.teacher_number) {
      data.teacher_number = `TCH-${Date.now().toString().slice(-4)}`;
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      data.password = await bcrypt.hash('teacher123', 10);
    }

    const insertId = await teacherRepo.create(data);
    return teacherRepo.getTeacherProfile(insertId);
  }

  async updateTeacher(id, data) {
    const existing = await teacherRepo.findById(id);
    if (!existing) throw { statusCode: 404, message: 'Teacher not found' };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    await teacherRepo.update(id, data);
    return teacherRepo.getTeacherProfile(id);
  }

  async deleteTeacher(id) {
    const existing = await teacherRepo.findById(id);
    if (!existing) throw { statusCode: 404, message: 'Teacher not found' };
    return teacherRepo.delete(id);
  }
}

module.exports = new TeacherService();
