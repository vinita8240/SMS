import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { Exam, SchoolClass, Subject } from '../../core/models/models';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  exams = signal<Exam[]>([]);
  questions = signal<any[]>([]);
  classes = signal<SchoolClass[]>([]);
  subjects = signal<Subject[]>([]);

  isExamModalOpen = signal<boolean>(false);
  isQuestionModalOpen = signal<boolean>(false);
  isDeleteDialogOpen = signal<boolean>(false);

  editingExamId: number | null = null;
  editingQuestionId: number | null = null;
  examToDelete: Exam | null = null;

  examColumns: TableColumn[] = [
    { key: 'name', label: 'Exam Name', sortable: true },
    { key: 'start_date', label: 'Start Date', type: 'date', sortable: true },
    { key: 'end_date', label: 'End Date', type: 'date' },
    { key: 'session', label: 'Academic Session' },
    { key: 'status', label: 'Status', type: 'badge' }
  ];

  questionColumns: TableColumn[] = [
    { key: 'question', label: 'Question' },
    { key: 'exam_name', label: 'Exam' },
    { key: 'class_name', label: 'Class' },
    { key: 'subject_name', label: 'Subject' },
    { key: 'marks', label: 'Marks' }
  ];

  examForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    start_date: [''],
    end_date: [''],
    session: ['2026-2027'],
    comment: [''],
    status: ['scheduled']
  });

  questionForm: FormGroup = this.fb.group({
    exam_id: ['', Validators.required],
    class_id: ['', Validators.required],
    subject_id: ['', Validators.required],
    question: ['', Validators.required],
    marks: [5]
  });

  ngOnInit() {
    this.api.get<SchoolClass[]>('/academics/classes').subscribe(res => this.classes.set(res.data || []));
    this.fetchExams();
    this.fetchQuestions();
  }

  fetchExams() {
    this.api.get<Exam[]>('/exams').subscribe(res => this.exams.set(res.data || []));
  }

  fetchQuestions() {
    this.api.get<any[]>('/exams/questions').subscribe(res => this.questions.set(res.data || []));
  }

  onClassChangeInQuestion() {
    const classId = this.questionForm.get('class_id')?.value;
    if (classId) {
      this.api.get<Subject[]>('/academics/subjects', { class_id: classId }).subscribe(res => this.subjects.set(res.data || []));
    }
  }

  onSearchExams(query: string) {
    if (!query) {
      this.fetchExams();
      return;
    }
    const q = query.toLowerCase();
    this.exams.update(items => items.filter(i => i.name.toLowerCase().includes(q)));
  }

  openAddExamModal() {
    this.editingExamId = null;
    this.examForm.reset({ session: '2026-2027', status: 'scheduled' });
    this.isExamModalOpen.set(true);
  }

  openEditExamModal(exam: Exam) {
    this.editingExamId = exam.exam_id;
    this.examForm.patchValue({
      name: exam.name,
      start_date: exam.start_date ? exam.start_date.substring(0, 10) : '',
      end_date: exam.end_date ? exam.end_date.substring(0, 10) : '',
      session: exam.session || '2026-2027',
      comment: exam.comment || '',
      status: exam.status || 'scheduled'
    });
    this.isExamModalOpen.set(true);
  }

  saveExam() {
    if (this.examForm.invalid) return;
    const payload = this.examForm.value;

    if (this.editingExamId) {
      this.api.put(`/exams/${this.editingExamId}`, payload).subscribe({
        next: () => {
          this.notify.success('Exam schedule updated');
          this.isExamModalOpen.set(false);
          this.fetchExams();
        }
      });
    } else {
      this.api.post('/exams', payload).subscribe({
        next: () => {
          this.notify.success('Exam scheduled successfully');
          this.isExamModalOpen.set(false);
          this.fetchExams();
        }
      });
    }
  }

  openAddQuestionModal() {
    this.editingQuestionId = null;
    this.questionForm.reset({ marks: 5 });
    this.isQuestionModalOpen.set(true);
  }

  openEditQuestionModal(q: any) {
    this.editingQuestionId = q.question_id;
    this.questionForm.patchValue({
      exam_id: q.exam_id,
      class_id: q.class_id,
      subject_id: q.subject_id,
      question: q.question,
      marks: q.marks || 5
    });
    this.onClassChangeInQuestion();
    this.isQuestionModalOpen.set(true);
  }

  saveQuestion() {
    if (this.questionForm.invalid) return;
    const payload = this.questionForm.value;

    if (this.editingQuestionId) {
      this.api.put(`/exams/questions/${this.editingQuestionId}`, payload).subscribe({
        next: () => {
          this.notify.success('Question updated in bank');
          this.isQuestionModalOpen.set(false);
          this.fetchQuestions();
        }
      });
    } else {
      this.api.post('/exams/questions', payload).subscribe({
        next: () => {
          this.notify.success('Question added to bank');
          this.isQuestionModalOpen.set(false);
          this.fetchQuestions();
        }
      });
    }
  }

  deleteQuestion(id: number) {
    this.api.delete(`/exams/questions/${id}`).subscribe({
      next: () => {
        this.notify.success('Question deleted');
        this.fetchQuestions();
      }
    });
  }

  confirmDeleteExam(exam: Exam) {
    this.examToDelete = exam;
    this.isDeleteDialogOpen.set(true);
  }

  executeDeleteExam() {
    if (!this.examToDelete) return;
    this.api.delete(`/exams/${this.examToDelete.exam_id}`).subscribe({
      next: () => {
        this.notify.success('Exam deleted');
        this.isDeleteDialogOpen.set(false);
        this.fetchExams();
      }
    });
  }
}
