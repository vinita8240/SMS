const pool = require('../../../config/db');

class NoticeTool {
  async getLatestNotices({ limit = 5, search = null, audience = null, classId = null }) {
    let sql = `
      SELECT 
        notice_id, notice_title, notice, date, audience, class_id, create_timestamp, created_at
      FROM noticeboard
      WHERE status = 'active'
    `;
    const params = [];

    if (search) {
      sql += ' AND (notice_title LIKE ? OR notice LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (audience) {
      sql += ' AND (audience = ? OR audience = "all")';
      params.push(audience);
    }

    if (classId) {
      sql += ' AND (class_id IS NULL OR class_id = ?)';
      params.push(classId);
    }

    sql += ' ORDER BY notice_id DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getCirculars({ limit = 5 }) {
    const sql = `
      SELECT 
        circular_id, title, reference_no, content, file_name, date, created_at
      FROM circular
      ORDER BY circular_id DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  }
}

module.exports = new NoticeTool();
