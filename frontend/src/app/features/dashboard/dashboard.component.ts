import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { DashboardMetrics } from '../../core/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, SkeletonLoaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  api = inject(ApiService);

  metrics = signal<DashboardMetrics | null>(null);
  isLoading = signal<boolean>(true);
  private chartInstances: Chart[] = [];

  @ViewChild('studentsClassChart') studentsClassCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('attendanceTrendChart') attendanceTrendCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('expenseCategoryChart') expenseCategoryCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('teacherDeptChart') teacherDeptCanvas?: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.fetchDashboard();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  private destroyCharts() {
    this.chartInstances.forEach(c => c.destroy());
    this.chartInstances = [];
  }

  fetchDashboard() {
    this.isLoading.set(true);
    this.api.get<DashboardMetrics>('/dashboard').subscribe({
      next: (res) => {
        if (res.data) {
          this.metrics.set(res.data);
          setTimeout(() => this.renderCharts(res.data), 50);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  renderCharts(data: DashboardMetrics) {
    if (!data.charts) return;
    this.destroyCharts();

    // 1. Students by Class
    if (this.studentsClassCanvas?.nativeElement) {
      const chart1 = new Chart(this.studentsClassCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.charts.studentsByClass.map(c => c.class_name),
          datasets: [{
            label: 'Students',
            data: data.charts.studentsByClass.map(c => c.student_count),
            backgroundColor: '#0284c7',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
      this.chartInstances.push(chart1);
    }

    // 2. Attendance Trend
    if (this.attendanceTrendCanvas?.nativeElement) {
      const chart2 = new Chart(this.attendanceTrendCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: data.charts.attendanceTrend.map(a => a.date),
          datasets: [
            {
              label: 'Present',
              data: data.charts.attendanceTrend.map(a => a.present),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Absent',
              data: data.charts.attendanceTrend.map(a => a.absent),
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      this.chartInstances.push(chart2);
    }

    // 3. Expense by Category
    if (this.expenseCategoryCanvas?.nativeElement) {
      const chart3 = new Chart(this.expenseCategoryCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: data.charts.expenseByCategory.map(e => e.category_name),
          datasets: [{
            data: data.charts.expenseByCategory.map(e => e.total_amount),
            backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      this.chartInstances.push(chart3);
    }

    // 4. Teacher Department
    if (this.teacherDeptCanvas?.nativeElement) {
      const chart4 = new Chart(this.teacherDeptCanvas.nativeElement, {
        type: 'polarArea',
        data: {
          labels: data.charts.teachersByDepartment.map(d => d.department_name),
          datasets: [{
            data: data.charts.teachersByDepartment.map(d => d.teacher_count),
            backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(139, 92, 246, 0.6)']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      this.chartInstances.push(chart4);
    }
  }
}
