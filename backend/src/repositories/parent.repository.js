const BaseRepository = require('./base.repository');

class ParentRepository extends BaseRepository {
  constructor() {
    super('parent', 'parent_id');
  }

  async getFilteredParents(filters = {}) {
    const { page = 1, limit = 20, search = '', status } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.email LIKE ? OR p.phone LIKE ? OR p.profession LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM parent p ${whereClause}`;
    const [countRows] = await this.pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM student s WHERE s.parent_id = p.parent_id) AS total_children
      FROM parent p
      ${whereClause}
      ORDER BY p.parent_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this.pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return {
      parents: rows,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  async getParentWithChildren(parentId) {
    const parentSql = `SELECT * FROM parent WHERE parent_id = ?`;
    const [parents] = await this.pool.query(parentSql, [parentId]);
    if (!parents[0]) return null;

    const childrenSql = `
      SELECT 
        s.student_id, s.admission_no, s.roll_no, s.name, s.gender, s.file_name, s.status,
        c.name AS class_name, sec.name AS section_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN section sec ON s.section_id = sec.section_id
      WHERE s.parent_id = ?
    `;
    const [children] = await this.pool.query(childrenSql, [parentId]);

    return {
      ...parents[0],
      children
    };
  }
}

module.exports = new ParentRepository();
