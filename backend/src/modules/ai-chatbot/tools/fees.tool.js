const pool = require('../../../config/db');

class FeesTool {
  async getStudentFees(params = {}) {
    const studentId = typeof params === 'object' ? params?.studentId : params;
    if (!studentId) return null;

    const sql = `
      SELECT 
        invoice_id, invoice_number, title, description,
        amount, discount, amount_paid, due,
        due_date, payment_method, status, year, created_at
      FROM invoice
      WHERE student_id = ?
      ORDER BY invoice_id DESC
    `;
    const [invoices] = await pool.query(sql, [studentId]);

    let totalFee = 0;
    let totalDiscount = 0;
    let totalPaid = 0;
    let totalDue = 0;

    const formattedInvoices = invoices.map(inv => {
      const amt = parseFloat(inv.amount || 0);
      const disc = parseFloat(inv.discount || 0);
      const paid = parseFloat(inv.amount_paid || 0);
      const balance = parseFloat(inv.due !== undefined ? inv.due : (amt - disc - paid));

      totalFee += amt;
      totalDiscount += disc;
      totalPaid += paid;
      totalDue += balance > 0 ? balance : 0;

      return {
        invoiceNumber: inv.invoice_number,
        title: inv.title,
        amount: amt,
        discount: disc,
        amountPaid: paid,
        balance: balance > 0 ? balance : 0,
        status: inv.status,
        dueDate: inv.due_date,
        year: inv.year
      };
    });

    return {
      studentId,
      totalFee: parseFloat(totalFee.toFixed(2)),
      paid: parseFloat(totalPaid.toFixed(2)),
      discount: parseFloat(totalDiscount.toFixed(2)),
      balance: parseFloat(totalDue.toFixed(2)),
      status: totalDue <= 0 ? 'PAID' : (totalPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING'),
      invoices: formattedInvoices
    };
  }

  async getFeeSummary(params = {}) {
    const { year = null } = params || {};
    let sql = `
      SELECT 
        COUNT(invoice_id) AS total_invoices,
        SUM(amount) AS total_invoiced,
        SUM(discount) AS total_discount,
        SUM(amount_paid) AS total_collected,
        SUM(due) AS total_outstanding,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_invoices,
        SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_invoices,
        SUM(CASE WHEN status = 'partially_paid' THEN 1 ELSE 0 END) AS partially_paid_invoices
      FROM invoice
    `;
    const queryParams = [];
    if (year) {
      sql += ' WHERE year = ?';
      queryParams.push(year);
    }

    const [rows] = await pool.query(sql, queryParams);
    const row = rows[0] || {};
    const invoiced = parseFloat(row.total_invoiced || 0);
    const collected = parseFloat(row.total_collected || 0);
    const discount = parseFloat(row.total_discount || 0);
    const outstanding = parseFloat(row.total_outstanding || (invoiced - discount - collected));

    return {
      totalInvoiced: invoiced,
      totalCollected: collected,
      totalDiscount: discount,
      totalOutstanding: outstanding,
      collectionRate: invoiced > 0 ? ((collected / (invoiced - discount)) * 100).toFixed(2) : 0,
      paidInvoices: parseInt(row.paid_invoices || 0, 10),
      unpaidInvoices: parseInt(row.unpaid_invoices || 0, 10),
      partiallyPaidInvoices: parseInt(row.partially_paid_invoices || 0, 10)
    };
  }
}

module.exports = new FeesTool();
