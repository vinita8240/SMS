const financeService = require('../services/finance.service');
const { successResponse } = require('../utils/response');

class FinanceController {
    // Invoices
    async getInvoices(req, res, next) {
        try {
            const filters = {
                page: req.query.page || 1,
                limit: req.query.limit || 100,
                search: req.query.search || '',
                class_id: req.query.class_id,
                status: req.query.status,
                student_id: req.query.student_id
            };
            const result = await financeService.getInvoices(filters);
            return successResponse(res, 'Invoices retrieved successfully', result.invoices, {
                page: result.page,
                limit: result.limit,
                total: result.total
            });
        } catch (err) {
            next(err);
        }
    }

    async getInvoiceById(req, res, next) {
        try {
            const invoice = await financeService.getInvoiceById(req.params.id);
            return successResponse(res, 'Invoice details retrieved', invoice);
        } catch (err) {
            next(err);
        }
    }

    async createInvoice(req, res, next) {
        try {
            const invoiceId = await financeService.createInvoice(req.body);
            return successResponse(res, 'Invoice created successfully', { invoice_id: invoiceId }, null, 201);
        } catch (err) {
            next(err);
        }
    }

    async updateInvoice(req, res, next) {
        try {
            const invoice = await financeService.updateInvoice(req.params.id, req.body);
            return successResponse(res, 'Invoice updated successfully', invoice);
        } catch (err) {
            next(err);
        }
    }

    async deleteInvoice(req, res, next) {
        try {
            await financeService.deleteInvoice(req.params.id);
            return successResponse(res, 'Invoice deleted successfully');
        } catch (err) {
            next(err);
        }
    }

    async recordPayment(req, res, next) {
        try {
            const result = await financeService.recordPayment(req.params.id, req.body);
            return successResponse(res, 'Fee payment collected successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getFeeMasters(req, res, next) {
        try {
            const data = await financeService.getFeeMasters();
            return successResponse(res, 'Fee masters retrieved', data);
        } catch (err) {
            next(err);
        }
    }

    async createFeeMaster(req, res, next) {
        try {
            const data = await financeService.createFeeMaster(req.body);
            return successResponse(res, 'Fee master created successfully', data, null, 201);
        } catch (err) {
            next(err);
        }
    }

    async updateFeeMaster(req, res, next) {
        try {
            const data = await financeService.updateFeeMaster(req.params.id, req.body);
            return successResponse(res, 'Fee master updated successfully', data);
        } catch (err) {
            next(err);
        }
    }

    async deleteFeeMaster(req, res, next) {
        try {
            await financeService.deleteFeeMaster(req.params.id);
            return successResponse(res, 'Fee master deleted successfully');
        } catch (err) {
            next(err);
        }
    }

    async getFeeGroups(req, res, next) {
        try {
            const data = await financeService.getFeeGroups();
            return successResponse(res, 'Fee groups retrieved', data);
        } catch (err) {
            next(err);
        }
    }

    async createFeeGroup(req, res, next) {
        try {
            const data = await financeService.createFeeGroup(req.body);
            return successResponse(res, 'Fee group created successfully', data, null, 201);
        } catch (err) {
            next(err);
        }
    }

    async updateFeeGroup(req, res, next) {
        try {
            const data = await financeService.updateFeeGroup(req.params.id, req.body);
            return successResponse(res, 'Fee group updated successfully', data);
        } catch (err) {
            next(err);
        }
    }

    async deleteFeeGroup(req, res, next) {
        try {
            await financeService.deleteFeeGroup(req.params.id);
            return successResponse(res, 'Fee group deleted successfully');
        } catch (err) {
            next(err);
        }
    }

    async getFeeTypes(req, res, next) {
        try {
            const data = await financeService.getFeeTypes();
            return successResponse(res, 'Fee types retrieved', data);
        } catch (err) {
            next(err);
        }
    }

    async createFeeType(req, res, next) {
        try {
            const data = await financeService.createFeeType(req.body);
            return successResponse(res, 'Fee type created successfully', data, null, 201);
        } catch (err) {
            next(err);
        }
    }

    async updateFeeType(req, res, next) {
        try {
            const data = await financeService.updateFeeType(req.params.id, req.body);
            return successResponse(res, 'Fee type updated successfully', data);
        } catch (err) {
            next(err);
        }
    }

    async deleteFeeType(req, res, next) {
        try {
            await financeService.deleteFeeType(req.params.id);
            return successResponse(res, 'Fee type deleted successfully');
        } catch (err) {
            next(err);
        }
    }

    async getFeeDiscounts(req, res, next) {
        try {
            const data = await financeService.getFeeDiscounts();
            return successResponse(res, 'Fee discounts retrieved', data);
        } catch (err) {
            next(err);
        }
    }

    async createFeeDiscount(req, res, next) {
        try {
            const data = await financeService.createFeeDiscount(req.body);
            return successResponse(res, 'Fee discount created successfully', data, null, 201);
        } catch (err) {
            next(err);
        }
    }

    // Expenses
    async getExpenseCategories(req, res, next) {
        try {
            const data = await financeService.getExpenseCategories();
            return successResponse(res, 'Expense categories retrieved', data);
        } catch (err) {
            next(err);
        }
    }

    async createExpenseCategory(req, res, next) {
        try {
            const data = await financeService.createExpenseCategory(req.body);
            return successResponse(res, 'Expense category created', data, null, 201);
        } catch (err) {
            next(err);
        }
    }

    async getExpenses(req, res, next) {
        try {
            const filters = {
                page: req.query.page || 1,
                limit: req.query.limit || 100,
                search: req.query.search || '',
                expense_category_id: req.query.expense_category_id,
                start_date: req.query.start_date,
                end_date: req.query.end_date
            };
            const result = await financeService.getExpenses(filters);
            return successResponse(res, 'Expenses retrieved successfully', result.expenses, {
                page: result.page,
                limit: result.limit,
                total: result.total
            });
        } catch (err) {
            next(err);
        }
    }

    async createExpense(req, res, next) {
        try {
            const expense = await financeService.createExpense(req.body);
            return successResponse(res, 'Expense recorded successfully', expense, null, 201);
        } catch (err) {
            next(err);
        }
    }

    async updateExpense(req, res, next) {
        try {
            const expense = await financeService.updateExpense(req.params.id, req.body);
            return successResponse(res, 'Expense updated successfully', expense);
        } catch (err) {
            next(err);
        }
    }

    async deleteExpense(req, res, next) {
        try {
            await financeService.deleteExpense(req.params.id);
            return successResponse(res, 'Expense deleted successfully');
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new FinanceController();