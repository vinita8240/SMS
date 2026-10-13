const BaseRepository = require('./base.repository');

class LibraryRepository extends BaseRepository {
  constructor() {
    super('book', 'book_id');
  }

  // --- Books ---
  async getBooks(filters = {}) {
    const { page = 1, limit = 100, search = '', book_category_id, status } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(b.name LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.publisher LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (book_category_id) {
      conditions.push('b.book_category_id = ?');
      params.push(book_category_id);
    }
    if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM book b ${where}`;
    const [countRows] = await this.pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        b.book_id AS id,
        b.book_id,
        b.name AS title,
        b.name,
        b.author,
        b.isbn,
        b.publisher,
        b.edition,
        b.rack_number,
        b.quantity AS total_copies,
        b.quantity AS copies,
        b.available_quantity AS available_copies,
        b.status,
        b.book_category_id AS category_id,
        bc.name AS category_name,
        c.name AS class_name,
        sub.name AS subject_name
      FROM book b
      LEFT JOIN book_category bc ON b.book_category_id = bc.book_category_id
      LEFT JOIN class c ON b.class_id = c.class_id
      LEFT JOIN subject sub ON b.subject_id = sub.subject_id
      ${where}
      ORDER BY b.book_id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return {
      books: rows,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  async createBook(data) {
    const name = data.title || data.name;
    const author = data.author;
    const book_category_id = data.category_id || data.book_category_id || 1;
    const isbn = data.isbn || '';
    const publisher = data.publisher || '';
    const rack_number = data.rack_number || '';
    const quantity = data.copies || data.total_copies || data.quantity || 1;
    const available_quantity = quantity;

    const [res] = await this.pool.query(
      `INSERT INTO book (name, author, book_category_id, isbn, publisher, rack_number, quantity, available_quantity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [name, author, book_category_id, isbn, publisher, rack_number, quantity, available_quantity]
    );

    return { id: res.insertId, ...data };
  }

  async updateBook(id, data) {
    const name = data.title || data.name;
    const author = data.author;
    const book_category_id = data.category_id || data.book_category_id;
    const isbn = data.isbn || '';
    const publisher = data.publisher || '';
    const rack_number = data.rack_number || '';
    const quantity = data.copies || data.total_copies || data.quantity;

    await this.pool.query(
      `UPDATE book SET 
        name = COALESCE(?, name),
        author = COALESCE(?, author),
        book_category_id = COALESCE(?, book_category_id),
        isbn = ?,
        publisher = ?,
        rack_number = ?,
        quantity = COALESCE(?, quantity),
        available_quantity = COALESCE(?, available_quantity)
       WHERE book_id = ?`,
      [name, author, book_category_id, isbn, publisher, rack_number, quantity, quantity, id]
    );

    return { id, ...data };
  }

  async deleteBook(id) {
    await this.pool.query(`DELETE FROM book WHERE book_id = ?`, [id]);
    return true;
  }

  // --- Categories ---
  async getBookCategories() {
    const [rows] = await this.pool.query(`
      SELECT 
        book_category_id AS id,
        book_category_id,
        name,
        description
      FROM book_category 
      ORDER BY name ASC
    `);
    return rows;
  }

  async createCategory(data) {
    const [res] = await this.pool.query(
      `INSERT INTO book_category (name, description) VALUES (?, ?)`,
      [data.name, data.description || '']
    );
    return { id: res.insertId, ...data };
  }

  async updateCategory(id, data) {
    await this.pool.query(
      `UPDATE book_category SET name = ?, description = ? WHERE book_category_id = ?`,
      [data.name, data.description || '', id]
    );
    return { id, ...data };
  }

  async deleteCategory(id) {
    await this.pool.query(`DELETE FROM book_category WHERE book_category_id = ?`, [id]);
    return true;
  }

  // --- Issues / Returns ---
  async getIssues(filters = {}) {
    const { status, student_id } = filters;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('li.status = ?');
      params.push(status);
    }
    if (student_id) {
      conditions.push('li.student_id = ?');
      params.push(student_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        li.issue_id AS id,
        li.issue_id,
        li.book_id,
        li.student_id,
        li.teacher_id,
        li.issue_date,
        li.due_date,
        li.return_date,
        li.fine_amount,
        li.status,
        b.name AS book_title, b.name AS title, b.author, b.isbn,
        s.name AS student_name, s.admission_no, s.roll_no,
        c.name AS class_name,
        t.name AS teacher_name
      FROM library_issues li
      LEFT JOIN book b ON li.book_id = b.book_id
      LEFT JOIN student s ON li.student_id = s.student_id
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN teacher t ON li.teacher_id = t.teacher_id
      ${where}
      ORDER BY li.issue_id DESC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async issueBook(bookId, studentId, teacherId, dueDate, issueDate = null) {
    return this.withTransaction(async (conn) => {
      const [bookRows] = await conn.query(`SELECT * FROM book WHERE book_id = ? FOR UPDATE`, [bookId]);
      if (!bookRows[0]) throw new Error('Book not found');
      if (bookRows[0].available_quantity <= 0) throw new Error('Book is currently unavailable');

      const borrowerType = studentId ? 'student' : 'teacher';
      const fromDate = issueDate || new Date().toISOString().substring(0, 10);
      const [res] = await conn.query(
        `INSERT INTO library_issues (book_id, borrower_type, student_id, teacher_id, issue_date, due_date, status)
         VALUES (?, ?, ?, ?, ?, ?, 'issued')`,
        [bookId, borrowerType, studentId || null, teacherId || null, fromDate, dueDate]
      );

      await conn.query(
        `UPDATE book SET available_quantity = available_quantity - 1, 
         status = CASE WHEN available_quantity <= 1 THEN 'unavailable' ELSE 'available' END
         WHERE book_id = ?`,
        [bookId]
      );

      return res.insertId;
    });
  }

  async returnBook(issueId, fineAmount = 0, returnDate = null) {
    return this.withTransaction(async (conn) => {
      const [issueRows] = await conn.query(`SELECT * FROM library_issues WHERE issue_id = ? FOR UPDATE`, [issueId]);
      if (!issueRows[0]) throw new Error('Issue record not found');
      if (issueRows[0].status === 'returned') throw new Error('Book has already been returned');

      const bookId = issueRows[0].book_id;
      const actualReturnDate = returnDate || new Date().toISOString().substring(0, 10);
      await conn.query(
        `UPDATE library_issues SET status = 'returned', return_date = ?, fine_amount = ? WHERE issue_id = ?`,
        [actualReturnDate, fineAmount, issueId]
      );

      await conn.query(
        `UPDATE book SET available_quantity = available_quantity + 1, status = 'available' WHERE book_id = ?`,
        [bookId]
      );

      return true;
    });
  }
}

module.exports = new LibraryRepository();
