import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { Invoice, SchoolClass, Student } from '../../core/models/models';

type FinanceTab = 'billing' | 'fees_master' | 'fees_group' | 'fees_type' | 'my_invoices' | 'search_payment' | 'due_fees' | 'offline_payment';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, ModalComponent, DatePipe, CurrencyPipe],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  invoices = signal<Invoice[]>([]);
  classes = signal<SchoolClass[]>([]);
  students = signal<Student[]>([]);
  feeMasters = signal<any[]>([]);
  feeGroups = signal<any[]>([]);
  feeTypes = signal<any[]>([]);

  activeTab = signal<FinanceTab>('billing');

  isInvoiceModalOpen = signal<boolean>(false);
  isPaymentModalOpen = signal<boolean>(false);
  isReceiptModalOpen = signal<boolean>(false);
  editingInvoice = signal<Invoice | null>(null);
  selectedInvoice = signal<any>(null);

  searchQuery: string = '';
  currentPage: number = 1;
  pagination = signal<any>(null);

  tabs: { key: FinanceTab; label: string }[] = [
    { key: 'billing', label: 'Billing' },
    { key: 'fees_master', label: 'Fee Master' },
    { key: 'fees_group', label: 'Fee Group' },
    { key: 'fees_type', label: 'Fee Type' },
    { key: 'my_invoices', label: 'My Invoices & Receipts' }
  ];

  columns: TableColumn[] = [
    { key: 'invoice_number', label: 'Invoice #', sortable: true },
    { key: 'student_name', label: 'Student', sortable: true },
    { key: 'class_name', label: 'Class' },
    { key: 'title', label: 'Fee Title' },
    { key: 'amount', label: 'Total Amount', type: 'currency' },
    { key: 'amount_paid', label: 'Paid', type: 'currency' },
    { key: 'due', label: 'Due Balance', type: 'currency' },
    { key: 'status', label: 'Status', type: 'badge' }
  ];

  invoiceForm: FormGroup = this.fb.group({
    class_id: ['', Validators.required],
    student_id: ['', Validators.required],
    title: ['', Validators.required],
    description: [''],
    amount: [2500, Validators.required],
    discount: [0],
    amount_paid: [0],
    payment_method: ['Cash'],
    due_date: [new Date().toISOString().slice(0, 10)],
    year: ['2025-2026']
  });

  paymentForm: FormGroup = this.fb.group({
    amount: ['', Validators.required],
    payment_method: ['Cash'],
    transaction_reference: ['']
  });

  feeMasterForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: [''],
    amount: [0, Validators.required],
    description: ['']
  });

  feeGroupForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    amount: [0, Validators.required]
  });

  feeTypeForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: [''],
    is_optional: [false]
  });

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab') as FinanceTab | null;
      this.activeTab.set(this.normalizeTab(tab));
    });

    this.api.get<SchoolClass[]>('/academics/classes').subscribe(res => this.classes.set(res.data || []));
    this.fetchInvoices();
    this.loadFeeCatalogs();
  }

  private loadFeeCatalogs() {
    this.api.get<any[]>('/finance/fee-masters').subscribe(res => this.feeMasters.set(res.data || []));
    this.api.get<any[]>('/finance/fee-groups').subscribe(res => this.feeGroups.set(res.data || []));
    this.api.get<any[]>('/finance/fee-types').subscribe(res => this.feeTypes.set(res.data || []));
  }

  private normalizeTab(tab: FinanceTab | null): FinanceTab {
    const validTabs: FinanceTab[] = ['billing', 'fees_master', 'fees_group', 'fees_type', 'my_invoices', 'search_payment', 'due_fees', 'offline_payment'];
    return validTabs.includes(tab as FinanceTab) ? (tab as FinanceTab) : 'billing';
  }

  setActiveTab(tab: FinanceTab) {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  fetchInvoices() {
    this.api.get<Invoice[]>('/finance/invoices', { page: this.currentPage, limit: 15, search: this.searchQuery }).subscribe({
      next: (res) => {
        this.invoices.set(res.data || []);
        this.pagination.set(res.pagination || null);
      }
    });
  }

  onClassChange() {
    const classId = this.invoiceForm.get('class_id')?.value;
    if (classId) {
      this.api.get<Student[]>('/students', { class_id: classId, limit: 100 }).subscribe(res => this.students.set(res.data || []));
    }
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.fetchInvoices();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchInvoices();
  }

  openAddModal() {
    this.editingInvoice.set(null);
    this.invoiceForm.reset({
      class_id: '',
      student_id: '',
      title: '',
      description: '',
      amount: 2500,
      discount: 0,
      amount_paid: 0,
      payment_method: 'Cash',
      due_date: new Date().toISOString().slice(0, 10),
      year: '2025-2026'
    });
    this.isInvoiceModalOpen.set(true);
  }

  openEditModal(inv: Invoice) {
    this.editingInvoice.set(inv);
    if (inv.class_id) {
      this.api.get<Student[]>('/students', { class_id: inv.class_id, limit: 100 }).subscribe(res => this.students.set(res.data || []));
    }
    this.invoiceForm.patchValue({
      class_id: inv.class_id || '',
      student_id: inv.student_id || '',
      title: inv.title,
      description: (inv as any).description || '',
      amount: inv.amount,
      discount: inv.discount || 0,
      amount_paid: inv.amount_paid || 0,
      payment_method: (inv as any).payment_method || 'Cash',
      due_date: inv.due_date ? String(inv.due_date).substring(0, 10) : new Date().toISOString().slice(0, 10),
      year: (inv as any).year || '2025-2026'
    });
    this.isInvoiceModalOpen.set(true);
  }

  saveInvoice() {
    if (this.invoiceForm.invalid) return;
    const val = this.invoiceForm.value;
    const editing = this.editingInvoice();

    if (editing) {
      this.api.put(`/finance/invoices/${editing.invoice_id}`, val).subscribe({
        next: () => {
          this.notify.success('Invoice updated successfully');
          this.isInvoiceModalOpen.set(false);
          this.fetchInvoices();
        },
        error: (err) => this.notify.error(err.error?.message || 'Failed to update invoice')
      });
    } else {
      this.api.post('/finance/invoices', val).subscribe({
        next: () => {
          this.notify.success('Invoice generated successfully');
          this.isInvoiceModalOpen.set(false);
          this.fetchInvoices();
        },
        error: (err) => this.notify.error(err.error?.message || 'Failed to generate invoice')
      });
    }
  }

  openPaymentModal(invoice: Invoice) {
    this.selectedInvoice.set(invoice);
    this.paymentForm.reset({ amount: invoice.due, payment_method: 'Cash' });
    this.isPaymentModalOpen.set(true);
  }

  submitPayment() {
    if (this.paymentForm.invalid || !this.selectedInvoice()) return;
    this.api.post(`/finance/invoices/${this.selectedInvoice().invoice_id}/payment`, this.paymentForm.value).subscribe({
      next: (res) => {
        const paymentData = (res as any)?.data || {};
        const invoiceData = paymentData.invoice || this.selectedInvoice();
        this.selectedInvoice.set({
          ...(this.selectedInvoice() || {}),
          ...invoiceData,
          receipt: paymentData.receipt || null
        });
        this.notify.success('Payment recorded successfully');
        this.isPaymentModalOpen.set(false);
        this.isReceiptModalOpen.set(true);
        this.fetchInvoices();
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to record payment');
      }
    });
  }

  viewInvoice(invoice: Invoice) {
    this.api.get<any>(`/finance/invoices/${invoice.invoice_id}`).subscribe({
      next: (res) => {
        this.selectedInvoice.set(res.data || invoice);
        this.isReceiptModalOpen.set(true);
      },
      error: () => {
        this.selectedInvoice.set(invoice);
        this.isReceiptModalOpen.set(true);
      }
    });
  }

  submitFeeMaster() {
    if (this.feeMasterForm.invalid) {
      this.feeMasterForm.markAllAsTouched();
      return;
    }

    const formValue = this.feeMasterForm.getRawValue();
    this.api.post('/finance/fee-masters', formValue).subscribe({
      next: (res) => {
        this.feeMasters.update(items => [res.data, ...items]);
        this.notify.success('Fee master added successfully');
        this.feeMasterForm.reset({ name: '', code: '', amount: 0, description: '' });
      },
      error: (err) => this.notify.error(err.error?.message || 'Failed to add fee master')
    });
  }

  submitFeeGroup() {
    if (this.feeGroupForm.invalid) {
      this.feeGroupForm.markAllAsTouched();
      return;
    }

    const formValue = this.feeGroupForm.getRawValue();
    this.api.post('/finance/fee-groups', formValue).subscribe({
      next: (res) => {
        this.feeGroups.update(items => [res.data, ...items]);
        this.notify.success('Fee group added successfully');
        this.feeGroupForm.reset({ name: '', description: '', amount: 0 });
      },
      error: (err) => this.notify.error(err.error?.message || 'Failed to add fee group')
    });
  }

  submitFeeType() {
    if (this.feeTypeForm.invalid) {
      this.feeTypeForm.markAllAsTouched();
      return;
    }

    const formValue = this.feeTypeForm.getRawValue();
    this.api.post('/finance/fee-types', formValue).subscribe({
      next: (res) => {
        this.feeTypes.update(items => [res.data, ...items]);
        this.notify.success('Fee type added successfully');
        this.feeTypeForm.reset({ name: '', code: '', is_optional: false });
      },
      error: (err) => this.notify.error(err.error?.message || 'Failed to add fee type')
    });
  }

  getMyInvoices() {
    return this.invoices().slice(0, 6);
  }
}
