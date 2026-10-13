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
import { Department, Designation, StaffLeave, Teacher } from '../../core/models/models';

@Component({
  selector: 'app-hr',
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
  templateUrl: './hr.component.html',
  styleUrl: './hr.component.css'
})
export class HrComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab: 'leaves' | 'departments' | 'designations' = 'leaves';
  loadingLeaves = signal<boolean>(true);

  leaves = signal<StaffLeave[]>([]);
  departments = signal<Department[]>([]);
  designations = signal<Designation[]>([]);
  teachers = signal<Teacher[]>([]);

  isLeaveModalOpen = false;
  isDeptModalOpen = false;
  isDesigModalOpen = false;
  isDeleteDeptOpen = false;
  isDeleteDesigOpen = false;
  isSubmitting = false;

  editingDept: Department | null = null;
  editingDesig: Designation | null = null;
  selectedDept: Department | null = null;
  selectedDesig: Designation | null = null;

  leaveForm: FormGroup = this.fb.group({
    teacher_id: [''],
    leave_type: ['Casual Leave', Validators.required],
    start_date: [new Date().toISOString().substring(0, 10), Validators.required],
    end_date: [new Date().toISOString().substring(0, 10), Validators.required],
    reason: ['', Validators.required]
  });

  deptForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  desigForm: FormGroup = this.fb.group({
    department_id: ['', Validators.required],
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.loadLeaves();
    this.loadDepartments();
    this.loadDesignations();
    this.loadTeachers();
  }

  isAdmin(): boolean {
    return this.auth.currentUser()?.role === 'admin';
  }

  loadTeachers() {
    this.api.get<Teacher[]>('/teachers', { limit: 200 }).subscribe(res => this.teachers.set(res.data || []));
  }

  loadLeaves() {
    this.loadingLeaves.set(true);
    this.api.get<StaffLeave[]>('/hr/leaves').subscribe({
      next: (res) => {
        this.leaves.set(res.data || []);
        this.loadingLeaves.set(false);
      },
      error: () => this.loadingLeaves.set(false)
    });
  }

  loadDepartments() {
    this.api.get<Department[]>('/hr/departments').subscribe({
      next: (res) => this.departments.set(res.data || [])
    });
  }

  loadDesignations() {
    this.api.get<Designation[]>('/hr/designations').subscribe({
      next: (res) => this.designations.set(res.data || [])
    });
  }

  openApplyLeaveModal() {
    const teachersList = this.teachers();
    this.leaveForm.reset({
      teacher_id: teachersList.length > 0 ? teachersList[0].teacher_id : '',
      leave_type: 'Casual Leave',
      start_date: new Date().toISOString().substring(0, 10),
      end_date: new Date().toISOString().substring(0, 10),
      reason: ''
    });
    this.isLeaveModalOpen = true;
  }

  saveLeave() {
    if (this.leaveForm.invalid) return;
    this.isSubmitting = true;
    this.api.post('/hr/leaves', this.leaveForm.value).subscribe({
      next: () => {
        this.notify.success('Leave application submitted');
        this.isSubmitting = false;
        this.isLeaveModalOpen = false;
        this.loadLeaves();
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to submit leave');
        this.isSubmitting = false;
      }
    });
  }

  updateLeaveStatus(leaveId: number, status: 'approved' | 'rejected') {
    this.api.put(`/hr/leaves/${leaveId}/status`, { status }).subscribe({
      next: () => {
        this.notify.success(`Leave request ${status}`);
        this.loadLeaves();
      },
      error: (err) => this.notify.error(err.error?.message || 'Failed to update leave')
    });
  }

  openAddDeptModal() {
    this.editingDept = null;
    this.deptForm.reset({ name: '', description: '' });
    this.isDeptModalOpen = true;
  }

  openEditDeptModal(d: Department) {
    this.editingDept = d;
    this.deptForm.patchValue({
      name: d.name,
      description: d.description || ''
    });
    this.isDeptModalOpen = true;
  }

  saveDept() {
    if (this.deptForm.invalid) return;
    this.isSubmitting = true;
    const val = this.deptForm.value;

    if (this.editingDept) {
      this.api.put(`/hr/departments/${this.editingDept.department_id || (this.editingDept as any).id}`, val).subscribe({
        next: () => {
          this.notify.success('Department updated');
          this.isSubmitting = false;
          this.isDeptModalOpen = false;
          this.loadDepartments();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/hr/departments', val).subscribe({
        next: () => {
          this.notify.success('Department created');
          this.isSubmitting = false;
          this.isDeptModalOpen = false;
          this.loadDepartments();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteDept(d: Department) {
    this.selectedDept = d;
    this.isDeleteDeptOpen = true;
  }

  deleteDept() {
    if (!this.selectedDept) return;
    const id = this.selectedDept.department_id || (this.selectedDept as any).id;
    this.api.delete(`/hr/departments/${id}`).subscribe({
      next: () => {
        this.notify.success('Department removed');
        this.isDeleteDeptOpen = false;
        this.loadDepartments();
      },
      error: () => this.isDeleteDeptOpen = false
    });
  }

  openAddDesigModal() {
    this.editingDesig = null;
    this.desigForm.reset({
      department_id: this.departments()[0]?.department_id || (this.departments()[0] as any)?.id || '',
      name: '',
      description: ''
    });
    this.isDesigModalOpen = true;
  }

  openEditDesigModal(des: Designation) {
    this.editingDesig = des;
    this.desigForm.patchValue({
      department_id: des.department_id || '',
      name: des.name,
      description: des.description || ''
    });
    this.isDesigModalOpen = true;
  }

  saveDesig() {
    if (this.desigForm.invalid) return;
    this.isSubmitting = true;
    const val = this.desigForm.value;

    if (this.editingDesig) {
      this.api.put(`/hr/designations/${this.editingDesig.designation_id || (this.editingDesig as any).id}`, val).subscribe({
        next: () => {
          this.notify.success('Designation updated');
          this.isSubmitting = false;
          this.isDesigModalOpen = false;
          this.loadDesignations();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/hr/designations', val).subscribe({
        next: () => {
          this.notify.success('Designation created');
          this.isSubmitting = false;
          this.isDesigModalOpen = false;
          this.loadDesignations();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteDesig(des: Designation) {
    this.selectedDesig = des;
    this.isDeleteDesigOpen = true;
  }

  deleteDesig() {
    if (!this.selectedDesig) return;
    const id = this.selectedDesig.designation_id || (this.selectedDesig as any).id;
    this.api.delete(`/hr/designations/${id}`).subscribe({
      next: () => {
        this.notify.success('Designation removed');
        this.isDeleteDesigOpen = false;
        this.loadDesignations();
      },
      error: () => this.isDeleteDesigOpen = false
    });
  }
}
