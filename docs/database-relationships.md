# Database Relationships: School Management System

## 1. Entity Relationship Details

### 1.1 Student Lifecycle Relationships
- `student.parent_id` $\rightarrow$ `parent.parent_id` (N:1, Many students can belong to one parent).
- `student.class_id` $\rightarrow$ `class.class_id` (N:1, Enrolled class).
- `student.section_id` $\rightarrow$ `section.section_id` (N:1, Assigned section).
- `student.dormitory_id` $\rightarrow$ `dormitory.dormitory_id` (N:1, Optional hostel residency).
- `student.transport_id` $\rightarrow$ `transport.transport_id` (N:1, Optional bus route).
- `student.house_id` $\rightarrow$ `house.house_id` (N:1, Optional school house).
- `student.club_id` $\rightarrow$ `club.club_id` (N:1, Optional club membership).

### 1.2 Academic Structure Relationships
- `section.class_id` $\rightarrow$ `class.class_id` (N:1, Sections under a class).
- `section.teacher_id` $\rightarrow$ `teacher.teacher_id` (N:1, Section / Class teacher).
- `class.teacher_id` $\rightarrow$ `teacher.teacher_id` (N:1, Head class teacher).
- `subject.class_id` $\rightarrow$ `class.class_id` (N:1, Curriculum class).
- `subject.teacher_id` $\rightarrow$ `teacher.teacher_id` (N:1, Assigned subject teacher).
- `academic_syllabus.class_id` $\rightarrow$ `class.class_id`.
- `academic_syllabus.subject_id` $\rightarrow$ `subject.subject_id`.
- `assignment.class_id` $\rightarrow$ `class.class_id`.
- `assignment.subject_id` $\rightarrow$ `subject.subject_id`.
- `assignment.teacher_id` $\rightarrow$ `teacher.teacher_id`.
- `material.class_id` $\rightarrow$ `class.class_id`.
- `material.subject_id` $\rightarrow$ `subject.subject_id`.
- `material.teacher_id` $\rightarrow$ `teacher.teacher_id`.

### 1.3 Attendance & Exam Relationships
- `attendance.student_id` $\rightarrow$ `student.student_id` (N:1, Foreign key).
- `attendance.class_id` $\rightarrow$ `class.class_id`.
- `attendance.section_id` $\rightarrow$ `section.section_id`.
- `mark.student_id` $\rightarrow$ `student.student_id`.
- `mark.exam_id` $\rightarrow$ `exam.exam_id`.
- `mark.class_id` $\rightarrow$ `class.class_id`.
- `mark.subject_id` $\rightarrow$ `subject.subject_id`.
- `exam_question.exam_id` $\rightarrow$ `exam.exam_id`.
- `exam_question.class_id` $\rightarrow$ `class.class_id`.
- `exam_question.subject_id` $\rightarrow$ `subject.subject_id`.

### 1.4 Financial Relationships
- `invoice.student_id` $\rightarrow$ `student.student_id`.
- `invoice.class_id` $\rightarrow$ `class.class_id`.
- `payment.invoice_id` $\rightarrow$ `invoice.invoice_id`.
- `payment.student_id` $\rightarrow$ `student.student_id`.
- `expenses.expense_category_id` $\rightarrow$ `expense_category.expense_category_id`.

### 1.5 Human Resources Relationships
- `teacher.department_id` $\rightarrow$ `department.department_id`.
- `teacher.designation_id` $\rightarrow$ `designation.designation_id`.
- `teacher.bank_id` $\rightarrow$ `bank.bank_id`.
- `designation.department_id` $\rightarrow$ `department.department_id`.
- `leave.teacher_id` $\rightarrow$ `teacher.teacher_id`.

### 1.6 Facilities Relationships
- `book.book_category_id` $\rightarrow$ `book_category.book_category_id`.
- `book.class_id` $\rightarrow$ `class.class_id`.
- `book.subject_id` $\rightarrow$ `subject.subject_id`.
- `library_issues.book_id` $\rightarrow$ `book.book_id`.
- `library_issues.student_id` $\rightarrow$ `student.student_id`.
- `hostel_room.hostel_category_id` $\rightarrow$ `hostel_category.hostel_category_id`.
- `dormitory.hostel_room_id` $\rightarrow$ `hostel_room.hostel_room_id`.
- `transport.transport_route_id` $\rightarrow$ `transport_route.transport_route_id`.
- `transport.vehicle_id` $\rightarrow$ `vehicle.vehicle_id`.
