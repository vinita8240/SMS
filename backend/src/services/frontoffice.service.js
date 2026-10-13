const pool = require('../config/db');

class FrontOfficeService {
  constructor() {
    this.initTables();
  }

  async initTables() {
    try {
      // 1. Admission Enquiries
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`front_office_enquiry\` (
          \`enquiry_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(191) NOT NULL,
          \`phone\` VARCHAR(50) NOT NULL,
          \`email\` VARCHAR(191) DEFAULT NULL,
          \`address\` TEXT DEFAULT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`note\` TEXT DEFAULT NULL,
          \`date\` DATE DEFAULT NULL,
          \`next_follow_up_date\` DATE DEFAULT NULL,
          \`assigned\` VARCHAR(100) DEFAULT 'Receptionist',
          \`reference\` VARCHAR(100) DEFAULT 'Direct Visit',
          \`source\` VARCHAR(100) DEFAULT 'Walk-in',
          \`class_id\` INT DEFAULT NULL,
          \`class_name\` VARCHAR(100) DEFAULT NULL,
          \`no_of_child\` INT DEFAULT 1,
          \`status\` VARCHAR(50) DEFAULT 'Active',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Visitor Book
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`front_office_visitor\` (
          \`visitor_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`purpose\` VARCHAR(150) NOT NULL,
          \`name\` VARCHAR(191) NOT NULL,
          \`phone\` VARCHAR(50) NOT NULL,
          \`id_card\` VARCHAR(100) DEFAULT NULL,
          \`no_of_person\` INT DEFAULT 1,
          \`date\` DATE DEFAULT NULL,
          \`in_time\` VARCHAR(50) DEFAULT NULL,
          \`out_time\` VARCHAR(50) DEFAULT NULL,
          \`note\` TEXT DEFAULT NULL,
          \`status\` VARCHAR(50) DEFAULT 'In School',
          \`file_name\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 3. Phone Call Log
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`front_office_call_log\` (
          \`call_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(191) NOT NULL,
          \`phone\` VARCHAR(50) NOT NULL,
          \`date\` DATE DEFAULT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`next_follow_up_date\` DATE DEFAULT NULL,
          \`call_duration\` VARCHAR(50) DEFAULT '2 mins',
          \`note\` TEXT DEFAULT NULL,
          \`call_type\` VARCHAR(50) DEFAULT 'Incoming',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 4. Postal Dispatch
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`front_office_dispatch\` (
          \`dispatch_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`to_title\` VARCHAR(191) NOT NULL,
          \`reference_no\` VARCHAR(100) DEFAULT NULL,
          \`address\` TEXT DEFAULT NULL,
          \`note\` TEXT DEFAULT NULL,
          \`from_title\` VARCHAR(191) DEFAULT NULL,
          \`date\` DATE DEFAULT NULL,
          \`file_name\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 5. Postal Receive
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`front_office_receive\` (
          \`receive_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`from_title\` VARCHAR(191) NOT NULL,
          \`reference_no\` VARCHAR(100) DEFAULT NULL,
          \`address\` TEXT DEFAULT NULL,
          \`note\` TEXT DEFAULT NULL,
          \`to_title\` VARCHAR(191) DEFAULT NULL,
          \`date\` DATE DEFAULT NULL,
          \`file_name\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 6. Complain / Grievance
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`front_office_complain\` (
          \`complain_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`complain_type\` VARCHAR(100) NOT NULL,
          \`source\` VARCHAR(100) DEFAULT 'Front Desk',
          \`complain_by\` VARCHAR(191) NOT NULL,
          \`phone\` VARCHAR(50) DEFAULT NULL,
          \`date\` DATE DEFAULT NULL,
          \`description\` TEXT NOT NULL,
          \`action_taken\` TEXT DEFAULT NULL,
          \`assigned\` VARCHAR(100) DEFAULT 'Principal',
          \`status\` VARCHAR(50) DEFAULT 'Pending',
          \`file_name\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 7. Setup Front Office (Purpose, Complain Type, Source, Reference)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`front_office_setup\` (
          \`setup_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`setup_type\` ENUM('purpose', 'complain_type', 'source', 'reference') NOT NULL,
          \`name\` VARCHAR(150) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Seed initial setup data if empty
      const [setupCount] = await pool.query(`SELECT COUNT(*) AS total FROM front_office_setup`);
      if (setupCount[0].total === 0) {
        await pool.query(`
          INSERT INTO front_office_setup (setup_type, name, description) VALUES
          ('purpose', 'Academic Admission', 'Visiting for new student admission enquiry'),
          ('purpose', 'Fee Submission', 'Paying tuition or transport fees'),
          ('purpose', 'Parent Teacher Meeting', 'Meeting with class coordinator/teacher'),
          ('purpose', 'Vendor / Supplier', 'Delivery and supplies discussion'),
          ('purpose', 'General Enquiry', 'General campus queries'),
          ('complain_type', 'Transport & Bus Route', 'Issues regarding bus delays or routes'),
          ('complain_type', 'Academic & Homework', 'Concerns about class curriculum or homework'),
          ('complain_type', 'Cafeteria & Food', 'Feedback on cafeteria meals'),
          ('complain_type', 'Fee & Accounts', 'Queries on fees receipt and billing'),
          ('complain_type', 'Discipline & Conduct', 'Student conduct and bullying reports'),
          ('source', 'Online Website', 'Lead from school dynamic website portal'),
          ('source', 'Social Media', 'Facebook, Instagram, LinkedIn campaign'),
          ('source', 'Newspaper / Banner', 'City hoarding and print media'),
          ('source', 'Parent Referral', 'Recommended by existing enrolled student parent'),
          ('source', 'Walk-in Desk', 'Direct front desk walk-in'),
          ('reference', 'School Principal', 'Referred by principal office'),
          ('reference', 'Senior Teacher', 'Teacher recommendation'),
          ('reference', 'Alumni Association', 'Referred by school alumnus'),
          ('reference', 'Management Board', 'Trustee or board reference')
        `);
      }

      // Seed initial demo data for enquiries if empty
      const [enqCount] = await pool.query(`SELECT COUNT(*) AS total FROM front_office_enquiry`);
      if (enqCount[0].total === 0) {
        await pool.query(`
          INSERT INTO front_office_enquiry (name, phone, email, address, description, date, next_follow_up_date, assigned, reference, source, class_name, no_of_child, status) VALUES
          ('David Miller', '9876543210', 'david.miller@example.com', '124 Park Avenue, Springfield', 'Enquiring for Grade 5 Science curriculum & bus pickup', '2026-09-20', '2026-09-26', 'Sarah Adams', 'School Website', 'Online Website', 'Grade 5', 1, 'Active'),
          ('Anita Sharma', '9812345678', 'anita.s@example.com', 'Flat 402, Green Valley Apartments', 'Looking for Grade 1 admission with day boarding option', '2026-09-18', '2026-09-25', 'John Walker', 'Parent Referral', 'Parent Referral', 'Grade 1', 1, 'Active'),
          ('Robert Chen', '9822334455', 'rchen@example.com', '78 River Road, North City', 'High school Grade 10 transfer from international school', '2026-09-15', '2026-09-22', 'Sarah Adams', 'Direct Visit', 'Walk-in Desk', 'Grade 10', 1, 'Won')
        `);
      }

      // Seed initial visitors if empty
      const [visCount] = await pool.query(`SELECT COUNT(*) AS total FROM front_office_visitor`);
      if (visCount[0].total === 0) {
        await pool.query(`
          INSERT INTO front_office_visitor (purpose, name, phone, id_card, no_of_person, date, in_time, out_time, note, status) VALUES
          ('Academic Admission', 'Carlos Gomez', '9778899001', 'DL-88392019', 2, '2026-09-24', '09:30 AM', '10:45 AM', 'Met with admission counselor Ms. Sarah', 'Checked Out'),
          ('Parent Teacher Meeting', 'Linda Wright', '9665544332', 'PASSPORT-A992', 1, '2026-09-24', '10:15 AM', NULL, 'Discussion regarding Grade 7 Mathematics progress', 'In School'),
          ('Vendor / Supplier', 'Michael Scott', '9554433221', 'EMP-VEND-302', 1, '2026-09-24', '11:00 AM', NULL, 'Stationery supply invoice sign-off', 'In School')
        `);
      }

      // Seed initial calls if empty
      const [callCount] = await pool.query(`SELECT COUNT(*) AS total FROM front_office_call_log`);
      if (callCount[0].total === 0) {
        await pool.query(`
          INSERT INTO front_office_call_log (name, phone, date, description, next_follow_up_date, call_duration, note, call_type) VALUES
          ('Dr. Patricia Hall', '9845012345', '2026-09-24', 'Inquired about upcoming Term 1 Examination dates', '2026-09-28', '3 mins 40 sec', 'Provided link to academic calendar', 'Incoming'),
          ('James Wilson', '9712398765', '2026-09-24', 'Called regarding admission verification documents', '2026-09-25', '4 mins 10 sec', 'Parent will submit transfer certificate tomorrow', 'Outgoing')
        `);
      }

      // Seed initial dispatch & receive if empty
      const [dispCount] = await pool.query(`SELECT COUNT(*) AS total FROM front_office_dispatch`);
      if (dispCount[0].total === 0) {
        await pool.query(`
          INSERT INTO front_office_dispatch (to_title, reference_no, address, note, from_title, date) VALUES
          ('State Board of Education', 'DSP-2026-098', 'Office of Secondary Education, Capital City', 'Annual Affiliation Renewal Docket', 'Principal Office', '2026-09-22'),
          ('City Police Headquarters', 'DSP-2026-099', 'Traffic & Transport Wing, City Center', 'Annual School Bus Route Intimation', 'Transport Coordinator', '2026-09-23')
        `);
      }

      const [recvCount] = await pool.query(`SELECT COUNT(*) AS total FROM front_office_receive`);
      if (recvCount[0].total === 0) {
        await pool.query(`
          INSERT INTO front_office_receive (from_title, reference_no, address, note, to_title, date) VALUES
          ('National Science Olympiad Committee', 'RCV-NSO-4410', '12 Olympiad Complex, National Hub', 'Olympiad Student Entry Passes & Roll Badges', 'Exam Department', '2026-09-21'),
          ('Ministry of Sports & Youth Affairs', 'RCV-SPORTS-889', 'Government Sports Authority', 'Inter-School Football Championship Invitation', 'Sports Director', '2026-09-23')
        `);
      }

      // Seed initial complaints if empty
      const [compCount] = await pool.query(`SELECT COUNT(*) AS total FROM front_office_complain`);
      if (compCount[0].total === 0) {
        await pool.query(`
          INSERT INTO front_office_complain (complain_type, source, complain_by, phone, date, description, action_taken, assigned, status) VALUES
          ('Transport & Bus Route', 'Front Desk', 'Marcus Vance', '9812903847', '2026-09-21', 'Route 4 Bus was 20 minutes delayed at Sector 9 pickup stop', 'Driver warned and route timing updated via GPS tracker', 'Mr. Robert (Transport Head)', 'Resolved'),
          ('Cafeteria & Food', 'Online Portal', 'Elena Rostova', '9718293041', '2026-09-23', 'Requests more fruit choices in middle school lunch canteen', 'Forwarded to head chef for weekly menu revision', 'Cafeteria Manager', 'In Progress')
        `);
      }
    } catch (err) {
      console.error('[FrontOfficeService] initTables warning:', err.message);
    }
  }

  // --- Enquiries ---
  async getEnquiries(filters = {}) {
    let sql = 'SELECT * FROM front_office_enquiry WHERE 1=1';
    const params = [];
    if (filters.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR class_name LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }
    sql += ' ORDER BY enquiry_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createEnquiry(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO front_office_enquiry (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM front_office_enquiry WHERE enquiry_id = ?', [result.insertId]);
    return rows[0];
  }

  async updateEnquiry(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE front_office_enquiry SET ${setClause} WHERE enquiry_id = ?`, [...values, id]);
    const [rows] = await pool.query('SELECT * FROM front_office_enquiry WHERE enquiry_id = ?', [id]);
    return rows[0];
  }

  async deleteEnquiry(id) {
    await pool.query('DELETE FROM front_office_enquiry WHERE enquiry_id = ?', [id]);
    return { success: true };
  }

  // --- Visitors ---
  async getVisitors(filters = {}) {
    let sql = 'SELECT * FROM front_office_visitor WHERE 1=1';
    const params = [];
    if (filters.search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR purpose LIKE ? OR id_card LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }
    if (filters.date) {
      sql += ' AND date = ?';
      params.push(filters.date);
    }
    sql += ' ORDER BY visitor_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createVisitor(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO front_office_visitor (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM front_office_visitor WHERE visitor_id = ?', [result.insertId]);
    return rows[0];
  }

  async updateVisitor(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE front_office_visitor SET ${setClause} WHERE visitor_id = ?`, [...values, id]);
    const [rows] = await pool.query('SELECT * FROM front_office_visitor WHERE visitor_id = ?', [id]);
    return rows[0];
  }

  async deleteVisitor(id) {
    await pool.query('DELETE FROM front_office_visitor WHERE visitor_id = ?', [id]);
    return { success: true };
  }

  // --- Phone Call Logs ---
  async getCallLogs(filters = {}) {
    let sql = 'SELECT * FROM front_office_call_log WHERE 1=1';
    const params = [];
    if (filters.call_type && filters.call_type !== 'all') {
      sql += ' AND call_type = ?';
      params.push(filters.call_type);
    }
    if (filters.search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR description LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }
    sql += ' ORDER BY call_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createCallLog(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO front_office_call_log (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM front_office_call_log WHERE call_id = ?', [result.insertId]);
    return rows[0];
  }

  async updateCallLog(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE front_office_call_log SET ${setClause} WHERE call_id = ?`, [...values, id]);
    const [rows] = await pool.query('SELECT * FROM front_office_call_log WHERE call_id = ?', [id]);
    return rows[0];
  }

  async deleteCallLog(id) {
    await pool.query('DELETE FROM front_office_call_log WHERE call_id = ?', [id]);
    return { success: true };
  }

  // --- Postal Dispatch ---
  async getDispatches(filters = {}) {
    let sql = 'SELECT * FROM front_office_dispatch WHERE 1=1';
    const params = [];
    if (filters.search) {
      sql += ' AND (to_title LIKE ? OR reference_no LIKE ? OR from_title LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }
    sql += ' ORDER BY dispatch_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createDispatch(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO front_office_dispatch (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM front_office_dispatch WHERE dispatch_id = ?', [result.insertId]);
    return rows[0];
  }

  async updateDispatch(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE front_office_dispatch SET ${setClause} WHERE dispatch_id = ?`, [...values, id]);
    const [rows] = await pool.query('SELECT * FROM front_office_dispatch WHERE dispatch_id = ?', [id]);
    return rows[0];
  }

  async deleteDispatch(id) {
    await pool.query('DELETE FROM front_office_dispatch WHERE dispatch_id = ?', [id]);
    return { success: true };
  }

  // --- Postal Receive ---
  async getReceives(filters = {}) {
    let sql = 'SELECT * FROM front_office_receive WHERE 1=1';
    const params = [];
    if (filters.search) {
      sql += ' AND (from_title LIKE ? OR reference_no LIKE ? OR to_title LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }
    sql += ' ORDER BY receive_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createReceive(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO front_office_receive (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM front_office_receive WHERE receive_id = ?', [result.insertId]);
    return rows[0];
  }

  async updateReceive(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE front_office_receive SET ${setClause} WHERE receive_id = ?`, [...values, id]);
    const [rows] = await pool.query('SELECT * FROM front_office_receive WHERE receive_id = ?', [id]);
    return rows[0];
  }

  async deleteReceive(id) {
    await pool.query('DELETE FROM front_office_receive WHERE receive_id = ?', [id]);
    return { success: true };
  }

  // --- Complaints ---
  async getComplaints(filters = {}) {
    let sql = 'SELECT * FROM front_office_complain WHERE 1=1';
    const params = [];
    if (filters.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      sql += ' AND (complain_by LIKE ? OR complain_type LIKE ? OR phone LIKE ? OR description LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }
    sql += ' ORDER BY complain_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createComplaint(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO front_office_complain (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM front_office_complain WHERE complain_id = ?', [result.insertId]);
    return rows[0];
  }

  async updateComplaint(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE front_office_complain SET ${setClause} WHERE complain_id = ?`, [...values, id]);
    const [rows] = await pool.query('SELECT * FROM front_office_complain WHERE complain_id = ?', [id]);
    return rows[0];
  }

  async deleteComplaint(id) {
    await pool.query('DELETE FROM front_office_complain WHERE complain_id = ?', [id]);
    return { success: true };
  }

  // --- Front Office Setup ---
  async getSetups(type) {
    let sql = 'SELECT * FROM front_office_setup';
    const params = [];
    if (type) {
      sql += ' WHERE setup_type = ?';
      params.push(type);
    }
    sql += ' ORDER BY setup_id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createSetup(data) {
    const [result] = await pool.query(
      'INSERT INTO front_office_setup (setup_type, name, description) VALUES (?, ?, ?)',
      [data.setup_type, data.name, data.description || '']
    );
    const [rows] = await pool.query('SELECT * FROM front_office_setup WHERE setup_id = ?', [result.insertId]);
    return rows[0];
  }

  async updateSetup(id, data) {
    await pool.query(
      'UPDATE front_office_setup SET name = ?, description = ? WHERE setup_id = ?',
      [data.name, data.description || '', id]
    );
    const [rows] = await pool.query('SELECT * FROM front_office_setup WHERE setup_id = ?', [id]);
    return rows[0];
  }

  async deleteSetup(id) {
    await pool.query('DELETE FROM front_office_setup WHERE setup_id = ?', [id]);
    return { success: true };
  }
}

module.exports = new FrontOfficeService();
