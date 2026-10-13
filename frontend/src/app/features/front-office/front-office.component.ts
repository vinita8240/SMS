import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';

export interface FrontOfficeEnquiry {
  enquiry_id?: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  description?: string;
  note?: string;
  date?: string;
  next_follow_up_date?: string;
  assigned?: string;
  reference?: string;
  source?: string;
  class_id?: number;
  class_name?: string;
  no_of_child?: number;
  status?: string;
  created_at?: string;
}

export interface FrontOfficeVisitor {
  visitor_id?: number;
  purpose: string;
  name: string;
  phone: string;
  id_card?: string;
  no_of_person?: number;
  date?: string;
  in_time?: string;
  out_time?: string;
  note?: string;
  status?: string;
  file_name?: string;
}

export interface FrontOfficeCallLog {
  call_id?: number;
  name: string;
  phone: string;
  date?: string;
  description?: string;
  next_follow_up_date?: string;
  call_duration?: string;
  note?: string;
  call_type?: string;
}

export interface FrontOfficePostal {
  dispatch_id?: number;
  receive_id?: number;
  to_title?: string;
  from_title?: string;
  reference_no?: string;
  address?: string;
  note?: string;
  date?: string;
  file_name?: string;
}

export interface FrontOfficeComplain {
  complain_id?: number;
  complain_type: string;
  source?: string;
  complain_by: string;
  phone?: string;
  date?: string;
  description: string;
  action_taken?: string;
  assigned?: string;
  status?: string;
}

export interface FrontOfficeSetup {
  setup_id?: number;
  setup_type: 'purpose' | 'complain_type' | 'source' | 'reference';
  name: string;
  description?: string;
}

@Component({
  selector: 'app-front-office',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ModalComponent,
    ConfirmDialogComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './front-office.component.html',
  styleUrl: './front-office.component.css'
})
export class FrontOfficeComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab: 'enquiry' | 'visitor' | 'call_log' | 'postal_dispatch' | 'postal_receive' | 'complain' | 'setup' = 'enquiry';
  activeSetupSubTab: 'purpose' | 'complain_type' | 'source' | 'reference' = 'purpose';

  isLoading = signal<boolean>(false);
  searchTerm = '';
  filterStatus = 'all';

  // Data signals
  enquiries = signal<FrontOfficeEnquiry[]>([]);
  visitors = signal<FrontOfficeVisitor[]>([]);
  callLogs = signal<FrontOfficeCallLog[]>([]);
  dispatches = signal<FrontOfficePostal[]>([]);
  receives = signal<FrontOfficePostal[]>([]);
  complaints = signal<FrontOfficeComplain[]>([]);
  setups = signal<FrontOfficeSetup[]>([]);

  // Setup options for select dropdowns
  purposeOptions = signal<FrontOfficeSetup[]>([]);
  complainTypeOptions = signal<FrontOfficeSetup[]>([]);
  sourceOptions = signal<FrontOfficeSetup[]>([]);
  referenceOptions = signal<FrontOfficeSetup[]>([]);

  // Modals state
  isModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isFollowUpModalOpen = signal<boolean>(false);
  isVisitorPassModalOpen = signal<boolean>(false);

  itemToDelete: { type: string; id: number; name: string } | null = null;
  selectedEnquiryForFollowUp: FrontOfficeEnquiry | null = null;
  selectedVisitorForPass: FrontOfficeVisitor | null = null;
  editingId: number | null = null;

  // Forms
  enquiryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    address: [''],
    description: [''],
    note: [''],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    next_follow_up_date: [''],
    assigned: ['Receptionist'],
    reference: ['Direct Visit'],
    source: ['Walk-in Desk'],
    class_name: ['Grade 1'],
    no_of_child: [1],
    status: ['Active']
  });

  followUpForm: FormGroup = this.fb.group({
    response: ['', Validators.required],
    next_follow_up_date: ['', Validators.required],
    status: ['Active']
  });

  visitorForm: FormGroup = this.fb.group({
    purpose: ['Academic Admission', Validators.required],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    id_card: [''],
    no_of_person: [1],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    in_time: ['09:30 AM', Validators.required],
    out_time: [''],
    note: [''],
    status: ['In School']
  });

  callLogForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    description: [''],
    next_follow_up_date: [''],
    call_duration: ['2 mins'],
    note: [''],
    call_type: ['Incoming', Validators.required]
  });

  postalForm: FormGroup = this.fb.group({
    to_title: [''],
    from_title: [''],
    reference_no: [''],
    address: [''],
    note: [''],
    date: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  complainForm: FormGroup = this.fb.group({
    complain_type: ['Transport & Bus Route', Validators.required],
    source: ['Front Desk'],
    complain_by: ['', Validators.required],
    phone: [''],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    description: ['', Validators.required],
    action_taken: [''],
    assigned: ['Principal'],
    status: ['Pending']
  });

  setupForm: FormGroup = this.fb.group({
    setup_type: ['purpose', Validators.required],
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tabParam = params['tab'].toLowerCase();
        if (['enquiry', 'visitor', 'call_log', 'postal_dispatch', 'postal_receive', 'complain', 'setup'].includes(tabParam)) {
          this.activeTab = tabParam as any;
        } else if (tabParam === 'calls') {
          this.activeTab = 'call_log';
        } else if (tabParam === 'postal') {
          this.activeTab = 'postal_dispatch';
        }
      }
      this.loadActiveTabData();
      this.loadAllSetups();
    });
  }

  setTab(tab: 'enquiry' | 'visitor' | 'call_log' | 'postal_dispatch' | 'postal_receive' | 'complain' | 'setup') {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
    this.loadActiveTabData();
  }

  setSetupSubTab(subTab: 'purpose' | 'complain_type' | 'source' | 'reference') {
    this.activeSetupSubTab = subTab;
    this.loadSetups(subTab);
  }

  loadActiveTabData() {
    this.searchTerm = '';
    this.filterStatus = 'all';

    switch (this.activeTab) {
      case 'enquiry':
        this.loadEnquiries();
        break;
      case 'visitor':
        this.loadVisitors();
        break;
      case 'call_log':
        this.loadCallLogs();
        break;
      case 'postal_dispatch':
        this.loadDispatches();
        break;
      case 'postal_receive':
        this.loadReceives();
        break;
      case 'complain':
        this.loadComplaints();
        break;
      case 'setup':
        this.loadSetups(this.activeSetupSubTab);
        break;
    }
  }

  loadAllSetups() {
    this.api.get<FrontOfficeSetup[]>('/front-office/setup').subscribe({
      next: (res) => {
        const list = res.data || [];
        this.purposeOptions.set(list.filter(s => s.setup_type === 'purpose'));
        this.complainTypeOptions.set(list.filter(s => s.setup_type === 'complain_type'));
        this.sourceOptions.set(list.filter(s => s.setup_type === 'source'));
        this.referenceOptions.set(list.filter(s => s.setup_type === 'reference'));
      }
    });
  }

  // --- Enquiries ---
  loadEnquiries() {
    this.isLoading.set(true);
    const params: any = {};
    if (this.filterStatus !== 'all') params.status = this.filterStatus;
    if (this.searchTerm) params.search = this.searchTerm;

    this.api.get<FrontOfficeEnquiry[]>('/front-office/enquiries', params).subscribe({
      next: (res) => {
        this.enquiries.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddEnquiry() {
    this.editingId = null;
    this.enquiryForm.reset({
      date: new Date().toISOString().slice(0, 10),
      assigned: 'Receptionist',
      reference: this.referenceOptions()[0]?.name || 'Direct Visit',
      source: this.sourceOptions()[0]?.name || 'Walk-in Desk',
      class_name: 'Grade 1',
      no_of_child: 1,
      status: 'Active'
    });
    this.isModalOpen.set(true);
  }

  openEditEnquiry(item: FrontOfficeEnquiry) {
    this.editingId = item.enquiry_id!;
    this.enquiryForm.patchValue({
      name: item.name,
      phone: item.phone,
      email: item.email || '',
      address: item.address || '',
      description: item.description || '',
      note: item.note || '',
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      next_follow_up_date: item.next_follow_up_date ? String(item.next_follow_up_date).slice(0, 10) : '',
      assigned: item.assigned || 'Receptionist',
      reference: item.reference || 'Direct Visit',
      source: item.source || 'Walk-in Desk',
      class_name: item.class_name || 'Grade 1',
      no_of_child: item.no_of_child || 1,
      status: item.status || 'Active'
    });
    this.isModalOpen.set(true);
  }

  saveEnquiry() {
    if (this.enquiryForm.invalid) return;
    const payload = this.enquiryForm.value;

    if (this.editingId) {
      this.api.put(`/front-office/enquiries/${this.editingId}`, payload).subscribe({
        next: () => {
          this.notify.success('Enquiry updated successfully');
          this.isModalOpen.set(false);
          this.loadEnquiries();
        },
        error: (err) => this.notify.error(err.error?.message || 'Failed to update enquiry')
      });
    } else {
      this.api.post('/front-office/enquiries', payload).subscribe({
        next: () => {
          this.notify.success('Enquiry recorded successfully');
          this.isModalOpen.set(false);
          this.loadEnquiries();
        },
        error: (err) => this.notify.error(err.error?.message || 'Failed to record enquiry')
      });
    }
  }

  openFollowUpModal(enq: FrontOfficeEnquiry) {
    this.selectedEnquiryForFollowUp = enq;
    this.followUpForm.reset({
      response: '',
      next_follow_up_date: enq.next_follow_up_date ? String(enq.next_follow_up_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: enq.status || 'Active'
    });
    this.isFollowUpModalOpen.set(true);
  }

  saveFollowUp() {
    if (this.followUpForm.invalid || !this.selectedEnquiryForFollowUp) return;
    const val = this.followUpForm.value;
    const noteAppend = `\n[${new Date().toLocaleDateString()}] Follow-up: ${val.response}`;
    const payload = {
      note: (this.selectedEnquiryForFollowUp.note || '') + noteAppend,
      next_follow_up_date: val.next_follow_up_date,
      status: val.status
    };

    this.api.put(`/front-office/enquiries/${this.selectedEnquiryForFollowUp.enquiry_id}`, payload).subscribe({
      next: () => {
        this.notify.success('Follow up logged successfully');
        this.isFollowUpModalOpen.set(false);
        this.loadEnquiries();
      }
    });
  }

  // --- Visitors ---
  loadVisitors() {
    this.isLoading.set(true);
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;

    this.api.get<FrontOfficeVisitor[]>('/front-office/visitors', params).subscribe({
      next: (res) => {
        this.visitors.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddVisitor() {
    this.editingId = null;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.visitorForm.reset({
      purpose: this.purposeOptions()[0]?.name || 'Academic Admission',
      no_of_person: 1,
      date: now.toISOString().slice(0, 10),
      in_time: timeStr,
      out_time: '',
      status: 'In School'
    });
    this.isModalOpen.set(true);
  }

  openEditVisitor(item: FrontOfficeVisitor) {
    this.editingId = item.visitor_id!;
    this.visitorForm.patchValue({
      purpose: item.purpose,
      name: item.name,
      phone: item.phone,
      id_card: item.id_card || '',
      no_of_person: item.no_of_person || 1,
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      in_time: item.in_time || '',
      out_time: item.out_time || '',
      note: item.note || '',
      status: item.status || 'In School'
    });
    this.isModalOpen.set(true);
  }

  saveVisitor() {
    if (this.visitorForm.invalid) return;
    const payload = this.visitorForm.value;

    if (this.editingId) {
      this.api.put(`/front-office/visitors/${this.editingId}`, payload).subscribe({
        next: () => {
          this.notify.success('Visitor updated');
          this.isModalOpen.set(false);
          this.loadVisitors();
        }
      });
    } else {
      this.api.post('/front-office/visitors', payload).subscribe({
        next: () => {
          this.notify.success('Visitor entry recorded');
          this.isModalOpen.set(false);
          this.loadVisitors();
        }
      });
    }
  }

  checkoutVisitor(item: FrontOfficeVisitor) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.api.put(`/front-office/visitors/${item.visitor_id}`, {
      out_time: timeStr,
      status: 'Checked Out'
    }).subscribe({
      next: () => {
        this.notify.success(`Visitor ${item.name} checked out at ${timeStr}`);
        this.loadVisitors();
      }
    });
  }

  printVisitorPass(item: FrontOfficeVisitor) {
    this.selectedVisitorForPass = item;
    this.isVisitorPassModalOpen.set(true);
  }

  // --- Call Logs ---
  loadCallLogs() {
    this.isLoading.set(true);
    const params: any = {};
    if (this.filterStatus !== 'all') params.call_type = this.filterStatus;
    if (this.searchTerm) params.search = this.searchTerm;

    this.api.get<FrontOfficeCallLog[]>('/front-office/calls', params).subscribe({
      next: (res) => {
        this.callLogs.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddCallLog() {
    this.editingId = null;
    this.callLogForm.reset({
      date: new Date().toISOString().slice(0, 10),
      call_duration: '2 mins',
      call_type: 'Incoming'
    });
    this.isModalOpen.set(true);
  }

  openEditCallLog(item: FrontOfficeCallLog) {
    this.editingId = item.call_id!;
    this.callLogForm.patchValue({
      name: item.name,
      phone: item.phone,
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: item.description || '',
      next_follow_up_date: item.next_follow_up_date ? String(item.next_follow_up_date).slice(0, 10) : '',
      call_duration: item.call_duration || '2 mins',
      note: item.note || '',
      call_type: item.call_type || 'Incoming'
    });
    this.isModalOpen.set(true);
  }

  saveCallLog() {
    if (this.callLogForm.invalid) return;
    const payload = this.callLogForm.value;

    if (this.editingId) {
      this.api.put(`/front-office/calls/${this.editingId}`, payload).subscribe({
        next: () => {
          this.notify.success('Call log updated');
          this.isModalOpen.set(false);
          this.loadCallLogs();
        }
      });
    } else {
      this.api.post('/front-office/calls', payload).subscribe({
        next: () => {
          this.notify.success('Call log recorded');
          this.isModalOpen.set(false);
          this.loadCallLogs();
        }
      });
    }
  }

  // --- Postal Dispatch ---
  loadDispatches() {
    this.isLoading.set(true);
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;

    this.api.get<FrontOfficePostal[]>('/front-office/dispatch', params).subscribe({
      next: (res) => {
        this.dispatches.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddDispatch() {
    this.editingId = null;
    this.postalForm.reset({
      date: new Date().toISOString().slice(0, 10),
      from_title: 'Principal Office'
    });
    this.isModalOpen.set(true);
  }

  openEditDispatch(item: FrontOfficePostal) {
    this.editingId = item.dispatch_id!;
    this.postalForm.patchValue({
      to_title: item.to_title,
      from_title: item.from_title || '',
      reference_no: item.reference_no || '',
      address: item.address || '',
      note: item.note || '',
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
    this.isModalOpen.set(true);
  }

  saveDispatch() {
    if (this.postalForm.invalid) return;
    const payload = this.postalForm.value;

    if (this.editingId) {
      this.api.put(`/front-office/dispatch/${this.editingId}`, payload).subscribe({
        next: () => {
          this.notify.success('Postal dispatch updated');
          this.isModalOpen.set(false);
          this.loadDispatches();
        }
      });
    } else {
      this.api.post('/front-office/dispatch', payload).subscribe({
        next: () => {
          this.notify.success('Postal dispatch recorded');
          this.isModalOpen.set(false);
          this.loadDispatches();
        }
      });
    }
  }

  // --- Postal Receive ---
  loadReceives() {
    this.isLoading.set(true);
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;

    this.api.get<FrontOfficePostal[]>('/front-office/receive', params).subscribe({
      next: (res) => {
        this.receives.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddReceive() {
    this.editingId = null;
    this.postalForm.reset({
      date: new Date().toISOString().slice(0, 10),
      to_title: 'School Administration'
    });
    this.isModalOpen.set(true);
  }

  openEditReceive(item: FrontOfficePostal) {
    this.editingId = item.receive_id!;
    this.postalForm.patchValue({
      to_title: item.to_title || '',
      from_title: item.from_title || '',
      reference_no: item.reference_no || '',
      address: item.address || '',
      note: item.note || '',
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
    this.isModalOpen.set(true);
  }

  saveReceive() {
    if (this.postalForm.invalid) return;
    const payload = this.postalForm.value;

    if (this.editingId) {
      this.api.put(`/front-office/receive/${this.editingId}`, payload).subscribe({
        next: () => {
          this.notify.success('Postal receive updated');
          this.isModalOpen.set(false);
          this.loadReceives();
        }
      });
    } else {
      this.api.post('/front-office/receive', payload).subscribe({
        next: () => {
          this.notify.success('Postal receive recorded');
          this.isModalOpen.set(false);
          this.loadReceives();
        }
      });
    }
  }

  // --- Complaints ---
  loadComplaints() {
    this.isLoading.set(true);
    const params: any = {};
    if (this.filterStatus !== 'all') params.status = this.filterStatus;
    if (this.searchTerm) params.search = this.searchTerm;

    this.api.get<FrontOfficeComplain[]>('/front-office/complaints', params).subscribe({
      next: (res) => {
        this.complaints.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddComplaint() {
    this.editingId = null;
    this.complainForm.reset({
      complain_type: this.complainTypeOptions()[0]?.name || 'Transport & Bus Route',
      source: 'Front Desk',
      date: new Date().toISOString().slice(0, 10),
      assigned: 'Principal',
      status: 'Pending'
    });
    this.isModalOpen.set(true);
  }

  openEditComplaint(item: FrontOfficeComplain) {
    this.editingId = item.complain_id!;
    this.complainForm.patchValue({
      complain_type: item.complain_type,
      source: item.source || 'Front Desk',
      complain_by: item.complain_by,
      phone: item.phone || '',
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: item.description,
      action_taken: item.action_taken || '',
      assigned: item.assigned || 'Principal',
      status: item.status || 'Pending'
    });
    this.isModalOpen.set(true);
  }

  saveComplaint() {
    if (this.complainForm.invalid) return;
    const payload = this.complainForm.value;

    if (this.editingId) {
      this.api.put(`/front-office/complaints/${this.editingId}`, payload).subscribe({
        next: () => {
          this.notify.success('Complaint updated');
          this.isModalOpen.set(false);
          this.loadComplaints();
        }
      });
    } else {
      this.api.post('/front-office/complaints', payload).subscribe({
        next: () => {
          this.notify.success('Complaint registered');
          this.isModalOpen.set(false);
          this.loadComplaints();
        }
      });
    }
  }

  // --- Setup Front Office ---
  loadSetups(type: 'purpose' | 'complain_type' | 'source' | 'reference') {
    this.isLoading.set(true);
    this.api.get<FrontOfficeSetup[]>('/front-office/setup', { type }).subscribe({
      next: (res) => {
        this.setups.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddSetup() {
    this.editingId = null;
    this.setupForm.reset({
      setup_type: this.activeSetupSubTab,
      name: '',
      description: ''
    });
    this.isModalOpen.set(true);
  }

  openEditSetup(item: FrontOfficeSetup) {
    this.editingId = item.setup_id!;
    this.setupForm.patchValue({
      setup_type: item.setup_type,
      name: item.name,
      description: item.description || ''
    });
    this.isModalOpen.set(true);
  }

  saveSetup() {
    if (this.setupForm.invalid) return;
    const payload = this.setupForm.value;

    if (this.editingId) {
      this.api.put(`/front-office/setup/${this.editingId}`, payload).subscribe({
        next: () => {
          this.notify.success('Setup item updated');
          this.isModalOpen.set(false);
          this.loadSetups(this.activeSetupSubTab);
          this.loadAllSetups();
        }
      });
    } else {
      this.api.post('/front-office/setup', payload).subscribe({
        next: () => {
          this.notify.success('Setup item created');
          this.isModalOpen.set(false);
          this.loadSetups(this.activeSetupSubTab);
          this.loadAllSetups();
        }
      });
    }
  }

  // --- Generic Delete Action ---
  confirmDelete(type: string, id: number, name: string) {
    this.itemToDelete = { type, id, name };
    this.isDeleteModalOpen.set(true);
  }

  executeDelete() {
    if (!this.itemToDelete) return;
    const { type, id } = this.itemToDelete;

    let endpoint = '';
    switch (type) {
      case 'enquiry': endpoint = `/front-office/enquiries/${id}`; break;
      case 'visitor': endpoint = `/front-office/visitors/${id}`; break;
      case 'call_log': endpoint = `/front-office/calls/${id}`; break;
      case 'postal_dispatch': endpoint = `/front-office/dispatch/${id}`; break;
      case 'postal_receive': endpoint = `/front-office/receive/${id}`; break;
      case 'complain': endpoint = `/front-office/complaints/${id}`; break;
      case 'setup': endpoint = `/front-office/setup/${id}`; break;
    }

    if (endpoint) {
      this.api.delete(endpoint).subscribe({
        next: () => {
          this.notify.success('Record deleted successfully');
          this.isDeleteModalOpen.set(false);
          this.loadActiveTabData();
          if (type === 'setup') this.loadAllSetups();
        },
        error: () => this.isDeleteModalOpen.set(false)
      });
    }
  }
}
