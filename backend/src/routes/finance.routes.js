const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Invoices
router.get('/invoices', financeController.getInvoices);
router.get('/invoices/:id', financeController.getInvoiceById);
router.post('/invoices', financeController.createInvoice);
router.put('/invoices/:id', financeController.updateInvoice);
router.delete('/invoices/:id', financeController.deleteInvoice);
router.post('/invoices/:id/payment', financeController.recordPayment);

// Expenses & Categories
router.get('/expense-categories', financeController.getExpenseCategories);
router.post('/expense-categories', financeController.createExpenseCategory);
router.get('/expenses', financeController.getExpenses);
router.post('/expenses', financeController.createExpense);
router.put('/expenses/:id', financeController.updateExpense);
router.delete('/expenses/:id', financeController.deleteExpense);

// Fee catalog
router.get('/fee-masters', financeController.getFeeMasters);
router.post('/fee-masters', financeController.createFeeMaster);
router.put('/fee-masters/:id', financeController.updateFeeMaster);
router.delete('/fee-masters/:id', financeController.deleteFeeMaster);

router.get('/fee-groups', financeController.getFeeGroups);
router.post('/fee-groups', financeController.createFeeGroup);
router.put('/fee-groups/:id', financeController.updateFeeGroup);
router.delete('/fee-groups/:id', financeController.deleteFeeGroup);

router.get('/fee-types', financeController.getFeeTypes);
router.post('/fee-types', financeController.createFeeType);
router.put('/fee-types/:id', financeController.updateFeeType);
router.delete('/fee-types/:id', financeController.deleteFeeType);

router.get('/fee-discounts', financeController.getFeeDiscounts);
router.post('/fee-discounts', financeController.createFeeDiscount);

module.exports = router;