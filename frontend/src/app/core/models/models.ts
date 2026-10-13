export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student' | 'accountant' | 'librarian' | 'hr_staff' | 'hostel_master' | 'transport_manager' | string;
  userType: 'admin' | 'teacher' | 'parent' | 'student' | string;
  phone?: string;
  avatar?: string;
  permissions?: string[];
  class_id?: number;
  section_id?: number;
}

export interface Student {
  student_id: number;
  admission_no: string;
  roll_no?: string;
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  gender: 'Male' | 'Female' | 'Other';
  birthday?: string;
  blood_group?: string;
  nationality?: string;
  mother_tongue?: string;
  religion?: string;
  father_name?: string;
  mother_name?: string;
  parent_id?: number;
  parent_name?: string;
  parent_phone?: string;
  class_id: number;
  class_name?: string;
  section_id: number;
  section_name?: string;
  student_category_id?: number;
  student_category_name?: string;
  social_category_id?: number;
  house_id?: number;
  house_name?: string;
  club_id?: number;
  club_name?: string;
  dormitory_id?: number;
  dormitory_name?: string;
  transport_id?: number;
  route_name?: string;
  session?: string;
  admission_date?: string;
  previous_school?: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated' | 'left' | 'disabled' | string;
  file_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Teacher {
  teacher_id: number;
  teacher_number: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  birthday?: string;
  gender?: 'Male' | 'Female' | 'Other';
  qualification?: string;
  marital_status?: string;
  blood_group?: string;
  joining_date?: string;
  leaving_date?: string;
  department_id?: number;
  department_name?: string;
  designation_id?: number;
  designation_name?: string;
  bank_id?: number;
  bank_name?: string;
  account_number?: string;
  basic_salary?: number;
  social_links?: string;
  status: 'active' | 'inactive' | 'resigned';
  file_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Parent {
  parent_id: number;
  name: string;
  email: string;
  password?: string;
  phone: string;
  profession?: string;
  address?: string;
  annual_income?: number;
  status: 'active' | 'inactive';
  total_children?: number;
  children?: Student[];
  created_at?: string;
  updated_at?: string;
}

export interface SchoolClass {
  class_id: number;
  name: string;
  name_numeric?: number;
  teacher_id?: number;
  teacher_name?: string;
  total_sections?: number;
  total_students?: number;
}

export interface Section {
  section_id: number;
  name: string;
  nick_name?: string;
  class_id: number;
  class_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  capacity?: number;
  total_students?: number;
}

export interface Subject {
  subject_id: number;
  name: string;
  code?: string;
  class_id: number;
  class_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  type: 'theory' | 'practical' | 'optional' | 'mandatory';
  pass_mark: number;
  final_mark: number;
}

export interface AcademicSyllabus {
  academic_syllabus_id: number;
  academic_syllabus_code?: string;
  title: string;
  description?: string;
  class_id: number;
  class_name?: string;
  subject_id?: number;
  subject_name?: string;
  session?: string;
  file_name: string;
  uploader_type?: string;
  uploader_id?: number;
  year?: string;
  created_at?: string;
}

export interface StudyMaterial {
  document_id: number;
  title: string;
  description?: string;
  file_name: string;
  file_type?: string;
  class_id: number;
  class_name?: string;
  subject_id?: number;
  subject_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  created_at?: string;
}

export interface Assignment {
  assignment_id: number;
  assignment_code?: string;
  title: string;
  description?: string;
  class_id: number;
  class_name?: string;
  subject_id: number;
  subject_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  due_date: string;
  file_name?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  attendance_id?: number;
  student_id: number;
  student_name?: string;
  admission_no?: string;
  roll_no?: string;
  attendance_status: number; // 1=Present, 2=Absent, 3=Late, 4=Half Day, 5=Holiday
  remarks?: string;
  date?: string;
}

export interface Exam {
  exam_id: number;
  name: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  session?: string;
  comment?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'published';
  created_at?: string;
}

export interface ExamQuestion {
  question_id: number;
  exam_id: number;
  exam_name?: string;
  class_id: number;
  class_name?: string;
  subject_id: number;
  subject_name?: string;
  question: string;
  marks: number;
  created_at?: string;
}

export interface Mark {
  mark_id?: number;
  student_id: number;
  student_name?: string;
  admission_no?: string;
  roll_no?: string;
  subject_id?: number;
  subject_name?: string;
  exam_id?: number;
  mark_obtained: number;
  mark_total: number;
  grade_point: number;
  grade: string;
  comment?: string;
}

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  student_id: number;
  student_name?: string;
  admission_no?: string;
  class_id: number;
  class_name?: string;
  title: string;
  description?: string;
  amount: number;
  discount: number;
  amount_paid: number;
  due: number;
  due_date?: string;
  payment_method?: string;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'cancelled';
  year?: string;
  payments?: Payment[];
  created_at?: string;
}

export interface Payment {
  payment_id: number;
  invoice_id?: number;
  student_id?: number;
  title?: string;
  method?: string;
  payment_method?: string;
  amount: number;
  payment_date?: string;
  transaction_reference?: string;
}

export interface Expense {
  expense_id: number;
  expense_category_id: number;
  category_name?: string;
  title: string;
  description?: string;
  amount: number;
  payment_method: string;
  reference_no?: string;
  expense_date: string;
  receipt_doc?: string;
  created_by?: number;
}

export interface ExpenseCategory {
  expense_category_id: number;
  id?: number;
  name: string;
  description?: string;
}

export interface Book {
  book_id: number;
  name: string;
  description?: string;
  author: string;
  class_id?: number;
  class_name?: string;
  subject_id?: number;
  subject_name?: string;
  book_category_id: number;
  category_name?: string;
  isbn?: string;
  edition?: string;
  publisher?: string;
  rack_number?: string;
  price: number;
  quantity: number;
  available_quantity: number;
  status: 'available' | 'unavailable';
}

export interface BookCategory {
  book_category_id: number;
  id?: number;
  name: string;
  description?: string;
}

export interface BookIssue {
  issue_id: number;
  book_id: number;
  book_name?: string;
  author?: string;
  borrower_type: 'student' | 'teacher';
  student_id?: number;
  student_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  status: 'issued' | 'returned' | 'overdue' | 'lost';
}

export interface TransportRoute {
  transport_route_id: number;
  route_name: string;
  start_point?: string;
  end_point?: string;
  route_fare: number;
  description?: string;
}

export interface Vehicle {
  vehicle_id: number;
  vehicle_number: string;
  vehicle_model?: string;
  year_made?: string;
  driver_name: string;
  driver_phone: string;
  driver_license?: string;
  vehicle_status: 'active' | 'maintenance' | 'retired';
  seating_capacity: number;
}

export interface HostelCategory {
  hostel_category_id: number;
  id?: number;
  name: string;
  type: 'Boys' | 'Girls' | 'Mixed' | 'Staff';
  description?: string;
}

export interface HostelRoom {
  hostel_room_id: number;
  id?: number;
  hostel_category_id: number;
  hostel_name?: string;
  room_number: string;
  room_type?: string;
  num_beds: number;
  cost_per_bed: number;
  description?: string;
}

export interface Dormitory {
  dormitory_id: number;
  name: string;
  hostel_room_id: number;
  incharge_name?: string;
  capacity?: number;
  description?: string;
}

export interface Department {
  department_id: number;
  id?: number;
  name: string;
  code?: string;
  description?: string;
}

export interface Designation {
  designation_id: number;
  id?: number;
  department_id: number;
  department_name?: string;
  name: string;
  description?: string;
}

export interface Notice {
  notice_id: number;
  id?: number;
  notice_title: string;
  title?: string;
  notice: string;
  content?: string;
  description?: string;
  date?: string;
  audience: 'all' | 'students' | 'parents' | 'teachers' | 'staff';
  target_role?: string;
  status: 'active' | 'archived';
  class_name?: string;
  section_name?: string;
}

export interface Circular {
  circular_id: number;
  id?: number;
  title: string;
  reference_no?: string;
  content: string;
  file_name?: string;
  date?: string;
}

export interface Enquiry {
  enquiry_id: number;
  id?: number;
  enquiry_category_id?: number;
  category_name?: string;
  name: string;
  email?: string;
  phone: string;
  purpose?: string;
  message: string;
  status: 'pending' | 'contacted' | 'resolved' | 'closed';
  date?: string;
  response?: string;
}

export interface StaffLeave {
  leave_id: number;
  id?: number;
  teacher_id: number;
  teacher_name?: string;
  teacher_number?: string;
  department_name?: string;
  designation_name?: string;
  leave_code?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  attachment?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
}

export interface DashboardMetrics {
  kpi: {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    totalClasses: number;
    totalSections: number;
    totalBooks: number;
    upcomingExams: number;
    pendingAssignments: number;
    presentToday: number;
    absentToday: number;
    totalRevenue: number;
    pendingFees: number;
    totalExpenses: number;
    totalBeds: number;
    occupiedBeds: number;
    hostelOccupancyRate: number;
  };
  charts: {
    studentsByClass: { class_name: string; student_count: number }[];
    genderDistribution: { gender: string; count: number }[];
    attendanceTrend: { date: string; present: number; absent: number; late: number }[];
    expenseByCategory: { category_name: string; total_amount: number }[];
    teachersByDepartment: { department_name: string; teacher_count: number }[];
    transportUtilization: { route_name: string; vehicle_number: string; seating_capacity: number; assigned_students: number }[];
  };
}

export interface ChatSource {
  type: string;
  label: string;
}

export interface ChatMessage {
  id?: number;
  conversationId?: string;
  sender: 'user' | 'bot' | 'system';
  message: string;
  intent?: string;
  sources?: ChatSource[];
  timestamp?: string | Date;
}

export interface ChatSuggestion {
  label: string;
  prompt: string;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  sources: ChatSource[];
  conversationId: string;
  timestamp: string;
}

