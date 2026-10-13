const BaseRepository = require('./base.repository');

class AcademicRepository extends BaseRepository {
  constructor() {
    super('class', 'class_id');
  }

  // --- Classes ---
  async getAllClasses() {
    const sql = `
      SELECT 
        c.*,
        t.name AS teacher_name,
        (SELECT COUNT(*) FROM section s WHERE s.class_id = c.class_id) AS total_sections,
        (SELECT COUNT(*) FROM student st WHERE st.class_id = c.class_id AND st.status = 'active') AS total_students
      FROM class c
      LEFT JOIN teacher t ON c.teacher_id = t.teacher_id
      ORDER BY c.name_numeric ASC, c.name ASC
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  // --- Sections ---
  async getSectionsByClass(classId) {
    const sql = `
      SELECT 
        s.*,
        c.name AS class_name,
        t.name AS teacher_name,
        (SELECT COUNT(*) FROM student st WHERE st.section_id = s.section_id AND st.status = 'active') AS total_students
      FROM section s
      JOIN class c ON s.class_id = c.class_id
      LEFT JOIN teacher t ON s.teacher_id = t.teacher_id
      ${classId ? 'WHERE s.class_id = ?' : ''}
      ORDER BY s.name ASC
    `;
    const params = classId ? [classId] : [];
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createSection(data) {
    const sql = `INSERT INTO section (name, nick_name, class_id, teacher_id, capacity) VALUES (?, ?, ?, ?, ?)`;
    const [res] = await this.pool.query(sql, [data.name, data.nick_name || null, data.class_id, data.teacher_id || null, data.capacity || 40]);
    return res.insertId;
  }

  async updateSection(id, data) {
    const sql = `UPDATE section SET name = ?, nick_name = ?, class_id = ?, teacher_id = ?, capacity = ? WHERE section_id = ?`;
    const [res] = await this.pool.query(sql, [data.name, data.nick_name || null, data.class_id, data.teacher_id || null, data.capacity || 40, id]);
    return res.affectedRows > 0;
  }

  async deleteSection(id) {
    const [res] = await this.pool.query(`DELETE FROM section WHERE section_id = ?`, [id]);
    return res.affectedRows > 0;
  }

  // --- Subjects ---
  async getSubjects(filters = {}) {
    const { class_id, teacher_id } = filters;
    const conditions = [];
    const params = [];

    if (class_id) {
      conditions.push('sub.class_id = ?');
      params.push(class_id);
    }
    if (teacher_id) {
      conditions.push('sub.teacher_id = ?');
      params.push(teacher_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT 
        sub.*,
        c.name AS class_name,
        t.name AS teacher_name
      FROM subject sub
      JOIN class c ON sub.class_id = c.class_id
      LEFT JOIN teacher t ON sub.teacher_id = t.teacher_id
      ${where}
      ORDER BY c.name_numeric ASC, sub.name ASC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createSubject(data) {
    const sql = `INSERT INTO subject (name, code, class_id, teacher_id, type, pass_mark, final_mark) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await this.pool.query(sql, [data.name, data.code || null, data.class_id, data.teacher_id || null, data.type || 'theory', data.pass_mark || 40, data.final_mark || 100]);
    return res.insertId;
  }

  async updateSubject(id, data) {
    const sql = `UPDATE subject SET name = ?, code = ?, class_id = ?, teacher_id = ?, type = ?, pass_mark = ?, final_mark = ? WHERE subject_id = ?`;
    const [res] = await this.pool.query(sql, [data.name, data.code || null, data.class_id, data.teacher_id || null, data.type || 'theory', data.pass_mark || 40, data.final_mark || 100, id]);
    return res.affectedRows > 0;
  }

  async deleteSubject(id) {
    const [res] = await this.pool.query(`DELETE FROM subject WHERE subject_id = ?`, [id]);
    return res.affectedRows > 0;
  }

  // --- Syllabus ---
  async getSyllabus(filters = {}) {
    const { class_id, subject_id, session } = filters;
    const conditions = [];
    const params = [];

    if (class_id) {
      conditions.push('syl.class_id = ?');
      params.push(class_id);
    }
    if (subject_id) {
      conditions.push('syl.subject_id = ?');
      params.push(subject_id);
    }
    if (session) {
      conditions.push('syl.session = ?');
      params.push(session);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT 
        syl.*,
        c.name AS class_name,
        sub.name AS subject_name
      FROM academic_syllabus syl
      JOIN class c ON syl.class_id = c.class_id
      LEFT JOIN subject sub ON syl.subject_id = sub.subject_id
      ${where}
      ORDER BY syl.academic_syllabus_id DESC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createSyllabus(data) {
    const sql = `INSERT INTO academic_syllabus (academic_syllabus_code, title, description, class_id, subject_id, session, file_name, uploader_type, uploader_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await this.pool.query(sql, [data.academic_syllabus_code || null, data.title, data.description || null, data.class_id, data.subject_id || null, data.session || '2026-2027', data.file_name, data.uploader_type || 'admin', data.uploader_id || 1]);
    return res.insertId;
  }

  async deleteSyllabus(id) {
    const [res] = await this.pool.query(`DELETE FROM academic_syllabus WHERE academic_syllabus_id = ?`, [id]);
    return res.affectedRows > 0;
  }

  // --- Assignments ---
  async getAssignments(filters = {}) {
    const { class_id, subject_id, teacher_id } = filters;
    const conditions = [];
    const params = [];

    if (class_id) {
      conditions.push('a.class_id = ?');
      params.push(class_id);
    }
    if (subject_id) {
      conditions.push('a.subject_id = ?');
      params.push(subject_id);
    }
    if (teacher_id) {
      conditions.push('a.teacher_id = ?');
      params.push(teacher_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT 
        a.*,
        c.name AS class_name,
        sub.name AS subject_name,
        t.name AS teacher_name
      FROM assignment a
      JOIN class c ON a.class_id = c.class_id
      JOIN subject sub ON a.subject_id = sub.subject_id
      LEFT JOIN teacher t ON a.teacher_id = t.teacher_id
      ${where}
      ORDER BY a.due_date DESC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createAssignment(data) {
    const sql = `INSERT INTO assignment (assignment_code, title, description, class_id, subject_id, teacher_id, due_date, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await this.pool.query(sql, [data.assignment_code || null, data.title, data.description || null, data.class_id, data.subject_id, data.teacher_id || null, data.due_date, data.file_name || null]);
    return res.insertId;
  }

  async deleteAssignment(id) {
    const [res] = await this.pool.query(`DELETE FROM assignment WHERE assignment_id = ?`, [id]);
    return res.affectedRows > 0;
  }

  // --- Study Materials ---
  async getMaterials(filters = {}) {
    const { class_id, subject_id, teacher_id } = filters;
    const conditions = [];
    const params = [];

    if (class_id) {
      conditions.push('m.class_id = ?');
      params.push(class_id);
    }
    if (subject_id) {
      conditions.push('m.subject_id = ?');
      params.push(subject_id);
    }
    if (teacher_id) {
      conditions.push('m.teacher_id = ?');
      params.push(teacher_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT 
        m.*,
        c.name AS class_name,
        sub.name AS subject_name,
        t.name AS teacher_name
      FROM material m
      JOIN class c ON m.class_id = c.class_id
      LEFT JOIN subject sub ON m.subject_id = sub.subject_id
      LEFT JOIN teacher t ON m.teacher_id = t.teacher_id
      ${where}
      ORDER BY m.document_id DESC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createMaterial(data) {
    const sql = `INSERT INTO material (title, description, file_name, file_type, class_id, subject_id, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await this.pool.query(sql, [data.title, data.description || null, data.file_name, data.file_type || 'pdf', data.class_id, data.subject_id || null, data.teacher_id || null]);
    return res.insertId;
  }

  async deleteMaterial(id) {
    const [res] = await this.pool.query(`DELETE FROM material WHERE document_id = ?`, [id]);
    return res.affectedRows > 0;
  }
}

module.exports = new AcademicRepository();
