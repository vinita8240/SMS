const BaseRepository = require('./base.repository');

class StudentRepository extends BaseRepository {
  constructor() {
    super('student', 'student_id');
  }

  async getFilteredStudents(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      class_id,
      section_id,
      session,
      status,
      gender,
      parent_id
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(s.name LIKE ? OR s.admission_no LIKE ? OR s.roll_no LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    if (class_id) {
      conditions.push('s.class_id = ?');
      params.push(class_id);
    }

    if (section_id) {
      conditions.push('s.section_id = ?');
      params.push(section_id);
    }

    if (session) {
      conditions.push('s.session = ?');
      params.push(session);
    }

    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }

    if (gender) {
      conditions.push('s.gender = ?');
      params.push(gender);
    }

    if (parent_id) {
      conditions.push('s.parent_id = ?');
      params.push(parent_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM student s ${whereClause}`;
    const [countRows] = await this.pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name, s.email, s.phone, s.gender, s.birthday,
        s.blood_group, s.father_name, s.mother_name, s.status, s.session, s.file_name, s.created_at,
        c.name AS class_name, c.class_id,
        sec.name AS section_name, sec.section_id,
        p.name AS parent_name, p.phone AS parent_phone, p.email AS parent_email,
        h.name AS house_name,
        cl.name AS club_name,
        d.name AS dormitory_name,
        tr.route_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      LEFT JOIN house h ON s.house_id = h.house_id
      LEFT JOIN club cl ON s.club_id = cl.club_id
      LEFT JOIN dormitory d ON s.dormitory_id = d.dormitory_id
      LEFT JOIN transport t ON s.transport_id = t.transport_id
      LEFT JOIN transport_route tr ON t.transport_route_id = tr.transport_route_id
      ${whereClause}
      ORDER BY s.student_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this.pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return {
      students: rows,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  async getStudentProfile(studentId) {
    const sql = `
      SELECT 
        s.*,
        c.name AS class_name,
        sec.name AS section_name,
        p.name AS parent_name, p.phone AS parent_phone, p.email AS parent_email, p.profession AS parent_profession, p.address AS parent_address,
        sc.name AS student_category_name,
        soc.name AS social_category_name,
        h.name AS house_name, h.color_code AS house_color,
        cl.name AS club_name,
        d.name AS dormitory_name,
        tr.route_name, tr.route_fare,
        v.vehicle_number, v.driver_name, v.driver_phone
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      LEFT JOIN student_category sc ON s.student_category_id = sc.student_category_id
      LEFT JOIN social_category soc ON s.social_category_id = soc.social_category_id
      LEFT JOIN house h ON s.house_id = h.house_id
      LEFT JOIN club cl ON s.club_id = cl.club_id
      LEFT JOIN dormitory d ON s.dormitory_id = d.dormitory_id
      LEFT JOIN transport t ON s.transport_id = t.transport_id
      LEFT JOIN transport_route tr ON t.transport_route_id = tr.transport_route_id
      LEFT JOIN vehicle v ON t.vehicle_id = v.vehicle_id
      WHERE s.student_id = ?
    `;
    const [rows] = await this.pool.query(sql, [studentId]);
    return rows[0] || null;
  }

  async promoteStudents(studentIds, targetClassId, targetSectionId, newSession) {
    return this.withTransaction(async (conn) => {
      for (const id of studentIds) {
        await conn.query(
          `UPDATE student SET class_id = ?, section_id = ?, session = ? WHERE student_id = ?`,
          [targetClassId, targetSectionId, newSession, id]
        );
      }
      return true;
    });
  }
}

module.exports = new StudentRepository();
