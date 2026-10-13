const libraryRepo = require('../repositories/library.repository');

class LibraryService {
  async getBooks(filters) {
    return libraryRepo.getBooks(filters);
  }

  async createBook(data) {
    return libraryRepo.createBook(data);
  }

  async updateBook(id, data) {
    return libraryRepo.updateBook(id, data);
  }

  async deleteBook(id) {
    return libraryRepo.deleteBook(id);
  }

  async getCategories() {
    return libraryRepo.getBookCategories();
  }

  async createCategory(data) {
    return libraryRepo.createCategory(data);
  }

  async updateCategory(id, data) {
    return libraryRepo.updateCategory(id, data);
  }

  async deleteCategory(id) {
    return libraryRepo.deleteCategory(id);
  }

  async getIssues(filters) {
    return libraryRepo.getIssues(filters);
  }

  async issueBook(bookId, studentId, teacherId, dueDate, issueDate) {
    return libraryRepo.issueBook(bookId, studentId, teacherId, dueDate, issueDate);
  }

  async returnBook(issueId, fineAmount, returnDate) {
    return libraryRepo.returnBook(issueId, fineAmount, returnDate);
  }
}

module.exports = new LibraryService();
