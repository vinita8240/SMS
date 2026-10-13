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
import { HostelCategory, HostelRoom } from '../../core/models/models';

@Component({
  selector: 'app-hostel',
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
  templateUrl: './hostel.component.html',
  styleUrl: './hostel.component.css'
})
export class HostelComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab: 'hostels' | 'rooms' = 'hostels';
  loading = signal<boolean>(true);
  loadingRooms = signal<boolean>(true);

  hostels = signal<HostelCategory[]>([]);
  rooms = signal<HostelRoom[]>([]);

  isHostelModalOpen = false;
  isRoomModalOpen = false;
  isDeleteHostelOpen = false;
  isDeleteRoomOpen = false;
  isSubmitting = false;

  editingHostel: HostelCategory | null = null;
  selectedHostel: HostelCategory | null = null;
  editingRoom: HostelRoom | null = null;
  selectedRoom: HostelRoom | null = null;

  hostelForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    type: ['Boys', Validators.required],
    description: ['']
  });

  roomForm: FormGroup = this.fb.group({
    hostel_category_id: ['', Validators.required],
    room_number: ['', Validators.required],
    room_type: ['Standard'],
    num_beds: [2, [Validators.required, Validators.min(1)]],
    cost_per_bed: [0]
  });

  ngOnInit() {
    this.loadHostels();
    this.loadRooms();
  }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'hostel_master';
  }

  loadHostels() {
    this.loading.set(true);
    this.api.get<HostelCategory[]>('/facilities/hostels').subscribe({
      next: (res) => {
        this.hostels.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRooms() {
    this.loadingRooms.set(true);
    this.api.get<HostelRoom[]>('/facilities/rooms').subscribe({
      next: (res) => {
        this.rooms.set(res.data || []);
        this.loadingRooms.set(false);
      },
      error: () => this.loadingRooms.set(false)
    });
  }

  openAddHostelModal() {
    this.editingHostel = null;
    this.hostelForm.reset({ type: 'Boys' });
    this.isHostelModalOpen = true;
  }

  openEditHostelModal(h: HostelCategory) {
    this.editingHostel = h;
    this.hostelForm.patchValue({
      name: h.name,
      type: h.type || 'Boys',
      description: h.description || ''
    });
    this.isHostelModalOpen = true;
  }

  saveHostel() {
    if (this.hostelForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.hostelForm.value;

    if (this.editingHostel) {
      const id = this.editingHostel.hostel_category_id || (this.editingHostel as any).id;
      this.api.put(`/facilities/hostels/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Hostel updated');
          this.isSubmitting = false;
          this.isHostelModalOpen = false;
          this.loadHostels();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/facilities/hostels', payload).subscribe({
        next: () => {
          this.notify.success('Hostel added');
          this.isSubmitting = false;
          this.isHostelModalOpen = false;
          this.loadHostels();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteHostel(h: HostelCategory) {
    this.selectedHostel = h;
    this.isDeleteHostelOpen = true;
  }

  deleteHostel() {
    if (!this.selectedHostel) return;
    const id = this.selectedHostel.hostel_category_id || (this.selectedHostel as any).id;
    this.api.delete(`/facilities/hostels/${id}`).subscribe({
      next: () => {
        this.notify.success('Hostel deleted');
        this.isDeleteHostelOpen = false;
        this.loadHostels();
      },
      error: () => this.isDeleteHostelOpen = false
    });
  }

  openAddRoomModal() {
    this.editingRoom = null;
    const hostList = this.hostels();
    this.roomForm.reset({
      hostel_category_id: hostList[0]?.hostel_category_id || (hostList[0] as any)?.id || '',
      room_number: '',
      room_type: 'Standard',
      num_beds: 2,
      cost_per_bed: 0
    });
    this.isRoomModalOpen = true;
  }

  openEditRoomModal(r: HostelRoom) {
    this.editingRoom = r;
    this.roomForm.patchValue({
      hostel_category_id: r.hostel_category_id || (r as any).hostel_id,
      room_number: r.room_number || (r as any).name || (r as any).room_no,
      room_type: r.room_type || 'Standard',
      num_beds: r.num_beds || (r as any).number_of_bed || 2,
      cost_per_bed: r.cost_per_bed || (r as any).cost || 0
    });
    this.isRoomModalOpen = true;
  }

  saveRoom() {
    if (this.roomForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.roomForm.value;

    if (this.editingRoom) {
      const id = this.editingRoom.hostel_room_id || (this.editingRoom as any).id;
      this.api.put(`/facilities/rooms/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Room updated');
          this.isSubmitting = false;
          this.isRoomModalOpen = false;
          this.loadRooms();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/facilities/rooms', payload).subscribe({
        next: () => {
          this.notify.success('Room added');
          this.isSubmitting = false;
          this.isRoomModalOpen = false;
          this.loadRooms();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteRoom(r: HostelRoom) {
    this.selectedRoom = r;
    this.isDeleteRoomOpen = true;
  }

  deleteRoom() {
    if (!this.selectedRoom) return;
    const id = this.selectedRoom.hostel_room_id || (this.selectedRoom as any).id;
    this.api.delete(`/facilities/rooms/${id}`).subscribe({
      next: () => {
        this.notify.success('Room deleted');
        this.isDeleteRoomOpen = false;
        this.loadRooms();
      },
      error: () => this.isDeleteRoomOpen = false
    });
  }
}
