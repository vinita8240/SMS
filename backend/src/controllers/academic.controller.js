const academicService = require('../services/academic.service');
const { successResponse } = require('../utils/response');

class AcademicController {
  // Classes
  async getClasses(req, res, next) {
    try {
      const classes = await academicService.getClasses();
      return successResponse(res, 'Classes retrieved successfully', classes);
    } catch (err) {
      next(err);
    }
  }

  async createClass(req, res, next) {
    try {
      const newClass = await academicService.createClass(req.body);
      return successResponse(res, 'Class created successfully', newClass, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateClass(req, res, next) {
    try {
      const updated = await academicService.updateClass(req.params.id, req.body);
      return successResponse(res, 'Class updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteClass(req, res, next) {
    try {
      await academicService.deleteClass(req.params.id);
      return successResponse(res, 'Class deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Sections
  async getSections(req, res, next) {
    try {
      const sections = await academicService.getSections(req.query.class_id);
      return successResponse(res, 'Sections retrieved successfully', sections);
    } catch (err) {
      next(err);
    }
  }

  async createSection(req, res, next) {
    try {
      const section = await academicService.createSection(req.body);
      return successResponse(res, 'Section created successfully', section, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateSection(req, res, next) {
    try {
      const updated = await academicService.updateSection(req.params.id, req.body);
      return successResponse(res, 'Section updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteSection(req, res, next) {
    try {
      await academicService.deleteSection(req.params.id);
      return successResponse(res, 'Section deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Subjects
  async getSubjects(req, res, next) {
    try {
      const subjects = await academicService.getSubjects({
        class_id: req.query.class_id,
        teacher_id: req.query.teacher_id
      });
      return successResponse(res, 'Subjects retrieved successfully', subjects);
    } catch (err) {
      next(err);
    }
  }

  async createSubject(req, res, next) {
    try {
      const subject = await academicService.createSubject(req.body);
      return successResponse(res, 'Subject created successfully', subject, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateSubject(req, res, next) {
    try {
      const updated = await academicService.updateSubject(req.params.id, req.body);
      return successResponse(res, 'Subject updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteSubject(req, res, next) {
    try {
      await academicService.deleteSubject(req.params.id);
      return successResponse(res, 'Subject deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Syllabus
  async getSyllabus(req, res, next) {
    try {
      let class_id = req.query.class_id;

      // If user is a student, automatically scope syllabus strictly to their enrolled class
      if (req.user && (req.user.userType === 'student' || req.user.role === 'student')) {
        let studentClassId = req.user.class_id;
        if (!studentClassId) {
          const pool = require('../config/db');
          const [rows] = await pool.query('SELECT class_id FROM student WHERE student_id = ?', [req.user.id]);
          if (rows.length > 0) studentClassId = rows[0].class_id;
        }
        if (studentClassId) {
          class_id = studentClassId;
        }
      }

      const syllabus = await academicService.getSyllabus({
        class_id,
        subject_id: req.query.subject_id,
        session: req.query.session
      });
      return successResponse(res, 'Syllabus retrieved successfully', syllabus);
    } catch (err) {
      next(err);
    }
  }

  async createSyllabus(req, res, next) {
    try {
      // Only Admin and Teacher can upload syllabus
      const allowedRoles = ['super_admin', 'admin', 'teacher'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators and teachers can upload syllabus.' });
      }

      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      data.uploader_type = req.user.role === 'teacher' ? 'teacher' : 'admin';
      data.uploader_id = req.user.id;

      const item = await academicService.createSyllabus(data);
      return successResponse(res, 'Syllabus uploaded successfully', item, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteSyllabus(req, res, next) {
    try {
      const allowedRoles = ['super_admin', 'admin', 'teacher'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators and teachers can delete syllabus.' });
      }

      await academicService.deleteSyllabus(req.params.id);
      return successResponse(res, 'Syllabus deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Assignments
  async getAssignments(req, res, next) {
    try {
      let class_id = req.query.class_id;

      if (req.user && (req.user.userType === 'student' || req.user.role === 'student')) {
        let studentClassId = req.user.class_id;
        if (!studentClassId) {
          const pool = require('../config/db');
          const [rows] = await pool.query('SELECT class_id FROM student WHERE student_id = ?', [req.user.id]);
          if (rows.length > 0) studentClassId = rows[0].class_id;
        }
        if (studentClassId) {
          class_id = studentClassId;
        }
      }

      const assignments = await academicService.getAssignments({
        class_id,
        subject_id: req.query.subject_id,
        teacher_id: req.query.teacher_id
      });
      return successResponse(res, 'Assignments retrieved successfully', assignments);
    } catch (err) {
      next(err);
    }
  }

  async createAssignment(req, res, next) {
    try {
      const allowedRoles = ['super_admin', 'admin', 'teacher'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators and teachers can create assignments.' });
      }

      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
      }
      if (req.user && req.user.role === 'teacher') {
        data.teacher_id = req.user.id;
      }
      const assignment = await academicService.createAssignment(data);
      return successResponse(res, 'Assignment created successfully', assignment, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteAssignment(req, res, next) {
    try {
      const allowedRoles = ['super_admin', 'admin', 'teacher'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators and teachers can delete assignments.' });
      }

      await academicService.deleteAssignment(req.params.id);
      return successResponse(res, 'Assignment deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Materials
  async getMaterials(req, res, next) {
    try {
      let class_id = req.query.class_id;

      if (req.user && (req.user.userType === 'student' || req.user.role === 'student')) {
        let studentClassId = req.user.class_id;
        if (!studentClassId) {
          const pool = require('../config/db');
          const [rows] = await pool.query('SELECT class_id FROM student WHERE student_id = ?', [req.user.id]);
          if (rows.length > 0) studentClassId = rows[0].class_id;
        }
        if (studentClassId) {
          class_id = studentClassId;
        }
      }

      const materials = await academicService.getMaterials({
        class_id,
        subject_id: req.query.subject_id,
        teacher_id: req.query.teacher_id
      });
      return successResponse(res, 'Study materials retrieved successfully', materials);
    } catch (err) {
      next(err);
    }
  }

  async createMaterial(req, res, next) {
    try {
      const allowedRoles = ['super_admin', 'admin', 'teacher'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators and teachers can upload study materials.' });
      }

      const data = req.body;
      if (req.file) {
        data.file_name = req.file.filename;
        data.file_type = req.file.mimetype;
      }
      if (req.user && req.user.role === 'teacher') {
        data.teacher_id = req.user.id;
      }
      const material = await academicService.createMaterial(data);
      return successResponse(res, 'Study material uploaded successfully', material, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteMaterial(req, res, next) {
    try {
      const allowedRoles = ['super_admin', 'admin', 'teacher'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators and teachers can delete study materials.' });
      }

      await academicService.deleteMaterial(req.params.id);
      return successResponse(res, 'Study material deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AcademicController();
