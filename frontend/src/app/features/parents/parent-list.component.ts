import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { Parent } from '../../core/models/models';

@Component({
  selector: 'app-parent-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, ModalComponent, ConfirmDialogComponent, SkeletonLoaderComponent],
  templateUrl: './parent-list.component.html',
  styleUrl: './parent-list.component.css'
})
export class ParentListComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  parents = signal<Parent[]>([]);
  isLoading = signal<boolean>(true);
  isFormModalOpen = signal<boolean>(false);
  isViewModalOpen = signal<boolean>(false);
  isDeleteDialogOpen = signal<boolean>(false);

  selectedParent = signal<Parent | null>(null);
  parentToDelete: Parent | null = null;
  editingParentId: number | null = null;
  searchQuery: string = '';
  currentPage: number = 1;
  pagination = signal<any>(null);

  columns: TableColumn[] = [
    { key: 'name', label: 'Parent Name', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { key: 'phone', label: 'Phone Number' },
    { key: 'profession', label: 'Profession' },
    { key: 'total_children', label: 'Children' },
    { key: 'status', label: 'Status', type: 'badge' }
  ];

  parentForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    profession: [''],
    annual_income: [null],
    address: [''],
    status: ['active']
  });

  ngOnInit() {
    this.fetchParents();
  }

  fetchParents() {
    this.isLoading.set(true);
    this.api.get<Parent[]>('/parents', { page: this.currentPage, limit: 15, search: this.searchQuery }).subscribe({
      next: (res) => {
        this.parents.set(res.data || []);
        this.pagination.set(res.pagination || null);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.fetchParents();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchParents();
  }

  openAddModal() {
    this.editingParentId = null;
    this.parentForm.reset({ status: 'active' });
    this.isFormModalOpen.set(true);
  }

  openEditModal(parent: Parent) {
    this.editingParentId = parent.parent_id;
    this.parentForm.patchValue({
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      profession: parent.profession || '',
      annual_income: parent.annual_income || null,
      address: parent.address || '',
      status: parent.status || 'active'
    });
    this.isFormModalOpen.set(true);
  }

  viewParent(parent: Parent) {
    this.api.get<Parent>(`/parents/${parent.parent_id}`).subscribe({
      next: (res) => {
        this.selectedParent.set(res.data);
        this.isViewModalOpen.set(true);
      }
    });
  }

  saveParent() {
    if (this.parentForm.invalid) return;
    const payload = this.parentForm.value;

    if (this.editingParentId) {
      this.api.put(`/parents/${this.editingParentId}`, payload).subscribe({
        next: () => {
          this.notify.success('Parent updated successfully');
          this.isFormModalOpen.set(false);
          this.fetchParents();
        }
      });
    } else {
      this.api.post('/parents', payload).subscribe({
        next: () => {
          this.notify.success('Parent added successfully');
          this.isFormModalOpen.set(false);
          this.fetchParents();
        }
      });
    }
  }

  confirmDelete(parent: Parent) {
    this.parentToDelete = parent;
    this.isDeleteDialogOpen.set(true);
  }

  executeDelete() {
    if (!this.parentToDelete) return;
    this.api.delete(`/parents/${this.parentToDelete.parent_id}`).subscribe({
      next: () => {
        this.notify.success('Parent deleted successfully');
        this.isDeleteDialogOpen.set(false);
        this.fetchParents();
      }
    });
  }
}
