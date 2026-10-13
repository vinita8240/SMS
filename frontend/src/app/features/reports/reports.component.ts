import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);

  activeReport: 'finance' | 'dues' | 'students' | 'exams' = 'finance';
  loading = signal<boolean>(true);
  reportData = signal<any[]>([]);
  today = new Date();

  ngOnInit() {
    this.fetchReport();
  }

  selectReport(report: 'finance' | 'dues' | 'students' | 'exams') {
    this.activeReport = report;
    this.fetchReport();
  }

  getReportTitle(): string {
    switch (this.activeReport) {
      case 'finance': return 'Fee Collection & Revenue Report';
      case 'dues': return 'Outstanding Fee Defaulters Report';
      case 'students': return 'Student Enrollment & Demographic Summary';
      case 'exams': return 'Academic Examination Marks & Results';
    }
  }

  fetchReport() {
    this.loading.set(true);
    if (this.activeReport === 'finance') {
      this.api.get<any[]>('/finance/invoices').subscribe({
        next: (res) => {
          this.reportData.set(res.data || []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else if (this.activeReport === 'dues') {
      this.api.get<any[]>('/finance/invoices').subscribe({
        next: (res) => {
          const list = (res.data || []).filter(inv => inv.status !== 'paid');
          this.reportData.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else if (this.activeReport === 'students') {
      this.api.get<any[]>('/students').subscribe({
        next: (res) => {
          this.reportData.set(res.data || []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else if (this.activeReport === 'exams') {
      this.api.get<any[]>('/exams/marks').subscribe({
        next: (res) => {
          this.reportData.set(res.data || []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  printReport() {
    window.print();
  }

  exportCSV() {
    const data = this.reportData();
    if (!data || !data.length) return;

    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const headers = keys.join(',');
    const rows = data.map(row => 
      keys.map(k => `"${(row[k] !== undefined && row[k] !== null) ? String(row[k]).replace(/"/g, '""') : ''}"`).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${this.activeReport}_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
