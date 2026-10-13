const pool = require('../../../config/db');

class AttendanceTool {
  async getStudentAttendance(params, startDateArg = null, endDateArg = null) {
    const studentId = typeof params === 'object' ? params?.studentId : params;
    const month = typeof params === 'object' ? (params?.month || null) : null;
    const year = typeof params === 'object' ? (params?.year || null) : null;
    const startDate = typeof params === 'object' ? (params?.startDate || startDateArg) : startDateArg;
    const endDate = typeof params === 'object' ? (params?.endDate || endDateArg) : endDateArg;
    if (!studentId) return null;

    let sql = `
      SELECT 
        COUNT(*) AS total_recorded_days,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) AS half_day,
        SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) AS holiday
      FROM attendance
      WHERE student_id = ?
    `;
    const sqlParams = [studentId];

    if (month && year) {
      sql += ' AND MONTH(date) = ? AND YEAR(date) = ?';
      sqlParams.push(month, year);
    } else if (startDate && endDate) {
      sql += ' AND date BETWEEN ? AND ?';
      sqlParams.push(startDate, endDate);
    }

    const [rows] = await pool.query(sql, sqlParams);
    const stat = rows[0] || {};
    const totalRecorded = parseInt(stat.total_recorded_days || 0, 10);
    const presentCount = parseInt(stat.present || 0, 10);
    const absentCount = parseInt(stat.absent || 0, 10);
    const lateCount = parseInt(stat.late || 0, 10);
    const halfDayCount = parseInt(stat.half_day || 0, 10);
    const holidayCount = parseInt(stat.holiday || 0, 10);

    const workingDays = totalRecorded - holidayCount;
    const effectivePresent = presentCount + (lateCount * 0.8) + (halfDayCount * 0.5);
    const percentage = workingDays > 0 ? ((effectivePresent / workingDays) * 100).toFixed(2) : 100.00;

    // Get recent absent dates
    const [absentDates] = await pool.query(
      `SELECT date, remarks FROM attendance WHERE student_id = ? AND status = 2 ORDER BY date DESC LIMIT 5`,
      [studentId]
    );

    return {
      studentId,
      totalRecordedDays: totalRecorded,
      totalWorkingDays: workingDays,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      halfDay: halfDayCount,
      holidays: holidayCount,
      percentage: parseFloat(percentage),
      recentAbsences: absentDates
    };
  }

  async getClassAttendance(params, sectionIdArg = null, dateArg = null) {
    const classId = typeof params === 'object' ? params?.classId : params;
    const sectionId = typeof params === 'object' ? (params?.sectionId || sectionIdArg) : sectionIdArg;
    const date = typeof params === 'object' ? (params?.date || dateArg) : dateArg;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    let sql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name AS student_name,
        COALESCE(a.status, 0) AS status,
        a.remarks
      FROM student s
      LEFT JOIN attendance a ON s.student_id = a.student_id AND a.date = ?
      WHERE s.class_id = ? AND s.status = 'active'
    `;
    const sqlParams = [targetDate, classId];
    if (sectionId) {
      sql += ' AND s.section_id = ?';
      sqlParams.push(sectionId);
    }
    sql += ' ORDER BY CAST(s.roll_no AS UNSIGNED) ASC, s.name ASC';

    const [rows] = await pool.query(sql, sqlParams);
    const total = rows.length;
    const present = rows.filter(r => r.status === 1).length;
    const absent = rows.filter(r => r.status === 2);
    const late = rows.filter(r => r.status === 3).length;
    const unmarked = rows.filter(r => r.status === 0).length;

    return {
      date: targetDate,
      classId,
      totalStudents: total,
      presentCount: present,
      absentCount: absent.length,
      absentees: absent.map(a => ({ name: a.student_name, roll: a.roll_no, remarks: a.remarks })),
      lateCount: late,
      unmarkedCount: unmarked,
      percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0
    };
  }

  async getSchoolAttendanceSummary(params) {
    const date = typeof params === 'object' ? params?.date : (params || null);
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const [stats] = await pool.query(`
      SELECT 
        COUNT(a.attendance_id) AS total_marked,
        SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 2 THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN a.status = 3 THEN 1 ELSE 0 END) AS late_count
      FROM attendance a
      WHERE a.date = ?
    `, [targetDate]);

    const [totalActive] = await pool.query(`SELECT COUNT(*) AS total FROM student WHERE status = 'active'`);
    const totalStudents = totalActive[0].total;
    const present = stats[0].present_count || 0;
    const absent = stats[0].absent_count || 0;

    return {
      date: targetDate,
      totalActiveStudents: totalStudents,
      totalMarked: stats[0].total_marked || 0,
      presentCount: present,
      absentCount: absent,
      lateCount: stats[0].late_count || 0,
      overallPercentage: totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(2) : 0
    };
  }

  async getLowAttendanceStudents(params) {
    const threshold = typeof params === 'object' ? (params?.threshold || 75) : (params || 75);
    const classId = typeof params === 'object' ? (params?.classId || null) : null;
    let sql = `
      SELECT 
        s.student_id, s.name, s.roll_no, c.name AS class_name,
        COUNT(a.attendance_id) AS total_days,
        SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN a.status = 2 THEN 1 ELSE 0 END) AS absent_days,
        ROUND((SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2) AS percentage
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      LEFT JOIN attendance a ON s.student_id = a.student_id
      WHERE s.status = 'active'
    `;
    const sqlParams = [];
    if (classId) {
      sql += ' AND s.class_id = ?';
      sqlParams.push(classId);
    }
    sql += `
      GROUP BY s.student_id, s.name, s.roll_no, c.name
      HAVING total_days > 0 AND percentage < ?
      ORDER BY percentage ASC
      LIMIT 15
    `;
    sqlParams.push(threshold);

    const [rows] = await pool.query(sql, sqlParams);
    return rows;
  }
}

module.exports = new AttendanceTool();
