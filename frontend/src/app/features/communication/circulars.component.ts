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
import { Circular, Enquiry } from '../../core/models/models';

@Component({
  selector: 'app-circulars',
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
  templateUrl: './circulars.component.html',
  styleUrl: './circulars.component.css'
})
export class CircularsComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab: 'circulars' | 'enquiries' = 'circulars';
  loadingCirculars = signal<boolean>(true);
  loadingEnquiries = signal<boolean>(true);

  circulars = signal<Circular[]>([]);
  enquiries = signal<Enquiry[]>([]);

  isCircularModalOpen = false;
  isEnquiryModalOpen = false;
  isDeleteCircularOpen = false;
  isDeleteEnquiryOpen = false;
  isSubmitting = false;

  editingCircular: Circular | null = null;
  selectedCircular: Circular | null = null;
  editingEnquiry: Enquiry | null = null;
  selectedEnquiry: Enquiry | null = null;

  circularForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    reference_no: [''],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    content: ['', Validators.required]
  });

  enquiryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    purpose: [''],
    status: ['pending'],
    message: ['']
  });

  ngOnInit() {
    this.loadCirculars();
    if (this.canManage()) {
      this.loadEnquiries();
    }
  }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'teacher';
  }

  loadCirculars() {
    this.loadingCirculars.set(true);
    this.api.get<Circular[]>('/communication/circulars').subscribe({
      next: (res) => {
        this.circulars.set(res.data || []);
        this.loadingCirculars.set(false);
      },
      error: () => this.loadingCirculars.set(false)
    });
  }

  loadEnquiries() {
    this.loadingEnquiries.set(true);
    this.api.get<Enquiry[]>('/communication/enquiries').subscribe({
      next: (res) => {
        this.enquiries.set(res.data || []);
        this.loadingEnquiries.set(false);
      },
      error: () => this.loadingEnquiries.set(false)
    });
  }

  openAddCircularModal() {
    this.editingCircular = null;
    this.circularForm.reset({
      date: new Date().toISOString().substring(0, 10)
    });
    this.isCircularModalOpen = true;
  }

  openEditCircularModal(c: Circular) {
    this.editingCircular = c;
    this.circularForm.patchValue({
      title: c.title,
      reference_no: c.reference_no || '',
      date: c.date ? String(c.date).substring(0, 10) : new Date().toISOString().substring(0, 10),
      content: c.content
    });
    this.isCircularModalOpen = true;
  }

  saveCircular() {
    if (this.circularForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.circularForm.value;

    if (this.editingCircular) {
      const id = this.editingCircular.circular_id || (this.editingCircular as any).id;
      this.api.put(`/communication/circulars/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Circular updated');
          this.isSubmitting = false;
          this.isCircularModalOpen = false;
          this.loadCirculars();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/communication/circulars', payload).subscribe({
        next: () => {
          this.notify.success('Circular issued');
          this.isSubmitting = false;
          this.isCircularModalOpen = false;
          this.loadCirculars();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteCircular(c: Circular) {
    this.selectedCircular = c;
    this.isDeleteCircularOpen = true;
  }

  deleteCircular() {
    if (!this.selectedCircular) return;
    const id = this.selectedCircular.circular_id || (this.selectedCircular as any).id;
    this.api.delete(`/communication/circulars/${id}`).subscribe({
      next: () => {
        this.notify.success('Circular deleted');
        this.isDeleteCircularOpen = false;
        this.loadCirculars();
      },
      error: () => this.isDeleteCircularOpen = false
    });
  }

  openAddEnquiryModal() {
    this.editingEnquiry = null;
    this.enquiryForm.reset({ status: 'pending' });
    this.isEnquiryModalOpen = true;
  }

  openEditEnquiryModal(e: Enquiry) {
    this.editingEnquiry = e;
    this.enquiryForm.patchValue({
      name: e.name,
      phone: e.phone,
      email: e.email || '',
      purpose: e.purpose || '',
      status: e.status || 'pending',
      message: e.message || (e as any).notes || ''
    });
    this.isEnquiryModalOpen = true;
  }

  saveEnquiry() {
    if (this.enquiryForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.enquiryForm.value;

    if (this.editingEnquiry) {
      const id = this.editingEnquiry.enquiry_id || (this.editingEnquiry as any).id;
      this.api.put(`/communication/enquiries/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Enquiry updated');
          this.isSubmitting = false;
          this.isEnquiryModalOpen = false;
          this.loadEnquiries();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/communication/enquiries', payload).subscribe({
        next: () => {
          this.notify.success('Enquiry logged');
          this.isSubmitting = false;
          this.isEnquiryModalOpen = false;
          this.loadEnquiries();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteEnquiry(e: Enquiry) {
    this.selectedEnquiry = e;
    this.isDeleteEnquiryOpen = true;
  }

  deleteEnquiry() {
    if (!this.selectedEnquiry) return;
    const id = this.selectedEnquiry.enquiry_id || (this.selectedEnquiry as any).id;
    this.api.delete(`/communication/enquiries/${id}`).subscribe({
      next: () => {
        this.notify.success('Enquiry removed');
        this.isDeleteEnquiryOpen = false;
        this.loadEnquiries();
      },
      error: () => this.isDeleteEnquiryOpen = false
    });
  }
}
