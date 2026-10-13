const financeRepo = require('../repositories/finance.repository');

class FinanceService {
    async getInvoices(filters) {
        return financeRepo.getFilteredInvoices(filters);
    }

    async getInvoiceById(id) {
        return financeRepo.getInvoiceWithPayments(id);
    }

    async createInvoice(data) {
        return financeRepo.createInvoice(data);
    }

    async updateInvoice(id, data) {
        return financeRepo.updateInvoice(id, data);
    }

    async deleteInvoice(id) {
        return financeRepo.deleteInvoice(id);
    }

    async recordPayment(invoiceId, data) {
        return financeRepo.recordPayment(invoiceId, data);
    }

    async getFeeMasters() { return financeRepo.getFeeMasters(); }
    async createFeeMaster(data) { return financeRepo.createFeeMaster(data); }
    async updateFeeMaster(id, data) { return financeRepo.updateFeeMaster(id, data); }
    async deleteFeeMaster(id) { return financeRepo.deleteFeeMaster(id); }

    async getFeeGroups() { return financeRepo.getFeeGroups(); }
    async createFeeGroup(data) { return financeRepo.createFeeGroup(data); }
    async updateFeeGroup(id, data) { return financeRepo.updateFeeGroup(id, data); }
    async deleteFeeGroup(id) { return financeRepo.deleteFeeGroup(id); }

    async getFeeTypes() { return financeRepo.getFeeTypes(); }
    async createFeeType(data) { return financeRepo.createFeeType(data); }
    async updateFeeType(id, data) { return financeRepo.updateFeeType(id, data); }
    async deleteFeeType(id) { return financeRepo.deleteFeeType(id); }

    async getFeeDiscounts() { return financeRepo.getFeeDiscounts(); }
    async createFeeDiscount(data) { return financeRepo.createFeeDiscount(data); }

    async getExpenseCategories() {
        return financeRepo.getExpenseCategories();
    }

    async createExpenseCategory(data) {
        return financeRepo.createExpenseCategory(data);
    }

    async getExpenses(filters) {
        return financeRepo.getExpenses(filters);
    }

    async createExpense(data) {
        return financeRepo.createExpense(data);
    }

    async updateExpense(id, data) {
        return financeRepo.updateExpense(id, data);
    }

    async deleteExpense(id) {
        return financeRepo.deleteExpense(id);
    }
}

module.exports = new FinanceService();