import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SchoolClass, Section, Teacher } from '../../core/models/models';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.css'
})
export class ClassesComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  classes = signal<SchoolClass[]>([]);
  sections = signal<Section[]>([]);
  teachers = signal<Teacher[]>([]);

  isClassModalOpen = signal<boolean>(false);
  isSectionModalOpen = signal<boolean>(false);
  isDeleteDialogOpen = signal<boolean>(false);

  editingClassId: number | null = null;
  editingSectionId: number | null = null;
  deleteType: 'class' | 'section' = 'class';
  itemToDeleteId: number | null = null;
  deleteMessage: string = '';

  classForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    name_numeric: [null],
    teacher_id: ['']
  });

  sectionForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    nick_name: [''],
    class_id: ['', Validators.required],
    teacher_id: [''],
    capacity: [35]
  });

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.api.get<SchoolClass[]>('/academics/classes').subscribe({
      next: (res) => this.classes.set(res.data || [])
    });

    this.api.get<Section[]>('/academics/sections').subscribe({
      next: (res) => this.sections.set(res.data || [])
    });

    this.api.get<Teacher[]>('/teachers', { limit: 100 }).subscribe({
      next: (res) => this.teachers.set(res.data || [])
    });
  }

  getSectionsForClass(classId: number): Section[] {
    return this.sections().filter(s => s.class_id === classId);
  }

  openAddClassModal() {
    this.editingClassId = null;
    this.classForm.reset();
    this.isClassModalOpen.set(true);
  }

  openEditClassModal(c: SchoolClass) {
    this.editingClassId = c.class_id;
    this.classForm.patchValue(c);
    this.isClassModalOpen.set(true);
  }

  saveClass() {
    if (this.classForm.invalid) return;
    const payload = this.classForm.value;

    if (this.editingClassId) {
      this.api.put(`/academics/classes/${this.editingClassId}`, payload).subscribe({
        next: () => {
          this.notify.success('Class updated successfully');
          this.isClassModalOpen.set(false);
          this.fetchData();
        }
      });
    } else {
      this.api.post('/academics/classes', payload).subscribe({
        next: () => {
          this.notify.success('Class created successfully');
          this.isClassModalOpen.set(false);
          this.fetchData();
        }
      });
    }
  }

  openAddSectionModal(classId?: number) {
    this.editingSectionId = null;
    this.sectionForm.reset({ capacity: 35, class_id: classId || '' });
    this.isSectionModalOpen.set(true);
  }

  openEditSectionModal(s: Section) {
    this.editingSectionId = s.section_id;
    this.sectionForm.patchValue(s);
    this.isSectionModalOpen.set(true);
  }

  saveSection() {
    if (this.sectionForm.invalid) return;
    const payload = this.sectionForm.value;

    if (this.editingSectionId) {
      this.api.put(`/academics/sections/${this.editingSectionId}`, payload).subscribe({
        next: () => {
          this.notify.success('Section updated successfully');
          this.isSectionModalOpen.set(false);
          this.fetchData();
        }
      });
    } else {
      this.api.post('/academics/sections', payload).subscribe({
        next: () => {
          this.notify.success('Section created successfully');
          this.isSectionModalOpen.set(false);
          this.fetchData();
        }
      });
    }
  }

  confirmDeleteClass(c: SchoolClass) {
    this.deleteType = 'class';
    this.itemToDeleteId = c.class_id;
    this.deleteMessage = `Are you sure you want to delete ${c.name}? This will affect all enrolled students.`;
    this.isDeleteDialogOpen.set(true);
  }

  confirmDeleteSection(s: Section) {
    this.deleteType = 'section';
    this.itemToDeleteId = s.section_id;
    this.deleteMessage = `Are you sure you want to delete section ${s.name}?`;
    this.isDeleteDialogOpen.set(true);
  }

  executeDelete() {
    if (!this.itemToDeleteId) return;

    if (this.deleteType === 'class') {
      this.api.delete(`/academics/classes/${this.itemToDeleteId}`).subscribe({
        next: () => {
          this.notify.success('Class deleted successfully');
          this.isDeleteDialogOpen.set(false);
          this.fetchData();
        }
      });
    } else {
      this.api.delete(`/academics/sections/${this.itemToDeleteId}`).subscribe({
        next: () => {
          this.notify.success('Section deleted successfully');
          this.isDeleteDialogOpen.set(false);
          this.fetchData();
        }
      });
    }
  }
}
