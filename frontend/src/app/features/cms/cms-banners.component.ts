import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-cms-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './cms-banners.component.html',
  styleUrls: ['./cms-banners.component.css'],})
export class CmsBannersComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  banners = signal<any[]>([]);
  isModalOpen = signal<boolean>(false);
  editingBannerId = signal<number | null>(null);

  formData: any = {
    title: '',
    subtitle: '',
    badge_text: '',
    description: '',
    image_url: '',
    button_text: 'Apply for Admission',
    button_url: '/site/contact',
    is_active: 1
  };

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.api.get<any>('/cms/banners').subscribe(res => {
      if (res.success && res.data) {
        this.banners.set(res.data);
      }
    });
  }

  openCreateModal() {
    this.editingBannerId.set(null);
    this.formData = { title: '', subtitle: '', badge_text: '', description: '', image_url: '', button_text: 'Apply for Admission', button_url: '/site/contact', is_active: 1 };
    this.isModalOpen.set(true);
  }

  openEditModal(banner: any) {
    this.editingBannerId.set(banner.banner_id);
    this.formData = { ...banner };
    this.isModalOpen.set(true);
  }

  saveBanner() {
    if (this.editingBannerId()) {
      this.api.put<any>(`/cms/banners/${this.editingBannerId()}`, this.formData).subscribe({
        next: () => {
          this.notify.success('Banner updated successfully!');
          this.isModalOpen.set(false);
          this.loadBanners();
        },
        error: (err) => this.notify.error(err.message)
      });
    } else {
      this.api.post<any>('/cms/banners', this.formData).subscribe({
        next: () => {
          this.notify.success('Banner created successfully!');
          this.isModalOpen.set(false);
          this.loadBanners();
        },
        error: (err) => this.notify.error(err.message)
      });
    }
  }

  deleteBanner(banner: any) {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;
    this.api.delete<any>(`/cms/banners/${banner.banner_id}`).subscribe({
      next: () => {
        this.notify.success('Banner deleted!');
        this.loadBanners();
      },
      error: (err) => this.notify.error(err.message)
    });
  }
}
