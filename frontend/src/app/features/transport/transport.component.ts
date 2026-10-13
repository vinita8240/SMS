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
import { TransportRoute, Vehicle } from '../../core/models/models';

@Component({
  selector: 'app-transport',
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
  templateUrl: './transport.component.html',
  styleUrl: './transport.component.css'
})
export class TransportComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab: 'routes' | 'vehicles' = 'routes';
  loadingRoutes = signal<boolean>(true);
  loadingVehicles = signal<boolean>(true);

  routes = signal<TransportRoute[]>([]);
  vehicles = signal<Vehicle[]>([]);

  isRouteModalOpen = false;
  isVehicleModalOpen = false;
  isDeleteRouteOpen = false;
  isDeleteVehicleOpen = false;
  isSubmitting = false;

  editingRoute: TransportRoute | null = null;
  selectedRoute: TransportRoute | null = null;
  editingVehicle: Vehicle | null = null;
  selectedVehicle: Vehicle | null = null;

  routeForm: FormGroup = this.fb.group({
    route_name: ['', Validators.required],
    start_point: [''],
    end_point: [''],
    route_fare: [0, [Validators.required, Validators.min(0)]],
    description: ['']
  });

  vehicleForm: FormGroup = this.fb.group({
    vehicle_number: ['', Validators.required],
    vehicle_model: [''],
    driver_name: ['', Validators.required],
    driver_phone: [''],
    driver_licence: [''],
    seating_capacity: [30, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.loadRoutes();
    this.loadVehicles();
  }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'transport_manager';
  }

  loadRoutes() {
    this.loadingRoutes.set(true);
    this.api.get<TransportRoute[]>('/facilities/routes').subscribe({
      next: (res) => {
        this.routes.set(res.data || []);
        this.loadingRoutes.set(false);
      },
      error: () => this.loadingRoutes.set(false)
    });
  }

  loadVehicles() {
    this.loadingVehicles.set(true);
    this.api.get<Vehicle[]>('/facilities/vehicles').subscribe({
      next: (res) => {
        this.vehicles.set(res.data || []);
        this.loadingVehicles.set(false);
      },
      error: () => this.loadingVehicles.set(false)
    });
  }

  openAddRouteModal() {
    this.editingRoute = null;
    this.routeForm.reset({ route_fare: 0 });
    this.isRouteModalOpen = true;
  }

  openEditRouteModal(r: TransportRoute) {
    this.editingRoute = r;
    this.routeForm.patchValue({
      route_name: r.route_name || (r as any).name || (r as any).title,
      start_point: r.start_point || '',
      end_point: r.end_point || '',
      route_fare: r.route_fare || (r as any).fare || 0,
      description: r.description || ''
    });
    this.isRouteModalOpen = true;
  }

  saveRoute() {
    if (this.routeForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.routeForm.value;

    if (this.editingRoute) {
      const id = this.editingRoute.transport_route_id || (this.editingRoute as any).id;
      this.api.put(`/facilities/routes/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Route updated');
          this.isSubmitting = false;
          this.isRouteModalOpen = false;
          this.loadRoutes();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/facilities/routes', payload).subscribe({
        next: () => {
          this.notify.success('Route added');
          this.isSubmitting = false;
          this.isRouteModalOpen = false;
          this.loadRoutes();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteRoute(r: TransportRoute) {
    this.selectedRoute = r;
    this.isDeleteRouteOpen = true;
  }

  deleteRoute() {
    if (!this.selectedRoute) return;
    const id = this.selectedRoute.transport_route_id || (this.selectedRoute as any).id;
    this.api.delete(`/facilities/routes/${id}`).subscribe({
      next: () => {
        this.notify.success('Route deleted');
        this.isDeleteRouteOpen = false;
        this.loadRoutes();
      },
      error: () => this.isDeleteRouteOpen = false
    });
  }

  openAddVehicleModal() {
    this.editingVehicle = null;
    this.vehicleForm.reset({ seating_capacity: 30 });
    this.isVehicleModalOpen = true;
  }

  openEditVehicleModal(v: Vehicle) {
    this.editingVehicle = v;
    this.vehicleForm.patchValue({
      vehicle_number: v.vehicle_number || (v as any).vehicle_no,
      vehicle_model: v.vehicle_model || '',
      driver_name: v.driver_name || '',
      driver_phone: v.driver_phone || '',
      driver_licence: v.driver_license || (v as any).driver_licence || '',
      seating_capacity: v.seating_capacity || (v as any).capacity || 30
    });
    this.isVehicleModalOpen = true;
  }

  saveVehicle() {
    if (this.vehicleForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.vehicleForm.value;

    if (this.editingVehicle) {
      const id = this.editingVehicle.vehicle_id || (this.editingVehicle as any).id;
      this.api.put(`/facilities/vehicles/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Vehicle updated');
          this.isSubmitting = false;
          this.isVehicleModalOpen = false;
          this.loadVehicles();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/facilities/vehicles', payload).subscribe({
        next: () => {
          this.notify.success('Vehicle added');
          this.isSubmitting = false;
          this.isVehicleModalOpen = false;
          this.loadVehicles();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteVehicle(v: Vehicle) {
    this.selectedVehicle = v;
    this.isDeleteVehicleOpen = true;
  }

  deleteVehicle() {
    if (!this.selectedVehicle) return;
    const id = this.selectedVehicle.vehicle_id || (this.selectedVehicle as any).id;
    this.api.delete(`/facilities/vehicles/${id}`).subscribe({
      next: () => {
        this.notify.success('Vehicle deleted');
        this.isDeleteVehicleOpen = false;
        this.loadVehicles();
      },
      error: () => this.isDeleteVehicleOpen = false
    });
  }
}
