const studentService = require('../services/student.service');
const { successResponse } = require('../utils/response');

class StudentController {
  async getStudents(req, res, next) {
    try {
      const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 200,
        search: req.query.search || req.query.q || '',
        class_id: req.query.class_id,
        section_id: req.query.section_id,
        session: req.query.session,
        status: req.query.status,
        gender: req.query.gender,
        parent_id: req.query.parent_id
      };
      const result = await studentService.getStudents(filters);
      return successResponse(res, 'Students retrieved successfully', result.students, {
        page: result.page,
        limit: result.limit,
        total: result.total
      });
    } catch (err) {
      next(err);
    }
  }

  async getStudentById(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      return successResponse(res, 'Student details retrieved', student);
    } catch (err) {
      next(err);
    }
  }

  async createStudent(req, res, next) {
    try {
      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      const student = await studentService.createStudent(data);
      return successResponse(res, 'Student created successfully', student, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStudent(req, res, next) {
    try {
      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      const student = await studentService.updateStudent(req.params.id, data);
      return successResponse(res, 'Student updated successfully', student);
    } catch (err) {
      next(err);
    }
  }

  async deleteStudent(req, res, next) {
    try {
      await studentService.deleteStudent(req.params.id);
      return successResponse(res, 'Student deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async reactivateStudent(req, res, next) {
    try {
      const result = await studentService.reactivateStudent(req.params.id);
      return successResponse(res, 'Student reactivated successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async promoteStudents(req, res, next) {
    try {
      const { student_ids, target_class_id, target_section_id, session } = req.body;
      await studentService.promoteStudents(student_ids, target_class_id, target_section_id, session);
      return successResponse(res, 'Students promoted successfully');
    } catch (err) {
      next(err);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      const { student_ids } = req.body;
      const result = await studentService.bulkDeleteStudents(student_ids);
      return successResponse(res, 'Students deleted in bulk', result);
    } catch (err) {
      next(err);
    }
  }

  async bulkDisable(req, res, next) {
    try {
      const { student_ids } = req.body;
      const result = await studentService.bulkDisableStudents(student_ids);
      return successResponse(res, 'Students disabled in bulk', result);
    } catch (err) {
      next(err);
    }
  }

  // Categories
  async getCategories(req, res, next) {
    try {
      const data = await studentService.getCategories();
      return successResponse(res, 'Categories retrieved', data);
    } catch (err) { next(err); }
  }

  async createCategory(req, res, next) {
    try {
      const data = await studentService.createCategory(req.body);
      return successResponse(res, 'Category created', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateCategory(req, res, next) {
    try {
      const data = await studentService.updateCategory(req.params.id, req.body);
      return successResponse(res, 'Category updated', data);
    } catch (err) { next(err); }
  }

  async deleteCategory(req, res, next) {
    try {
      await studentService.deleteCategory(req.params.id);
      return successResponse(res, 'Category deleted');
    } catch (err) { next(err); }
  }

  // Houses
  async getHouses(req, res, next) {
    try {
      const data = await studentService.getHouses();
      return successResponse(res, 'Houses retrieved', data);
    } catch (err) { next(err); }
  }

  async createHouse(req, res, next) {
    try {
      const data = await studentService.createHouse(req.body);
      return successResponse(res, 'House created', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateHouse(req, res, next) {
    try {
      const data = await studentService.updateHouse(req.params.id, req.body);
      return successResponse(res, 'House updated', data);
    } catch (err) { next(err); }
  }

  async deleteHouse(req, res, next) {
    try {
      await studentService.deleteHouse(req.params.id);
      return successResponse(res, 'House deleted');
    } catch (err) { next(err); }
  }

  // Disable Reasons
  async getDisableReasons(req, res, next) {
    try {
      const data = await studentService.getDisableReasons();
      return successResponse(res, 'Disable reasons retrieved', data);
    } catch (err) { next(err); }
  }

  async createDisableReason(req, res, next) {
    try {
      const data = await studentService.createDisableReason(req.body);
      return successResponse(res, 'Disable reason created', data, null, 201);
    } catch (err) { next(err); }
  }

  async updateDisableReason(req, res, next) {
    try {
      const data = await studentService.updateDisableReason(req.params.id, req.body);
      return successResponse(res, 'Disable reason updated', data);
    } catch (err) { next(err); }
  }

  async deleteDisableReason(req, res, next) {
    try {
      await studentService.deleteDisableReason(req.params.id);
      return successResponse(res, 'Disable reason deleted');
    } catch (err) { next(err); }
  }

  // Online Admissions
  async getOnlineAdmissions(req, res, next) {
    try {
      const data = await studentService.getOnlineAdmissions(req.query);
      return successResponse(res, 'Online admissions retrieved', data);
    } catch (err) { next(err); }
  }

  async updateOnlineAdmission(req, res, next) {
    try {
      const data = await studentService.updateOnlineAdmission(req.params.id, req.body);
      return successResponse(res, 'Online admission updated', data);
    } catch (err) { next(err); }
  }

  async enrollOnlineAdmission(req, res, next) {
    try {
      const result = await studentService.enrollOnlineAdmission(req.params.id, req.body);
      return successResponse(res, 'Applicant enrolled successfully', result);
    } catch (err) { next(err); }
  }

  // Import Students & Download Sample
  async downloadImportSample(req, res, next) {
    try {
      const csvData = studentService.getImportSampleCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="sample_student_import.csv"');
      return res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  }

  async importStudents(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel (.xlsx) file' });
      }
      const { class_id, section_id, session } = req.body;
      const result = await studentService.importStudents({
        filePath: req.file.path,
        fileBuffer: req.file.buffer,
        class_id,
        section_id,
        session
      });
      return successResponse(res, `Processed ${result.totalRows} student rows: ${result.importedCount} imported, ${result.failedCount} skipped/failed`, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudentController();
