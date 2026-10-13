const BaseRepository = require('./base.repository');

class ExamRepository extends BaseRepository {
  constructor() {
    super('exam', 'exam_id');
  }

  // --- Exams ---
  async getExams(session) {
    let sql = `
      SELECT 
        exam_id AS id,
        exam_id,
        name,
        name AS title,
        start_date,
        start_date AS date,
        end_date,
        session,
        status,
        comment,
        comment AS description
      FROM exam
    `;
    const params = [];
    if (session) {
      sql += ` WHERE session = ?`;
      params.push(session);
    }
    sql += ` ORDER BY start_date DESC`;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createExam(data) {
    const [res] = await this.pool.query(
      `INSERT INTO exam (name, start_date, end_date, session, status, comment) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name || data.title, data.start_date || data.date, data.end_date || data.start_date, data.session || '2025-2026', data.status || 'scheduled', data.comment || data.description || '']
    );
    return { id: res.insertId, ...data };
  }

  async updateExam(id, data) {
    await this.pool.query(
      `UPDATE exam SET
        name = COALESCE(?, name),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        session = COALESCE(?, session),
        status = COALESCE(?, status),
        comment = COALESCE(?, comment)
       WHERE exam_id = ?`,
      [data.name || data.title, data.start_date || data.date, data.end_date, data.session, data.status, data.comment || data.description, id]
    );
    return { id, ...data };
  }

  async deleteExam(id) {
    await this.pool.query(`DELETE FROM mark WHERE exam_id = ?`, [id]);
    await this.pool.query(`DELETE FROM exam WHERE exam_id = ?`, [id]);
    return true;
  }

  // --- Questions ---
  async getQuestions(filters = {}) {
    const { exam_id, class_id, subject_id } = filters;
    const conditions = [];
    const params = [];

    if (exam_id) {
      conditions.push('eq.exam_id = ?');
      params.push(exam_id);
    }
    if (class_id) {
      conditions.push('eq.class_id = ?');
      params.push(class_id);
    }
    if (subject_id) {
      conditions.push('eq.subject_id = ?');
      params.push(subject_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT 
        eq.question_id AS id,
        eq.question_id,
        eq.exam_id,
        eq.class_id,
        eq.subject_id,
        eq.question,
        eq.marks,
        eq.file_name,
        e.name AS exam_name,
        c.name AS class_name,
        sub.name AS subject_name,
        t.name AS teacher_name
      FROM exam_question eq
      LEFT JOIN exam e ON eq.exam_id = e.exam_id
      LEFT JOIN class c ON eq.class_id = c.class_id
      LEFT JOIN subject sub ON eq.subject_id = sub.subject_id
      LEFT JOIN teacher t ON eq.teacher_id = t.teacher_id
      ${where}
      ORDER BY eq.question_id DESC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createQuestion(data) {
    const sql = `INSERT INTO exam_question (exam_id, class_id, subject_id, teacher_id, question, marks, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await this.pool.query(sql, [data.exam_id, data.class_id, data.subject_id, data.teacher_id || null, data.question, data.marks || 1, data.file_name || null]);
    return { id: res.insertId, ...data };
  }

  async deleteQuestion(id) {
    const [res] = await this.pool.query(`DELETE FROM exam_question WHERE question_id = ?`, [id]);
    return res.affectedRows > 0;
  }

  // --- Marks Sheet ---
  async getAllMarks() {
    const sql = `
      SELECT 
        m.mark_id AS id,
        m.mark_id,
        m.student_id,
        s.name AS student_name,
        e.name AS exam_name,
        sub.name AS subject_name,
        m.mark_obtained,
        m.mark_total AS max_marks,
        m.grade,
        m.grade_point
      FROM mark m
      LEFT JOIN student s ON m.student_id = s.student_id
      LEFT JOIN exam e ON m.exam_id = e.exam_id
      LEFT JOIN subject sub ON m.subject_id = sub.subject_id
      ORDER BY m.mark_id DESC
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  async getMarkSheet(examId, classId, sectionId, subjectId) {
    const sql = `
      SELECT 
        s.student_id AS id,
        s.student_id,
        s.admission_no,
        s.roll_no,
        s.name AS student_name,
        m.mark_id,
        COALESCE(m.mark_obtained, 0) AS mark_obtained,
        COALESCE(m.mark_total, 100) AS mark_total,
        m.grade_point,
        m.grade,
        m.comment
      FROM student s
      LEFT JOIN mark m ON s.student_id = m.student_id AND m.exam_id = ? AND m.subject_id = ?
      WHERE s.class_id = ? AND s.section_id = ? AND s.status = 'active'
      ORDER BY CAST(s.roll_no AS UNSIGNED) ASC, s.name ASC
    `;
    const [rows] = await this.pool.query(sql, [examId, subjectId, classId, sectionId]);
    return rows;
  }

  async saveMarksBatch(examId, classId, sectionId, subjectId, markEntries) {
    return this.withTransaction(async (conn) => {
      for (const entry of markEntries) {
        const checkSql = `SELECT mark_id FROM mark WHERE student_id = ? AND exam_id = ? AND subject_id = ?`;
        const [existing] = await conn.query(checkSql, [entry.student_id, examId, subjectId]);

        if (existing.length > 0) {
          await conn.query(
            `UPDATE mark 
             SET mark_obtained = ?, mark_total = ?, grade_point = ?, grade = ?, comment = ?, section_id = ?
             WHERE mark_id = ?`,
            [entry.mark_obtained, entry.mark_total || 100, entry.grade_point, entry.grade, entry.comment || null, sectionId, existing[0].mark_id]
          );
        } else {
          await conn.query(
            `INSERT INTO mark (student_id, subject_id, class_id, section_id, exam_id, mark_obtained, mark_total, grade_point, grade, comment)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [entry.student_id, subjectId, classId, sectionId, examId, entry.mark_obtained, entry.mark_total || 100, entry.grade_point, entry.grade, entry.comment || null]
          );
        }
      }
      return true;
    });
  }

  async getStudentReportCard(studentId, examId) {
    const studentSql = `
      SELECT s.*, c.name AS class_name, sec.name AS section_name, e.name AS exam_name, e.session
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      JOIN section sec ON s.section_id = sec.section_id
      CROSS JOIN exam e ON e.exam_id = ?
      WHERE s.student_id = ?
    `;
    const [studentRows] = await this.pool.query(studentSql, [examId, studentId]);
    if (!studentRows[0]) return null;

    const marksSql = `
      SELECT 
        m.*,
        sub.name AS subject_name,
        sub.code AS subject_code,
        sub.pass_mark,
        sub.final_mark
      FROM mark m
      JOIN subject sub ON m.subject_id = sub.subject_id
      WHERE m.student_id = ? AND m.exam_id = ?
      ORDER BY sub.name ASC
    `;
    const [marks] = await this.pool.query(marksSql, [studentId, examId]);

    let totalObtained = 0;
    let totalMax = 0;
    let totalGradePoints = 0;
    let isPassed = true;

    for (const item of marks) {
      totalObtained += parseFloat(item.mark_obtained) || 0;
      totalMax += parseFloat(item.mark_total) || 100;
      totalGradePoints += parseFloat(item.grade_point) || 0;
      if (parseFloat(item.mark_obtained) < (parseFloat(item.pass_mark) || 40)) {
        isPassed = false;
      }
    }

    const count = marks.length || 1;
    const gpa = (totalGradePoints / count).toFixed(2);
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00';

    return {
      student: studentRows[0],
      marks,
      summary: {
        totalObtained,
        totalMax,
        percentage,
        gpa,
        isPassed,
        status: isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'
      }
    };
  }
}

module.exports = new ExamRepository();
