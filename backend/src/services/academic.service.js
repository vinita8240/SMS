const academicRepo = require('../repositories/academic.repository');

class AcademicService {
  // Classes
  async getClasses() {
    return academicRepo.getAllClasses();
  }

  async createClass(data) {
    if (!data.name) throw { statusCode: 400, message: 'Class name is required' };
    const id = await academicRepo.create(data);
    return academicRepo.findById(id);
  }

  async updateClass(id, data) {
    await academicRepo.update(id, data);
    return academicRepo.findById(id);
  }

  async deleteClass(id) {
    return academicRepo.delete(id);
  }

  // Sections
  async getSections(classId) {
    return academicRepo.getSectionsByClass(classId);
  }

  async createSection(data) {
    if (!data.name || !data.class_id) throw { statusCode: 400, message: 'Section name and Class ID are required' };
    const id = await academicRepo.createSection(data);
    return { section_id: id, ...data };
  }

  async updateSection(id, data) {
    await academicRepo.updateSection(id, data);
    return { section_id: id, ...data };
  }

  async deleteSection(id) {
    return academicRepo.deleteSection(id);
  }

  // Subjects
  async getSubjects(filters) {
    return academicRepo.getSubjects(filters);
  }

  async createSubject(data) {
    if (!data.name || !data.class_id) throw { statusCode: 400, message: 'Subject name and Class ID are required' };
    const id = await academicRepo.createSubject(data);
    return { subject_id: id, ...data };
  }

  async updateSubject(id, data) {
    await academicRepo.updateSubject(id, data);
    return { subject_id: id, ...data };
  }

  async deleteSubject(id) {
    return academicRepo.deleteSubject(id);
  }

  // Syllabus
  async getSyllabus(filters) {
    return academicRepo.getSyllabus(filters);
  }

  async createSyllabus(data) {
    if (!data.title || !data.class_id || !data.file_name) {
      throw { statusCode: 400, message: 'Title, Class, and Syllabus File are required' };
    }
    const id = await academicRepo.createSyllabus(data);
    return { academic_syllabus_id: id, ...data };
  }

  async deleteSyllabus(id) {
    return academicRepo.deleteSyllabus(id);
  }

  // Assignments
  async getAssignments(filters) {
    return academicRepo.getAssignments(filters);
  }

  async createAssignment(data) {
    if (!data.title || !data.class_id || !data.subject_id || !data.due_date) {
      throw { statusCode: 400, message: 'Title, Class, Subject, and Due Date are required' };
    }
    const id = await academicRepo.createAssignment(data);
    return { assignment_id: id, ...data };
  }

  async deleteAssignment(id) {
    return academicRepo.deleteAssignment(id);
  }

  // Materials
  async getMaterials(filters) {
    return academicRepo.getMaterials(filters);
  }

  async createMaterial(data) {
    if (!data.title || !data.class_id || !data.file_name) {
      throw { statusCode: 400, message: 'Title, Class, and Material File are required' };
    }
    const id = await academicRepo.createMaterial(data);
    return { document_id: id, ...data };
  }

  async deleteMaterial(id) {
    return academicRepo.deleteMaterial(id);
  }
}

module.exports = new AcademicService();
