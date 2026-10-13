const BaseRepository = require('./base.repository');

class DashboardRepository extends BaseRepository {
  constructor() {
    super('settings', 'settings_id');
  }

  async getAdminDashboardMetrics() {
    // Run all 10 analytics queries in parallel for ultra-fast response
    const [
      [counts],
      [attStats],
      [finances],
      [hostel],
      [studentsByClass],
      [genderDist],
      [attTrend],
      [expenseByCat],
      [teacherDept],
      [transportUtil]
    ] = await Promise.all([
      // 1. Basic Counts
      this.pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM student WHERE status = 'active') AS total_students,
          (SELECT COUNT(*) FROM teacher WHERE status = 'active') AS total_teachers,
          (SELECT COUNT(*) FROM parent WHERE status = 'active') AS total_parents,
          (SELECT COUNT(*) FROM class) AS total_classes,
          (SELECT COUNT(*) FROM section) AS total_sections,
          (SELECT COUNT(*) FROM book) AS total_books,
          (SELECT COUNT(*) FROM exam WHERE status IN ('scheduled', 'ongoing')) AS upcoming_exams,
          (SELECT COUNT(*) FROM assignment WHERE due_date >= CURDATE()) AS pending_assignments
      `),

      // 2. Today's Attendance
      this.pool.query(`
        SELECT 
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS present_today,
          SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS absent_today,
          COUNT(*) AS marked_today
        FROM attendance
        WHERE date = (SELECT MAX(date) FROM attendance)
      `),

      // 3. Financial Summary
      this.pool.query(`
        SELECT 
          COALESCE(SUM(amount_paid), 0) AS total_revenue,
          COALESCE(SUM(due), 0) AS pending_fees,
          COALESCE((SELECT SUM(amount) FROM expenses), 0) AS total_expenses
        FROM invoice
      `),

      // 4. Hostel Occupancy
      this.pool.query(`
        SELECT 
          COALESCE(SUM(num_beds), 0) AS total_beds,
          (SELECT COUNT(*) FROM student WHERE dormitory_id IS NOT NULL AND status = 'active') AS occupied_beds
        FROM hostel_room
      `),

      // 5. Chart Data: Students per Class
      this.pool.query(`
        SELECT c.name AS class_name, COUNT(s.student_id) AS student_count
        FROM class c
        LEFT JOIN student s ON c.class_id = s.class_id AND s.status = 'active'
        GROUP BY c.class_id, c.name, c.name_numeric
        ORDER BY c.name_numeric ASC, c.name ASC
      `),

      // 6. Chart Data: Gender Distribution
      this.pool.query(`
        SELECT gender, COUNT(*) AS count
        FROM student
        WHERE status = 'active'
        GROUP BY gender
      `),

      // 7. Chart Data: Attendance Trend (Last 7 dates)
      this.pool.query(`
        SELECT 
          date,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS present,
          SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS absent,
          SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS late
        FROM attendance
        GROUP BY date
        ORDER BY date DESC
        LIMIT 7
      `),

      // 8. Chart Data: Expense by Category
      this.pool.query(`
        SELECT ec.name AS category_name, COALESCE(SUM(e.amount), 0) AS total_amount
        FROM expense_category ec
        LEFT JOIN expenses e ON ec.expense_category_id = e.expense_category_id
        GROUP BY ec.expense_category_id, ec.name
      `),

      // 9. Chart Data: Teachers by Department
      this.pool.query(`
        SELECT d.name AS department_name, COUNT(t.teacher_id) AS teacher_count
        FROM department d
        LEFT JOIN teacher t ON d.department_id = t.department_id AND t.status = 'active'
        GROUP BY d.department_id, d.name
      `),

      // 10. Chart Data: Transport Utilization
      this.pool.query(`
        SELECT 
          tr.route_name,
          v.vehicle_number,
          v.seating_capacity,
          COUNT(s.student_id) AS assigned_students
        FROM transport t
        JOIN transport_route tr ON t.transport_route_id = tr.transport_route_id
        JOIN vehicle v ON t.vehicle_id = v.vehicle_id
        LEFT JOIN student s ON s.transport_id = t.transport_id AND s.status = 'active'
        GROUP BY t.transport_id, tr.route_name, v.vehicle_number, v.seating_capacity
      `)
    ]);

    return {
      kpi: {
        totalStudents: counts[0].total_students || 0,
        totalTeachers: counts[0].total_teachers || 0,
        totalParents: counts[0].total_parents || 0,
        totalClasses: counts[0].total_classes || 0,
        totalSections: counts[0].total_sections || 0,
        totalBooks: counts[0].total_books || 0,
        upcomingExams: counts[0].upcoming_exams || 0,
        pendingAssignments: counts[0].pending_assignments || 0,
        presentToday: attStats[0] ? (attStats[0].present_today || 0) : 0,
        absentToday: attStats[0] ? (attStats[0].absent_today || 0) : 0,
        totalRevenue: parseFloat(finances[0].total_revenue) || 0,
        pendingFees: parseFloat(finances[0].pending_fees) || 0,
        totalExpenses: parseFloat(finances[0].total_expenses) || 0,
        totalBeds: parseInt(hostel[0].total_beds, 10) || 0,
        occupiedBeds: parseInt(hostel[0].occupied_beds, 10) || 0,
        hostelOccupancyRate: hostel[0].total_beds > 0 ? ((hostel[0].occupied_beds / hostel[0].total_beds) * 100).toFixed(1) : 0
      },
      charts: {
        studentsByClass,
        genderDistribution: genderDist,
        attendanceTrend: attTrend.reverse(),
        expenseByCategory: expenseByCat,
        teachersByDepartment: teacherDept,
        transportUtilization: transportUtil
      }
    };
  }

  async getTeacherDashboardMetrics(teacherId) {
    const [assigned] = await this.pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM class WHERE teacher_id = ?) AS class_teacher_count,
        (SELECT COUNT(*) FROM section WHERE teacher_id = ?) AS section_teacher_count,
        (SELECT COUNT(*) FROM subject WHERE teacher_id = ?) AS subject_count,
        (SELECT COUNT(*) FROM assignment WHERE teacher_id = ? AND due_date >= CURDATE()) AS active_assignments,
        (SELECT COUNT(*) FROM \`leave\` WHERE teacher_id = ? AND status = 'pending') AS pending_leaves
    `, [teacherId, teacherId, teacherId, teacherId, teacherId]);

    const [recentLeaves] = await this.pool.query(`
      SELECT * FROM \`leave\` WHERE teacher_id = ? ORDER BY leave_id DESC LIMIT 5
    `, [teacherId]);

    return {
      stats: assigned[0],
      recentLeaves
    };
  }

  async getStudentDashboardMetrics(studentId) {
    const [
      [student],
      [finances],
      [attendance],
      [recentMarks]
    ] = await Promise.all([
      this.pool.query(`
        SELECT s.*, c.name AS class_name, sec.name AS section_name
        FROM student s
        JOIN class c ON s.class_id = c.class_id
        JOIN section sec ON s.section_id = sec.section_id
        WHERE s.student_id = ?
      `, [studentId]),
      this.pool.query(`
        SELECT 
          COALESCE(SUM(amount), 0) AS total_billed,
          COALESCE(SUM(amount_paid), 0) AS total_paid,
          COALESCE(SUM(due), 0) AS total_due
        FROM invoice WHERE student_id = ?
      `, [studentId]),
      this.pool.query(`
        SELECT 
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS present_days,
          SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS absent_days,
          COUNT(*) AS total_days,
          ROUND((SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2) AS percentage
        FROM attendance WHERE student_id = ?
      `, [studentId]),
      this.pool.query(`
        SELECT m.*, sub.name AS subject_name, e.name AS exam_name
        FROM mark m
        JOIN subject sub ON m.subject_id = sub.subject_id
        JOIN exam e ON m.exam_id = e.exam_id
        WHERE m.student_id = ?
        ORDER BY m.mark_id DESC LIMIT 5
      `, [studentId])
    ]);

    return {
      profile: student[0] || null,
      finances: finances[0],
      attendance: attendance[0],
      recentMarks
    };
  }

  async getParentDashboardMetrics(parentId) {
    const [children] = await this.pool.query(`
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name, s.file_name,
        c.name AS class_name, sec.name AS section_name,
        (SELECT COALESCE(SUM(due), 0) FROM invoice i WHERE i.student_id = s.student_id) AS pending_due,
        (SELECT ROUND((SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1) FROM attendance a WHERE a.student_id = s.student_id) AS attendance_rate
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      JOIN section sec ON s.section_id = sec.section_id
      WHERE s.parent_id = ?
    `, [parentId]);

    return {
      children
    };
  }
}

module.exports = new DashboardRepository();
