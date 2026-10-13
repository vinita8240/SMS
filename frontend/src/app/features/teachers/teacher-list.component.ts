import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { Teacher } from '../../core/models/models';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, ModalComponent, ConfirmDialogComponent, SkeletonLoaderComponent],
  templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.css'
})
export class TeacherListComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  teachers = signal<Teacher[]>([]);
  departments = signal<any[]>([]);
  designations = signal<any[]>([]);

  isLoading = signal<boolean>(true);
  isFormModalOpen = signal<boolean>(false);
  isViewModalOpen = signal<boolean>(false);
  isDeleteDialogOpen = signal<boolean>(false);

  selectedTeacher = signal<any>(null);
  teacherToDelete: Teacher | null = null;
  editingTeacherId: number | null = null;
  searchQuery: string = '';
  currentPage: number = 1;
  pagination = signal<any>(null);

  columns: TableColumn[] = [
    { key: 'teacher_number', label: 'Code', sortable: true },
    { key: 'name', label: 'Teacher Name', sortable: true },
    { key: 'department_name', label: 'Department' },
    { key: 'designation_name', label: 'Designation' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'basic_salary', label: 'Salary', type: 'currency' },
    { key: 'status', label: 'Status', type: 'badge' }
  ];

  teacherForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    teacher_number: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: ['Male'],
    birthday: [''],
    department_id: [''],
    designation_id: [''],
    qualification: [''],
    marital_status: [''],
    blood_group: [''],
    basic_salary: [5000],
    joining_date: [new Date().toISOString().substring(0, 10)],
    address: [''],
    status: ['active']
  });

  ngOnInit() {
    this.fetchMetadata();
    this.fetchTeachers();
  }

  fetchMetadata() {
    this.api.get<any[]>('/hr/departments').subscribe({
      next: (res) => this.departments.set(res.data || [])
    });
    this.api.get<any[]>('/hr/designations').subscribe({
      next: (res) => this.designations.set(res.data || [])
    });
  }

  fetchTeachers() {
    this.isLoading.set(true);
    this.api.get<Teacher[]>('/teachers', { page: this.currentPage, limit: 15, search: this.searchQuery }).subscribe({
      next: (res) => {
        this.teachers.set(res.data || []);
        this.pagination.set(res.pagination || null);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.fetchTeachers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchTeachers();
  }

  openAddModal() {
    this.editingTeacherId = null;
    this.teacherForm.reset({
      gender: 'Male',
      basic_salary: 5000,
      status: 'active',
      joining_date: new Date().toISOString().substring(0, 10)
    });
    this.isFormModalOpen.set(true);
  }

  openEditModal(teacher: Teacher) {
    this.editingTeacherId = teacher.teacher_id;
    this.teacherForm.patchValue({
      name: teacher.name,
      teacher_number: teacher.teacher_number,
      email: teacher.email,
      phone: teacher.phone || '',
      gender: teacher.gender || 'Male',
      birthday: teacher.birthday ? teacher.birthday.substring(0, 10) : '',
      department_id: teacher.department_id || '',
      designation_id: teacher.designation_id || '',
      qualification: teacher.qualification || '',
      marital_status: teacher.marital_status || '',
      blood_group: teacher.blood_group || '',
      basic_salary: teacher.basic_salary || 5000,
      joining_date: teacher.joining_date ? teacher.joining_date.substring(0, 10) : '',
      address: teacher.address || '',
      status: teacher.status || 'active'
    });
    this.isFormModalOpen.set(true);
  }

  viewTeacher(teacher: Teacher) {
    this.api.get<any>(`/teachers/${teacher.teacher_id}`).subscribe({
      next: (res) => {
        this.selectedTeacher.set(res.data);
        this.isViewModalOpen.set(true);
      }
    });
  }

  saveTeacher() {
    if (this.teacherForm.invalid) return;
    const payload = this.teacherForm.value;

    if (this.editingTeacherId) {
      this.api.put(`/teachers/${this.editingTeacherId}`, payload).subscribe({
        next: () => {
          this.notify.success('Teacher updated successfully');
          this.isFormModalOpen.set(false);
          this.fetchTeachers();
        }
      });
    } else {
      this.api.post('/teachers', payload).subscribe({
        next: () => {
          this.notify.success('Teacher registered successfully');
          this.isFormModalOpen.set(false);
          this.fetchTeachers();
        }
      });
    }
  }

  confirmDelete(teacher: Teacher) {
    this.teacherToDelete = teacher;
    this.isDeleteDialogOpen.set(true);
  }

  executeDelete() {
    if (!this.teacherToDelete) return;
    this.api.delete(`/teachers/${this.teacherToDelete.teacher_id}`).subscribe({
      next: () => {
        this.notify.success('Teacher deleted successfully');
        this.isDeleteDialogOpen.set(false);
        this.fetchTeachers();
      }
    });
  }
}
