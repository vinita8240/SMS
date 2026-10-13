const BaseRepository = require('./base.repository');

class AttendanceRepository extends BaseRepository {
  constructor() {
    super('attendance', 'attendance_id');
  }

  async getClassAttendance(classId, sectionId, date) {
    const sql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name AS student_name, s.gender, s.file_name,
        COALESCE(a.status, 0) AS attendance_status,
        a.attendance_id,
        a.remarks,
        a.date
      FROM student s
      LEFT JOIN attendance a ON s.student_id = a.student_id AND a.date = ?
      WHERE s.class_id = ? AND s.section_id = ? AND s.status = 'active'
      ORDER BY CAST(s.roll_no AS UNSIGNED) ASC, s.name ASC
    `;
    const [rows] = await this.pool.query(sql, [date, classId, sectionId]);
    return rows;
  }

  async saveBulkAttendance(classId, sectionId, date, records) {
    return this.withTransaction(async (conn) => {
      const timestamp = Date.now();
      for (const rec of records) {
        const checkSql = `SELECT attendance_id FROM attendance WHERE student_id = ? AND date = ?`;
        const [existing] = await conn.query(checkSql, [rec.student_id, date]);

        if (existing.length > 0) {
          await conn.query(
            `UPDATE attendance SET status = ?, remarks = ?, class_id = ?, section_id = ?, timestamp = ? WHERE attendance_id = ?`,
            [rec.status, rec.remarks || null, classId, sectionId, timestamp, existing[0].attendance_id]
          );
        } else {
          await conn.query(
            `INSERT INTO attendance (student_id, class_id, section_id, date, status, remarks, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [rec.student_id, classId, sectionId, date, rec.status, rec.remarks || null, timestamp]
          );
        }
      }
      return true;
    });
  }

  async getStudentMonthlyAttendance(studentId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const sql = `
      SELECT attendance_id, date, status, remarks
      FROM attendance
      WHERE student_id = ? AND date BETWEEN ? AND ?
      ORDER BY date ASC
    `;
    const [rows] = await this.pool.query(sql, [studentId, startDate, endDate]);

    const summarySql = `
      SELECT 
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS absent_days,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS late_days,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) AS half_days,
        SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) AS holidays,
        COUNT(*) AS total_recorded_days
      FROM attendance
      WHERE student_id = ? AND date BETWEEN ? AND ?
    `;
    const [summary] = await this.pool.query(summarySql, [studentId, startDate, endDate]);

    return {
      records: rows,
      summary: summary[0]
    };
  }

  async getAttendanceReport(classId, sectionId, startDate, endDate) {
    const sql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name AS student_name,
        SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 2 THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN a.status = 3 THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN a.status = 4 THEN 1 ELSE 0 END) AS half_day_count,
        COUNT(a.attendance_id) AS total_marked,
        ROUND((SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2) AS percentage
      FROM student s
      LEFT JOIN attendance a ON s.student_id = a.student_id AND a.date BETWEEN ? AND ?
      WHERE s.class_id = ? AND s.section_id = ? AND s.status = 'active'
      GROUP BY s.student_id, s.admission_no, s.roll_no, s.name
      ORDER BY CAST(s.roll_no AS UNSIGNED) ASC
    `;
    const [rows] = await this.pool.query(sql, [startDate, endDate, classId, sectionId]);
    return rows;
  }
}

module.exports = new AttendanceRepository();
