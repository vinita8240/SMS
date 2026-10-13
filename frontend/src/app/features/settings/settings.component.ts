import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    SkeletonLoaderComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);
  theme = inject(ThemeService);

  activeTab: 'general' | 'audit' = 'general';
  isSaving = false;
  loadingAudit = signal<boolean>(true);
  auditLogs = signal<any[]>([]);

  settingsForm: FormGroup = this.fb.group({
    system_name: ['Apex International Academy', Validators.required],
    system_email: ['admin@school.com', [Validators.required, Validators.email]],
    phone: ['+1 234 567 8900'],
    address: ['100 Education Way, Academic City'],
    currency: ['\$'],
    running_year: ['2025-2026']
  });

  ngOnInit() {
    this.loadSettings();
    this.loadAuditLogs();
  }

  loadSettings() {
    this.api.get<any>('/settings').subscribe({
      next: (res) => {
        if (res.data) {
          this.settingsForm.patchValue(res.data);
        }
      }
    });
  }

  loadAuditLogs() {
    this.loadingAudit.set(true);
    this.api.get<any[]>('/settings/audit-logs').subscribe({
      next: (res) => {
        this.auditLogs.set(res.data || []);
        this.loadingAudit.set(false);
      },
      error: () => this.loadingAudit.set(false)
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;
    this.isSaving = true;
    this.api.put('/settings', this.settingsForm.value).subscribe({
      next: () => {
        this.notify.success('Settings updated successfully');
        this.isSaving = false;
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to save settings');
        this.isSaving = false;
      }
    });
  }
}
