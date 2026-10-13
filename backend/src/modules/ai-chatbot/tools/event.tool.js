const pool = require('../../../config/db');

class EventTool {
  async getUpcomingEvents({ limit = 5, category = null }) {
    let sql = `
      SELECT 
        event_id, title, description, venue, start_date, end_date, time, category, registration_url
      FROM cms_events
      WHERE is_published = 1
    `;
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY start_date ASC, event_id ASC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getEventDetails(slugOrId) {
    const isNum = !isNaN(slugOrId);
    let sql = 'SELECT * FROM cms_events WHERE is_published = 1 AND ';
    sql += isNum ? 'event_id = ?' : 'slug = ?';

    const [rows] = await pool.query(sql, [slugOrId]);
    return rows[0] || null;
  }
}

module.exports = new EventTool();
