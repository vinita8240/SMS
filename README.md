<<<<<<< HEAD
# Apex SMS - Complete Enterprise School Management System

A production-grade, full-stack **School Management System (SMS)** built with **Angular 18+**, **Node.js / Express.js**, and **MySQL**, preserving and utilizing a comprehensive 40+ table relational database schema (`school_data`).

---

## 🌟 Key Features

### 🔐 Multi-Role RBAC Authentication
- **Role-Based Portals**: Tailored workflows and access control for **Super Admin / Principal**, **Teachers**, **Parents**, and **Students**.
- **JWT & bcrypt**: Secure authentication with stateless token headers and bcrypt salt hashing.
- **Demo Logins**: One-click fast-login presets for all 4 roles.

### 📚 Academic & Class Management
- **Classes & Sections**: Full CRUD, teacher incharge assignments, student capacity tracking.
- **Subject Management**: Subject codes, teacher allocations, theory/practical configurations.
- **Syllabus & Materials**: Study material repository, class-filtered downloads, syllabus distribution.
- **Homework Assignments**: Assignment manager with submission deadlines and task descriptions.

### 👥 Student, Parent & Teacher Directories
- **Student Information System**: Comprehensive profile tracking (Admission #, DOB, Gender, Roll, Blood group, Address, Parent linking, ID card generator, Class promotion engine).
- **Parent Portal**: Parent profiles with direct relational linking to enrolled children.
- **Teacher Directory**: Faculty profiles, designation, department, contact records, assigned classes.

### 📅 Smart Attendance Management
- **Interactive Daily Grid**: Mark `Present`, `Absent`, `Late`, `Excused` with single-click bulk actions.
- **Live Attendance KPI**: Real-time attendance rate calculation per class and date.

### 📝 Examination & Grading Engine
- **Exam Schedules & Terms**: Midterm, Final, Unit tests with grade distributions.
- **Marksheet & Instant GPA**: Automatic grade mapping (A+, A, B, C, F) and live GPA computation.
- **Printable Student Report Cards**: Dynamic, professional, ready-to-print terminal cards with institution watermark.

### 💰 Accounting, Fees & Expense Tracking
- **Fee Invoicing**: Dynamic fee vouchers, partial payments, payment method tracking, and balance due calculations.
- **Automated Calculation**: `amount_due = amount - discount - amount_paid` strictly enforced on server.
- **Printable Payment Receipts**: Formal print receipts with itemized breakdown.
- **Expense Management**: Categorized institution expenditures, voucher numbers, and monthly analytics.

### 📖 Library & Lending System
- **Book Catalog**: Title, author, publisher, ISBN, rack placement, total copies, live availability.
- **Issue & Return Workflow**: Due date tracking, overdue monitoring, single-click return processing.

### 🏢 Facilities & Fleet Management
- **Hostels & Dormitories**: Hostel buildings, room types, bed capacities, and fee per bed.
- **Transport Fleet**: Bus routes, scheduled pickup stops, driver contact, vehicle capacity, monthly fare tracking.

### 🏢 Human Resources & Leaves
- **Staff Leaves**: Employee leave requests with Admin approval/rejection workflows.
- **Departments & Designations**: Organizational hierarchy and faculty titles.

### 📢 Communication & Admissions
- **Noticeboard**: Role-targeted announcements (All, Teachers, Parents, Students).
- **Administrative Circulars**: Official school circulars with reference numbers.
- **Admission Enquiries**: Prospective student lead tracker with pipeline statuses (`pending`, `contacted`, `admitted`, `closed`).

### 📊 Analytics & Reporting Engine
- Multi-tab report generator with live data: Fee Collection, Outstanding Dues / Defaulters, Student Enrollment demographics, Exam marksheet performance.
- One-click CSV export and browser print views.

### ⚙️ System Settings & Audit Logs
- School profile configuration (Name, Email, Phone, Address, Currency, Academic session).
- **Security Audit Logs**: Automated logging of user mutations (CREATE, UPDATE, DELETE) with IP addresses and timestamps.
- **Dark / Light Mode**: Seamless theme switching with persistent state.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 18 (Standalone Components, Signals, Reactive Forms, Lazy Routing) |
| **Styling** | Tailwind CSS (Custom Theme Tokens, Responsive, Dark/Light Mode) |
| **Icons** | Lucide Angular Icons |
| **Charts** | Chart.js |
| **Backend** | Node.js + Express.js (MVC + Service + Repository Pattern) |
| **Database** | MySQL 5.7+ / 8.0+ / MariaDB 10.4+ (`InnoDB`, `utf8mb4`) |
| **Security** | JWT, bcrypt, Helmet, CORS, Rate Limiter, XSS Sanitization |
| **API Docs** | Swagger / OpenAPI 3.0 at `/api-docs` |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.x
- **MySQL** >= 5.7 or MariaDB >= 10.4 (e.g. XAMPP / WAMP / Standalone MySQL)
- **npm** >= 9.x

### 2. Database Setup
1. Start MySQL service on `localhost:3306`.
2. Create the database `school_data`:
   ```sql
   CREATE DATABASE school_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import the schema and seed data:
   - Import `database/schema.sql` (Creates all 45+ tables with foreign keys and indexes).
   - Import `database/seed.sql` (Populates complete initial dataset with demo users, classes, subjects, exams, invoices, etc.).

*Using command line:*
```bash
mysql -u root -p school_data < database/schema.sql
mysql -u root -p school_data < database/seed.sql
```

---

### 3. Backend Setup

```bash
cd backend
npm install
```

Configure `backend/.env` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=school_data

JWT_SECRET=super_secret_jwt_key_school_management_2026_xyz
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:4200
```

Start backend development server:
```bash
npm run dev
# or
node src/server.js
```
The API is live at `http://localhost:5000`.  
Explore interactive Swagger documentation at: `http://localhost:5000/api-docs`

---

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Start Angular development server:
```bash
npm start
# or
npx ng serve --open
```
The application opens at `http://localhost:4200`.

---

## 🔑 Default Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@school.com` | `admin123` | Full unrestricted access |
| **Teacher** | `teacher@school.com` | `teacher123` | Classes, Subjects, Attendance, Marks, Leaves |
| **Parent** | `parent@school.com` | `parent123` | Child profiles, Invoices, Notices, Circulars |
| **Student** | `student@school.com` | `student123` | Profile, Timetable, Study Materials, Notices |

*(All demo credentials can be pre-filled via the 1-click demo buttons on `/login`)*

---

## 🚢 Production Deployment Guide

### Option A: Apache / cPanel / Shared Hosting (PHP / Node Selector)
1. **Frontend Production Build**:
   ```bash
   cd frontend
   npm run build
   ```
   Upload the generated contents of `frontend/dist/school-app/browser/` to `public_html/` or your web directory.
   Add the following `.htaccess` for Angular SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

2. **Backend on cPanel Node.js Selector**:
   - Upload `backend/` directory.
   - Set Application startup file: `src/server.js`.
   - Add environment variables in cPanel Node application interface.
   - Run `npm install --production`.
   - Start the application.

---

### Option B: Nginx + Systemd / PM2 (Linux VPS)
1. **Run Backend with PM2**:
   ```bash
   cd /var/www/sms/backend
   npm install --production
   pm2 start src/server.js --name "sms-api"
   pm2 save
   pm2 startup
   ```

2. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name school.yourdomain.com;

       # Frontend Angular SPA
       location / {
           root /var/www/sms/frontend/dist/school-app/browser;
           try_files $uri $uri/ /index.html;
           index index.html;
       }

       # Backend API Proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       # Swagger Docs Proxy
       location /api-docs {
           proxy_pass http://127.0.0.1:5000/api-docs;
           proxy_set_header Host $host;
       }
   }
   ```

---

## 📁 Repository Structure

```text
├── database/
│   ├── schema.sql              # Complete 45+ table relational schema (InnoDB, utf8mb4)
│   ├── seed.sql                # Production seed dataset with demo records
│   └── migration.sql           # Schema migration & integrity sync script
├── docs/
│   ├── database-analysis.md    # Legacy table structure analysis
│   ├── database-relationships.md # Relational FKs & indexes documentation
│   └── erd.md                  # Entity Relationship Diagram (Mermaid)
├── backend/
│   ├── src/
│   │   ├── config/             # MySQL connection pool & Swagger OpenAPI specs
│   │   ├── controllers/        # RESTful route handlers for all modules
│   │   ├── middlewares/        # JWT auth, RBAC, audit logging, error handling
│   │   ├── repositories/       # Data Access Layer & parameterized SQL queries
│   │   ├── routes/             # API routing definitions
│   │   ├── services/           # Business logic & calculations engine
│   │   ├── app.js              # Express app initialization & security middlewares
│   │   └── server.js           # HTTP server bootstrap
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Auth, API, Theme, Notification services, Interceptors, Guards
│   │   │   ├── features/       # Feature modules (Students, Teachers, Finance, Exams, etc.)
│   │   │   ├── layout/         # Dynamic role-based sidebar, header & global search
│   │   │   ├── shared/         # Reusable modals, data tables, loaders, stats cards
│   │   │   ├── app.config.ts   # Application providers & HTTP interceptors
│   │   │   └── app.routes.ts   # Route definitions & guards
│   │   ├── environments/       # Environment configs (dev & prod)
│   │   └── styles.css          # Tailwind design tokens & UI animations
│   ├── tailwind.config.js
│   ├── angular.json
│   └── package.json
└── README.md
```

---

## 📄 License
This project is proprietary and open for institutional educational use.
=======
# SMS
>>>>>>> 513374a4d89b71a35a8eefe10d64066ff62a4116
