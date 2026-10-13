import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ModalComponent,
    ConfirmDialogComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  Math = Math;
  loading = signal<boolean>(true);
  expenses = signal<any[]>([]);
  filteredExpenses = signal<any[]>([]);
  categories = signal<any[]>([]);

  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isDeleteOpen = false;
  isSubmitting = false;
  editingExpense: any = null;
  selectedExpense: any = null;

  expenseForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    payment_method: ['Cash'],
    reference_no: [''],
    description: ['']
  });

  ngOnInit() {
    this.loadData();
  }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'accountant';
  }

  loadData() {
    this.loading.set(true);
    this.api.get<any[]>('/finance/expenses').subscribe({
      next: (res) => {
        const data = res.data || [];
        this.expenses.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.api.get<any[]>('/finance/expense-categories').subscribe({
      next: (res) => this.categories.set(res.data || [])
    });
  }

  totalExpense = signal<number>(0);
  thisMonthExpense = signal<number>(0);

  applyFilters() {
    let result = [...this.expenses()];
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(e => 
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.reference_no && e.reference_no.toLowerCase().includes(q))
      );
    }
    if (this.selectedCategory) {
      result = result.filter(e => e.category_id == this.selectedCategory || e.expense_category_id == this.selectedCategory);
    }
    this.filteredExpenses.set(result);
    this.currentPage = 1;

    // Calculate metrics
    const total = this.expenses().reduce((sum, e) => sum + Number(e.amount || 0), 0);
    this.totalExpense.set(total);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthly = this.expenses().filter(e => {
      const d = new Date(e.date || e.expense_date || e.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    this.thisMonthExpense.set(monthly);
  }

  paginatedExpenses() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredExpenses().slice(start, start + this.pageSize);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  onCategoryFilter(event: any) {
    this.selectedCategory = event.target.value;
    this.applyFilters();
  }

  openAddModal() {
    this.editingExpense = null;
    this.expenseForm.reset({
      title: '',
      category_id: this.categories()[0]?.id || '',
      amount: '',
      date: new Date().toISOString().substring(0, 10),
      payment_method: 'Cash',
      reference_no: '',
      description: ''
    });
    this.isModalOpen = true;
  }

  openEditModal(exp: any) {
    this.editingExpense = exp;
    this.expenseForm.patchValue({
      title: exp.title || exp.name,
      category_id: exp.category_id || exp.expense_category_id,
      amount: exp.amount,
      date: (exp.date || exp.expense_date || '').substring(0, 10),
      payment_method: exp.payment_method || 'Cash',
      reference_no: exp.reference_no || '',
      description: exp.description || ''
    });
    this.isModalOpen = true;
  }

  saveExpense() {
    if (this.expenseForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.expenseForm.value;

    if (this.editingExpense) {
      this.api.put(`/finance/expenses/${this.editingExpense.id}`, payload).subscribe({
        next: () => {
          this.notify.success('Expense updated successfully');
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.loadData();
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Failed to update expense');
          this.isSubmitting = false;
        }
      });
    } else {
      this.api.post('/finance/expenses', payload).subscribe({
        next: () => {
          this.notify.success('Expense recorded successfully');
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.loadData();
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Failed to record expense');
          this.isSubmitting = false;
        }
      });
    }
  }

  confirmDelete(exp: any) {
    this.selectedExpense = exp;
    this.isDeleteOpen = true;
  }

  deleteExpense() {
    if (!this.selectedExpense) return;
    this.api.delete(`/finance/expenses/${this.selectedExpense.id}`).subscribe({
      next: () => {
        this.notify.success('Expense deleted');
        this.isDeleteOpen = false;
        this.loadData();
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to delete expense');
        this.isDeleteOpen = false;
      }
    });
  }

  exportCSV() {
    const data = this.filteredExpenses();
    if (!data.length) return;
    const headers = ['ID', 'Title', 'Category', 'Amount', 'Date', 'Payment Method', 'Reference No'];
    const rows = data.map(e => [
      e.id,
      `"${e.title || ''}"`,
      `"${e.category_name || ''}"`,
      e.amount || 0,
      e.date || e.expense_date || '',
      e.payment_method || '',
      `"${e.reference_no || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenses_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
