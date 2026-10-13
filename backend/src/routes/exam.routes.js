const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');

router.use(authenticate);

// Exams
router.get('/', examController.getExams);
router.post('/', examController.createExam);
router.put('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);

// Questions
router.get('/questions', examController.getQuestions);
router.post('/questions', uploadDocument.single('file'), examController.createQuestion);
router.delete('/questions/:id', examController.deleteQuestion);

// Mark Sheets & Reports
router.get('/marks', examController.getMarkSheet);
router.get('/marks/sheet', examController.getMarkSheet);
router.post('/marks', examController.saveMarks);
router.post('/marks/save', examController.saveMarks);
router.get('/results/student/:studentId?', examController.getStudentResult);

module.exports = router;
