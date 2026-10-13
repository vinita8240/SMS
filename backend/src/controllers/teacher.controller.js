const teacherService = require('../services/teacher.service');
const { successResponse } = require('../utils/response');

class TeacherController {
  async getTeachers(req, res, next) {
    try {
      const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        search: req.query.search || '',
        department_id: req.query.department_id,
        designation_id: req.query.designation_id,
        status: req.query.status
      };
      const result = await teacherService.getTeachers(filters);
      return successResponse(res, 'Teachers retrieved successfully', result.teachers, {
        page: result.page,
        limit: result.limit,
        total: result.total
      });
    } catch (err) {
      next(err);
    }
  }

  async getTeacherById(req, res, next) {
    try {
      const teacher = await teacherService.getTeacherById(req.params.id);
      return successResponse(res, 'Teacher details retrieved', teacher);
    } catch (err) {
      next(err);
    }
  }

  async createTeacher(req, res, next) {
    try {
      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      const teacher = await teacherService.createTeacher(data);
      return successResponse(res, 'Teacher created successfully', teacher, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateTeacher(req, res, next) {
    try {
      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      const teacher = await teacherService.updateTeacher(req.params.id, data);
      return successResponse(res, 'Teacher updated successfully', teacher);
    } catch (err) {
      next(err);
    }
  }

  async deleteTeacher(req, res, next) {
    try {
      await teacherService.deleteTeacher(req.params.id);
      return successResponse(res, 'Teacher deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TeacherController();
