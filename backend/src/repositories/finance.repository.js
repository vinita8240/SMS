const BaseRepository = require('./base.repository');

class FinanceRepository extends BaseRepository {
    constructor() {
        super('invoice', 'invoice_id');
    }

    // --- Invoices ---
    async getFilteredInvoices(filters = {}) {
        const { page = 1, limit = 100, search = '', class_id, status, student_id } = filters;
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push('(i.invoice_number LIKE ? OR i.title LIKE ? OR s.name LIKE ? OR s.admission_no LIKE ?)');
            const str = `%${search}%`;
            params.push(str, str, str, str);
        }
        if (class_id) {
            conditions.push('i.class_id = ?');
            params.push(class_id);
        }
        if (status) {
            conditions.push('i.status = ?');
            params.push(status);
        }
        if (student_id) {
            conditions.push('i.student_id = ?');
            params.push(student_id);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countSql = `SELECT COUNT(*) AS total FROM invoice i LEFT JOIN student s ON i.student_id = s.student_id ${where}`;
        const [countRows] = await this.pool.query(countSql, params);
        const total = countRows[0].total;

        const dataSql = `
      SELECT 
        i.invoice_id AS id,
        i.invoice_id,
        i.invoice_number AS invoice_no,
        i.invoice_number,
        i.title,
        i.description,
        i.amount,
        i.discount,
        i.amount_paid,
        i.due,
        i.due AS amount_due,
        i.due_date,
        i.payment_method,
        i.status,
        i.year,
        s.student_id,
        s.name AS student_name, s.admission_no, s.roll_no,
        c.class_id,
        c.name AS class_name,
        p.phone AS parent_phone
      FROM invoice i
      LEFT JOIN student s ON i.student_id = s.student_id
      LEFT JOIN class c ON i.class_id = c.class_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      ${where}
      ORDER BY i.invoice_id DESC
      LIMIT ? OFFSET ?
    `;
        const [rows] = await this.pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

        return {
            invoices: rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        };
    }

    async getInvoiceWithPayments(invoiceId) {
        const invSql = `
      SELECT 
        i.invoice_id AS id,
        i.invoice_id,
        i.invoice_number AS invoice_no,
        i.invoice_number,
        i.title,
        i.description,
        i.amount,
        i.discount,
        i.amount_paid,
        i.due,
        i.due AS amount_due,
        i.due_date,
        i.payment_method,
        i.status,
        i.year,
        s.student_id,
        s.name AS student_name, s.admission_no, s.roll_no, s.email AS student_email, s.phone AS student_phone,
        c.name AS class_name,
        p.name AS parent_name, p.phone AS parent_phone
      FROM invoice i
      LEFT JOIN student s ON i.student_id = s.student_id
      LEFT JOIN class c ON i.class_id = c.class_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE i.invoice_id = ?
    `;
        const [invRows] = await this.pool.query(invSql, [invoiceId]);
        if (!invRows[0]) return null;

        const paySql = `SELECT payment_id AS id, payment_id, invoice_id, title, payment_method, amount, payment_date, transaction_reference FROM payment WHERE invoice_id = ? ORDER BY payment_id DESC`;
        const [payments] = await this.pool.query(paySql, [invoiceId]);

        return {
            ...invRows[0],
            payments
        };
    }

    async createInvoice(data) {
        const amount = parseFloat(data.amount) || 0;
        const discount = parseFloat(data.discount) || 0;
        const amountPaid = parseFloat(data.amount_paid) || 0;
        const due = Math.max(0, amount - discount - amountPaid);
        const status = due === 0 ? 'paid' : (amountPaid > 0 ? 'partially_paid' : 'unpaid');
        const invoiceNum = data.invoice_no || data.invoice_number || `INV-${Date.now().toString().slice(-6)}`;

        return this.withTransaction(async(conn) => {
            const sql = `
        INSERT INTO invoice (invoice_number, student_id, class_id, title, description, amount, discount, amount_paid, due, due_date, payment_method, status, year)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const [res] = await conn.query(sql, [
                invoiceNum, data.student_id, data.class_id || 1, data.title, data.description || null,
                amount, discount, amountPaid, due, data.due_date || null, data.payment_method || 'Cash', status, data.year || '2025-2026'
            ]);

            if (amountPaid > 0) {
                await conn.query(
                    `INSERT INTO payment (invoice_id, student_id, title, payment_method, amount, payment_date, transaction_reference)
           VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`, [res.insertId, data.student_id, `Payment for ${data.title}`, data.payment_method || 'Cash', amountPaid, data.transaction_reference || null]
                );
            }

            return res.insertId;
        });
    }

    async updateInvoice(id, data) {
        const amount = parseFloat(data.amount);
        const discount = parseFloat(data.discount) || 0;
        const amountPaid = parseFloat(data.amount_paid) || 0;
        const due = Math.max(0, amount - discount - amountPaid);
        const status = due === 0 ? 'paid' : (amountPaid > 0 ? 'partially_paid' : 'unpaid');

        await this.pool.query(
            `UPDATE invoice SET 
        title = COALESCE(?, title),
        amount = COALESCE(?, amount),
        discount = COALESCE(?, discount),
        amount_paid = COALESCE(?, amount_paid),
        due = COALESCE(?, due),
        status = COALESCE(?, status),
        due_date = COALESCE(?, due_date)
       WHERE invoice_id = ?`, [data.title, amount, discount, amountPaid, due, status, data.due_date, id]
        );

        return { id, ...data };
    }

    async deleteInvoice(id) {
        await this.pool.query(`DELETE FROM payment WHERE invoice_id = ?`, [id]);
        await this.pool.query(`DELETE FROM invoice WHERE invoice_id = ?`, [id]);
        return true;
    }

    async recordPayment(invoiceId, paymentData) {
        return this.withTransaction(async(conn) => {
            const [invRows] = await conn.query(`SELECT * FROM invoice WHERE invoice_id = ? FOR UPDATE`, [invoiceId]);
            if (!invRows[0]) throw new Error('Invoice not found');

            const invoice = invRows[0];
            const payAmount = parseFloat(paymentData.amount);
            if (!Number.isFinite(payAmount) || payAmount <= 0) {
                throw new Error('Payment amount must be greater than zero');
            }

            const newPaid = (parseFloat(invoice.amount_paid) || 0) + payAmount;
            const netPayable = (parseFloat(invoice.amount) || 0) - (parseFloat(invoice.discount) || 0);
            const newDue = Math.max(0, netPayable - newPaid);
            const newStatus = newDue === 0 ? 'paid' : 'partially_paid';
            const paymentMethod = paymentData.payment_method || invoice.payment_method || 'Cash';
            const paymentRef = paymentData.transaction_reference || `TXN-${Date.now()}`;

            const [studentRows] = await conn.query(`SELECT s.name AS student_name, s.admission_no, c.name AS class_name FROM student s LEFT JOIN class c ON c.class_id = s.class_id WHERE s.student_id = ?`, [invoice.student_id]);
            const student = studentRows[0] || {};

            await conn.query(
                `UPDATE invoice SET amount_paid = ?, due = ?, status = ?, payment_method = ? WHERE invoice_id = ?`, [newPaid, newDue, newStatus, paymentMethod, invoiceId]
            );

            const [payRes] = await conn.query(
                `INSERT INTO payment (invoice_id, student_id, title, payment_method, amount, payment_date, transaction_reference)
         VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`, [invoiceId, invoice.student_id, paymentData.title || `Payment towards ${invoice.invoice_number}`, paymentMethod, payAmount, paymentRef]
            );

            const receiptNumber = `RCPT-${String(invoiceId).padStart(4, '0')}-${String(payRes.insertId).padStart(4, '0')}`;
            const invoicePayload = {
                ...invoice,
                amount_paid: newPaid,
                due: newDue,
                status: newStatus,
                payment_method: paymentMethod,
                student_name: student.student_name,
                admission_no: student.admission_no,
                class_name: student.class_name
            };

            return {
                payment_id: payRes.insertId,
                invoice_id: invoiceId,
                invoice: invoicePayload,
                receipt: {
                    receipt_number: receiptNumber,
                    invoice_number: invoice.invoice_number,
                    amount_paid: newPaid,
                    balance_due: newDue,
                    payment_method: paymentMethod,
                    transaction_reference: paymentRef,
                    payment_date: new Date().toISOString().slice(0, 10),
                    student_name: student.student_name,
                    class_name: student.class_name
                }
            };
        });
    }

    async getFeeMasters() {
        const [rows] = await this.pool.query(`SELECT fee_master_id AS id, fee_master_id, name, code, amount, description, status FROM fee_master ORDER BY name ASC`);
        return rows;
    }

    async createFeeMaster(data) {
        const [res] = await this.pool.query(
            `INSERT INTO fee_master (name, code, amount, description, status) VALUES (?, ?, ?, ?, ?)`, [data.name, data.code || null, parseFloat(data.amount) || 0, data.description || null, data.status || 'active']
        );
        return { id: res.insertId, fee_master_id: res.insertId, ...data, amount: parseFloat(data.amount) || 0, status: data.status || 'active' };
    }

    async updateFeeMaster(id, data) {
        const [res] = await this.pool.query(
            `UPDATE fee_master SET name = COALESCE(?, name), code = COALESCE(?, code), amount = COALESCE(?, amount), description = COALESCE(?, description), status = COALESCE(?, status) WHERE fee_master_id = ?`, [data.name, data.code, parseFloat(data.amount), data.description, data.status, id]
        );
        return { id, ...data, updated: res.affectedRows > 0 };
    }

    async deleteFeeMaster(id) {
        await this.pool.query(`DELETE FROM fee_master WHERE fee_master_id = ?`, [id]);
        return true;
    }

    async getFeeGroups() {
        const [rows] = await this.pool.query(`SELECT fee_group_id AS id, fee_group_id, name, description, amount, status FROM fee_group ORDER BY name ASC`);
        return rows;
    }

    async createFeeGroup(data) {
        const [res] = await this.pool.query(
            `INSERT INTO fee_group (name, description, amount, status) VALUES (?, ?, ?, ?)`, [data.name, data.description || null, parseFloat(data.amount) || 0, data.status || 'active']
        );
        return { id: res.insertId, fee_group_id: res.insertId, ...data, amount: parseFloat(data.amount) || 0, status: data.status || 'active' };
    }

    async updateFeeGroup(id, data) {
        const [res] = await this.pool.query(
            `UPDATE fee_group SET name = COALESCE(?, name), description = COALESCE(?, description), amount = COALESCE(?, amount), status = COALESCE(?, status) WHERE fee_group_id = ?`, [data.name, data.description, parseFloat(data.amount), data.status, id]
        );
        return { id, ...data, updated: res.affectedRows > 0 };
    }

    async deleteFeeGroup(id) {
        await this.pool.query(`DELETE FROM fee_group WHERE fee_group_id = ?`, [id]);
        return true;
    }

    async getFeeTypes() {
        const [rows] = await this.pool.query(`SELECT fee_type_id AS id, fee_type_id, name, code, is_optional, status FROM fee_type ORDER BY name ASC`);
        return rows;
    }

    async createFeeType(data) {
        const [res] = await this.pool.query(
            `INSERT INTO fee_type (name, code, is_optional, status) VALUES (?, ?, ?, ?)`, [data.name, data.code || null, data.is_optional ? 1 : 0, data.status || 'active']
        );
        return { id: res.insertId, fee_type_id: res.insertId, ...data, is_optional: !!data.is_optional, status: data.status || 'active' };
    }

    async updateFeeType(id, data) {
        const [res] = await this.pool.query(
            `UPDATE fee_type SET name = COALESCE(?, name), code = COALESCE(?, code), is_optional = COALESCE(?, is_optional), status = COALESCE(?, status) WHERE fee_type_id = ?`, [data.name, data.code, data.is_optional ? 1 : 0, data.status, id]
        );
        return { id, ...data, updated: res.affectedRows > 0 };
    }

    async deleteFeeType(id) {
        await this.pool.query(`DELETE FROM fee_type WHERE fee_type_id = ?`, [id]);
        return true;
    }

    async getFeeDiscounts() {
        const [rows] = await this.pool.query(`SELECT fee_discount_id AS id, fee_discount_id, name, code, description FROM fee_discount ORDER BY name ASC`);
        return rows;
    }

    async createFeeDiscount(data) {
        const [res] = await this.pool.query(
            `INSERT INTO fee_discount (name, code, description) VALUES (?, ?, ?)`, [data.name, data.code, data.description || null]
        );
        return { id: res.insertId, fee_discount_id: res.insertId, ...data };
    }

    // --- Expenses ---
    async getExpenseCategories() {
        const [rows] = await this.pool.query(`SELECT expense_category_id AS id, expense_category_id, name, description FROM expense_category ORDER BY name ASC`);
        return rows;
    }

    async createExpenseCategory(data) {
        const [res] = await this.pool.query(`INSERT INTO expense_category (name, description) VALUES (?, ?)`, [data.name, data.description || '']);
        return { id: res.insertId, ...data };
    }

    async getExpenses(filters = {}) {
        const { page = 1, limit = 100, search = '', expense_category_id, start_date, end_date } = filters;
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push('(e.title LIKE ? OR e.description LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s);
        }
        if (expense_category_id) {
            conditions.push('e.expense_category_id = ?');
            params.push(expense_category_id);
        }
        if (start_date && end_date) {
            conditions.push('e.expense_date BETWEEN ? AND ?');
            params.push(start_date, end_date);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countSql = `SELECT COUNT(*) AS total FROM expenses e ${where}`;
        const [countRows] = await this.pool.query(countSql, params);
        const total = countRows[0].total;

        const dataSql = `
      SELECT 
        e.expense_id AS id,
        e.expense_id,
        e.title,
        e.title AS name,
        e.description,
        e.amount,
        e.payment_method,
        e.expense_date AS date,
        e.expense_date,
        e.expense_category_id AS category_id,
        ec.name AS category_name
      FROM expenses e
      LEFT JOIN expense_category ec ON e.expense_category_id = ec.expense_category_id
      ${where}
      ORDER BY e.expense_date DESC, e.expense_id DESC
      LIMIT ? OFFSET ?
    `;
        const [rows] = await this.pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

        return {
            expenses: rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        };
    }

    async createExpense(data) {
        const [res] = await this.pool.query(`
      INSERT INTO expenses (expense_category_id, title, description, amount, payment_method, expense_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [
            data.category_id || data.expense_category_id || 1,
            data.title || data.name,
            data.description || null,
            data.amount,
            data.payment_method || 'Cash',
            data.date || data.expense_date || new Date().toISOString().substring(0, 10)
        ]);
        return { id: res.insertId, ...data };
    }

    async updateExpense(id, data) {
        await this.pool.query(`
      UPDATE expenses SET
        expense_category_id = COALESCE(?, expense_category_id),
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        amount = COALESCE(?, amount),
        payment_method = COALESCE(?, payment_method),
        expense_date = COALESCE(?, expense_date)
      WHERE expense_id = ?
    `, [
            data.category_id || data.expense_category_id,
            data.title || data.name,
            data.description,
            data.amount,
            data.payment_method,
            data.date || data.expense_date,
            id
        ]);
        return { id, ...data };
    }

    async deleteExpense(id) {
        await this.pool.query(`DELETE FROM expenses WHERE expense_id = ?`, [id]);
        return true;
    }
}

module.exports = new FinanceRepository();