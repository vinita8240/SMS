# Database Analysis: School Management System (`school_data`)

## 1. Executive Summary
This document provides an in-depth analysis of the legacy and enhanced `school_data` database schema. The database is designed to serve a multi-tier School Management System (SMS) encompassing student lifecycle management, academic curricula, daily attendance, examination and grading, financial billing/collection, campus facilities (library, hostel, transport), staff HR and payroll, and multi-channel communication.

## 2. Table Catalog & Domain Classification

### 2.1 Core User & Identity Management
| Table | Description | Primary Key | Key Foreign References |
|---|---|---|---|
| `admin` | Super Admin and administrative staff accounts | `admin_id` | `admin_role_id` |
| `admin_role` | Role definitions and RBAC permission sets | `admin_role_id` | - |
| `teacher` | Academic and administrative teaching staff | `teacher_id` | `department_id`, `designation_id`, `bank_id` |
| `parent` | Guardian/Parent accounts linked to students | `parent_id` | - |
| `student` | Enrolled student profiles and personal info | `student_id` | `class_id`, `section_id`, `parent_id`, `dormitory_id`, `transport_id`, `house_id`, `club_id` |
| `student_category` | Student classification (General, Scholarship, etc.) | `student_category_id` | - |
| `social_category` | Socio-economic/caste classification | `social_category_id` | - |

### 2.2 Academic Architecture
| Table | Description | Primary Key | Key Foreign References |
|---|---|---|---|
| `class` | Academic grades (e.g., Grade 1 to 12) | `class_id` | `teacher_id` (Class Teacher) |
| `section` | Class divisions/sections (e.g., A, B, C) | `section_id` | `class_id`, `teacher_id` |
| `subject` | Subjects taught across classes | `subject_id` | `class_id`, `teacher_id` |
| `academic_syllabus` | Uploaded curricula and syllabi | `academic_syllabus_id` | `class_id`, `subject_id` |
| `assignment` | Homework and class assignments | `assignment_id` | `class_id`, `subject_id`, `teacher_id` |
| `material` | Downloadable study materials and notes | `document_id` | `class_id`, `subject_id`, `teacher_id` |

### 2.3 Attendance & Evaluation
| Table | Description | Primary Key | Key Foreign References |
|---|---|---|---|
| `attendance` | Daily student attendance logs | `attendance_id` | `student_id`, `class_id`, `section_id` |
| `exam` | Scheduled exam terms (e.g., Midterm, Finals) | `exam_id` | - |
| `exam_question` | Questions assigned to exams | `question_id` | `exam_id`, `class_id`, `subject_id`, `teacher_id` |
| `mark` | Grade points and marks achieved | `mark_id` | `student_id`, `exam_id`, `class_id`, `subject_id` |

### 2.4 Finance & Accounting
| Table | Description | Primary Key | Key Foreign References |
|---|---|---|---|
| `invoice` | Fee invoices generated for students | `invoice_id` | `student_id`, `class_id` |
| `payment` | Payment transactions made against invoices | `payment_id` | `invoice_id`, `student_id`, `expense_category_id` |
| `expense_category` | Categorization for institutional expenses | `expense_category_id` | - |
| `expenses` (New Normalized) | Institutional expense vouchers | `expense_id` | `expense_category_id` |
| `bank` | Bank details for salary and vendor transactions | `bank_id` | - |

### 2.5 Facilities & Operations
| Table | Description | Primary Key | Key Foreign References |
|---|---|---|---|
| `book` | Library book catalog | `book_id` | `book_category_id`, `class_id`, `subject_id` |
| `book_category` | Library book classifications | `book_category_id` | - |
| `library_issues` (New Normalized) | Book lending transactions | `issue_id` | `book_id`, `student_id`, `teacher_id` |
| `hostel_category` | Hostel classification (Boys, Girls, Senior) | `hostel_category_id` | - |
| `hostel_room` | Room configurations and bed counts | `hostel_room_id` | `hostel_category_id` |
| `dormitory` | Dormitory allocations and room mappings | `dormitory_id` | `hostel_room_id` |
| `transport_route` | Bus routes and stop fares | `transport_route_id` | - |
| `vehicle` | School fleet information and drivers | `vehicle_id` | - |
| `transport` | Transport subscriptions for students | `transport_id` | `transport_route_id`, `vehicle_id` |

### 2.6 Human Resources & Extracurriculars
| Table | Description | Primary Key | Key Foreign References |
|---|---|---|---|
| `department` | Academic and administrative departments | `department_id` | - |
| `designation` | Job titles and staff designations | `designation_id` | `department_id` |
| `leave` | Staff leave applications and status | `leave_id` | `teacher_id` |
| `house` | Student school houses (e.g., Red, Blue) | `house_id` | - |
| `club` | Student clubs (Robotics, Debate, Arts) | `club_id` | - |
| `activity` | Student extracurricular participation | `activity_id` | `club_id`, `house_id` |

### 2.7 Communication, Settings & Audit
| Table | Description | Primary Key | Key Foreign References |
|---|---|---|---|
| `noticeboard` | Institutional announcements | `notice_id` | - |
| `circular` | Official circulars with file attachments | `circular_id` | - |
| `enquiry` | Public admission inquiries and status | `enquiry_id` | `enquiry_category_id` |
| `enquiry_category` | Classification for enquiries | `enquiry_category_id` | - |
| `settings` | System-wide school configurations | `settings_id` | - |
| `sms_settings` | SMS Gateway & notification configurations | `sms_settings_id` | - |
| `language` & `language_list` | Localization definitions | `language_id` | - |
| `audit_logs` (New Normalized) | System action and security trail | `log_id` | - |

---

## 3. Data Integrity & Normalization Enhancements
1. **Password Security:** All password fields transitioned to standard bcrypt-hashed strings (`VARCHAR(255)`).
2. **Financial Precision:** Amounts stored as `DECIMAL(10,2)` with calculated columns/formulas guaranteeing `amount_due = amount - discount - amount_paid`.
3. **Foreign Key Enforcement:** Referential integrity established with `ON DELETE RESTRICT` or `ON DELETE CASCADE` where logically appropriate.
4. **Auditability:** Added `created_at` and `updated_at` timestamps across all major entities.
