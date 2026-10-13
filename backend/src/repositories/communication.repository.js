const BaseRepository = require('./base.repository');

class CommunicationRepository extends BaseRepository {
  constructor() {
    super('noticeboard', 'notice_id');
  }

  // --- Notices ---
  async getNotices(audience) {
    let sql = `
      SELECT 
        n.notice_id AS id,
        n.notice_id,
        n.notice_title AS title,
        n.notice_title,
        n.notice,
        n.notice AS content,
        n.notice AS description,
        n.audience AS target_role,
        n.audience,
        n.date,
        n.created_at,
        c.name AS class_name,
        s.name AS section_name
      FROM noticeboard n
      LEFT JOIN class c ON n.class_id = c.class_id
      LEFT JOIN section s ON n.section_id = s.section_id
    `;
    const params = [];
    if (audience && audience !== 'all') {
      sql += ` WHERE n.audience = 'all' OR n.audience = ?`;
      params.push(audience);
    }
    sql += ` ORDER BY n.notice_id DESC`;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createNotice(data) {
    const title = data.title || data.notice_title;
    const body = data.notice || data.content || data.description || '';
    const audience = data.target_role || data.audience || 'all';
    const date = data.date || new Date().toISOString().substring(0, 10);

    const [res] = await this.pool.query(
      `INSERT INTO noticeboard (notice_title, notice, audience, date, status) VALUES (?, ?, ?, ?, 'active')`,
      [title, body, audience, date]
    );
    return { id: res.insertId, ...data };
  }

  async updateNotice(id, data) {
    const title = data.title || data.notice_title;
    const body = data.notice || data.content || data.description;
    const audience = data.target_role || data.audience;
    const date = data.date;

    await this.pool.query(
      `UPDATE noticeboard SET 
        notice_title = COALESCE(?, notice_title),
        notice = COALESCE(?, notice),
        audience = COALESCE(?, audience),
        date = COALESCE(?, date)
       WHERE notice_id = ?`,
      [title, body, audience, date, id]
    );
    return { id, ...data };
  }

  async deleteNotice(id) {
    await this.pool.query(`DELETE FROM noticeboard WHERE notice_id = ?`, [id]);
    return true;
  }

  // --- Circulars ---
  async getCirculars() {
    const [rows] = await this.pool.query(`
      SELECT 
        circular_id AS id,
        circular_id,
        title,
        reference_no,
        content,
        file_name,
        date,
        created_at
      FROM circular 
      ORDER BY circular_id DESC
    `);
    return rows;
  }

  async createCircular(data) {
    const sql = `INSERT INTO circular (title, reference_no, content, file_name, date) VALUES (?, ?, ?, ?, ?)`;
    const [res] = await this.pool.query(sql, [
      data.title, 
      data.reference_no || null, 
      data.content || data.description || '', 
      data.file_name || null, 
      data.date || new Date().toISOString().substring(0, 10)
    ]);
    return { id: res.insertId, ...data };
  }

  async updateCircular(id, data) {
    await this.pool.query(
      `UPDATE circular SET 
        title = COALESCE(?, title),
        reference_no = COALESCE(?, reference_no),
        content = COALESCE(?, content),
        date = COALESCE(?, date)
       WHERE circular_id = ?`,
      [data.title, data.reference_no, data.content || data.description, data.date, id]
    );
    return { id, ...data };
  }

  async deleteCircular(id) {
    await this.pool.query(`DELETE FROM circular WHERE circular_id = ?`, [id]);
    return true;
  }

  // --- Enquiries ---
  async getEnquiryCategories() {
    const [rows] = await this.pool.query(`SELECT * FROM enquiry_category ORDER BY category_name ASC`);
    return rows;
  }

  async getEnquiries(filters = {}) {
    const { status, enquiry_category_id } = filters;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }
    if (enquiry_category_id) {
      conditions.push('e.enquiry_category_id = ?');
      params.push(enquiry_category_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        e.enquiry_id AS id,
        e.enquiry_id,
        e.name,
        e.name AS student_name,
        e.phone,
        e.email,
        e.purpose AS class_name,
        e.message AS notes,
        e.message,
        e.status,
        e.date,
        e.response,
        ec.category_name
      FROM enquiry e
      LEFT JOIN enquiry_category ec ON e.enquiry_category_id = ec.enquiry_category_id
      ${where}
      ORDER BY e.enquiry_id DESC
    `;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async createEnquiry(data) {
    const [res] = await this.pool.query(
      `INSERT INTO enquiry (name, phone, email, purpose, message, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.phone, data.email || '', data.class_name || data.purpose || 'General', data.notes || data.message || '', data.status || 'pending', data.date || new Date().toISOString().substring(0, 10)]
    );
    return { id: res.insertId, ...data };
  }

  async updateEnquiry(id, data) {
    await this.pool.query(
      `UPDATE enquiry SET 
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        purpose = COALESCE(?, purpose),
        message = COALESCE(?, message),
        status = COALESCE(?, status),
        response = COALESCE(?, response)
       WHERE enquiry_id = ?`,
      [data.name, data.phone, data.email, data.class_name || data.purpose, data.notes || data.message, data.status, data.response, id]
    );
    return { id, ...data };
  }

  async deleteEnquiry(id) {
    await this.pool.query(`DELETE FROM enquiry WHERE enquiry_id = ?`, [id]);
    return true;
  }
}

module.exports = new CommunicationRepository();
