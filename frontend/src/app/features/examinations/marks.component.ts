import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { Exam, SchoolClass, Section, Subject, Mark } from '../../core/models/models';

@Component({
  selector: 'app-marks',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, SkeletonLoaderComponent],
  templateUrl: './marks.component.html',
  styleUrl: './marks.component.css'
})
export class MarksComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  exams = signal<Exam[]>([]);
  classes = signal<SchoolClass[]>([]);
  sections = signal<Section[]>([]);
  subjects = signal<Subject[]>([]);
  markSheet = signal<any[]>([]);

  selectedExam: string = '1';
  selectedClass: string = '3';
  selectedSection: string = '5';
  selectedSubject: string = '1';

  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isReportModalOpen = signal<boolean>(false);
  reportCard = signal<any>(null);

  ngOnInit() {
    this.api.get<Exam[]>('/exams').subscribe(res => {
      this.exams.set(res.data || []);
      if (this.exams().length > 0) this.selectedExam = String(this.exams()[0].exam_id);
    });

    this.api.get<SchoolClass[]>('/academics/classes').subscribe(res => {
      this.classes.set(res.data || []);
      if (this.classes().length > 0) {
        this.selectedClass = String(this.classes()[0].class_id);
        this.onClassChange();
      }
    });
  }

  onClassChange() {
    if (!this.selectedClass) return;
    this.api.get<Section[]>('/academics/sections', { class_id: this.selectedClass }).subscribe(res => {
      this.sections.set(res.data || []);
      if (this.sections().length > 0) this.selectedSection = String(this.sections()[0].section_id);
    });

    this.api.get<Subject[]>('/academics/subjects', { class_id: this.selectedClass }).subscribe(res => {
      this.subjects.set(res.data || []);
      if (this.subjects().length > 0) {
        this.selectedSubject = String(this.subjects()[0].subject_id);
        this.fetchSheet();
      }
    });
  }

  fetchSheet() {
    if (!this.selectedExam || !this.selectedClass || !this.selectedSection || !this.selectedSubject) return;
    this.isLoading.set(true);

    this.api.get<any[]>('/exams/marks/sheet', {
      exam_id: this.selectedExam,
      class_id: this.selectedClass,
      section_id: this.selectedSection,
      subject_id: this.selectedSubject
    }).subscribe({
      next: (res) => {
        this.markSheet.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onMarkChange(entry: any) {
    const obtained = parseFloat(entry.mark_obtained) || 0;
    const total = parseFloat(entry.mark_total) || 100;
    const percentage = total > 0 ? (obtained / total) * 100 : 0;

    if (percentage >= 90) { entry.grade = 'A+'; entry.grade_point = 4.0; }
    else if (percentage >= 80) { entry.grade = 'A'; entry.grade_point = 3.7; }
    else if (percentage >= 70) { entry.grade = 'B+'; entry.grade_point = 3.3; }
    else if (percentage >= 60) { entry.grade = 'B'; entry.grade_point = 3.0; }
    else if (percentage >= 50) { entry.grade = 'C+'; entry.grade_point = 2.5; }
    else if (percentage >= 40) { entry.grade = 'C'; entry.grade_point = 2.0; }
    else { entry.grade = 'F'; entry.grade_point = 0.0; }
  }

  saveMarks() {
    this.isSaving.set(true);
    const marks = this.markSheet().map(m => ({
      student_id: m.student_id,
      mark_obtained: m.mark_obtained,
      mark_total: m.mark_total || 100,
      grade: m.grade,
      grade_point: m.grade_point,
      comment: m.comment || null
    }));

    this.api.post('/exams/marks/save', {
      exam_id: this.selectedExam,
      class_id: this.selectedClass,
      section_id: this.selectedSection,
      subject_id: this.selectedSubject,
      marks
    }).subscribe({
      next: () => {
        this.notify.success('Marks saved and evaluated successfully');
        this.isSaving.set(false);
        this.fetchSheet();
      },
      error: () => this.isSaving.set(false)
    });
  }

  viewReportCard(studentId: number) {
    this.api.get<any>(`/exams/results/student/${studentId}`, { exam_id: this.selectedExam }).subscribe({
      next: (res) => {
        this.reportCard.set(res.data);
        this.isReportModalOpen.set(true);
      }
    });
  }
}
