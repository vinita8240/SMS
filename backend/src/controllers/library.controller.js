const libraryService = require('../services/library.service');
const { successResponse } = require('../utils/response');

class LibraryController {
  async getBooks(req, res, next) {
    try {
      const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 100,
        search: req.query.search || '',
        book_category_id: req.query.book_category_id,
        status: req.query.status
      };
      const result = await libraryService.getBooks(filters);
      return successResponse(res, 'Books retrieved successfully', result.books, {
        page: result.page,
        limit: result.limit,
        total: result.total
      });
    } catch (err) {
      next(err);
    }
  }

  async createBook(req, res, next) {
    try {
      const book = await libraryService.createBook(req.body);
      return successResponse(res, 'Book added successfully', book, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateBook(req, res, next) {
    try {
      const book = await libraryService.updateBook(req.params.id, req.body);
      return successResponse(res, 'Book updated successfully', book);
    } catch (err) {
      next(err);
    }
  }

  async deleteBook(req, res, next) {
    try {
      await libraryService.deleteBook(req.params.id);
      return successResponse(res, 'Book deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await libraryService.getCategories();
      return successResponse(res, 'Book categories retrieved', categories);
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await libraryService.createCategory(req.body);
      return successResponse(res, 'Category created successfully', category, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await libraryService.updateCategory(req.params.id, req.body);
      return successResponse(res, 'Category updated successfully', category);
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await libraryService.deleteCategory(req.params.id);
      return successResponse(res, 'Category deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getIssues(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        student_id: req.query.student_id
      };
      const issues = await libraryService.getIssues(filters);
      return successResponse(res, 'Book issues retrieved', issues);
    } catch (err) {
      next(err);
    }
  }

  async issueBook(req, res, next) {
    try {
      const { book_id, student_id, teacher_id, due_date, issue_date } = req.body;
      const issueId = await libraryService.issueBook(book_id, student_id, teacher_id, due_date, issue_date);
      return successResponse(res, 'Book issued successfully', { issue_id: issueId }, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async returnBook(req, res, next) {
    try {
      const { fine_amount, return_date } = req.body;
      await libraryService.returnBook(req.params.id, fine_amount, return_date);
      return successResponse(res, 'Book returned successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LibraryController();
