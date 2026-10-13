const BaseRepository = require('./base.repository');

class SettingsRepository extends BaseRepository {
  constructor() {
    super('settings', 'settings_id');
  }

  async getAllSettings() {
    const [rows] = await this.pool.query(`SELECT type, description FROM settings`);
    const settingsMap = {};
    for (const row of rows) {
      settingsMap[row.type] = row.description;
    }
    return settingsMap;
  }

  async updateSettings(settingsMap) {
    return this.withTransaction(async (conn) => {
      for (const [key, value] of Object.entries(settingsMap)) {
        const checkSql = `SELECT settings_id FROM settings WHERE type = ?`;
        const [existing] = await conn.query(checkSql, [key]);

        if (existing.length > 0) {
          await conn.query(`UPDATE settings SET description = ? WHERE type = ?`, [value, key]);
        } else {
          await conn.query(`INSERT INTO settings (type, description) VALUES (?, ?)`, [key, value]);
        }
      }
      return true;
    });
  }

  async getRoles() {
    const [rows] = await this.pool.query(`SELECT * FROM admin_role ORDER BY admin_role_id ASC`);
    return rows;
  }

  async getAuditLogs(limit = 50) {
    const [rows] = await this.pool.query(`SELECT * FROM audit_logs ORDER BY log_id DESC LIMIT ?`, [limit]);
    return rows;
  }

  async getLanguages() {
    const [rows] = await this.pool.query(`SELECT * FROM language_list WHERE status = 'active'`);
    return rows;
  }

  async getHouses() {
    const [rows] = await this.pool.query(`SELECT * FROM house ORDER BY house_id ASC`);
    return rows;
  }

  async getClubs() {
    const [rows] = await this.pool.query(`SELECT * FROM club ORDER BY club_id ASC`);
    return rows;
  }

  async getStudentCategories() {
    const [rows] = await this.pool.query(`SELECT * FROM student_category ORDER BY student_category_id ASC`);
    return rows;
  }

  async getSocialCategories() {
    const [rows] = await this.pool.query(`SELECT * FROM social_category ORDER BY social_category_id ASC`);
    return rows;
  }
}

module.exports = new SettingsRepository();
