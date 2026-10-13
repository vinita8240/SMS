import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-cms-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './cms-settings.component.html',
  styleUrls: ['./cms-settings.component.css'],})
export class CmsSettingsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  isSaving = signal<boolean>(false);
  formData: any = {};
  socialLinks: any = { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' };

  ngOnInit() {
    this.api.get<any>('/cms/settings').subscribe(res => {
      if (res.success && res.data) {
        this.formData = { ...res.data };
        if (res.data.social_links_json) {
          try {
            this.socialLinks = typeof res.data.social_links_json === 'string' 
              ? JSON.parse(res.data.social_links_json) 
              : res.data.social_links_json;
          } catch (e) {}
        }
      }
    });
  }

  saveSettings() {
    this.isSaving.set(true);
    const payload = {
      ...this.formData,
      social_links_json: this.socialLinks
    };

    this.api.put<any>('/cms/settings', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notify.success('Website settings updated successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notify.error('Failed to update settings: ' + err.message);
      }
    });
  }
}
