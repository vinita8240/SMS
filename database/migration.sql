-- ==========================================================
-- School Management System (SMS) - Migration Script
-- Database: SMS
-- ==========================================================

USE `SMS`;

-- 1. Ensure new normalized tables exist if migrating from old version
CREATE TABLE IF NOT EXISTS `expenses` (
  `expense_id` INT(11) NOT NULL AUTO_INCREMENT,
  `expense_category_id` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Cash',
  `expense_date` DATE NOT NULL,
  `receipt_doc` VARCHAR(255) DEFAULT NULL,
  `created_by` INT(11) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`expense_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fee_master` (
  `fee_master_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fee_master_id`),
  UNIQUE KEY `idx_fee_master_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fee_group` (
  `fee_group_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fee_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fee_type` (
  `fee_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `is_optional` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fee_type_id`),
  UNIQUE KEY `idx_fee_type_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fee_discount` (
  `fee_discount_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fee_discount_id`),
  UNIQUE KEY `idx_fee_discount_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `fee_discount` (`name`, `code`, `description`)
SELECT 'RKS Discount 1', 'rksdisc01', 'Student fee discount'
WHERE NOT EXISTS (SELECT 1 FROM `fee_discount` WHERE `code` = 'rksdisc01');

INSERT INTO `fee_discount` (`name`, `code`, `description`)
SELECT 'Sibling Discount', 'sibling-disc', 'Sibling enrollment discount'
WHERE NOT EXISTS (SELECT 1 FROM `fee_discount` WHERE `code` = 'sibling-disc');

INSERT INTO `fee_discount` (`name`, `code`, `description`)
SELECT 'Handicapped Discount', 'handicap-disc', 'Special needs fee discount'
WHERE NOT EXISTS (SELECT 1 FROM `fee_discount` WHERE `code` = 'handicap-disc');

INSERT INTO `fee_discount` (`name`, `code`, `description`)
SELECT 'Class Topper Discount', 'cls-top-disc', 'Academic achievement discount'
WHERE NOT EXISTS (SELECT 1 FROM `fee_discount` WHERE `code` = 'cls-top-disc');

INSERT INTO `fee_master` (`name`, `code`, `amount`, `description`)
SELECT 'Tuition Fee', 'TUITION', 2500.00, 'Monthly class tuition'
WHERE NOT EXISTS (SELECT 1 FROM `fee_master` WHERE `code` = 'TUITION');

INSERT INTO `fee_master` (`name`, `code`, `amount`, `description`)
SELECT 'Lab Fee', 'LAB', 800.00, 'Science and computer lab'
WHERE NOT EXISTS (SELECT 1 FROM `fee_master` WHERE `code` = 'LAB');

INSERT INTO `fee_master` (`name`, `code`, `amount`, `description`)
SELECT 'Transport Fee', 'TRANSPORT', 1200.00, 'School transport pass'
WHERE NOT EXISTS (SELECT 1 FROM `fee_master` WHERE `code` = 'TRANSPORT');

INSERT INTO `fee_group` (`name`, `description`, `amount`)
SELECT 'Primary Annual', 'Foundation classes fee group', 3600.00
WHERE NOT EXISTS (SELECT 1 FROM `fee_group` WHERE `name` = 'Primary Annual');

INSERT INTO `fee_group` (`name`, `description`, `amount`)
SELECT 'Middle School', 'Middle section annual fees', 4200.00
WHERE NOT EXISTS (SELECT 1 FROM `fee_group` WHERE `name` = 'Middle School');

INSERT INTO `fee_group` (`name`, `description`, `amount`)
SELECT 'Boarding', 'Hostel and boarding fee group', 9800.00
WHERE NOT EXISTS (SELECT 1 FROM `fee_group` WHERE `name` = 'Boarding');

INSERT INTO `fee_type` (`name`, `code`, `is_optional`)
SELECT 'Tuition', 'TUI', 0
WHERE NOT EXISTS (SELECT 1 FROM `fee_type` WHERE `code` = 'TUI');

INSERT INTO `fee_type` (`name`, `code`, `is_optional`)
SELECT 'Exam', 'EXM', 1
WHERE NOT EXISTS (SELECT 1 FROM `fee_type` WHERE `code` = 'EXM');

INSERT INTO `fee_type` (`name`, `code`, `is_optional`)
SELECT 'Library', 'LIB', 0
WHERE NOT EXISTS (SELECT 1 FROM `fee_type` WHERE `code` = 'LIB');

CREATE TABLE IF NOT EXISTS `library_issues` (
  `issue_id` INT(11) NOT NULL AUTO_INCREMENT,
  `book_id` INT(11) NOT NULL,
  `borrower_type` ENUM('student', 'teacher') DEFAULT 'student',
  `student_id` INT(11) DEFAULT NULL,
  `teacher_id` INT(11) DEFAULT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE DEFAULT NULL,
  `fine_amount` DECIMAL(10,2) DEFAULT 0.00,
  `status` ENUM('issued', 'returned', 'overdue', 'lost') DEFAULT 'issued',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `log_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `user_type` VARCHAR(50) DEFAULT 'admin',
  `user_name` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `record_id` VARCHAR(50) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `old_values` JSON DEFAULT NULL,
  `new_values` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Clean up and recalculate any inconsistent invoice due balances
UPDATE `invoice` 
SET `due` = GREATEST(0.00, `amount` - `discount` - `amount_paid`),
    `status` = CASE 
      WHEN `amount_paid` >= (`amount` - `discount`) THEN 'paid'
      WHEN `amount_paid` > 0 THEN 'partially_paid'
      ELSE 'unpaid'
    END
WHERE `invoice_id` > 0;

-- 4. Enterprise AI Chatbot Persistence & Logging Tables
CREATE TABLE IF NOT EXISTS `chat_conversations` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `user_type` VARCHAR(50) DEFAULT 'guest',
  `role` VARCHAR(50) DEFAULT 'guest',
  `title` VARCHAR(255) DEFAULT 'New Conversation',
  `context_json` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_conv_user` (`user_id`, `role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` VARCHAR(64) NOT NULL,
  `role` ENUM('user','assistant','system') NOT NULL,
  `message` LONGTEXT NOT NULL,
  `tool_name` VARCHAR(100) DEFAULT NULL,
  `sources_json` LONGTEXT DEFAULT NULL,
  `metadata` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_msg_conv` (`conversation_id`),
  CONSTRAINT `fk_chat_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_tool_calls` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` VARCHAR(64) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `tool_name` VARCHAR(100) NOT NULL,
  `input_params` LONGTEXT DEFAULT NULL,
  `output_summary` LONGTEXT DEFAULT NULL,
  `execution_time_ms` INT(11) DEFAULT 0,
  `success` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tool_conv` (`conversation_id`),
  KEY `idx_tool_name` (`tool_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_feedback` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `message_id` INT(11) DEFAULT NULL,
  `conversation_id` VARCHAR(64) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `rating` ENUM('helpful','unhelpful') NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fb_conv` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Knowledge Base & RAG Tables
CREATE TABLE IF NOT EXISTS `knowledge_documents` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `source_type` ENUM('policy','manual','faq','admission_doc','curriculum','general') DEFAULT 'general',
  `content` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kdoc_cat` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `knowledge_chunks` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `document_id` INT(11) NOT NULL,
  `chunk_text` LONGTEXT NOT NULL,
  `keywords` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kchunk_doc` (`document_id`),
  CONSTRAINT `fk_kchunk_doc` FOREIGN KEY (`document_id`) REFERENCES `knowledge_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


