const bcrypt = require('bcryptjs');
const studentRepo = require('../repositories/student.repository');
const pool = require('../config/db');
const xlsx = require('xlsx');

class StudentService {
    constructor() {
        this.initExtendedTables();
    }

    async initExtendedTables() {
        try {
            // 1. Student Category Table
            await pool.query(`
        CREATE TABLE IF NOT EXISTS \`student_category\` (
          \`student_category_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(100) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

            // 2. House Table
            await pool.query(`
        CREATE TABLE IF NOT EXISTS \`house\` (
          \`house_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(100) NOT NULL,
          \`color_code\` VARCHAR(20) DEFAULT '#705ec8',
          \`house_master\` VARCHAR(100) DEFAULT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

            // 3. Disable Reason Table
            await pool.query(`
        CREATE TABLE IF NOT EXISTS \`disable_reason\` (
          \`disable_reason_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(191) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

            // 4. Online Admission Table
            await pool.query(`
        CREATE TABLE IF NOT EXISTS \`online_admission\` (
          \`online_admission_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`reference_no\` VARCHAR(100) NOT NULL,
          \`student_name\` VARCHAR(191) NOT NULL,
          \`class_id\` INT DEFAULT NULL,
          \`class_name\` VARCHAR(100) DEFAULT NULL,
          \`gender\` VARCHAR(20) DEFAULT 'Male',
          \`birthday\` DATE DEFAULT NULL,
          \`father_name\` VARCHAR(191) DEFAULT NULL,
          \`mother_name\` VARCHAR(191) DEFAULT NULL,
          \`phone\` VARCHAR(50) NOT NULL,
          \`email\` VARCHAR(191) DEFAULT NULL,
          \`address\` TEXT DEFAULT NULL,
          \`submission_date\` DATE DEFAULT NULL,
          \`status\` ENUM('Submitted', 'Under Review', 'Approved', 'Enrolled', 'Rejected') DEFAULT 'Submitted',
          \`notes\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

            // Seed initial Categories if empty
            const [catCount] = await pool.query(`SELECT COUNT(*) AS total FROM student_category`);
            if (catCount[0].total === 0) {
                await pool.query(`
          INSERT INTO student_category (name, description) VALUES
          ('General', 'Standard general admission category'),
          ('OBC (Other Backward Classes)', 'Reserved category for other backward classes'),
          ('SC / ST', 'Scheduled Caste / Scheduled Tribe reservation'),
          ('EWS (Economically Weaker Section)', 'Financial assistance quota'),
          ('Special Needs & Inclusion', 'Differently abled with specialized learning support'),
          ('Sports & Cultural Quota', 'Excellence in athletics, music or fine arts')
        `);
            }

            // Seed initial Houses if empty
            const [houseCount] = await pool.query(`SELECT COUNT(*) AS total FROM house`);
            if (houseCount[0].total === 0) {
                await pool.query(`
          INSERT INTO house (name, color_code, house_master, description) VALUES
          ('Red Dragons', '#ef4444', 'Mr. Robert Vance', 'Symbolizing bravery, endurance and vibrant energy'),
          ('Blue Phoenix', '#3b82f6', 'Ms. Sarah Jenkins', 'Symbolizing intellect, wisdom and resilience'),
          ('Green Hawks', '#10b981', 'Mr. David Miller', 'Symbolizing growth, harmony and team leadership'),
          ('Yellow Lions', '#f59e0b', 'Mrs. Emily Clark', 'Symbolizing solar strength, courage and enthusiasm')
        `);
            }

            // Seed initial Disable Reasons if empty
            const [drCount] = await pool.query(`SELECT COUNT(*) AS total FROM disable_reason`);
            if (drCount[0].total === 0) {
                await pool.query(`
          INSERT INTO disable_reason (name, description) VALUES
          ('Transferred to another school', 'Family relocated or student moved to a different institution'),
          ('Graduated / Completed Education', 'Successfully finished final high school session'),
          ('Long-term Medical Leave', 'Temporarily inactive due to health or medical treatment'),
          ('Financial Fee Default', 'Account suspended pending outstanding fee clearance'),
          ('Disciplinary Suspension', 'Administrative temporary or permanent suspension')
        `);
            }

            // Seed initial Online Admissions if empty
            const [oaCount] = await pool.query(`SELECT COUNT(*) AS total FROM online_admission`);
            if (oaCount[0].total === 0) {
                await pool.query(`
          INSERT INTO online_admission (reference_no, student_name, class_name, gender, birthday, father_name, phone, email, address, submission_date, status, notes) VALUES
          ('APP-2026-8901', 'Oliver Queen', 'Grade 1', 'Male', '2020-04-12', 'Robert Queen', '9812300001', 'oliver.q@example.com', 'Star City Heights', '2026-09-21', 'Submitted', 'Application submitted with birth certificate attachment'),
          ('APP-2026-8902', 'Diana Prince', 'Grade 6', 'Female', '2015-08-20', 'Hippolyta Prince', '9812300002', 'diana.p@example.com', 'Paradise Island St, Metropolis', '2026-09-22', 'Under Review', 'Prior grade report verified with 95% average score'),
          ('APP-2026-8903', 'Bruce Wayne', 'Grade 9', 'Male', '2012-02-19', 'Thomas Wayne', '9812300003', 'bruce.w@example.com', 'Wayne Manor, Gotham Valley', '2026-09-23', 'Approved', 'Interview cleared with academic director')
        `);
            }
        } catch (err) {
            console.error('[StudentService] initExtendedTables warning:', err.message);
        }
    }

    async getStudents(filters) {
        return studentRepo.getFilteredStudents(filters);
    }

    async getStudentById(id) {
        const student = await studentRepo.getStudentProfile(id);
        if (!student) throw { statusCode: 404, message: 'Student not found' };
        delete student.password;
        return student;
    }

    async createStudent(data) {
        if (data.first_name) {
            data.name = `${data.first_name} ${data.last_name || ''}`.trim();
        } else if (data.name) {
            data.first_name = data.name.split(' ')[0] || data.name;
            data.last_name = data.name.split(' ').slice(1).join(' ') || '';
        }

        if (!data.name || !data.class_id) {
            throw { statusCode: 400, message: 'First Name / Name and Class are required fields' };
        }

        // Auto generate admission number if not provided
        if (!data.admission_no) {
            data.admission_no = `ADM-${Date.now().toString().slice(-6)}`;
        }

        // Default student password if provided
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            data.password = await bcrypt.hash('student123', 10);
        }

        const insertId = await studentRepo.create(data);
        return studentRepo.getStudentProfile(insertId);
    }

    async updateStudent(id, data) {
        const existing = await studentRepo.findById(id);
        if (!existing) throw { statusCode: 404, message: 'Student not found' };

        if (data.first_name) {
            data.name = `${data.first_name} ${data.last_name || ''}`.trim();
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            delete data.password;
        }

        await studentRepo.update(id, data);
        return studentRepo.getStudentProfile(id);
    }

    async deleteStudent(id) {
        const existing = await studentRepo.findById(id);
        if (!existing) throw { statusCode: 404, message: 'Student not found' };
        return studentRepo.delete(id);
    }

    async promoteStudents(studentIds, targetClassId, targetSectionId, newSession) {
        if (!Array.isArray(studentIds) || studentIds.length === 0 || !targetClassId || !targetSectionId) {
            throw { statusCode: 400, message: 'Target class, section, and student list are required' };
        }
        return studentRepo.promoteStudents(studentIds, targetClassId, targetSectionId, newSession || '2026-2027');
    }

    // --- Extended Features: Categories ---
    async getCategories() {
        const [rows] = await pool.query(`
      SELECT sc.*, COUNT(s.student_id) AS student_count 
      FROM student_category sc 
      LEFT JOIN student s ON (s.student_category_id = sc.student_category_id OR s.religion = sc.name) 
      GROUP BY sc.student_category_id
      ORDER BY sc.student_category_id ASC
    `);
        return rows;
    }

    async createCategory(data) {
        const [result] = await pool.query('INSERT INTO student_category (name, description) VALUES (?, ?)', [data.name, data.description || '']);
        const [rows] = await pool.query('SELECT * FROM student_category WHERE student_category_id = ?', [result.insertId]);
        return rows[0];
    }

    async updateCategory(id, data) {
        await pool.query('UPDATE student_category SET name = ?, description = ? WHERE student_category_id = ?', [data.name, data.description || '', id]);
        const [rows] = await pool.query('SELECT * FROM student_category WHERE student_category_id = ?', [id]);
        return rows[0];
    }

    async deleteCategory(id) {
        await pool.query('DELETE FROM student_category WHERE student_category_id = ?', [id]);
        return { success: true };
    }

    // --- Extended Features: Houses ---
    async getHouses() {
        const [rows] = await pool.query(`
      SELECT h.*, COUNT(s.student_id) AS student_count 
      FROM house h 
      LEFT JOIN student s ON s.house_id = h.house_id 
      GROUP BY h.house_id
      ORDER BY h.house_id ASC
    `);
        return rows;
    }

    async createHouse(data) {
        const [result] = await pool.query(
            'INSERT INTO house (name, color_code, house_master, description) VALUES (?, ?, ?, ?)', [data.name, data.color_code || '#705ec8', data.house_master || '', data.description || '']
        );
        const [rows] = await pool.query('SELECT * FROM house WHERE house_id = ?', [result.insertId]);
        return rows[0];
    }

    async updateHouse(id, data) {
        await pool.query(
            'UPDATE house SET name = ?, color_code = ?, house_master = ?, description = ? WHERE house_id = ?', [data.name, data.color_code || '#705ec8', data.house_master || '', data.description || '', id]
        );
        const [rows] = await pool.query('SELECT * FROM house WHERE house_id = ?', [id]);
        return rows[0];
    }

    async deleteHouse(id) {
        await pool.query('DELETE FROM house WHERE house_id = ?', [id]);
        return { success: true };
    }

    // --- Extended Features: Disable Reasons ---
    async getDisableReasons() {
        const [rows] = await pool.query(`
      SELECT dr.*, COUNT(s.student_id) AS student_count 
      FROM disable_reason dr 
      LEFT JOIN student s ON (s.status = 'inactive' OR s.status = 'disabled') 
      GROUP BY dr.disable_reason_id
      ORDER BY dr.disable_reason_id ASC
    `);
        return rows;
    }

    async createDisableReason(data) {
        const [result] = await pool.query('INSERT INTO disable_reason (name, description) VALUES (?, ?)', [data.name, data.description || '']);
        const [rows] = await pool.query('SELECT * FROM disable_reason WHERE disable_reason_id = ?', [result.insertId]);
        return rows[0];
    }

    async updateDisableReason(id, data) {
        await pool.query('UPDATE disable_reason SET name = ?, description = ? WHERE disable_reason_id = ?', [data.name, data.description || '', id]);
        const [rows] = await pool.query('SELECT * FROM disable_reason WHERE disable_reason_id = ?', [id]);
        return rows[0];
    }

    async deleteDisableReason(id) {
        await pool.query('DELETE FROM disable_reason WHERE disable_reason_id = ?', [id]);
        return { success: true };
    }

    // --- Extended Features: Online Admissions ---
    async getOnlineAdmissions(filters = {}) {
        let sql = 'SELECT * FROM online_admission WHERE 1=1';
        const params = [];
        if (filters.status && filters.status !== 'all') {
            sql += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.search) {
            sql += ' AND (student_name LIKE ? OR reference_no LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }
        sql += ' ORDER BY online_admission_id DESC';
        const [rows] = await pool.query(sql, params);
        return rows;
    }

    async updateOnlineAdmission(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        await pool.query(`UPDATE online_admission SET ${setClause} WHERE online_admission_id = ?`, [...values, id]);
        const [rows] = await pool.query('SELECT * FROM online_admission WHERE online_admission_id = ?', [id]);
        return rows[0];
    }

    async enrollOnlineAdmission(id, admissionData = {}) {
        const [rows] = await pool.query('SELECT * FROM online_admission WHERE online_admission_id = ?', [id]);
        const app = rows[0];
        if (!app) throw { statusCode: 404, message: 'Online admission record not found' };

        // Find class id if not provided
        let classId = admissionData.class_id || app.class_id;
        if (!classId) {
            const [classes] = await pool.query('SELECT class_id FROM class LIMIT 1');
            classId = classes[0] ? classes[0].class_id : 1;
        }

        const [sections] = await pool.query('SELECT section_id FROM section WHERE class_id = ? LIMIT 1', [classId]);
        const sectionId = admissionData.section_id || (sections[0] ? sections[0].section_id : 1);

        const newStudentData = {
            name: app.student_name,
            first_name: app.student_name.split(' ')[0],
            last_name: app.student_name.split(' ').slice(1).join(' ') || '',
            admission_no: `ADM-${Date.now().toString().slice(-6)}`,
            roll_no: Math.floor(10 + Math.random() * 89).toString(),
            class_id: classId,
            section_id: sectionId,
            gender: app.gender || 'Male',
            birthday: app.birthday || '2016-01-01',
            father_name: app.father_name || '',
            mother_name: app.mother_name || '',
            phone: app.phone || '',
            email: app.email || '',
            address: app.address || '',
            session: '2026-27',
            admission_date: new Date().toISOString().slice(0, 10),
            status: 'active'
        };

        const newStudent = await this.createStudent(newStudentData);
        await pool.query("UPDATE online_admission SET status = 'Enrolled' WHERE online_admission_id = ?", [id]);

        return {
            message: 'Student enrolled successfully from online admission application',
            student: newStudent,
            online_admission: {...app, status: 'Enrolled' }
        };
    }

    // --- Extended Features: Batch Actions & Reactivation ---
    async reactivateStudent(id) {
        const [res] = await pool.query("UPDATE student SET status = 'active' WHERE student_id = ?", [id]);
        return { success: res.affectedRows > 0, message: 'Student reactivated successfully' };
    }

    async bulkDeleteStudents(studentIds) {
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            throw { statusCode: 400, message: 'Array of student IDs required' };
        }
        const placeholders = studentIds.map(() => '?').join(', ');
        const [result] = await pool.query(`DELETE FROM student WHERE student_id IN (${placeholders})`, studentIds);
        return { success: true, deletedCount: result.affectedRows };
    }

    async bulkDisableStudents(studentIds) {
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            throw { statusCode: 400, message: 'Array of student IDs required' };
        }
        const placeholders = studentIds.map(() => '?').join(', ');
        const [result] = await pool.query(`UPDATE student SET status = 'disabled' WHERE student_id IN (${placeholders})`, studentIds);
        return { success: true, disabledCount: result.affectedRows };
    }

    // --- Student Import & Sample Generator ---
    getImportSampleCsv() {
        const headers = [
            'admission_no',
            'roll_no',
            'first_name',
            'last_name',
            'gender',
            'birthday',
            'category',
            'religion',
            'caste',
            'phone',
            'email',
            'admission_date',
            'blood_group',
            'house',
            'height',
            'weight',
            'father_name',
            'father_phone',
            'father_occupation',
            'mother_name',
            'mother_phone',
            'mother_occupation',
            'guardian_is',
            'guardian_name',
            'guardian_relation',
            'guardian_phone',
            'guardian_email',
            'guardian_address',
            'address',
            'city',
            'national_id',
            'bank_name',
            'bank_account_no',
            'ifsc_code'
        ];

        const sampleRows = [
            [
                'ADM-2026-001', '101', 'Alexander', 'Wright', 'Male', '2015-04-12', 'General', 'Christian', 'Catholic',
                '9876543210', 'alex.w@example.com', '2026-09-01', 'O+', 'Red Dragons', '135', '32',
                'George Wright', '9876543211', 'Software Engineer', 'Martha Wright', '9876543212', 'Teacher',
                'Father', 'George Wright', 'Father', '9876543211', 'george@example.com', '124 Park Avenue, Springfield',
                '124 Park Avenue', 'Springfield', 'NID-99210', 'State Bank', '1092837461', 'SBIN0001'
            ],
            [
                'ADM-2026-002', '102', 'Sophia', 'Sharma', 'Female', '2015-08-25', 'OBC', 'Hindu', 'Brahmin',
                '9812345678', 'sophia.s@example.com', '2026-09-01', 'A+', 'Blue Phoenix', '130', '29',
                'Rajesh Sharma', '9812345679', 'Medical Doctor', 'Sunita Sharma', '9812345680', 'Architect',
                'Father', 'Rajesh Sharma', 'Father', '9876543279', 'rajesh@example.com', 'Flat 402, Green Valley Apartments',
                'Flat 402, Green Valley', 'North City', 'NID-88341', 'HDFC Bank', '9928374612', 'HDFC0002'
            ],
            [
                'ADM-2026-003', '103', 'Daniel', 'Kim', 'Male', '2015-11-03', 'General', 'Christian', 'Protestant',
                '9845012345', 'daniel.k@example.com', '2026-09-01', 'B+', 'Green Hawks', '138', '34',
                'Min-jun Kim', '9845012346', 'Business Owner', 'Ji-eun Kim', '9845012347', 'Accountant',
                'Mother', 'Ji-eun Kim', 'Mother', '9845012347', 'jieun@example.com', '78 River Road, Metropolis',
                '78 River Road', 'Metropolis', 'NID-77291', 'City Bank', '8837461920', 'CITI0005'
            ]
        ];

        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvLines = [
            headers.join(','),
            ...sampleRows.map(row => row.map(escapeCsv).join(','))
        ];

        return csvLines.join('\r\n');
    }

    async importStudents({ filePath, fileBuffer, class_id, section_id, session }) {
        const classId = Number.parseInt(class_id, 10);
        if (!Number.isInteger(classId) || classId <= 0) {
            throw { statusCode: 400, message: 'Class selection is required for importing students' };
        }

        const requestedSectionId = section_id ? Number.parseInt(section_id, 10) : null;
        const [sections] = await pool.query(
            'SELECT section_id FROM section WHERE class_id = ? ORDER BY section_id LIMIT 1', [classId]
        );
        if (sections.length === 0) {
            throw { statusCode: 400, message: 'The selected class has no section. Create a section before importing students.' };
        }
        if (requestedSectionId) {
            const [matchingSections] = await pool.query(
                'SELECT section_id FROM section WHERE section_id = ? AND class_id = ?', [requestedSectionId, classId]
            );
            if (matchingSections.length === 0) {
                throw { statusCode: 400, message: 'The selected section does not belong to the selected class' };
            }
        }
        const defaultSectionId = requestedSectionId || sections[0].section_id;

        let workbook;
        if (filePath) {
            workbook = xlsx.readFile(filePath);
        } else if (fileBuffer) {
            workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        } else {
            throw { statusCode: 400, message: 'No file uploaded for import' };
        }

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw { statusCode: 400, message: 'Uploaded file has no readable sheets' };
        }

        const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
        if (!rawRows || rawRows.length === 0) {
            throw { statusCode: 400, message: 'The uploaded file is empty or contains no data rows' };
        }

        // Load category and house lookup maps
        const [categories] = await pool.query('SELECT student_category_id, name FROM student_category');
        const categoryMap = new Map();
        categories.forEach(c => categoryMap.set(c.name.toLowerCase().trim(), c.student_category_id));

        const [houses] = await pool.query('SELECT house_id, name FROM house');
        const houseMap = new Map();
        houses.forEach(h => houseMap.set(h.name.toLowerCase().trim(), h.house_id));

        const defaultPassword = await bcrypt.hash('student123', 10);
        const importedStudents = [];
        const errors = [];

        for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];
            const rowNum = i + 2; // +1 for 0-index, +1 for header row

            // Normalize row keys (lowercase, trim, replace spaces/dashes with underscores)
            const normalized = {};
            for (const [key, val] of Object.entries(row)) {
                const cleanKey = key.toLowerCase().trim().replace(/[\s\-]+/g, '_');
                normalized[cleanKey] = typeof val === 'string' ? val.trim() : val;
            }

            // Check name / first_name
            const firstName = normalized.first_name || normalized.firstname || normalized.name || '';
            const lastName = normalized.last_name || normalized.lastname || '';
            if (!firstName) {
                errors.push({ row: rowNum, error: 'Student First Name or Name is required' });
                continue;
            }

            const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName;

            // Admission No
            let admissionNo = normalized.admission_no || normalized.admissionno || normalized.admission_number || '';
            if (!admissionNo) {
                admissionNo = `ADM-${Date.now().toString().slice(-6)}${i}`;
            }

            // Gender
            let gender = 'Male';
            const rawGender = String(normalized.gender || '').toLowerCase();
            if (rawGender.startsWith('f')) gender = 'Female';
            else if (rawGender.startsWith('o')) gender = 'Other';

            // Date helper
            const parseDate = (val) => {
                if (!val) return null;
                if (typeof val === 'number') {
                    // Excel date serial number
                    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                    return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
                }
                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
            };

            const birthday = parseDate(normalized.birthday || normalized.dob || normalized.date_of_birth);
            const admissionDate = parseDate(normalized.admission_date || normalized.admissiondate) || new Date().toISOString().slice(0, 10);

            // Category & House lookups
            let studentCategoryId = null;
            if (normalized.category) {
                studentCategoryId = categoryMap.get(String(normalized.category).toLowerCase().trim()) || null;
            }
            let houseId = null;
            if (normalized.house) {
                houseId = houseMap.get(String(normalized.house).toLowerCase().trim()) || null;
            }

            const studentData = {
                admission_no: admissionNo,
                roll_no: normalized.roll_no ? String(normalized.roll_no) : null,
                name: fullName,
                gender,
                birthday,
                admission_date: admissionDate,
                phone: normalized.phone || normalized.mobile || normalized.mobile_no || null,
                email: normalized.email || null,
                password: defaultPassword,
                class_id: classId,
                section_id: defaultSectionId,
                session: session || normalized.session || '2026-2027',
                student_category_id: studentCategoryId,
                house_id: houseId,
                religion: normalized.religion || null,
                blood_group: normalized.blood_group || null,
                father_name: normalized.father_name || null,
                mother_name: normalized.mother_name || null,
                address: normalized.address || normalized.current_address || null,
                city: normalized.city || null,
                status: 'active'
            };

            try {
                const insertId = await studentRepo.create(studentData);
                importedStudents.push({
                    student_id: insertId,
                    admission_no: admissionNo,
                    name: fullName,
                    roll_no: studentData.roll_no
                });
            } catch (err) {
                errors.push({
                    row: rowNum,
                    admission_no: admissionNo,
                    name: fullName,
                    error: err.sqlMessage || err.message
                });
            }
        }

        return {
            totalRows: rawRows.length,
            importedCount: importedStudents.length,
            failedCount: errors.length,
            importedStudents,
            errors
        };
    }
}

module.exports = new StudentService();