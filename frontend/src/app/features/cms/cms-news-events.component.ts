import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-cms-news-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './cms-news-events.component.html',
  styleUrls: ['./cms-news-events.component.css'],})
export class CmsNewsEventsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  activeTab: 'news' | 'events' = 'news';
  news = signal<any[]>([]);
  events = signal<any[]>([]);
  isModalOpen = signal<boolean>(false);
  editingItemId = signal<number | null>(null);

  formData: any = {};

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.get<any>('/cms/news').subscribe(res => {
      if (res.success && res.data) this.news.set(res.data);
    });
    this.api.get<any>('/cms/events').subscribe(res => {
      if (res.success && res.data) this.events.set(res.data);
    });
  }

  openCreateModal() {
    this.editingItemId.set(null);
    if (this.activeTab === 'news') {
      this.formData = { title: '', slug: 'news-' + Date.now(), summary: '', content: '<p>Content...</p>', image_url: '', category: 'General', is_published: 1, published_at: new Date().toISOString().slice(0, 10) };
    } else {
      this.formData = { title: '', slug: 'event-' + Date.now(), description: '', venue: 'Main Auditorium', start_date: new Date().toISOString().slice(0, 10), time: '09:00 AM', image_url: '', category: 'Academic', is_published: 1 };
    }
    this.isModalOpen.set(true);
  }

  openEditNews(item: any) {
    this.editingItemId.set(item.news_id);
    this.formData = { ...item };
    this.isModalOpen.set(true);
  }

  openEditEvent(item: any) {
    this.editingItemId.set(item.event_id);
    this.formData = { ...item };
    this.isModalOpen.set(true);
  }

  saveItem() {
    const endpoint = this.activeTab === 'news' ? '/cms/news' : '/cms/events';
    const id = this.editingItemId();

    if (id) {
      this.api.put<any>(`${endpoint}/${id}`, this.formData).subscribe({
        next: () => {
          this.notify.success('Updated successfully!');
          this.isModalOpen.set(false);
          this.loadData();
        },
        error: (err) => this.notify.error(err.message)
      });
    } else {
      this.api.post<any>(endpoint, this.formData).subscribe({
        next: () => {
          this.notify.success('Created successfully!');
          this.isModalOpen.set(false);
          this.loadData();
        },
        error: (err) => this.notify.error(err.message)
      });
    }
  }

  deleteNews(item: any) {
    if (!confirm(`Delete news article "${item.title}"?`)) return;
    this.api.delete<any>(`/cms/news/${item.news_id}`).subscribe({
      next: () => {
        this.notify.success('News article deleted!');
        this.loadData();
      },
      error: (err) => this.notify.error(err.message)
    });
  }

  deleteEvent(item: any) {
    if (!confirm(`Delete event "${item.title}"?`)) return;
    this.api.delete<any>(`/cms/events/${item.event_id}`).subscribe({
      next: () => {
        this.notify.success('Event deleted!');
        this.loadData();
      },
      error: (err) => this.notify.error(err.message)
    });
  }
}
