import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cms-menus',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cms-menus.component.html',
  styleUrls: ['./cms-menus.component.css'],})
export class CmsMenusComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  menus = signal<any[]>([]);
  isModalOpen = signal<boolean>(false);
  editingMenuId = signal<number | null>(null);

  formData: any = {
    title: '',
    route: '/site',
    parent_id: null,
    display_order: 1,
    is_active: 1
  };

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.api.get<any>('/cms/menu').subscribe(res => {
      if (res.success && res.data) {
        this.menus.set(res.data);
      }
    });
  }

  openCreateModal() {
    this.editingMenuId.set(null);
    this.formData = { title: '', route: '/site', parent_id: null, display_order: this.menus().length + 1, is_active: 1 };
    this.isModalOpen.set(true);
  }

  openAddChild(parent: any) {
    this.editingMenuId.set(null);
    this.formData = { title: '', route: '/site/p/', parent_id: parent.menu_id, display_order: (parent.children?.length || 0) + 1, is_active: 1 };
    this.isModalOpen.set(true);
  }

  openEditModal(item: any) {
    this.editingMenuId.set(item.menu_id);
    this.formData = { ...item };
    this.isModalOpen.set(true);
  }

  saveMenu() {
    if (this.editingMenuId()) {
      this.api.put<any>(`/cms/menu/${this.editingMenuId()}`, this.formData).subscribe({
        next: () => {
          this.notify.success('Menu updated successfully!');
          this.isModalOpen.set(false);
          this.loadMenus();
        },
        error: (err) => this.notify.error(err.message)
      });
    } else {
      this.api.post<any>('/cms/menu', this.formData).subscribe({
        next: () => {
          this.notify.success('Menu created successfully!');
          this.isModalOpen.set(false);
          this.loadMenus();
        },
        error: (err) => this.notify.error(err.message)
      });
    }
  }

  deleteMenu(item: any) {
    if (!confirm(`Delete menu item "${item.title}"?`)) return;
    this.api.delete<any>(`/cms/menu/${item.menu_id}`).subscribe({
      next: () => {
        this.notify.success('Menu item deleted!');
        this.loadMenus();
      },
      error: (err) => this.notify.error(err.message)
    });
  }
}
