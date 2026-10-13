import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cms-homepage-builder',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cms-homepage-builder.component.html',
  styleUrls: ['./cms-homepage-builder.component.css'],})
export class CmsHomepageBuilderComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  sections = signal<any[]>([]);
  isSaving = signal<boolean>(false);
  editingSection = signal<any | null>(null);

  ngOnInit() {
    this.loadSections();
  }

  loadSections() {
    this.api.get<any>('/cms/homepage').subscribe(res => {
      if (res.success && res.data) {
        this.sections.set(res.data);
      }
    });
  }

  toggleEnabled(sec: any) {
    sec.is_enabled = sec.is_enabled ? 0 : 1;
  }

  moveUp(index: number) {
    if (index === 0) return;
    const list = [...this.sections()];
    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    this.sections.set(list);
  }

  moveDown(index: number) {
    if (index === this.sections().length - 1) return;
    const list = [...this.sections()];
    const temp = list[index + 1];
    list[index + 1] = list[index];
    list[index] = temp;
    this.sections.set(list);
  }

  saveOrder() {
    this.isSaving.set(true);
    const payload = this.sections().map((sec, idx) => ({
      section_id: sec.section_id,
      display_order: idx + 1,
      is_enabled: sec.is_enabled
    }));

    this.api.put<any>('/cms/homepage', { sections: payload }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notify.success('Homepage layout and order saved successfully!');
        this.loadSections();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notify.error('Failed to save layout: ' + err.message);
      }
    });
  }

  openEdit(sec: any) {
    this.editingSection.set({ ...sec });
  }

  saveEditSection() {
    const s = this.editingSection();
    if (!s) return;
    this.api.put<any>(`/cms/homepage/sections/${s.section_id}`, s).subscribe({
      next: () => {
        this.notify.success('Section updated successfully!');
        this.editingSection.set(null);
        this.loadSections();
      },
      error: (err) => {
        this.notify.error('Failed to update section: ' + err.message);
      }
    });
  }
}
