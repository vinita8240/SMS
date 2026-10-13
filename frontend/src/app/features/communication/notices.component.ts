import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { Notice } from '../../core/models/models';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ModalComponent,
    ConfirmDialogComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './notices.component.html',
  styleUrl: './notices.component.css'
})
export class NoticesComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  loading = signal<boolean>(true);
  notices = signal<Notice[]>([]);

  isModalOpen = false;
  isDeleteOpen = false;
  isSubmitting = false;

  editingNotice: Notice | null = null;
  selectedNotice: Notice | null = null;

  noticeForm: FormGroup = this.fb.group({
    notice_title: ['', Validators.required],
    audience: ['all', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    notice: ['', Validators.required]
  });

  ngOnInit() {
    this.loadNotices();
  }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'teacher';
  }

  loadNotices() {
    this.loading.set(true);
    this.api.get<Notice[]>('/communication/notices').subscribe({
      next: (res) => {
        this.notices.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openAddNoticeModal() {
    this.editingNotice = null;
    this.noticeForm.reset({
      notice_title: '',
      audience: 'all',
      date: new Date().toISOString().substring(0, 10),
      notice: ''
    });
    this.isModalOpen = true;
  }

  openEditNoticeModal(n: Notice) {
    this.editingNotice = n;
    this.noticeForm.patchValue({
      notice_title: n.notice_title || (n as any).title,
      audience: n.audience || (n as any).target_role || 'all',
      date: n.date ? String(n.date).substring(0, 10) : new Date().toISOString().substring(0, 10),
      notice: n.notice || (n as any).content || (n as any).description
    });
    this.isModalOpen = true;
  }

  saveNotice() {
    if (this.noticeForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.noticeForm.value;

    if (this.editingNotice) {
      const id = this.editingNotice.notice_id || (this.editingNotice as any).id;
      this.api.put(`/communication/notices/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Notice updated successfully');
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.loadNotices();
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Failed to update notice');
          this.isSubmitting = false;
        }
      });
    } else {
      this.api.post('/communication/notices', payload).subscribe({
        next: () => {
          this.notify.success('Notice posted successfully');
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.loadNotices();
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Failed to post notice');
          this.isSubmitting = false;
        }
      });
    }
  }

  confirmDeleteNotice(n: Notice) {
    this.selectedNotice = n;
    this.isDeleteOpen = true;
  }

  deleteNotice() {
    if (!this.selectedNotice) return;
    const id = this.selectedNotice.notice_id || (this.selectedNotice as any).id;
    this.api.delete(`/communication/notices/${id}`).subscribe({
      next: () => {
        this.notify.success('Notice deleted');
        this.isDeleteOpen = false;
        this.loadNotices();
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to delete notice');
        this.isDeleteOpen = false;
      }
    });
  }
}
