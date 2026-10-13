-- ==========================================================
-- School Management System (SMS) - Live Database Schema
-- Database: SMS
-- Generated: 2026-09-10T17:48:31.911Z
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `SMS` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `SMS`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- Table structure for table `academic_syllabus`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `academic_syllabus`;
CREATE TABLE `academic_syllabus` (
  `academic_syllabus_id` int(11) NOT NULL AUTO_INCREMENT,
  `academic_syllabus_code` varchar(50) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `session` varchar(50) DEFAULT '2026-2027',
  `file_name` varchar(255) NOT NULL,
  `uploader_type` varchar(50) DEFAULT 'admin',
  `uploader_id` int(11) DEFAULT 1,
  `year` varchar(20) DEFAULT '2026',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`academic_syllabus_id`),
  KEY `idx_syl_class` (`class_id`),
  KEY `fk_syl_subj` (`subject_id`),
  CONSTRAINT `fk_syl_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_syl_subj` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `activity`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
  `activity_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `club_id` int(11) DEFAULT NULL,
  `house_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`activity_id`),
  KEY `fk_act_club` (`club_id`),
  KEY `fk_act_house` (`house_id`),
  CONSTRAINT `fk_act_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`club_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_act_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`house_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `admin`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `admin_role_id` int(11) NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `avatar` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `idx_admin_email` (`email`),
  KEY `idx_admin_role` (`admin_role_id`),
  CONSTRAINT `fk_admin_role` FOREIGN KEY (`admin_role_id`) REFERENCES `admin_role` (`admin_role_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `admin_role`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `admin_role`;
CREATE TABLE `admin_role` (
  `admin_role_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`admin_role_id`),
  UNIQUE KEY `idx_role_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `assignment`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `assignment`;
CREATE TABLE `assignment` (
  `assignment_id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_code` varchar(50) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `due_date` date NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`assignment_id`),
  KEY `idx_asgn_class_subj` (`class_id`,`subject_id`),
  KEY `fk_asgn_subj` (`subject_id`),
  KEY `fk_asgn_teacher` (`teacher_id`),
  CONSTRAINT `fk_asgn_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asgn_subj` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asgn_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `attendance`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) DEFAULT NULL,
  `date` date NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `status` int(11) NOT NULL COMMENT '1=Present, 2=Absent, 3=Late, 4=Half Day, 5=Holiday',
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `idx_stud_date` (`student_id`,`date`),
  KEY `idx_att_class_date` (`class_id`,`section_id`,`date`),
  KEY `fk_att_section` (`section_id`),
  CONSTRAINT `fk_att_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_section` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `audit_logs`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_type` varchar(50) DEFAULT 'admin',
  `user_name` varchar(191) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(100) NOT NULL,
  `record_id` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `old_values` longtext DEFAULT NULL,
  `new_values` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_module` (`module`),
  KEY `idx_audit_user` (`user_id`,`user_type`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `bank`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `bank`;
CREATE TABLE `bank` (
  `bank_id` int(11) NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(191) NOT NULL,
  `account_name` varchar(191) NOT NULL,
  `account_number` varchar(100) NOT NULL,
  `branch` varchar(191) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `swift_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`bank_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `book`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book` (
  `book_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `author` varchar(191) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `book_category_id` int(11) NOT NULL,
  `isbn` varchar(50) DEFAULT NULL,
  `edition` varchar(50) DEFAULT NULL,
  `publisher` varchar(191) DEFAULT NULL,
  `rack_number` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `quantity` int(11) DEFAULT 1,
  `available_quantity` int(11) DEFAULT 1,
  `status` enum('available','unavailable') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`book_id`),
  KEY `idx_book_cat` (`book_category_id`),
  KEY `fk_bk_class` (`class_id`),
  KEY `fk_bk_subj` (`subject_id`),
  CONSTRAINT `fk_bk_cat` FOREIGN KEY (`book_category_id`) REFERENCES `book_category` (`book_category_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bk_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bk_subj` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `book_category`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `book_category`;
CREATE TABLE `book_category` (
  `book_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`book_category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `ci_sessions`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `ci_sessions`;
CREATE TABLE `ci_sessions` (
  `id` varchar(128) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `timestamp` int(10) unsigned NOT NULL DEFAULT 0,
  `data` blob NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ci_sessions_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `circular`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `circular`;
CREATE TABLE `circular` (
  `circular_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `content` text NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`circular_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `class`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `class`;
CREATE TABLE `class` (
  `class_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `name_numeric` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`class_id`),
  KEY `idx_class_teacher` (`teacher_id`),
  CONSTRAINT `fk_class_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `club`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `club`;
CREATE TABLE `club` (
  `club_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`club_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `department`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `designation`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `designation`;
CREATE TABLE `designation` (
  `designation_id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`designation_id`),
  KEY `idx_designation_dept` (`department_id`),
  CONSTRAINT `fk_designation_dept` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `dormitory`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `dormitory`;
CREATE TABLE `dormitory` (
  `dormitory_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `hostel_room_id` int(11) NOT NULL,
  `incharge_name` varchar(191) DEFAULT NULL,
  `capacity` int(11) DEFAULT 20,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`dormitory_id`),
  KEY `fk_dorm_room` (`hostel_room_id`),
  CONSTRAINT `fk_dorm_room` FOREIGN KEY (`hostel_room_id`) REFERENCES `hostel_room` (`hostel_room_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `enquiry`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `enquiry`;
CREATE TABLE `enquiry` (
  `enquiry_id` int(11) NOT NULL AUTO_INCREMENT,
  `enquiry_category_id` int(11) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `purpose` varchar(191) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('pending','contacted','resolved','closed') DEFAULT 'pending',
  `date` date DEFAULT NULL,
  `response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`enquiry_id`),
  KEY `fk_enq_cat` (`enquiry_category_id`),
  CONSTRAINT `fk_enq_cat` FOREIGN KEY (`enquiry_category_id`) REFERENCES `enquiry_category` (`enquiry_category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `enquiry_category`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `enquiry_category`;
CREATE TABLE `enquiry_category` (
  `enquiry_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(191) NOT NULL,
  `purpose` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`enquiry_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `exam`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `exam`;
CREATE TABLE `exam` (
  `exam_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `session` varchar(50) DEFAULT '2026-2027',
  `comment` text DEFAULT NULL,
  `status` enum('scheduled','ongoing','completed','published') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`exam_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `exam_question`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `exam_question`;
CREATE TABLE `exam_question` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `question` text NOT NULL,
  `marks` int(11) DEFAULT 1,
  `file_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`question_id`),
  KEY `fk_eq_exam` (`exam_id`),
  KEY `fk_eq_class` (`class_id`),
  KEY `fk_eq_subj` (`subject_id`),
  KEY `fk_eq_teacher` (`teacher_id`),
  CONSTRAINT `fk_eq_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eq_exam` FOREIGN KEY (`exam_id`) REFERENCES `exam` (`exam_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eq_subj` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eq_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `expense_category`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `expense_category`;
CREATE TABLE `expense_category` (
  `expense_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`expense_category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `fee_master`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `fee_master`;
CREATE TABLE `fee_master` (
  `fee_master_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fee_master_id`),
  UNIQUE KEY `idx_fee_master_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `fee_group`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `fee_group`;
CREATE TABLE `fee_group` (
  `fee_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fee_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `fee_type`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `fee_type`;
CREATE TABLE `fee_type` (
  `fee_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `is_optional` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fee_type_id`),
  UNIQUE KEY `idx_fee_type_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `fee_discount`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `fee_discount`;
CREATE TABLE `fee_discount` (
  `fee_discount_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fee_discount_id`),
  UNIQUE KEY `idx_fee_discount_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `expenses`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `expense_id` int(11) NOT NULL AUTO_INCREMENT,
  `expense_category_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Cash',
  `reference_no` varchar(100) DEFAULT NULL,
  `expense_date` date NOT NULL,
  `receipt_doc` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`expense_id`),
  KEY `idx_exp_cat` (`expense_category_id`),
  CONSTRAINT `fk_exp_cat` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_category` (`expense_category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `hostel_category`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `hostel_category`;
CREATE TABLE `hostel_category` (
  `hostel_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `type` enum('Boys','Girls','Mixed','Staff') DEFAULT 'Boys',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`hostel_category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `hostel_room`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `hostel_room`;
CREATE TABLE `hostel_room` (
  `hostel_room_id` int(11) NOT NULL AUTO_INCREMENT,
  `hostel_category_id` int(11) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `room_type` varchar(100) DEFAULT 'Standard',
  `num_beds` int(11) DEFAULT 4,
  `cost_per_bed` decimal(10,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`hostel_room_id`),
  KEY `idx_room_hostel` (`hostel_category_id`),
  CONSTRAINT `fk_room_hostel` FOREIGN KEY (`hostel_category_id`) REFERENCES `hostel_category` (`hostel_category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `house`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `house`;
CREATE TABLE `house` (
  `house_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `color_code` varchar(50) DEFAULT '#2563eb',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`house_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `invoice`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `invoice`;
CREATE TABLE `invoice` (
  `invoice_id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `due` decimal(10,2) NOT NULL DEFAULT 0.00,
  `creation_timestamp` bigint(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'Cash',
  `status` enum('paid','unpaid','partially_paid','cancelled') DEFAULT 'unpaid',
  `year` varchar(20) DEFAULT '2026-2027',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `idx_inv_num` (`invoice_number`),
  KEY `idx_inv_student` (`student_id`),
  KEY `idx_inv_class` (`class_id`),
  KEY `idx_inv_status` (`status`),
  CONSTRAINT `fk_inv_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `language`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `language`;
CREATE TABLE `language` (
  `phrase_id` int(11) NOT NULL AUTO_INCREMENT,
  `phrase` text NOT NULL,
  `english` text DEFAULT NULL,
  `spanish` text DEFAULT NULL,
  `french` text DEFAULT NULL,
  `hindi` text DEFAULT NULL,
  `arabic` text DEFAULT NULL,
  PRIMARY KEY (`phrase_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `language_list`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `language_list`;
CREATE TABLE `language_list` (
  `language_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`language_id`),
  UNIQUE KEY `idx_lang_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `leave`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `leave`;
CREATE TABLE `leave` (
  `leave_id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `leave_code` varchar(50) DEFAULT NULL,
  `leave_type` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`leave_id`),
  KEY `idx_leave_teacher` (`teacher_id`),
  CONSTRAINT `fk_leave_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `library_issues`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `library_issues`;
CREATE TABLE `library_issues` (
  `issue_id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `borrower_type` enum('student','teacher') DEFAULT 'student',
  `student_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('issued','returned','overdue','lost') DEFAULT 'issued',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`issue_id`),
  KEY `idx_issue_bk` (`book_id`),
  KEY `idx_issue_stud` (`student_id`),
  KEY `fk_iss_teacher` (`teacher_id`),
  CONSTRAINT `fk_iss_bk` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_iss_stud` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_iss_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `mark`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `mark`;
CREATE TABLE `mark` (
  `mark_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) DEFAULT NULL,
  `exam_id` int(11) NOT NULL,
  `mark_obtained` decimal(5,2) DEFAULT 0.00,
  `mark_total` decimal(5,2) DEFAULT 100.00,
  `grade_point` decimal(3,2) DEFAULT 0.00,
  `grade` varchar(10) DEFAULT 'F',
  `comment` varchar(255) DEFAULT NULL,
  `year` varchar(20) DEFAULT '2026',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`mark_id`),
  UNIQUE KEY `idx_stud_exam_subj` (`student_id`,`exam_id`,`subject_id`),
  KEY `idx_mark_exam_class` (`exam_id`,`class_id`),
  KEY `fk_mark_subj` (`subject_id`),
  KEY `fk_mark_class` (`class_id`),
  CONSTRAINT `fk_mark_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mark_exam` FOREIGN KEY (`exam_id`) REFERENCES `exam` (`exam_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mark_stud` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mark_subj` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `material`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `material`;
CREATE TABLE `material` (
  `document_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`document_id`),
  KEY `idx_mat_class` (`class_id`),
  KEY `fk_mat_subj` (`subject_id`),
  KEY `fk_mat_teacher` (`teacher_id`),
  CONSTRAINT `fk_mat_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mat_subj` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mat_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `noticeboard`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `noticeboard`;
CREATE TABLE `noticeboard` (
  `notice_id` int(11) NOT NULL AUTO_INCREMENT,
  `notice_title` varchar(191) NOT NULL,
  `notice` text NOT NULL,
  `create_timestamp` bigint(20) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `audience` enum('all','students','parents','teachers','staff') DEFAULT 'all',
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `status` enum('active','archived') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`notice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `parent`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `parent`;
CREATE TABLE `parent` (
  `parent_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `profession` varchar(191) DEFAULT NULL,
  `annual_income` decimal(12,2) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`parent_id`),
  UNIQUE KEY `idx_parent_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `payment`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_type` varchar(50) DEFAULT 'income' COMMENT 'income or expense',
  `invoice_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `expense_category_id` int(11) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Cash',
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `year` varchar(20) DEFAULT '2026-2027',
  `transaction_reference` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`payment_id`),
  KEY `idx_pay_inv` (`invoice_id`),
  KEY `idx_pay_stud` (`student_id`),
  KEY `fk_pay_exp_cat` (`expense_category_id`),
  CONSTRAINT `fk_pay_exp_cat` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_category` (`expense_category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_inv` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_stud` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `section`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `section`;
CREATE TABLE `section` (
  `section_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `nick_name` varchar(191) DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT 40,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`section_id`),
  KEY `idx_section_class` (`class_id`),
  KEY `idx_section_teacher` (`teacher_id`),
  CONSTRAINT `fk_sec_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sec_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `settings`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `settings_id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`settings_id`),
  UNIQUE KEY `idx_settings_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `sms_settings`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `sms_settings`;
CREATE TABLE `sms_settings` (
  `sms_settings_id` int(11) NOT NULL AUTO_INCREMENT,
  `clickatell_user` varchar(191) DEFAULT NULL,
  `clickatell_password` varchar(191) DEFAULT NULL,
  `clickatell_api_id` varchar(191) DEFAULT NULL,
  `twilio_account_sid` varchar(191) DEFAULT NULL,
  `twilio_auth_token` varchar(191) DEFAULT NULL,
  `twilio_sender_phone_number` varchar(191) DEFAULT NULL,
  `msg91_authentication_key` varchar(191) DEFAULT NULL,
  `msg91_sender_id` varchar(191) DEFAULT NULL,
  `msg91_route` varchar(191) DEFAULT NULL,
  `msg91_country_code` varchar(50) DEFAULT NULL,
  `active_sms_service` varchar(100) DEFAULT 'disabled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`sms_settings_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `social_category`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `social_category`;
CREATE TABLE `social_category` (
  `social_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`social_category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `student`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `admission_no` varchar(50) NOT NULL,
  `roll_no` varchar(50) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT 'Male',
  `birthday` date DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Indian',
  `mother_tongue` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `father_name` varchar(191) DEFAULT NULL,
  `mother_name` varchar(191) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `student_category_id` int(11) DEFAULT NULL,
  `social_category_id` int(11) DEFAULT NULL,
  `house_id` int(11) DEFAULT NULL,
  `club_id` int(11) DEFAULT NULL,
  `dormitory_id` int(11) DEFAULT NULL,
  `transport_id` int(11) DEFAULT NULL,
  `session` varchar(50) DEFAULT '2026-2027',
  `admission_date` date DEFAULT NULL,
  `previous_school` text DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','transferred','graduated','left') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `idx_student_adm` (`admission_no`),
  KEY `idx_stud_class` (`class_id`),
  KEY `idx_stud_section` (`section_id`),
  KEY `idx_stud_parent` (`parent_id`),
  KEY `idx_stud_session` (`session`),
  KEY `fk_stud_cat` (`student_category_id`),
  KEY `fk_stud_soc_cat` (`social_category_id`),
  KEY `fk_stud_house` (`house_id`),
  KEY `fk_stud_club` (`club_id`),
  KEY `fk_stud_dorm` (`dormitory_id`),
  KEY `fk_stud_trans` (`transport_id`),
  CONSTRAINT `fk_stud_cat` FOREIGN KEY (`student_category_id`) REFERENCES `student_category` (`student_category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_stud_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stud_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`club_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_stud_dorm` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitory` (`dormitory_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_stud_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`house_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_stud_parent` FOREIGN KEY (`parent_id`) REFERENCES `parent` (`parent_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_stud_section` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stud_soc_cat` FOREIGN KEY (`social_category_id`) REFERENCES `social_category` (`social_category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_stud_trans` FOREIGN KEY (`transport_id`) REFERENCES `transport` (`transport_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `student_category`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `student_category`;
CREATE TABLE `student_category` (
  `student_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`student_category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `subject`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject` (
  `subject_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `type` enum('theory','practical','optional','mandatory') DEFAULT 'theory',
  `pass_mark` int(11) DEFAULT 40,
  `final_mark` int(11) DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`subject_id`),
  KEY `idx_subj_class` (`class_id`),
  KEY `idx_subj_teacher` (`teacher_id`),
  CONSTRAINT `fk_subj_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subj_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `teacher`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher` (
  `teacher_id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_number` varchar(50) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT 'Male',
  `qualification` varchar(255) DEFAULT NULL,
  `marital_status` varchar(50) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `leaving_date` date DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `designation_id` int(11) DEFAULT NULL,
  `bank_id` int(11) DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT 0.00,
  `social_links` longtext DEFAULT NULL,
  `status` enum('active','inactive','resigned') DEFAULT 'active',
  `file_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`teacher_id`),
  UNIQUE KEY `idx_teacher_number` (`teacher_number`),
  UNIQUE KEY `idx_teacher_email` (`email`),
  KEY `idx_teacher_dept` (`department_id`),
  KEY `idx_teacher_desig` (`designation_id`),
  KEY `idx_teacher_bank` (`bank_id`),
  CONSTRAINT `fk_teacher_bank` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`bank_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_teacher_dept` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_teacher_desig` FOREIGN KEY (`designation_id`) REFERENCES `designation` (`designation_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `transport`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `transport`;
CREATE TABLE `transport` (
  `transport_id` int(11) NOT NULL AUTO_INCREMENT,
  `transport_route_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `route_name` varchar(191) DEFAULT NULL,
  `number_of_vehicle` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `route_fare` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`transport_id`),
  KEY `idx_trans_route` (`transport_route_id`),
  KEY `idx_trans_veh` (`vehicle_id`),
  CONSTRAINT `fk_trans_route` FOREIGN KEY (`transport_route_id`) REFERENCES `transport_route` (`transport_route_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trans_veh` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `transport_route`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `transport_route`;
CREATE TABLE `transport_route` (
  `transport_route_id` int(11) NOT NULL AUTO_INCREMENT,
  `route_name` varchar(191) NOT NULL,
  `start_point` varchar(191) DEFAULT NULL,
  `end_point` varchar(191) DEFAULT NULL,
  `route_fare` decimal(10,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`transport_route_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table structure for table `vehicle`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `vehicle`;
CREATE TABLE `vehicle` (
  `vehicle_id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_number` varchar(50) NOT NULL,
  `vehicle_model` varchar(100) DEFAULT NULL,
  `year_made` varchar(20) DEFAULT NULL,
  `driver_name` varchar(191) NOT NULL,
  `driver_phone` varchar(50) NOT NULL,
  `driver_license` varchar(100) DEFAULT NULL,
  `vehicle_status` enum('active','maintenance','retired') DEFAULT 'active',
  `seating_capacity` int(11) DEFAULT 40,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `idx_veh_number` (`vehicle_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
