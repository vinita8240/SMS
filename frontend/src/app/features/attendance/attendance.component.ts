import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { SchoolClass, Section, AttendanceRecord } from '../../core/models/models';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  classes = signal<SchoolClass[]>([]);
  sections = signal<Section[]>([]);
  attendanceList = signal<AttendanceRecord[]>([]);

  selectedDate: string = new Date().toISOString().slice(0, 10);
  selectedClass: string = '3';
  selectedSection: string = '5';
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  ngOnInit() {
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
      if (this.sections().length > 0) {
        this.selectedSection = String(this.sections()[0].section_id);
        this.fetchAttendance();
      }
    });
  }

  fetchAttendance() {
    if (!this.selectedClass || !this.selectedSection || !this.selectedDate) return;
    this.isLoading.set(true);

    this.api.get<AttendanceRecord[]>('/attendance', {
      class_id: this.selectedClass,
      section_id: this.selectedSection,
      date: this.selectedDate
    }).subscribe({
      next: (res) => {
        const records = (res.data || []).map(r => ({
          ...r,
          attendance_status: r.attendance_status || 1
        }));
        this.attendanceList.set(records);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  markAll(status: number) {
    this.attendanceList.update(list => list.map(item => ({ ...item, attendance_status: status })));
  }

  countStatus(status: number): number {
    return this.attendanceList().filter(a => a.attendance_status === status).length;
  }

  saveAttendance() {
    this.isSaving.set(true);
    const records = this.attendanceList().map(item => ({
      student_id: item.student_id,
      status: item.attendance_status,
      remarks: item.remarks || null
    }));

    this.api.post('/attendance/bulk', {
      class_id: this.selectedClass,
      section_id: this.selectedSection,
      date: this.selectedDate,
      records
    }).subscribe({
      next: () => {
        this.notify.success('Attendance saved successfully');
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }
}
