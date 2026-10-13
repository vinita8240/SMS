import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { SchoolClass, Subject } from '../../core/models/models';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.css'
})
export class MaterialsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  syllabi = signal<any[]>([]);
  materials = signal<any[]>([]);
  classes = signal<SchoolClass[]>([]);
  syllabusSubjects = signal<Subject[]>([]);
  materialSubjects = signal<Subject[]>([]);

  selectedClassId = '';
  searchKeyword = '';

  isSyllabusModalOpen = signal<boolean>(false);
  isMaterialModalOpen = signal<boolean>(false);

  // Role permissions
  canUpload = computed(() => {
    const role = (this.auth.currentUser()?.role || '').toLowerCase();
    return ['super_admin', 'admin', 'teacher'].includes(role);
  });

  isStudent = computed(() => {
    const role = (this.auth.currentUser()?.role || '').toLowerCase();
    const userType = (this.auth.currentUser()?.userType || '').toLowerCase();
    return role === 'student' || userType === 'student';
  });

  studentClassName = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    if ((user as any).class_name) return (user as any).class_name;
    const cls = this.classes().find(c => c.class_id === user.class_id);
    return cls ? cls.name : '';
  });

  // Filtered lists computed according to role and search
  filteredSyllabi = computed(() => {
    let list = this.syllabi();
    const studentUser = this.auth.currentUser();

    if (this.isStudent() && studentUser?.class_id) {
      list = list.filter(s => Number(s.class_id) === Number(studentUser.class_id));
    } else if (this.selectedClassId) {
      list = list.filter(s => Number(s.class_id) === Number(this.selectedClassId));
    }

    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) || 
        (s.class_name && s.class_name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    return list;
  });

  filteredMaterials = computed(() => {
    let list = this.materials();
    const studentUser = this.auth.currentUser();

    if (this.isStudent() && studentUser?.class_id) {
      list = list.filter(m => Number(m.class_id) === Number(studentUser.class_id));
    } else if (this.selectedClassId) {
      list = list.filter(m => Number(m.class_id) === Number(this.selectedClassId));
    }

    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(m => 
        (m.title && m.title.toLowerCase().includes(q)) || 
        (m.class_name && m.class_name.toLowerCase().includes(q)) ||
        (m.subject_name && m.subject_name.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    }

    return list;
  });

  syllabusForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    class_id: ['', Validators.required],
    subject_id: [''],
    session: ['2026-2027'],
    file_name: ['syllabus_document.pdf', Validators.required],
    description: ['']
  });

  materialForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    class_id: ['', Validators.required],
    subject_id: [''],
    file_type: ['PDF'],
    file_name: ['study_notes.pdf', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.api.get<SchoolClass[]>('/academics/classes').subscribe(res => {
      if (res.success && res.data) {
        this.classes.set(res.data);
      }
    });
    this.fetchData();
  }

  onFilterChange() {
    this.fetchData();
  }

  onSyllabusClassChange() {
    const classId = this.syllabusForm.get('class_id')?.value;
    if (classId) {
      this.api.get<Subject[]>('/academics/subjects', { class_id: classId }).subscribe(res => this.syllabusSubjects.set(res.data || []));
    }
  }

  onMaterialClassChange() {
    const classId = this.materialForm.get('class_id')?.value;
    if (classId) {
      this.api.get<Subject[]>('/academics/subjects', { class_id: classId }).subscribe(res => this.materialSubjects.set(res.data || []));
    }
  }

  fetchData() {
    const params: Record<string, any> = {};
    if (this.selectedClassId && !this.isStudent()) {
      params['class_id'] = this.selectedClassId;
    }

    this.api.get<any[]>('/academics/syllabus', params).subscribe(res => this.syllabi.set(res.data || []));
    this.api.get<any[]>('/academics/materials', params).subscribe(res => this.materials.set(res.data || []));
  }

  openAddSyllabusModal() {
    this.syllabusForm.reset({ session: '2026-2027', file_name: 'syllabus_document.pdf' });
    this.isSyllabusModalOpen.set(true);
  }

  openAddMaterialModal() {
    this.materialForm.reset({ file_type: 'PDF', file_name: 'study_notes.pdf' });
    this.isMaterialModalOpen.set(true);
  }

  saveSyllabus() {
    if (this.syllabusForm.invalid) return;
    this.api.post('/academics/syllabus', this.syllabusForm.value).subscribe({
      next: () => {
        this.notify.success('Syllabus Uploaded', 'New academic syllabus has been published.');
        this.isSyllabusModalOpen.set(false);
        this.fetchData();
      },
      error: (err) => {
        this.notify.error('Upload Failed', err.error?.message || 'Could not upload syllabus.');
      }
    });
  }

  saveMaterial() {
    if (this.materialForm.invalid) return;
    this.api.post('/academics/materials', this.materialForm.value).subscribe({
      next: () => {
        this.notify.success('Material Saved', 'Study material document has been published.');
        this.isMaterialModalOpen.set(false);
        this.fetchData();
      },
      error: (err) => {
        this.notify.error('Upload Failed', err.error?.message || 'Could not upload study material.');
      }
    });
  }

  deleteSyllabus(id: number) {
    if (!confirm('Are you sure you want to delete this syllabus?')) return;
    this.api.delete(`/academics/syllabus/${id}`).subscribe({
      next: () => {
        this.notify.success('Syllabus Deleted', 'Syllabus item removed.');
        this.fetchData();
      },
      error: (err) => {
        this.notify.error('Delete Failed', err.error?.message || 'Could not delete syllabus.');
      }
    });
  }

  deleteMaterial(id: number) {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    this.api.delete(`/academics/materials/${id}`).subscribe({
      next: () => {
        this.notify.success('Material Deleted', 'Study material removed.');
        this.fetchData();
      },
      error: (err) => {
        this.notify.error('Delete Failed', err.error?.message || 'Could not delete study material.');
      }
    });
  }

  downloadFile(fileName: string) {
    this.notify.info('Downloading File', `Starting download for ${fileName}`);
  }
}
