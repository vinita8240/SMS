import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-cms-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './cms-gallery.component.html',
  styleUrls: ['./cms-gallery.component.css'],})
export class CmsGalleryComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  categories = signal<any[]>([]);
  items = signal<any[]>([]);
  isModalOpen = signal<boolean>(false);

  formData: any = {
    title: '',
    image_url: '',
    category_id: 1,
    description: '',
    is_published: 1
  };

  ngOnInit() {
    this.loadGallery();
  }

  loadGallery() {
    this.api.get<any>('/cms/gallery').subscribe(res => {
      if (res.success && res.data) {
        this.categories.set(res.data.categories || []);
        this.items.set(res.data.items || []);
      }
    });
  }

  openCreateModal() {
    this.formData = { title: '', image_url: '', category_id: this.categories()[0]?.category_id || 1, description: '', is_published: 1 };
    this.isModalOpen.set(true);
  }

  saveItem() {
    this.api.post<any>('/cms/gallery', this.formData).subscribe({
      next: () => {
        this.notify.success('Photo added to gallery!');
        this.isModalOpen.set(false);
        this.loadGallery();
      },
      error: (err) => this.notify.error(err.message)
    });
  }

  deleteItem(item: any) {
    if (!confirm(`Delete photo "${item.title}"?`)) return;
    this.api.delete<any>(`/cms/gallery/${item.gallery_id}`).subscribe({
      next: () => {
        this.notify.success('Photo deleted!');
        this.loadGallery();
      },
      error: (err) => this.notify.error(err.message)
    });
  }
}
