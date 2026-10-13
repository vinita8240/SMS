const pool = require('../config/db');
const { successResponse } = require('../utils/response');

class SearchController {
  async globalSearch(req, res, next) {
    try {
      const q = req.query.q ? req.query.q.trim() : '';
      if (!q || q.length < 2) {
        return successResponse(res, 'Search term too short', { results: [] });
      }

      const searchPattern = `%${q}%`;

      // 1. Students
      const [students] = await pool.query(
        `SELECT student_id AS id, name AS title, CONCAT('Student • Roll: ', COALESCE(roll_no, '-'), ' • Class ID: ', class_id) AS subtitle, '/admin/students/' AS link, 'student' AS type
         FROM student WHERE name LIKE ? OR admission_no LIKE ? OR roll_no LIKE ? LIMIT 5`,
        [searchPattern, searchPattern, searchPattern]
      );

      // 2. Teachers
      const [teachers] = await pool.query(
        `SELECT teacher_id AS id, name AS title, CONCAT('Teacher • ', COALESCE(email, '')) AS subtitle, '/admin/teachers/' AS link, 'teacher' AS type
         FROM teacher WHERE name LIKE ? OR email LIKE ? OR teacher_number LIKE ? LIMIT 5`,
        [searchPattern, searchPattern, searchPattern]
      );

      // 3. Books
      const [books] = await pool.query(
        `SELECT book_id AS id, name AS title, CONCAT('Book • Author: ', author, ' • ISBN: ', COALESCE(isbn, '-')) AS subtitle, '/admin/library' AS link, 'book' AS type
         FROM book WHERE name LIKE ? OR author LIKE ? OR isbn LIKE ? LIMIT 5`,
        [searchPattern, searchPattern, searchPattern]
      );

      // 4. Invoices
      const [invoices] = await pool.query(
        `SELECT invoice_id AS id, invoice_number AS title, CONCAT('Invoice • Due: $', due, ' • Status: ', status) AS subtitle, '/admin/invoices' AS link, 'invoice' AS type
         FROM invoice WHERE invoice_number LIKE ? OR title LIKE ? LIMIT 5`,
        [searchPattern, searchPattern]
      );

      // 5. Notices
      const [notices] = await pool.query(
        `SELECT notice_id AS id, notice_title AS title, CONCAT('Notice • Audience: ', audience) AS subtitle, '/admin/notices' AS link, 'notice' AS type
         FROM noticeboard WHERE notice_title LIKE ? OR notice LIKE ? LIMIT 5`,
        [searchPattern, searchPattern]
      );

      const results = [
        ...students,
        ...teachers,
        ...books,
        ...invoices,
        ...notices
      ];

      return successResponse(res, 'Search results found', { results });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
