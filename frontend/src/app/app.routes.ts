import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Multi-Theme Website Routes
  {
    path: 'site',
    loadComponent: () => import('./public-site/public-shell.component').then(m => m.PublicShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./public-site/pages/public-home.component').then(m => m.PublicHomeComponent)
      },
      {
        path: 'p/:slug',
        loadComponent: () => import('./public-site/pages/public-dynamic-page.component').then(m => m.PublicDynamicPageComponent)
      },
      {
        path: 'news',
        loadComponent: () => import('./public-site/pages/public-news.component').then(m => m.PublicNewsComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./public-site/pages/public-events.component').then(m => m.PublicEventsComponent)
      },
      {
        path: 'gallery',
        loadComponent: () => import('./public-site/pages/public-gallery.component').then(m => m.PublicGalleryComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./public-site/pages/public-contact.component').then(m => m.PublicContactComponent)
      },
      {
        path: 'admissions',
        loadComponent: () => import('./public-site/pages/public-contact.component').then(m => m.PublicContactComponent)
      }
    ]
  },

  // Authentication
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    data: { mode: 'admin' }
  },
  {
    path: 'userlogin',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    data: { mode: 'user' }
  },
  {
    path: 'site/login',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'site/userlogin',
    redirectTo: 'userlogin',
    pathMatch: 'full'
  },

  // Admin ERP & CMS App Shell
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // CMS Management Modules
      {
        path: 'cms',
        redirectTo: 'cms/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'cms/dashboard',
        loadComponent: () => import('./features/cms/cms-dashboard.component').then(m => m.CmsDashboardComponent)
      },
      {
        path: 'cms/themes',
        loadComponent: () => import('./features/cms/cms-themes.component').then(m => m.CmsThemesComponent)
      },
      {
        path: 'cms/builder',
        loadComponent: () => import('./features/cms/cms-homepage-builder.component').then(m => m.CmsHomepageBuilderComponent)
      },
      {
        path: 'cms/pages',
        loadComponent: () => import('./features/cms/cms-pages.component').then(m => m.CmsPagesComponent)
      },
      {
        path: 'cms/menu',
        loadComponent: () => import('./features/cms/cms-menus.component').then(m => m.CmsMenusComponent)
      },
      {
        path: 'cms/banners',
        loadComponent: () => import('./features/cms/cms-banners.component').then(m => m.CmsBannersComponent)
      },
      {
        path: 'cms/news-events',
        loadComponent: () => import('./features/cms/cms-news-events.component').then(m => m.CmsNewsEventsComponent)
      },
      {
        path: 'cms/gallery',
        loadComponent: () => import('./features/cms/cms-gallery.component').then(m => m.CmsGalleryComponent)
      },
      {
        path: 'cms/settings',
        loadComponent: () => import('./features/cms/cms-settings.component').then(m => m.CmsSettingsComponent)
      },

      // Front Office ERP Module
      {
        path: 'front-office',
        loadComponent: () => import('./features/front-office/front-office.component').then(m => m.FrontOfficeComponent)
      },

      // School Management ERP Modules
      {
        path: 'students',
        loadComponent: () => import('./features/students/student-list.component').then(m => m.StudentListComponent)
      },
      {
        path: 'students/admission',
        loadComponent: () => import('./features/students/student-admission.component').then(m => m.StudentAdmissionComponent)
      },
      {
        path: 'teachers',
        loadComponent: () => import('./features/teachers/teacher-list.component').then(m => m.TeacherListComponent)
      },
      {
        path: 'parents',
        loadComponent: () => import('./features/parents/parent-list.component').then(m => m.ParentListComponent)
      },
      {
        path: 'academics/classes',
        loadComponent: () => import('./features/academics/classes.component').then(m => m.ClassesComponent)
      },
      {
        path: 'academics/subjects',
        loadComponent: () => import('./features/academics/subjects.component').then(m => m.SubjectsComponent)
      },
      {
        path: 'academics/materials',
        loadComponent: () => import('./features/academics/materials.component').then(m => m.MaterialsComponent)
      },
      {
        path: 'academics/assignments',
        loadComponent: () => import('./features/academics/assignments.component').then(m => m.AssignmentsComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance.component').then(m => m.AttendanceComponent)
      },
      {
        path: 'examinations/exams',
        loadComponent: () => import('./features/examinations/exams.component').then(m => m.ExamsComponent)
      },
      {
        path: 'examinations/marks',
        loadComponent: () => import('./features/examinations/marks.component').then(m => m.MarksComponent)
      },
      {
        path: 'finance/invoices',
        loadComponent: () => import('./features/finance/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: 'finance/expenses',
        loadComponent: () => import('./features/finance/expenses.component').then(m => m.ExpensesComponent)
      },
      {
        path: 'library',
        loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent)
      },
      {
        path: 'hostel',
        loadComponent: () => import('./features/hostel/hostel.component').then(m => m.HostelComponent)
      },
      {
        path: 'transport',
        loadComponent: () => import('./features/transport/transport.component').then(m => m.TransportComponent)
      },
      {
        path: 'hr',
        loadComponent: () => import('./features/hr/hr.component').then(m => m.HrComponent)
      },
      {
        path: 'communication/notices',
        loadComponent: () => import('./features/communication/notices.component').then(m => m.NoticesComponent)
      },
      {
        path: 'communication/circulars',
        loadComponent: () => import('./features/communication/circulars.component').then(m => m.CircularsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },

      // Aliases & Role Redirects
      { path: 'admin/dashboard', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'teacher/dashboard', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'student/dashboard', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'parent/dashboard', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
