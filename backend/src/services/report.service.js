const pool = require('../config/db');

class ReportService {
  async getStudentReport(filters = {}) {
    const { class_id, section_id, status } = filters;
    let sql = `
      SELECT 
        s.admission_no, s.roll_no, s.name, s.gender, s.birthday, s.phone, s.status, s.session,
        c.name AS class_name, sec.name AS section_name, p.name AS parent_name, p.phone AS parent_phone
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      JOIN section sec ON s.section_id = sec.section_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE 1=1
    `;
    const params = [];
    if (class_id) {
      sql += ` AND s.class_id = ?`;
      params.push(class_id);
    }
    if (section_id) {
      sql += ` AND s.section_id = ?`;
      params.push(section_id);
    }
    if (status) {
      sql += ` AND s.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY c.name_numeric ASC, s.name ASC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getFeeCollectionReport(startDate, endDate) {
    let sql = `
      SELECT 
        p.payment_id, p.payment_date, p.title, p.payment_method, p.amount, p.transaction_reference,
        i.invoice_number, s.name AS student_name, s.admission_no, c.name AS class_name
      FROM payment p
      LEFT JOIN invoice i ON p.invoice_id = i.invoice_id
      LEFT JOIN student s ON p.student_id = s.student_id
      LEFT JOIN class c ON i.class_id = c.class_id
      WHERE 1=1
    `;
    const params = [];
    if (startDate && endDate) {
      sql += ` AND p.payment_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    sql += ` ORDER BY p.payment_date DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getOutstandingFeeReport(class_id) {
    let sql = `
      SELECT 
        i.invoice_id, i.invoice_number, i.title, i.amount, i.discount, i.amount_paid, i.due, i.due_date, i.status,
        s.name AS student_name, s.admission_no, s.phone AS student_phone,
        c.name AS class_name, p.name AS parent_name, p.phone AS parent_phone
      FROM invoice i
      JOIN student s ON i.student_id = s.student_id
      JOIN class c ON i.class_id = c.class_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE i.due > 0
    `;
    const params = [];
    if (class_id) {
      sql += ` AND i.class_id = ?`;
      params.push(class_id);
    }
    sql += ` ORDER BY i.due DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getExamResultsReport(examId, classId, sectionId) {
    const sql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name AS student_name,
        sub.name AS subject_name,
        m.mark_obtained, m.mark_total, m.grade_point, m.grade
      FROM student s
      JOIN mark m ON s.student_id = m.student_id AND m.exam_id = ?
      JOIN subject sub ON m.subject_id = sub.subject_id
      WHERE s.class_id = ? AND s.section_id = ?
      ORDER BY s.student_id ASC, sub.name ASC
    `;
    const [rows] = await pool.query(sql, [examId, classId, sectionId]);
    return rows;
  }
}

module.exports = new ReportService();
