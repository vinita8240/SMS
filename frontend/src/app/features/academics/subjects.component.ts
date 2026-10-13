import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { Subject, SchoolClass, Teacher } from '../../core/models/models';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css'
})
export class SubjectsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  subjects = signal<Subject[]>([]);
  classes = signal<SchoolClass[]>([]);
  teachers = signal<Teacher[]>([]);

  isModalOpen = signal<boolean>(false);
  isDeleteDialogOpen = signal<boolean>(false);

  selectedClass: string = '';
  editingSubjectId: number | null = null;
  subjectToDelete: Subject | null = null;

  columns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Subject Name', sortable: true },
    { key: 'type', label: 'Type', type: 'badge' },
    { key: 'class_name', label: 'Class', sortable: true },
    { key: 'teacher_name', label: 'Instructor' },
    { key: 'pass_mark', label: 'Pass Mark' },
    { key: 'final_mark', label: 'Total Mark' }
  ];

  subjectForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: [''],
    class_id: ['', Validators.required],
    teacher_id: [''],
    type: ['theory'],
    pass_mark: [40],
    final_mark: [100]
  });

  ngOnInit() {
    this.api.get<SchoolClass[]>('/academics/classes').subscribe(res => this.classes.set(res.data || []));
    this.api.get<Teacher[]>('/teachers', { limit: 100 }).subscribe(res => this.teachers.set(res.data || []));
    this.fetchSubjects();
  }

  fetchSubjects() {
    const params: any = {};
    if (this.selectedClass) params.class_id = this.selectedClass;
    this.api.get<Subject[]>('/academics/subjects', params).subscribe({
      next: (res) => this.subjects.set(res.data || [])
    });
  }

  onSearch(query: string) {
    if (!query) {
      this.fetchSubjects();
      return;
    }
    const q = query.toLowerCase();
    this.subjects.update(items => items.filter(i => i.name.toLowerCase().includes(q) || (i.code && i.code.toLowerCase().includes(q))));
  }

  openAddModal() {
    this.editingSubjectId = null;
    this.subjectForm.reset({ type: 'theory', pass_mark: 40, final_mark: 100 });
    this.isModalOpen.set(true);
  }

  openEditModal(sub: Subject) {
    this.editingSubjectId = sub.subject_id;
    this.subjectForm.patchValue({
      name: sub.name,
      code: sub.code || '',
      class_id: sub.class_id,
      teacher_id: sub.teacher_id || '',
      type: sub.type || 'theory',
      pass_mark: sub.pass_mark || 40,
      final_mark: sub.final_mark || 100
    });
    this.isModalOpen.set(true);
  }

  saveSubject() {
    if (this.subjectForm.invalid) return;
    const payload = this.subjectForm.value;

    if (this.editingSubjectId) {
      this.api.put(`/academics/subjects/${this.editingSubjectId}`, payload).subscribe({
        next: () => {
          this.notify.success('Subject updated');
          this.isModalOpen.set(false);
          this.fetchSubjects();
        }
      });
    } else {
      this.api.post('/academics/subjects', payload).subscribe({
        next: () => {
          this.notify.success('Subject added');
          this.isModalOpen.set(false);
          this.fetchSubjects();
        }
      });
    }
  }

  confirmDelete(sub: Subject) {
    this.subjectToDelete = sub;
    this.isDeleteDialogOpen.set(true);
  }

  executeDelete() {
    if (!this.subjectToDelete) return;
    this.api.delete(`/academics/subjects/${this.subjectToDelete.subject_id}`).subscribe({
      next: () => {
        this.notify.success('Subject deleted');
        this.isDeleteDialogOpen.set(false);
        this.fetchSubjects();
      }
    });
  }
}
