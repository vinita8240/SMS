const pool = require('../../../config/db');

/**
 * Library tool to query books and student/teacher borrowing records
 */
const libraryTool = {
  /**
   * Search for books by title, author, isbn, publisher or subject
   */
  async searchBooks(params = {}) {
    const { query, category_id, class_id, limit = 10 } = params;
    let sql = `
      SELECT b.book_id, b.name, b.author, b.isbn, b.edition, b.publisher,
             b.rack_number, b.price, b.quantity, b.available_quantity, b.status,
             c.name as class_name, sub.name as subject_name, bc.name as category_name
      FROM book b
      LEFT JOIN class c ON b.class_id = c.class_id
      LEFT JOIN subject sub ON b.subject_id = sub.subject_id
      LEFT JOIN book_category bc ON b.book_category_id = bc.book_category_id
      WHERE 1=1
    `;
    const queryParams = [];

    if (query) {
      sql += ` AND (b.name LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.publisher LIKE ? OR sub.name LIKE ?)`;
      const term = `%${query}%`;
      queryParams.push(term, term, term, term, term);
    }
    if (category_id) {
      sql += ` AND b.book_category_id = ?`;
      queryParams.push(category_id);
    }
    if (class_id) {
      sql += ` AND b.class_id = ?`;
      queryParams.push(class_id);
    }

    sql += ` ORDER BY b.name ASC LIMIT ?`;
    queryParams.push(Number(limit));

    const [rows] = await pool.query(sql, queryParams);
    return rows;
  },

  /**
   * Get student issued books and history
   */
  async getStudentLibraryRecords(student_id) {
    if (!student_id) return [];
    const sql = `
      SELECT li.issue_id, li.issue_date, li.due_date, li.return_date, li.fine_amount, li.status,
             b.name as book_name, b.author, b.isbn, b.rack_number
      FROM library_issues li
      JOIN book b ON li.book_id = b.book_id
      WHERE li.borrower_type = 'student' AND li.student_id = ?
      ORDER BY li.issue_date DESC
    `;
    const [rows] = await pool.query(sql, [student_id]);
    return rows;
  },

  /**
   * Library statistics
   */
  async getLibrarySummary() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(book_id) as total_titles,
        COALESCE(SUM(quantity), 0) as total_books,
        COALESCE(SUM(available_quantity), 0) as available_books
      FROM book
    `);
    const [issued] = await pool.query(`
      SELECT COUNT(*) as active_issues FROM library_issues WHERE status IN ('issued', 'overdue')
    `);
    return {
      ...stats[0],
      active_issues: issued[0]?.active_issues || 0
    };
  }
};

module.exports = libraryTool;
