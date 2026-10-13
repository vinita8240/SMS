const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/library.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Books
router.get('/books', libraryController.getBooks);
router.post('/books', libraryController.createBook);
router.put('/books/:id', libraryController.updateBook);
router.delete('/books/:id', libraryController.deleteBook);

// Categories
router.get('/categories', libraryController.getCategories);
router.post('/categories', libraryController.createCategory);
router.put('/categories/:id', libraryController.updateCategory);
router.delete('/categories/:id', libraryController.deleteCategory);

// Issues & Returns (supports both /issues and /issue, and return action)
router.get('/issues', libraryController.getIssues);
router.post('/issues', libraryController.issueBook);
router.post('/issue', libraryController.issueBook);

router.post('/issues/:id/return', libraryController.returnBook);
router.post('/return/:id', libraryController.returnBook);

module.exports = router;
