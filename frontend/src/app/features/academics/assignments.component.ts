import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SchoolClass, Subject } from '../../core/models/models';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.css'
})
export class AssignmentsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  assignments = signal<any[]>([]);
  classes = signal<SchoolClass[]>([]);
  subjects = signal<Subject[]>([]);

  isModalOpen = signal<boolean>(false);
  isDeleteDialogOpen = signal<boolean>(false);
  editingAssignmentId: number | null = null;
  assignmentToDelete: any = null;

  columns: TableColumn[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'class_name', label: 'Class', sortable: true },
    { key: 'subject_name', label: 'Subject' },
    { key: 'teacher_name', label: 'Assigned By' },
    { key: 'due_date', label: 'Due Date', type: 'date', sortable: true }
  ];

  assignmentForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    class_id: ['', Validators.required],
    subject_id: ['', Validators.required],
    due_date: ['', Validators.required],
    file_name: ['assignment_doc.pdf'],
    description: ['']
  });

  ngOnInit() {
    this.api.get<SchoolClass[]>('/academics/classes').subscribe(res => this.classes.set(res.data || []));
    this.fetchAssignments();
  }

  fetchAssignments() {
    this.api.get<any[]>('/academics/assignments').subscribe(res => this.assignments.set(res.data || []));
  }

  onClassChange() {
    const classId = this.assignmentForm.get('class_id')?.value;
    if (classId) {
      this.api.get<Subject[]>('/academics/subjects', { class_id: classId }).subscribe(res => this.subjects.set(res.data || []));
    }
  }

  onSearch(query: string) {
    if (!query) {
      this.fetchAssignments();
      return;
    }
    const q = query.toLowerCase();
    this.assignments.update(items => items.filter(i => i.title.toLowerCase().includes(q) || i.class_name?.toLowerCase().includes(q)));
  }

  openAddModal() {
    this.editingAssignmentId = null;
    this.assignmentForm.reset({ due_date: new Date().toISOString().slice(0, 10), file_name: 'assignment_sheet.pdf' });
    this.isModalOpen.set(true);
  }

  openEditModal(asg: any) {
    this.editingAssignmentId = asg.assignment_id;
    this.assignmentForm.patchValue({
      title: asg.title,
      class_id: asg.class_id,
      subject_id: asg.subject_id,
      due_date: asg.due_date ? asg.due_date.substring(0, 10) : '',
      file_name: asg.file_name || 'assignment_sheet.pdf',
      description: asg.description || ''
    });
    this.onClassChange();
    this.isModalOpen.set(true);
  }

  saveAssignment() {
    if (this.assignmentForm.invalid) return;
    const payload = this.assignmentForm.value;

    if (this.editingAssignmentId) {
      this.api.put(`/academics/assignments/${this.editingAssignmentId}`, payload).subscribe({
        next: () => {
          this.notify.success('Assignment updated successfully');
          this.isModalOpen.set(false);
          this.fetchAssignments();
        }
      });
    } else {
      this.api.post('/academics/assignments', payload).subscribe({
        next: () => {
          this.notify.success('Assignment created successfully');
          this.isModalOpen.set(false);
          this.fetchAssignments();
        }
      });
    }
  }

  confirmDelete(asg: any) {
    this.assignmentToDelete = asg;
    this.isDeleteDialogOpen.set(true);
  }

  executeDelete() {
    if (!this.assignmentToDelete) return;
    this.api.delete(`/academics/assignments/${this.assignmentToDelete.assignment_id}`).subscribe({
      next: () => {
        this.notify.success('Assignment deleted');
        this.isDeleteDialogOpen.set(false);
        this.fetchAssignments();
      }
    });
  }
}
