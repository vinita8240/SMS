import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cms-themes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cms-themes.component.html',
  styleUrls: ['./cms-themes.component.css'],})
export class CmsThemesComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  themes = signal<any[]>([]);
  isActivating = signal<number | null>(null);
  customizingTheme = signal<any | null>(null);

  ngOnInit() {
    this.loadThemes();
  }

  loadThemes() {
    this.api.get<any>('/cms/themes').subscribe(res => {
      if (res.success && res.data) {
        this.themes.set(res.data);
      }
    });
  }

  activateTheme(theme: any) {
    this.isActivating.set(theme.theme_id);
    this.api.post<any>(`/cms/themes/${theme.theme_id}/activate`, {}).subscribe({
      next: (res) => {
        this.isActivating.set(null);
        this.notify.success(res.message || `Theme ${theme.theme_name} activated successfully!`);
        this.loadThemes();
      },
      error: (err) => {
        this.isActivating.set(null);
        this.notify.error('Failed to activate theme: ' + err.message);
      }
    });
  }

  openCustomizer(theme: any) {
    this.customizingTheme.set({ ...theme });
  }

  saveCustomizer() {
    const t = this.customizingTheme();
    if (!t) return;
    this.api.put<any>(`/cms/themes/${t.theme_id}`, t).subscribe({
      next: () => {
        this.notify.success('Theme styles updated successfully!');
        this.customizingTheme.set(null);
        this.loadThemes();
      },
      error: (err) => {
        this.notify.error('Failed to update theme: ' + err.message);
      }
    });
  }
}
