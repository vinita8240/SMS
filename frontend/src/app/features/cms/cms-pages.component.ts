import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cms-pages',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cms-pages.component.html',
  styleUrls: ['./cms-pages.component.css'],})
export class CmsPagesComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  pages = signal<any[]>([]);
  isModalOpen = signal<boolean>(false);
  editingPageId = signal<number | null>(null);

  formData: any = {
    title: '',
    slug: '',
    subtitle: '',
    featured_image: '',
    template_type: 'standard',
    content: '',
    seo_title: '',
    seo_keywords: '',
    seo_description: '',
    is_published: 1,
    menu_visible: 1
  };

  ngOnInit() {
    this.loadPages();
  }

  loadPages() {
    this.api.get<any>('/cms/pages').subscribe(res => {
      if (res.success && res.data) {
        this.pages.set(res.data);
      }
    });
  }

  autoSlugify() {
    if (!this.editingPageId() && this.formData.title) {
      this.formData.slug = this.formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
  }

  openCreateModal() {
    this.editingPageId.set(null);
    this.formData = {
      title: '',
      slug: '',
      subtitle: '',
      featured_image: '',
      template_type: 'standard',
      content: '<h2>Title</h2><p>Write your page content here...</p>',
      seo_title: '',
      seo_keywords: '',
      seo_description: '',
      is_published: 1,
      menu_visible: 1
    };
    this.isModalOpen.set(true);
  }

  openEditModal(page: any) {
    this.editingPageId.set(page.page_id);
    this.formData = { ...page };
    this.isModalOpen.set(true);
  }

  savePage() {
    if (this.editingPageId()) {
      this.api.put<any>(`/cms/pages/${this.editingPageId()}`, this.formData).subscribe({
        next: () => {
          this.notify.success('Page updated successfully!');
          this.isModalOpen.set(false);
          this.loadPages();
        },
        error: (err) => this.notify.error(err.message)
      });
    } else {
      this.api.post<any>('/cms/pages', this.formData).subscribe({
        next: () => {
          this.notify.success('Page created successfully!');
          this.isModalOpen.set(false);
          this.loadPages();
        },
        error: (err) => this.notify.error(err.message)
      });
    }
  }

  deletePage(page: any) {
    if (!confirm(`Are you sure you want to delete the page "${page.title}"?`)) return;
    this.api.delete<any>(`/cms/pages/${page.page_id}`).subscribe({
      next: () => {
        this.notify.success('Page deleted successfully!');
        this.loadPages();
      },
      error: (err) => this.notify.error(err.message)
    });
  }
}
