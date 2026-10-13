import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { ApiService } from '../core/services/api.service';
import { ToastComponent } from '../shared/components/toast.component';

export interface SmartSchoolSubMenuItem {
  label: string;
  route: string;
  queryParams?: Record<string, string>;
  badge?: string;
  roles?: string[];
}

export interface SmartSchoolMenuItem {
  label: string;
  route?: string;
  queryParams?: Record<string, string>;
  icon?: string;
  badge?: string;
  roles?: string[];
  children?: SmartSchoolSubMenuItem[];
  isOpen?: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    FormsModule, 
    LucideAngularModule,
    ToastComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  api = inject(ApiService);
  router = inject(Router);

  isSidebarOpen = signal<boolean>(true);
  isUserMenuOpen = signal<boolean>(false);
  isLanguageMenuOpen = signal<boolean>(false);
  searchQuery: string = '';
  searchResults = signal<any[]>([]);

  languages: LanguageOption[] = SUPPORTED_LANGUAGES;
  currentLanguage = signal<LanguageOption>(
    SUPPORTED_LANGUAGES.find(l => l.code === (localStorage.getItem('sms_language') || 'en')) || SUPPORTED_LANGUAGES[0]
  );

  // Smart School Navigation Structure with distinct unique query routes for each item
  menuItems: SmartSchoolMenuItem[] = [
    {
      label: 'Front Site CMS',
      icon: '🌐',
      isOpen: true,
      roles: ['super_admin', 'admin'],
      children: [
        { label: 'CMS Dashboard', route: '/cms/dashboard', roles: ['super_admin', 'admin'] },
        { label: 'Theme Manager (5 Themes)', route: '/cms/themes', roles: ['super_admin', 'admin'] },
        { label: 'Homepage Builder', route: '/cms/builder', roles: ['super_admin', 'admin'] },
        { label: 'Dynamic Pages', route: '/cms/pages', roles: ['super_admin', 'admin'] },
        { label: 'Navigation Menus', route: '/cms/menu', roles: ['super_admin', 'admin'] },
        { label: 'Hero Banners', route: '/cms/banners', roles: ['super_admin', 'admin'] },
        { label: 'News & Events', route: '/cms/news-events', roles: ['super_admin', 'admin'] },
        { label: 'Media Gallery', route: '/cms/gallery', roles: ['super_admin', 'admin'] },
        { label: 'Website Settings', route: '/cms/settings', roles: ['super_admin', 'admin'] }
      ]
    },
    {
      label: 'Front Office',
      icon: '🏢',
      isOpen: false,
      roles: ['super_admin', 'admin', 'receptionist'],
      children: [
        { label: 'Admission Enquiries', route: '/front-office', queryParams: { tab: 'enquiry' }, roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Visitor Book', route: '/front-office', queryParams: { tab: 'visitor' }, roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Phone Call Log', route: '/front-office', queryParams: { tab: 'call_log' }, roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Postal Dispatch', route: '/front-office', queryParams: { tab: 'postal_dispatch' }, roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Postal Receive', route: '/front-office', queryParams: { tab: 'postal_receive' }, roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Complain', route: '/front-office', queryParams: { tab: 'complain' }, roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Setup Front Office', route: '/front-office', queryParams: { tab: 'setup' }, roles: ['super_admin', 'admin', 'receptionist'] }
      ]
    },
    {
      label: 'Student Information',
      icon: '👤',
      isOpen: true,
      roles: ['super_admin', 'admin', 'teacher', 'accountant', 'receptionist', 'librarian', 'parent'],
      children: [
        { label: 'Student Details', route: '/students', roles: ['super_admin', 'admin', 'teacher', 'accountant', 'receptionist', 'librarian', 'parent'] },
        { label: 'Student Admission', route: '/students/admission', roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Import Student', route: '/students', queryParams: { filter: 'import' }, roles: ['super_admin', 'admin'] },
        { label: 'Online Admission', route: '/students/admission', queryParams: { mode: 'online' }, roles: ['super_admin', 'admin', 'receptionist'] },
        { label: 'Disabled Students', route: '/students', queryParams: { filter: 'disabled' }, roles: ['super_admin', 'admin'] },
        { label: 'Multi Class Student', route: '/students', queryParams: { filter: 'multiclass' }, roles: ['super_admin', 'admin'] },
        { label: 'Bulk Delete', route: '/students', queryParams: { filter: 'bulk_delete' }, roles: ['super_admin', 'admin'] },
        { label: 'Student Categories', route: '/students', queryParams: { filter: 'categories' }, roles: ['super_admin', 'admin'] },
        { label: 'Student House', route: '/students', queryParams: { filter: 'house' }, roles: ['super_admin', 'admin'] },
        { label: 'Disable Reason', route: '/students', queryParams: { filter: 'disable_reason' }, roles: ['super_admin', 'admin'] }
      ]
    },
    {
      label: 'Fees Collection',
      icon: '💰',
      isOpen: false,
      roles: ['super_admin', 'admin', 'accountant', 'student', 'parent'],
      children: [
        { label: 'Collect Fees', route: '/finance/invoices', roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Search Fees Payment', route: '/finance/invoices', queryParams: { tab: 'search_payment' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Search Due Fees', route: '/finance/invoices', queryParams: { tab: 'due_fees' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Fees Master', route: '/finance/invoices', queryParams: { tab: 'fees_master' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Fees Group', route: '/finance/invoices', queryParams: { tab: 'fees_group' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Fees Type', route: '/finance/invoices', queryParams: { tab: 'fees_type' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'My Invoices & Receipts', route: '/finance/invoices', queryParams: { tab: 'my_invoices' }, roles: ['student', 'parent'] }
      ]
    },
    {
      label: 'Online Course',
      icon: '💻',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      children: [
        { label: 'Online Course List', route: '/academics/materials', queryParams: { tab: 'online_courses' }, roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { label: 'Offline Payment', route: '/finance/invoices', queryParams: { tab: 'offline_payment' }, roles: ['super_admin', 'admin', 'accountant'] }
      ]
    },
    {
      label: 'Behaviour Records',
      icon: '📋',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher'],
      children: [
        { label: 'Assign Incident', route: '/attendance', queryParams: { tab: 'assign_incident' }, roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'Incidents', route: '/attendance', queryParams: { tab: 'incidents' }, roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'Reports', route: '/reports', queryParams: { tab: 'behaviour_reports' }, roles: ['super_admin', 'admin'] }
      ]
    },
    {
      label: 'Multi Branch',
      icon: '👥',
      isOpen: false,
      roles: ['super_admin', 'admin'],
      children: [
        { label: 'Overview', route: '/dashboard', queryParams: { view: 'branch_overview' }, roles: ['super_admin', 'admin'] },
        { label: 'Settings', route: '/settings', queryParams: { tab: 'multi_branch' }, roles: ['super_admin', 'admin'] }
      ]
    },
    {
      label: 'Gmeet Live Classes',
      icon: '📹',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      children: [
        { label: 'Live Classes', route: '/academics/materials', queryParams: { live: 'gmeet_classes' }, roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { label: 'Live Meeting', route: '/academics/materials', queryParams: { live: 'gmeet_meeting' }, roles: ['super_admin', 'admin', 'teacher'] }
      ]
    },
    {
      label: 'Zoom Live Classes',
      icon: '🎥',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      children: [
        { label: 'Live Classes', route: '/academics/materials', queryParams: { live: 'zoom_classes' }, roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { label: 'Live Meeting', route: '/academics/materials', queryParams: { live: 'zoom_meeting' }, roles: ['super_admin', 'admin', 'teacher'] }
      ]
    },
    {
      label: 'Income',
      icon: '💲',
      isOpen: false,
      roles: ['super_admin', 'admin', 'accountant'],
      children: [
        { label: 'Add Income', route: '/finance/invoices', queryParams: { mode: 'add_income' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Search Income', route: '/finance/invoices', queryParams: { mode: 'search_income' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Income Head', route: '/finance/invoices', queryParams: { mode: 'income_head' }, roles: ['super_admin', 'admin', 'accountant'] }
      ]
    },
    {
      label: 'Expenses',
      icon: '💳',
      isOpen: false,
      roles: ['super_admin', 'admin', 'accountant'],
      children: [
        { label: 'Add Expense', route: '/finance/expenses', roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Search Expense', route: '/finance/expenses', queryParams: { tab: 'search_expense' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Expense Head', route: '/finance/expenses', queryParams: { tab: 'expense_head' }, roles: ['super_admin', 'admin', 'accountant'] }
      ]
    },
    {
      label: 'Attendance',
      icon: '📅',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'receptionist', 'student', 'parent'],
      children: [
        { label: 'Student Attendance', route: '/attendance', roles: ['super_admin', 'admin', 'teacher', 'receptionist'] },
        { label: 'Attendance By Date', route: '/attendance', queryParams: { tab: 'by_date' }, roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'My Attendance Record', route: '/attendance', queryParams: { tab: 'my_record' }, roles: ['student', 'parent'] },
        { label: 'Approve Leave', route: '/hr', queryParams: { tab: 'approve_leave' }, roles: ['super_admin', 'admin', 'hr_staff'] }
      ]
    },
    {
      label: 'Examinations',
      icon: '🏆',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'],
      children: [
        { label: 'Exam Group', route: '/examinations/exams', roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'Exam Schedule', route: '/examinations/exams', queryParams: { tab: 'schedule' }, roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
        { label: 'Exam Result & Marks', route: '/examinations/marks', roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
        { label: 'Marks Grade', route: '/examinations/marks', queryParams: { tab: 'grades' }, roles: ['super_admin', 'admin', 'teacher'] }
      ]
    },
    {
      label: 'Academics',
      icon: '📚',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'],
      children: [
        { label: 'Class Timetable', route: '/academics/classes', roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
        { label: 'Teachers Timetable', route: '/academics/classes', queryParams: { tab: 'teacher_timetable' }, roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'Assign Class Teacher', route: '/academics/classes', queryParams: { tab: 'assign_teacher' }, roles: ['super_admin', 'admin'] },
        { label: 'Promote Students', route: '/students', queryParams: { tab: 'promote' }, roles: ['super_admin', 'admin'] },
        { label: 'Subject Group', route: '/academics/subjects', queryParams: { tab: 'subject_group' }, roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'Subjects', route: '/academics/subjects', roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { label: 'Class', route: '/academics/classes', queryParams: { tab: 'classes' }, roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'Sections', route: '/academics/classes', queryParams: { tab: 'sections' }, roles: ['super_admin', 'admin', 'teacher'] }
      ]
    },
    {
      label: 'Human Resource',
      icon: '👔',
      isOpen: false,
      roles: ['super_admin', 'admin', 'accountant', 'teacher', 'hr_staff', 'librarian'],
      children: [
        { label: 'Staff Directory', route: '/teachers', roles: ['super_admin', 'admin', 'accountant', 'teacher', 'hr_staff', 'librarian'] },
        { label: 'Staff Attendance', route: '/attendance', queryParams: { type: 'staff_attendance' }, roles: ['super_admin', 'admin', 'hr_staff'] },
        { label: 'Payroll', route: '/hr', queryParams: { tab: 'payroll' }, roles: ['super_admin', 'admin', 'accountant', 'hr_staff'] },
        { label: 'Apply Leave', route: '/hr', roles: ['super_admin', 'admin', 'teacher', 'hr_staff', 'accountant', 'librarian'] },
        { label: 'Leave Type', route: '/hr', queryParams: { tab: 'leave_type' }, roles: ['super_admin', 'admin', 'hr_staff'] },
        { label: 'Department', route: '/hr', queryParams: { tab: 'department' }, roles: ['super_admin', 'admin', 'hr_staff'] },
        { label: 'Designation', route: '/hr', queryParams: { tab: 'designation' }, roles: ['super_admin', 'admin', 'hr_staff'] }
      ]
    },
    {
      label: 'Communicate',
      icon: '📢',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'receptionist', 'student', 'parent'],
      children: [
        { label: 'Notice Board', route: '/communication/notices', roles: ['super_admin', 'admin', 'teacher', 'receptionist', 'student', 'parent'] },
        { label: 'Send Email / SMS', route: '/communication/circulars', roles: ['super_admin', 'admin', 'teacher', 'receptionist'] },
        { label: 'Email / SMS Log', route: '/communication/circulars', queryParams: { tab: 'logs' }, roles: ['super_admin', 'admin', 'teacher', 'receptionist'] }
      ]
    },
    {
      label: 'Download Center',
      icon: '📥',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      children: [
        { label: 'Study Material', route: '/academics/materials', roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { label: 'Syllabus', route: '/academics/materials', queryParams: { tab: 'syllabus' }, roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { label: 'Other Downloads', route: '/academics/materials', queryParams: { tab: 'downloads' }, roles: ['super_admin', 'admin', 'teacher', 'student'] }
      ]
    },
    {
      label: 'Homework',
      icon: '📝',
      isOpen: false,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      children: [
        { label: 'Add Homework', route: '/academics/assignments', roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'Homework Evaluation', route: '/academics/assignments', queryParams: { tab: 'evaluation' }, roles: ['super_admin', 'admin', 'teacher'] },
        { label: 'My Assignments', route: '/academics/assignments', queryParams: { tab: 'my_assignments' }, roles: ['student'] }
      ]
    },
    {
      label: 'Library',
      icon: '📖',
      isOpen: false,
      roles: ['super_admin', 'admin', 'librarian', 'teacher', 'student'],
      children: [
        { label: 'Book List', route: '/library', roles: ['super_admin', 'admin', 'librarian', 'teacher', 'student'] },
        { label: 'Issue - Return', route: '/library', queryParams: { tab: 'issue_return' }, roles: ['super_admin', 'admin', 'librarian'] },
        { label: 'Add Student Member', route: '/library', queryParams: { tab: 'student_member' }, roles: ['super_admin', 'admin', 'librarian'] },
        { label: 'Add Staff Member', route: '/library', queryParams: { tab: 'staff_member' }, roles: ['super_admin', 'admin', 'librarian'] }
      ]
    },
    {
      label: 'Transport',
      icon: '🚌',
      isOpen: false,
      roles: ['super_admin', 'admin', 'student', 'parent'],
      children: [
        { label: 'Routes & Stops', route: '/transport', roles: ['super_admin', 'admin', 'student', 'parent'] },
        { label: 'Vehicles', route: '/transport', queryParams: { tab: 'vehicles' }, roles: ['super_admin', 'admin'] },
        { label: 'Assign Vehicle', route: '/transport', queryParams: { tab: 'assign_vehicle' }, roles: ['super_admin', 'admin'] }
      ]
    },
    {
      label: 'Hostel',
      icon: '🏠',
      isOpen: false,
      roles: ['super_admin', 'admin', 'student'],
      children: [
        { label: 'Hostel Rooms', route: '/hostel', roles: ['super_admin', 'admin', 'student'] },
        { label: 'Room Type', route: '/hostel', queryParams: { tab: 'room_type' }, roles: ['super_admin', 'admin'] },
        { label: 'Hostel Buildings', route: '/hostel', queryParams: { tab: 'buildings' }, roles: ['super_admin', 'admin'] }
      ]
    },
    {
      label: 'Reports',
      icon: '📊',
      isOpen: false,
      roles: ['super_admin', 'admin', 'accountant'],
      children: [
        { label: 'Student Report', route: '/reports', roles: ['super_admin', 'admin'] },
        { label: 'Finance Report', route: '/reports', queryParams: { tab: 'finance_report' }, roles: ['super_admin', 'admin', 'accountant'] },
        { label: 'Attendance Report', route: '/reports', queryParams: { tab: 'attendance_report' }, roles: ['super_admin', 'admin'] },
        { label: 'Examinations Report', route: '/reports', queryParams: { tab: 'exam_report' }, roles: ['super_admin', 'admin'] }
      ]
    },
    {
      label: 'System Settings',
      icon: '⚙️',
      isOpen: false,
      roles: ['super_admin', 'admin'],
      children: [
        { label: 'General Setting', route: '/settings', roles: ['super_admin', 'admin'] },
        { label: 'Session Setting', route: '/settings', queryParams: { tab: 'session' }, roles: ['super_admin', 'admin'] },
        { label: 'Notification Setting', route: '/settings', queryParams: { tab: 'notifications' }, roles: ['super_admin', 'admin'] }
      ]
    }
  ];

  // Dynamic role-filtered menu items
  visibleMenuItems = computed(() => {
    const rawRole = this.auth.currentUser()?.role || this.auth.userRole() || 'super_admin';
    const currentRole = rawRole.toLowerCase();

    // Super admin sees all menus
    if (currentRole === 'super_admin') {
      return this.menuItems;
    }

    return this.menuItems.filter(item => {
      // Check if top-level menu allows this role
      const matchesParent = !item.roles || item.roles.includes(currentRole);
      if (!matchesParent) return false;

      // If it has children, ensure at least one child is visible for this role
      if (item.children && item.children.length > 0) {
        return item.children.some(child => !child.roles || child.roles.includes(currentRole));
      }

      return true;
    });
  });

  getVisibleChildren(item: SmartSchoolMenuItem) {
    if (!item.children) return [];
    const rawRole = this.auth.currentUser()?.role || this.auth.userRole() || 'super_admin';
    const currentRole = rawRole.toLowerCase();

    if (currentRole === 'super_admin') return item.children;

    return item.children.filter(c => !c.roles || c.roles.includes(currentRole));
  }

  constructor() {
    // Expand the current active section based on URL and query params
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.visibleMenuItems().forEach(item => {
          if (item.children && item.children.some(c => this.isSubActive(c, item))) {
            item.isOpen = true;
          }
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.isUserMenuOpen.set(false);
    }
    if (!target.closest('.language-dropdown-container')) {
      this.isLanguageMenuOpen.set(false);
    }
  }

  isRouteActive(route?: string, queryParams?: Record<string, string>): boolean {
    if (!route) return false;
    const urlTree = this.router.parseUrl(this.router.url);
    const primaryChildren = urlTree.root.children['primary'];
    const currentPath = primaryChildren ? '/' + primaryChildren.segments.map(s => s.path).join('/') : '/';

    if (route === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }

    if (currentPath !== route) return false;

    if (queryParams && Object.keys(queryParams).length > 0) {
      return Object.keys(queryParams).every(k => urlTree.queryParams[k] === queryParams[k]);
    }

    return true;
  }

  isSubActive(sub: SmartSchoolSubMenuItem, parent: SmartSchoolMenuItem): boolean {
    const urlTree = this.router.parseUrl(this.router.url);
    const primaryChildren = urlTree.root.children['primary'];
    const currentPath = primaryChildren ? '/' + primaryChildren.segments.map(s => s.path).join('/') : '/';

    // Must match base route path
    if (sub.route !== currentPath) {
      return false;
    }

    const subKeys = Object.keys(sub.queryParams || {});
    const currentQueryParams = urlTree.queryParams;

    // If this sub has query params, verify every key/value match
    if (subKeys.length > 0) {
      return subKeys.every(k => currentQueryParams[k] === sub.queryParams![k]);
    }

    // If this sub has NO query params:
    // It is active if none of its sibling items match the current query params
    const siblings = parent.children || [];
    const hasSiblingWithMatchingQueryParams = siblings.some(sib => {
      const sibKeys = Object.keys(sib.queryParams || {});
      if (sibKeys.length === 0) return false;
      return sibKeys.every(k => currentQueryParams[k] === sib.queryParams![k]);
    });

    return !hasSiblingWithMatchingQueryParams;
  }

  isParentActive(item: SmartSchoolMenuItem): boolean {
    if (!item.children || item.children.length === 0) {
      return !!item.route && this.isRouteActive(item.route, item.queryParams);
    }
    return item.children.some(c => this.isSubActive(c, item));
  }

  userRoleDisplay(): string {
    const role = this.auth.currentUser()?.role || 'Super Admin';
    return role.replace(/_/g, ' ').toUpperCase();
  }

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  toggleMenu(item: SmartSchoolMenuItem) {
    item.isOpen = !item.isOpen;
  }

  onNavClick() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen.set(false);
    }
  }

  setLanguage(lang: LanguageOption) {
    this.currentLanguage.set(lang);
    localStorage.setItem('sms_language', lang.code);
    this.isLanguageMenuOpen.set(false);
  }

  onSearch(event: any) {
    if (this.searchQuery && this.searchQuery.trim().length >= 2) {
      this.api.get<any>('/search', { q: this.searchQuery.trim() }).subscribe({
        next: (res) => {
          this.searchResults.set(res.data || res.data?.results || []);
        },
        error: () => this.searchResults.set([])
      });
    } else {
      this.searchResults.set([]);
    }
  }

  executeGlobalSearch() {
    if (!this.searchQuery) return;
    this.router.navigate(['/students'], { queryParams: { q: this.searchQuery.trim() } });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  logout() {
    this.isUserMenuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
