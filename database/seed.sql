-- ==========================================================
-- School Management System (SMS) - Production Seed Data
-- Database: SMS
-- Default credentials:
-- Super Admin: admin@school.com / admin123
-- Teacher: teacher@school.com / teacher123
-- Parent: parent@school.com / parent123
-- Student: student@school.com / student123
-- ==========================================================

USE `SMS`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. System Settings
TRUNCATE TABLE `settings`;
INSERT INTO `settings` (`type`, `description`) VALUES
('system_name', 'St. Lawrence International School'),
('system_title', 'St. Lawrence SMS Portal'),
('address', '124 Academic Way, Tech City, NY 10001'),
('phone', '+1 (555) 234-5678'),
('paypal_email', 'billing@stlawrence.edu'),
('currency', '$'),
('system_email', 'admin@stlawrence.edu'),
('academic_session', '2026-2027'),
('running_year', '2026-2027'),
('language', 'english'),
('theme', 'slate_blue'),
('timezone', 'America/New_York'),
('date_format', 'YYYY-MM-DD');

-- 2. SMS Settings
TRUNCATE TABLE `sms_settings`;
INSERT INTO `sms_settings` (`sms_settings_id`, `active_sms_service`, `twilio_sender_phone_number`) VALUES
(1, 'disabled', '+15550001111');

-- 3. Roles & Permissions
TRUNCATE TABLE `admin_role`;
INSERT INTO `admin_role` (`admin_role_id`, `name`, `slug`, `description`, `permissions`) VALUES
(1, 'Super Admin', 'super_admin', 'Full platform administrative access', '["all"]'),
(2, 'Principal / Academic Admin', 'admin', 'Academic and student administrative operations', '["students.*", "teachers.*", "academics.*", "attendance.*", "exams.*", "reports.*"]'),
(3, 'Accountant', 'accountant', 'Fee collection, invoices, and expense management', '["finance.*", "reports.finance"]'),
(4, 'Librarian', 'librarian', 'Library catalog, issue, and returns', '["library.*"]'),
(5, 'HR / Staff Manager', 'hr_staff', 'Staff management, leave approvals, and designations', '["hr.*", "teachers.view"]');

-- 4. Admins (Password: admin123 => $2a$10$Qj2z2QzZ2Z2Z2Z2Z2Z2Z2.VzL3mY/oQ9Uv7QZ0G1j2k3l4m5n6o7p)
-- Using universal bcrypt hash for admin123 / password
-- $2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S
TRUNCATE TABLE `admin`;
INSERT INTO `admin` (`admin_id`, `name`, `email`, `password`, `phone`, `admin_role_id`, `status`) VALUES
(1, 'Dr. Alexander Vance', 'admin@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 100-0001', 1, 'active'),
(2, 'Elena Rostova', 'accountant@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 100-0002', 3, 'active'),
(3, 'Marcus Aurelius', 'librarian@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 100-0003', 4, 'active');

-- 5. Departments & Designations
TRUNCATE TABLE `department`;
INSERT INTO `department` (`department_id`, `name`, `code`, `description`) VALUES
(1, 'Science & Technology', 'SCI-TECH', 'Physics, Chemistry, Biology, and Computer Science'),
(2, 'Mathematics & Statistics', 'MATH', 'Pure and Applied Mathematics'),
(3, 'Languages & Literature', 'LANG', 'English, Spanish, and World Literature'),
(4, 'Social Studies & Humanities', 'HUM', 'History, Geography, and Civics'),
(5, 'Physical Education & Arts', 'PE-ARTS', 'Sports, Music, and Performing Arts');

TRUNCATE TABLE `designation`;
INSERT INTO `designation` (`designation_id`, `department_id`, `name`, `description`) VALUES
(1, 1, 'Senior Science Master', 'Head of Science division'),
(2, 1, 'Computer Science Instructor', 'CS & Information Systems lead'),
(3, 2, 'Senior Mathematics Master', 'High school Calculus & Algebra lead'),
(4, 3, 'English Department Head', 'Literature and Grammar lead'),
(5, 5, 'Athletic Director', 'Head of Sports & Physical Education');

-- 6. Banks
TRUNCATE TABLE `bank`;
INSERT INTO `bank` (`bank_id`, `bank_name`, `account_name`, `account_number`, `branch`, `ifsc_code`) VALUES
(1, 'JPMorgan Chase', 'St. Lawrence School Payroll', '9876543210', 'Midtown Manhattan', 'CHASUS33XXX'),
(2, 'Bank of America', 'Institutional Operations', '1234567890', 'Main Campus Branch', 'BOFAUS3NXXX');

-- 7. Teachers (Password: teacher123 => $2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S)
TRUNCATE TABLE `teacher`;
INSERT INTO `teacher` (`teacher_id`, `teacher_number`, `name`, `email`, `password`, `phone`, `gender`, `qualification`, `department_id`, `designation_id`, `bank_id`, `basic_salary`, `status`) VALUES
(1, 'TCH-1001', 'Prof. Robert Thorne', 'teacher@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 200-0001', 'Male', 'Ph.D. in Applied Physics', 1, 1, 1, 6500.00, 'active'),
(2, 'TCH-1002', 'Sarah Jenkins', 'sarah.jenkins@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 200-0002', 'Female', 'M.Sc. Mathematics', 2, 3, 1, 5800.00, 'active'),
(3, 'TCH-1003', 'David K. Miller', 'david.miller@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 200-0003', 'Male', 'M.A. English Literature', 3, 4, 1, 5500.00, 'active'),
(4, 'TCH-1004', 'Dr. Rachel Chen', 'rachel.chen@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 200-0004', 'Female', 'Ph.D. Computer Science', 1, 2, 1, 6200.00, 'active');

-- 8. Classes
TRUNCATE TABLE `class`;
INSERT INTO `class` (`class_id`, `name`, `name_numeric`, `teacher_id`) VALUES
(1, 'Grade 8', 8, 1),
(2, 'Grade 9', 9, 2),
(3, 'Grade 10', 10, 3),
(4, 'Grade 11', 11, 4),
(5, 'Grade 12', 12, 1);

-- 9. Sections
TRUNCATE TABLE `section`;
INSERT INTO `section` (`section_id`, `name`, `nick_name`, `class_id`, `teacher_id`, `capacity`) VALUES
(1, 'Section A', 'Eagles', 1, 1, 35),
(2, 'Section B', 'Falcons', 1, 2, 35),
(3, 'Section A', 'Titans', 2, 2, 35),
(4, 'Section B', 'Phoenix', 2, 3, 35),
(5, 'Section A', 'Apex', 3, 3, 40),
(6, 'Section B', 'Vortex', 3, 4, 40),
(7, 'Section A', 'Science Stream', 4, 4, 30),
(8, 'Section A', 'Senior Honors', 5, 1, 30);

-- 10. Subjects
TRUNCATE TABLE `subject`;
INSERT INTO `subject` (`subject_id`, `name`, `code`, `class_id`, `teacher_id`, `type`, `pass_mark`, `final_mark`) VALUES
(1, 'Advanced Physics', 'PHY-101', 3, 1, 'theory', 40, 100),
(2, 'Pure Mathematics', 'MTH-101', 3, 2, 'theory', 40, 100),
(3, 'World Literature & English', 'ENG-101', 3, 3, 'theory', 40, 100),
(4, 'Computer Science & AI', 'CS-101', 3, 4, 'theory', 40, 100),
(5, 'General Science', 'SCI-08', 1, 1, 'theory', 40, 100),
(6, 'Foundation Math', 'MTH-08', 1, 2, 'theory', 40, 100);

-- 11. Student Categories & Social Categories
TRUNCATE TABLE `student_category`;
INSERT INTO `student_category` (`student_category_id`, `name`, `description`) VALUES
(1, 'General Admission', 'Regular fee paying student'),
(2, 'Merit Scholar', 'Academic scholarship recipient 50%'),
(3, 'Sports Scholar', 'Athletic scholarship recipient');

TRUNCATE TABLE `social_category`;
INSERT INTO `social_category` (`social_category_id`, `name`) VALUES
(1, 'General'),
(2, 'OBC / Regional'),
(3, 'Special Category');

-- 12. Houses & Clubs
TRUNCATE TABLE `house`;
INSERT INTO `house` (`house_id`, `name`, `color_code`, `description`) VALUES
(1, 'Gryphon House', '#dc2626', 'Courage and Leadership'),
(2, 'Pegasus House', '#2563eb', 'Intellect and Innovation'),
(3, 'Phoenix House', '#f59e0b', 'Resilience and Honor');

TRUNCATE TABLE `club`;
INSERT INTO `club` (`club_id`, `name`, `description`) VALUES
(1, 'Robotics & STEM Club', 'Designing and programming automated systems'),
(2, 'Debate & MUN Society', 'Public speaking and international affairs'),
(3, 'Visual Arts & Media', 'Photography, sketching, and digital arts');

-- 13. Hostel & Dormitories
TRUNCATE TABLE `hostel_category`;
INSERT INTO `hostel_category` (`hostel_category_id`, `name`, `type`, `description`) VALUES
(1, 'Newton Boys Hall', 'Boys', 'Main senior boys residential building'),
(2, 'Curie Girls Hall', 'Girls', 'Main senior girls residential building');

TRUNCATE TABLE `hostel_room`;
INSERT INTO `hostel_room` (`hostel_room_id`, `hostel_category_id`, `room_number`, `room_type`, `num_beds`, `cost_per_bed`) VALUES
(1, 1, 'B-101', 'Deluxe Double', 2, 450.00),
(2, 1, 'B-102', 'Quad Suite', 4, 300.00),
(3, 2, 'G-201', 'Deluxe Double', 2, 450.00),
(4, 2, 'G-202', 'Quad Suite', 4, 300.00);

TRUNCATE TABLE `dormitory`;
INSERT INTO `dormitory` (`dormitory_id`, `name`, `hostel_room_id`, `incharge_name`, `capacity`) VALUES
(1, 'Newton Wing A', 1, 'Mr. James Wilson', 2),
(2, 'Curie Wing East', 3, 'Mrs. Clara Oswald', 2);

-- 14. Transport Routes & Vehicles
TRUNCATE TABLE `transport_route`;
INSERT INTO `transport_route` (`transport_route_id`, `route_name`, `start_point`, `end_point`, `route_fare`) VALUES
(1, 'North Metro Route #1', 'North Station Hub', 'Main Campus Gate', 85.00),
(2, 'Westside Express Route #2', 'West End Plaza', 'Main Campus Gate', 95.00);

TRUNCATE TABLE `vehicle`;
INSERT INTO `vehicle` (`vehicle_id`, `vehicle_number`, `vehicle_model`, `year_made`, `driver_name`, `driver_phone`, `seating_capacity`) VALUES
(1, 'SCH-BUS-01', 'Blue Bird Vision 2024', '2024', 'Thomas Green', '+1 (555) 300-0001', 48),
(2, 'SCH-BUS-02', 'Thomas Built C2', '2023', 'Michael Davis', '+1 (555) 300-0002', 44);

TRUNCATE TABLE `transport`;
INSERT INTO `transport` (`transport_id`, `transport_route_id`, `vehicle_id`, `route_name`, `route_fare`) VALUES
(1, 1, 1, 'North Metro Route #1', 85.00),
(2, 2, 2, 'Westside Express Route #2', 95.00);

-- 15. Parents (Password: parent123 => $2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S)
TRUNCATE TABLE `parent`;
INSERT INTO `parent` (`parent_id`, `name`, `email`, `password`, `phone`, `profession`, `address`, `annual_income`) VALUES
(1, 'Arthur & Marian Hayes', 'parent@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 400-0001', 'Civil Engineer & Architect', '742 Evergreen Terrace, NY', 145000.00),
(2, 'Jonathan & Clara Reed', 'jonathan.reed@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 400-0002', 'Cardiologist', '108 Grand Avenue, NY', 220000.00);

-- 16. Students (Password: student123 => $2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S)
TRUNCATE TABLE `student`;
INSERT INTO `student` (`student_id`, `admission_no`, `roll_no`, `name`, `email`, `password`, `phone`, `gender`, `birthday`, `blood_group`, `father_name`, `mother_name`, `parent_id`, `class_id`, `section_id`, `student_category_id`, `house_id`, `club_id`, `dormitory_id`, `transport_id`, `session`, `status`) VALUES
(1, 'ADM-2026-001', '1001', 'Julian Hayes', 'student@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 500-0001', 'Male', '2010-04-12', 'O+', 'Arthur Hayes', 'Marian Hayes', 1, 3, 5, 1, 1, 1, 1, 1, '2026-2027', 'active'),
(2, 'ADM-2026-002', '1002', 'Sophie Hayes', 'sophie.hayes@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 500-0002', 'Female', '2012-08-25', 'O+', 'Arthur Hayes', 'Marian Hayes', 1, 1, 1, 2, 1, 3, NULL, 1, '2026-2027', 'active'),
(3, 'ADM-2026-003', '1003', 'Lucas Reed', 'lucas.reed@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 500-0003', 'Male', '2010-11-03', 'A+', 'Jonathan Reed', 'Clara Reed', 2, 3, 5, 1, 2, 2, 1, 2, '2026-2027', 'active'),
(4, 'ADM-2026-004', '1004', 'Emma Watson Reed', 'emma.reed@school.com', '$2a$10$wO36v9.h872e4Hq.pW.nweVbH3o2/yVnUq9.g4i0X6qZ5N8g7fX7S', '+1 (555) 500-0004', 'Female', '2011-02-14', 'B+', 'Jonathan Reed', 'Clara Reed', 2, 2, 3, 3, 3, 1, 2, 2, '2026-2027', 'active');

-- 17. Attendance (1=Present, 2=Absent, 3=Late)
TRUNCATE TABLE `attendance`;
INSERT INTO `attendance` (`date`, `student_id`, `class_id`, `section_id`, `status`, `remarks`) VALUES
('2026-09-08', 1, 3, 5, 1, 'On time'),
('2026-09-08', 3, 3, 5, 1, 'On time'),
('2026-09-09', 1, 3, 5, 1, 'On time'),
('2026-09-09', 3, 3, 5, 3, 'Late 10 mins'),
('2026-09-10', 1, 3, 5, 1, 'On time'),
('2026-09-10', 3, 3, 5, 1, 'On time');

-- 18. Exams & Marks
TRUNCATE TABLE `exam`;
INSERT INTO `exam` (`exam_id`, `name`, `start_date`, `end_date`, `session`, `status`) VALUES
(1, 'Term 1 Midterm Examination', '2026-10-15', '2026-10-25', '2026-2027', 'published'),
(2, 'Annual Final Examination', '2027-03-10', '2027-03-24', '2026-2027', 'scheduled');

TRUNCATE TABLE `mark`;
INSERT INTO `mark` (`student_id`, `subject_id`, `class_id`, `section_id`, `exam_id`, `mark_obtained`, `mark_total`, `grade_point`, `grade`, `comment`) VALUES
(1, 1, 3, 5, 1, 92.00, 100.00, 4.00, 'A+', 'Outstanding problem-solving'),
(1, 2, 3, 5, 1, 88.50, 100.00, 3.80, 'A', 'Strong analytical performance'),
(1, 3, 3, 5, 1, 94.00, 100.00, 4.00, 'A+', 'Exceptional essay analysis'),
(1, 4, 3, 5, 1, 98.00, 100.00, 4.00, 'A+', 'Perfect coding assignments'),
(3, 1, 3, 5, 1, 85.00, 100.00, 3.60, 'A', 'Good lab work'),
(3, 2, 3, 5, 1, 91.00, 100.00, 4.00, 'A+', 'Excellent calculus proofs'),
(3, 3, 3, 5, 1, 79.50, 100.00, 3.00, 'B+', 'Solid comprehension'),
(3, 4, 3, 5, 1, 89.00, 100.00, 3.80, 'A', 'Very good algorithms');

-- 19. Finance: Invoices, Payments, Expenses
TRUNCATE TABLE `expense_category`;
INSERT INTO `expense_category` (`expense_category_id`, `name`, `description`) VALUES
(1, 'Laboratory Equipment & Consumables', 'Chemistry, Physics and Robotics lab supplies'),
(2, 'Campus Utilities & Electricity', 'Power, Water, and Fiber Internet'),
(3, 'Facility Maintenance & Grounds', 'Building repairs, cleaning, and gardening');

TRUNCATE TABLE `expenses`;
INSERT INTO `expenses` (`expense_category_id`, `title`, `amount`, `payment_method`, `expense_date`, `description`) VALUES
(1, 'STEM Robotics Kits & Microcontrollers', 2450.00, 'Bank Transfer', '2026-09-02', 'Procured 15 Arduino & sensor kits'),
(2, 'Campus Solar Grid & Fiber Internet', 1820.00, 'Online', '2026-09-05', 'Monthly campus utility billing');

TRUNCATE TABLE `invoice`;
INSERT INTO `invoice` (`invoice_id`, `invoice_number`, `student_id`, `class_id`, `title`, `description`, `amount`, `discount`, `amount_paid`, `due`, `due_date`, `status`) VALUES
(1, 'INV-2026-001', 1, 3, 'Term 1 Tuition & Lab Fees', 'Comprehensive tuition, lab fees, and library access', 2500.00, 100.00, 2400.00, 0.00, '2026-09-30', 'paid'),
(2, 'INV-2026-002', 2, 1, 'Term 1 Junior Tuition', 'Junior high tuition with 50% merit discount', 1800.00, 900.00, 900.00, 0.00, '2026-09-30', 'paid'),
(3, 'INV-2026-003', 3, 3, 'Term 1 Tuition & Boarding', 'Tuition, hostel room, and transport subscription', 3200.00, 0.00, 1600.00, 1600.00, '2026-09-30', 'partially_paid');

TRUNCATE TABLE `payment`;
INSERT INTO `payment` (`payment_id`, `invoice_id`, `student_id`, `title`, `payment_method`, `amount`, `payment_date`, `transaction_reference`) VALUES
(1, 1, 1, 'Term 1 Full Payment', 'Bank Transfer', 2400.00, '2026-09-01', 'TXN-CHASE-9921'),
(2, 2, 2, 'Term 1 Merit Balance', 'Credit Card', 900.00, '2026-09-02', 'TXN-STRIPE-8831'),
(3, 3, 3, 'Term 1 Installment 1', 'Cheque', 1600.00, '2026-09-03', 'CHQ-BOA-4412');

-- 20. Library
TRUNCATE TABLE `book_category`;
INSERT INTO `book_category` (`book_category_id`, `name`, `description`) VALUES
(1, 'Physics & Engineering', 'Mechanics, Electromagnetism, Quantum Physics'),
(2, 'Pure Mathematics', 'Calculus, Linear Algebra, Number Theory'),
(3, 'Literature & Classics', 'World literature, Shakespeare, Modern fiction');

TRUNCATE TABLE `book`;
INSERT INTO `book` (`book_id`, `name`, `author`, `book_category_id`, `isbn`, `publisher`, `price`, `quantity`, `available_quantity`) VALUES
(1, 'Principles of Quantum Mechanics', 'R. Shankar', 1, '978-0306447908', 'Plenum Press', 85.00, 10, 8),
(2, 'Calculus: Early Transcendentals', 'James Stewart', 2, '978-1285741550', 'Cengage', 120.00, 15, 14),
(3, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', 1, '978-0134610993', 'Pearson', 140.00, 12, 11);

TRUNCATE TABLE `library_issues`;
INSERT INTO `library_issues` (`issue_id`, `book_id`, `borrower_type`, `student_id`, `issue_date`, `due_date`, `status`) VALUES
(1, 1, 'student', 1, '2026-09-01', '2026-09-21', 'issued'),
(2, 3, 'student', 3, '2026-09-02', '2026-09-22', 'issued');

-- 21. Notices & Circulars
TRUNCATE TABLE `noticeboard`;
INSERT INTO `noticeboard` (`notice_id`, `notice_title`, `notice`, `date`, `audience`, `status`) VALUES
(1, 'Welcome to Academic Session 2026-2027', 'Welcome all students, faculty, and parents to the new academic year. Orientation begins Monday.', '2026-09-01', 'all', 'active'),
(2, 'STEM Robotics Championship Registration', 'Registrations are now open for the Regional Robotics Championship. Interested students please consult Dr. Chen.', '2026-09-04', 'students', 'active'),
(3, 'Parent-Teacher Conference Schedule', 'The first term parent-teacher conference is scheduled for Oct 10th. Timetable slots available online.', '2026-09-07', 'parents', 'active');

TRUNCATE TABLE `circular`;
INSERT INTO `circular` (`circular_id`, `title`, `reference_no`, `content`, `date`) VALUES
(1, 'Annual Safety and Campus Protocols', 'CIR/2026/01', 'All laboratory safety protocols and emergency drills will be conducted in the second week of September.', '2026-09-01');

-- 22. Assignments, Materials, Syllabus
TRUNCATE TABLE `academic_syllabus`;
INSERT INTO `academic_syllabus` (`academic_syllabus_code`, `title`, `class_id`, `subject_id`, `session`, `file_name`) VALUES
('SYL-GR10-PHY', 'Grade 10 Physics Master Syllabus', 3, 1, '2026-2027', 'syllabus_physics_gr10.pdf'),
('SYL-GR10-MTH', 'Grade 10 Calculus & Algebra Syllabus', 3, 2, '2026-2027', 'syllabus_math_gr10.pdf');

TRUNCATE TABLE `assignment`;
INSERT INTO `assignment` (`assignment_code`, `title`, `description`, `class_id`, `subject_id`, `teacher_id`, `due_date`, `file_name`) VALUES
('ASG-PHY-01', 'Newtonian Mechanics Problem Set #1', 'Solve problems 1 through 15 on projectile motion and frictional surfaces.', 3, 1, 1, '2026-09-25', 'assignment_physics_01.pdf'),
('ASG-CS-01', 'Dynamic Programming & Graph Traversal', 'Implement Dijkstra and A* pathfinding in Python with documentation.', 3, 4, 4, '2026-09-28', 'assignment_cs_01.pdf');

TRUNCATE TABLE `material`;
INSERT INTO `material` (`title`, `description`, `file_name`, `file_type`, `class_id`, `subject_id`, `teacher_id`) VALUES
('Lecture 01: Kinematics Notes', 'Comprehensive lecture slide pack covering vectors and kinematics.', 'kinematics_notes.pdf', 'pdf', 3, 1, 1),
('AI & Machine Learning Foundations', 'Introductory slides on neural networks and gradient descent.', 'ai_foundations.pdf', 'pdf', 3, 4, 4);

-- 23. Staff Leaves
TRUNCATE TABLE `leave`;
INSERT INTO `leave` (`teacher_id`, `leave_code`, `leave_type`, `start_date`, `end_date`, `reason`, `status`) VALUES
(2, 'LEV-2026-001', 'Casual Leave', '2026-09-18', '2026-09-19', 'Attending National Mathematics Symposium', 'approved');

SET FOREIGN_KEY_CHECKS = 1;
