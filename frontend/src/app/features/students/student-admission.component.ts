import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { SchoolClass, Section, Student } from '../../core/models/models';

import { ModalComponent } from '../../shared/components/modal.component';

interface FeeGroupItem {
  id: string;
  name: string;
  amount: string;
  selected: boolean;
}

interface DiscountItem {
  id: string;
  name: string;
  code: string;
  selected: boolean;
}

type AdmissionMasterKind = 'class' | 'section' | 'category' | 'house' | 'feeGroup' | 'discount' | 'route' | 'hostel' | 'room';

@Component({
  selector: 'app-student-admission',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ModalComponent],
  templateUrl: './student-admission.component.html',
  styleUrl: './student-admission.component.css'
})
export class StudentAdmissionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);
  isMoreDetailsOpen = false;

  classes = signal<SchoolClass[]>([]);
  sections = signal<Section[]>([]);
  categories = signal<any[]>([]);
  houses = signal<any[]>([]);
  routes = signal<any[]>([]);
  hostels = signal<any[]>([]);
  rooms = signal<any[]>([]);
  feeGroups = signal<FeeGroupItem[]>([]);
  isMasterModalOpen = signal<boolean>(false);
  masterKind = signal<AdmissionMasterKind>('class');
  masterForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    name_numeric: [''],
    description: [''],
    class_id: [''],
    capacity: [40],
    color_code: ['#705ec8'],
    house_master: [''],
    code: [''],
    amount: [0],
    start_point: [''],
    end_point: [''],
    fare: [0],
    type: ['Boys'],
    hostel_id: [''],
    room_type: ['Standard'],
    number_of_bed: [2],
    cost_per_bed: [0]
  });

  discounts = signal<DiscountItem[]>([]);

  admissionForm: FormGroup = this.fb.group({
    admission_no: [`ADM-${Math.floor(100000 + Math.random() * 900000)}`, [Validators.required]],
    roll_no: [''],
    class_id: ['', [Validators.required]],
    section_id: ['', [Validators.required]],
    first_name: ['', [Validators.required]],
    last_name: [''],
    gender: ['', [Validators.required]],
    birthday: ['', [Validators.required]],
    student_category_id: [''],
    religion: [''],
    caste: [''],
    phone: [''],
    email: ['', [Validators.email]],
    admission_date: [new Date().toISOString().split('T')[0]],
    blood_group: [''],
    house_id: [''],
    height: [''],
    weight: [''],
    measurement_date: [new Date().toISOString().split('T')[0]],
    medical_history: [''],
    
    // Transport & Hostel
    route_id: [''],
    pickup_point: [''],
    fees_month: [''],
    hostel_id: [''],
    room_no: [''],

    // Parent Guardian Details
    father_name: [''],
    father_phone: [''],
    father_occupation: [''],
    mother_name: [''],
    mother_phone: [''],
    mother_occupation: [''],
    guardian_is: ['Father', [Validators.required]],
    guardian_name: ['', [Validators.required]],
    guardian_relation: ['Father'],
    guardian_email: [''],
    guardian_phone: ['', [Validators.required]],
    guardian_occupation: [''],
    guardian_address: [''],

    // More Details
    national_id: [''],
    local_id: [''],
    bank_name: [''],
    bank_account_no: [''],
    ifsc_code: [''],
    previous_school: [''],
    address: ['']
  });

  ngOnInit() {
    this.loadRegistrationMasters();
  }

  loadRegistrationMasters() {
    this.api.get<SchoolClass[]>('/academics/classes').subscribe(res => {
      this.classes.set(res.data || []);
    });

    this.api.get<Section[]>('/academics/sections').subscribe(res => {
      this.sections.set(res.data || []);
    });

    this.api.get<any[]>('/students/categories').subscribe(res => this.categories.set(res.data || []));
    this.api.get<any[]>('/students/houses').subscribe(res => this.houses.set(res.data || []));
    this.api.get<any[]>('/facility/transport/routes').subscribe(res => this.routes.set(res.data || []));
    this.api.get<any[]>('/facility/hostels').subscribe(res => this.hostels.set(res.data || []));
    this.api.get<any[]>('/facility/rooms').subscribe(res => this.rooms.set(res.data || []));
    this.api.get<any[]>('/finance/fee-groups').subscribe({
      next: res => this.feeGroups.set((res.data || []).map((group: any) => ({
        id: String(group.fee_group_id || group.id),
        name: group.name,
        amount: String(group.amount || 0),
        selected: false
      })))
    });
    this.api.get<any[]>('/finance/fee-discounts').subscribe({
      next: res => this.discounts.set((res.data || []).map((discount: any) => ({
        id: String(discount.fee_discount_id || discount.id),
        name: discount.name,
        code: discount.code,
        selected: false
      })))
    });
  }

  onClassChange() {
    const classId = this.admissionForm.get('class_id')?.value;
    this.admissionForm.patchValue({ section_id: '' });
    if (classId) {
      this.api.get<Section[]>('/academics/sections', { class_id: classId }).subscribe(res => {
        this.sections.set(res.data || []);
      });
    } else {
      this.sections.set([]);
    }
  }

  masterTitle(): string {
    const titles: Record<AdmissionMasterKind, string> = {
      class: 'Create Class',
      section: 'Create Section',
      category: 'Create Student Category',
      house: 'Create House',
      feeGroup: 'Create Fee Group',
      discount: 'Create Fee Discount',
      route: 'Create Transport Route',
      hostel: 'Create Hostel',
      room: 'Create Hostel Room'
    };
    return titles[this.masterKind()];
  }

  openMasterModal(kind: AdmissionMasterKind) {
    this.masterKind.set(kind);
    this.masterForm.reset({
      name: '',
      name_numeric: '',
      description: '',
      class_id: this.admissionForm.get('class_id')?.value || '',
      capacity: 40,
      color_code: '#705ec8',
      house_master: '',
      code: '',
      amount: 0,
      start_point: '',
      end_point: '',
      fare: 0,
      type: 'Boys',
      hostel_id: this.hostels()[0]?.hostel_category_id || this.hostels()[0]?.id || '',
      room_type: 'Standard',
      number_of_bed: 2,
      cost_per_bed: 0
    });
    this.isMasterModalOpen.set(true);
  }

  roomsForSelectedHostel(): any[] {
    const hostelId = Number(this.admissionForm.get('hostel_id')?.value);
    return this.rooms().filter(room => Number(room.hostel_id || room.hostel_category_id) === hostelId);
  }

  pickupPoints(): string[] {
    return [...new Set(this.routes().flatMap(route => [route.start_point, route.end_point]).filter(Boolean))];
  }

  private buildMasterPayload(kind: AdmissionMasterKind) {
    const raw = this.masterForm.getRawValue();
    const safe = { ...raw };

    switch (kind) {
      case 'class':
        return {
          name: safe.name,
          name_numeric: safe.name_numeric !== '' && safe.name_numeric !== null ? Number(safe.name_numeric) : null
        };
      case 'section':
        return {
          name: safe.name,
          class_id: safe.class_id,
          nick_name: safe.description || '',
          capacity: Number(safe.capacity ?? 35)
        };
      case 'category':
        return {
          name: safe.name,
          description: safe.description || ''
        };
      case 'house':
        return {
          name: safe.name,
          color_code: safe.color_code || '#705ec8',
          house_master: safe.house_master || '',
          description: safe.description || ''
        };
      case 'feeGroup':
        return {
          name: safe.name,
          amount: Number(safe.amount ?? 0),
          description: safe.description || ''
        };
      case 'discount':
        return {
          name: safe.name,
          code: safe.code || '',
          description: safe.description || ''
        };
      case 'route':
        return {
          name: safe.name,
          start_point: safe.start_point || '',
          end_point: safe.end_point || '',
          fare: Number(safe.fare ?? 0),
          description: safe.description || ''
        };
      case 'hostel':
        return {
          name: safe.name,
          type: safe.type || 'Boys',
          description: safe.description || ''
        };
      case 'room':
        return {
          hostel_id: safe.hostel_id,
          name: safe.name,
          room_number: safe.name,
          room_type: safe.room_type || 'Standard',
          number_of_bed: Number(safe.number_of_bed ?? 2),
          cost_per_bed: Number(safe.cost_per_bed ?? 0)
        };
      default:
        return safe;
    }
  }

  saveMaster() {
    if (this.masterForm.invalid) {
      this.masterForm.markAllAsTouched();
      return;
    }

    const kind = this.masterKind();
    const payload = this.buildMasterPayload(kind);
    if (kind === 'section' && !payload.class_id) {
      this.notify.error('Class Required', 'Select a class before creating a section.');
      return;
    }
    if (kind === 'room' && !payload.hostel_id) {
      this.notify.error('Hostel Required', 'Create or select a hostel before creating a room.');
      return;
    }

    const endpoints: Record<AdmissionMasterKind, string> = {
      class: '/academics/classes',
      section: '/academics/sections',
      category: '/students/categories',
      house: '/students/houses',
      feeGroup: '/finance/fee-groups',
      discount: '/finance/fee-discounts',
      route: '/facility/transport/routes',
      hostel: '/facility/hostels',
      room: '/facility/rooms'
    };

    this.api.post<any>(endpoints[kind], payload).subscribe({
      next: res => {
        const item = res.data || payload;
        this.applyCreatedMaster(kind, item);
        this.isMasterModalOpen.set(false);
        this.notify.success(`${this.masterTitle().replace('Create ', '')} created`);
      },
      error: err => this.notify.error(err.error?.message || `Could not create ${this.masterTitle().replace('Create ', '').toLowerCase()}.`)
    });
  }

  private applyCreatedMaster(kind: AdmissionMasterKind, item: any) {
    switch (kind) {
      case 'class':
        this.classes.update(items => [item, ...items]);
        this.admissionForm.patchValue({ class_id: item.class_id || item.id, section_id: '' });
        this.sections.set([]);
        break;
      case 'section':
        this.sections.update(items => [item, ...items]);
        this.admissionForm.patchValue({ section_id: item.section_id || item.id });
        break;
      case 'category':
        this.categories.update(items => [item, ...items]);
        this.admissionForm.patchValue({ student_category_id: item.student_category_id || item.id });
        break;
      case 'house':
        this.houses.update(items => [item, ...items]);
        this.admissionForm.patchValue({ house_id: item.house_id || item.id });
        break;
      case 'feeGroup':
        this.feeGroups.update(items => [{ id: String(item.fee_group_id || item.id), name: item.name, amount: String(item.amount || 0), selected: false }, ...items]);
        break;
      case 'discount':
        this.discounts.update(items => [{ id: String(item.fee_discount_id || item.id), name: item.name, code: item.code, selected: false }, ...items]);
        break;
      case 'route':
        this.routes.update(items => [item, ...items]);
        this.admissionForm.patchValue({ route_id: item.transport_route_id || item.id, pickup_point: item.start_point || '' });
        break;
      case 'hostel':
        this.hostels.update(items => [item, ...items]);
        this.admissionForm.patchValue({ hostel_id: item.hostel_category_id || item.id, room_no: '' });
        break;
      case 'room':
        this.rooms.update(items => [{ ...item, id: item.hostel_room_id || item.id, room_number: item.room_number || item.name, hostel_id: item.hostel_id || item.hostel_category_id }, ...items]);
        this.admissionForm.patchValue({ room_no: item.room_number || item.name || '' });
        break;
    }
  }

  onGuardianTypeChange(type: string) {
    if (type === 'Father') {
      const fatherName = this.admissionForm.get('father_name')?.value || '';
      const fatherPhone = this.admissionForm.get('father_phone')?.value || '';
      const fatherOcc = this.admissionForm.get('father_occupation')?.value || '';
      this.admissionForm.patchValue({
        guardian_name: fatherName,
        guardian_phone: fatherPhone,
        guardian_relation: 'Father',
        guardian_occupation: fatherOcc
      });
    } else if (type === 'Mother') {
      const motherName = this.admissionForm.get('mother_name')?.value || '';
      const motherPhone = this.admissionForm.get('mother_phone')?.value || '';
      const motherOcc = this.admissionForm.get('mother_occupation')?.value || '';
      this.admissionForm.patchValue({
        guardian_name: motherName,
        guardian_phone: motherPhone,
        guardian_relation: 'Mother',
        guardian_occupation: motherOcc
      });
    } else {
      this.admissionForm.patchValue({
        guardian_relation: 'Guardian'
      });
    }
  }

  addSibling() {
    this.notify.info('Add Sibling', 'Select an enrolled student to link siblings and duplicate parent details.');
  }

  resetForm() {
    this.admissionForm.reset({
      admission_no: `ADM-${Math.floor(100000 + Math.random() * 900000)}`,
      student_category_id: '',
      guardian_is: 'Father',
      guardian_relation: 'Father',
      admission_date: new Date().toISOString().split('T')[0],
      measurement_date: new Date().toISOString().split('T')[0]
    });
  }

  onSubmit() {
    if (this.admissionForm.invalid) {
      this.admissionForm.markAllAsTouched();
      this.notify.error('Required Fields Missing', 'Please fill in all mandatory fields marked with a red asterisk (*)');
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.admissionForm.value;

    const studentPayload = {
      ...formVal,
      name: `${formVal.first_name} ${formVal.last_name || ''}`.trim(),
      status: 'active'
    };

    this.api.post<Student>('/students', studentPayload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.notify.success('Admission Created', `Student ${studentPayload.name} (${studentPayload.admission_no}) has been enrolled successfully.`);
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notify.error('Admission Failed', err.error?.message || 'Could not save student admission.');
      }
    });
  }

  // --- Student Import Modal Logic ---
  isImportModalOpen = signal<boolean>(false);
  importClassId = signal<string>('');
  importSectionId = signal<string>('');
  importSections = signal<Section[]>([]);
  importFile: File | null = null;
  importFileName = signal<string>('');
  isImporting = signal<boolean>(false);
  importResult = signal<any>(null);

  openImportModal() {
    this.importClassId.set(this.classes()[0]?.class_id?.toString() || '');
    this.onImportClassChange();
    this.importFile = null;
    this.importFileName.set('');
    this.importResult.set(null);
    this.isImportModalOpen.set(true);
  }

  closeImportModal() {
    this.isImportModalOpen.set(false);
    this.importResult.set(null);
  }

  onImportClassChange() {
    const classId = Number(this.importClassId());
    if (classId) {
      this.api.get<Section[]>('/academics/sections', { class_id: classId }).subscribe({
        next: (res) => {
          this.importSections.set(res.data || []);
          if (res.data && res.data.length > 0) {
            this.importSectionId.set(res.data[0].section_id?.toString() || '');
          } else {
            this.importSectionId.set('');
          }
        },
        error: () => this.importSections.set([])
      });
    } else {
      this.importSections.set([]);
      this.importSectionId.set('');
    }
  }

  onImportFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.importFile = input.files[0];
      this.importFileName.set(input.files[0].name);
      this.importResult.set(null);
    }
  }

  downloadSampleCsv() {
    this.api.download('/students/import/sample').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_student_import.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notify.success('Sample File Downloaded', 'sample_student_import.csv has been downloaded successfully.');
      },
      error: () => {
        // Fallback client-side generator if offline
        this.downloadClientSampleCsv();
      }
    });
  }

  downloadClientSampleCsv() {
    const headers = 'admission_no,roll_no,first_name,last_name,gender,birthday,category,religion,caste,phone,email,admission_date,blood_group,house,height,weight,father_name,father_phone,father_occupation,mother_name,mother_phone,mother_occupation,guardian_is,guardian_name,guardian_relation,guardian_phone,guardian_email,guardian_address,address,city,national_id,bank_name,bank_account_no,ifsc_code';
    const row1 = 'ADM-2026-001,101,Alexander,Wright,Male,2015-04-12,General,Christian,Catholic,9876543210,alex.w@example.com,2026-09-01,O+,Red Dragons,135,32,George Wright,9876543211,Software Engineer,Martha Wright,9876543212,Teacher,Father,George Wright,Father,9876543211,george@example.com,"124 Park Avenue, Springfield","124 Park Avenue",Springfield,NID-99210,State Bank,1092837461,SBIN0001';
    const row2 = 'ADM-2026-002,102,Sophia,Sharma,Female,2015-08-25,OBC,Hindu,Brahmin,9812345678,sophia.s@example.com,2026-09-01,A+,Blue Phoenix,130,29,Rajesh Sharma,9812345679,Doctor,Sunita Sharma,9812345680,Architect,Father,Rajesh Sharma,Father,9876543279,rajesh@example.com,"Flat 402, Green Valley Apartments","Flat 402, Green Valley",North City,NID-88341,HDFC Bank,9928374612,HDFC0002';
    const csv = `${headers}\r\n${row1}\r\n${row2}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_student_import.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.notify.success('Sample File Downloaded', 'sample_student_import.csv has been downloaded successfully.');
  }

  submitImport() {
    if (!this.importClassId()) {
      this.notify.error('Class Required', 'Please select a Class to import students into.');
      return;
    }
    if (!this.importFile) {
      this.notify.error('File Required', 'Please choose a CSV or Excel (.xlsx) file to upload.');
      return;
    }

    this.isImporting.set(true);
    const formData = new FormData();
    formData.append('class_id', this.importClassId());
    if (this.importSectionId()) {
      formData.append('section_id', this.importSectionId());
    }
    formData.append('file', this.importFile);

    this.api.upload<any>('/students/import', formData).subscribe({
      next: (res) => {
        this.isImporting.set(false);
        this.importResult.set(res.data);
        const count = res.data?.importedCount || 0;
        this.notify.success('Import Finished', `Successfully imported ${count} students.`);
      },
      error: (err) => {
        this.isImporting.set(false);
        this.notify.error('Import Failed', err.error?.message || 'Could not import students from file.');
      }
    });
  }
}
