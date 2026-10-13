const pool = require('../../../config/db');

class ChatbotRepository {
  constructor() {
    this.initialized = false;
    this.ensureTablesExist();
  }

  async ensureTablesExist() {
    if (this.initialized) return;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`chatbot_conversations\` (
          \`id\` varchar(64) NOT NULL,
          \`user_id\` int(11) DEFAULT NULL,
          \`user_type\` varchar(50) DEFAULT 'guest',
          \`role\` varchar(50) DEFAULT 'guest',
          \`title\` varchar(255) DEFAULT 'New Conversation',
          \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_conv_user\` (\`user_id\`, \`role\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`chatbot_messages\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`conversation_id\` varchar(64) NOT NULL,
          \`sender\` enum('user','bot','system') NOT NULL,
          \`message\` longtext NOT NULL,
          \`intent\` varchar(100) DEFAULT NULL,
          \`sources\` longtext DEFAULT NULL,
          \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_msg_conv\` (\`conversation_id\`),
          CONSTRAINT \`fk_msg_conv\` FOREIGN KEY (\`conversation_id\`) REFERENCES \`chatbot_conversations\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`chatbot_feedback\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`conversation_id\` varchar(64) NOT NULL,
          \`message_id\` int(11) DEFAULT NULL,
          \`rating\` enum('up','down') NOT NULL,
          \`comment\` text DEFAULT NULL,
          \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_feedback_conv\` (\`conversation_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      this.initialized = true;
    } catch (err) {
      console.error('[ChatbotRepository] Table init check:', err.message);
    }
  }

  async getOrCreateConversation(conversationId, user = null, firstMessage = 'Conversation') {
    await this.ensureTablesExist();
    const userId = user ? (user.id || user.student_id || user.teacher_id || user.parent_id || user.admin_id) : null;
    const role = user?.role || 'guest';
    const userType = user?.userType || 'guest';

    const [existing] = await pool.query('SELECT * FROM chatbot_conversations WHERE id = ?', [conversationId]);
    if (existing.length > 0) {
      // Update title if needed
      return existing[0];
    }

    const title = firstMessage.length > 40 ? firstMessage.substring(0, 37) + '...' : firstMessage;
    await pool.query(
      'INSERT INTO chatbot_conversations (id, user_id, user_type, role, title) VALUES (?, ?, ?, ?, ?)',
      [conversationId, userId, userType, role, title]
    );

    return {
      id: conversationId,
      user_id: userId,
      user_type: userType,
      role,
      title
    };
  }

  async addMessage(conversationId, sender, message, intent = null, sources = null) {
    await this.ensureTablesExist();
    const sourcesJson = sources ? JSON.stringify(sources) : null;
    const [res] = await pool.query(
      'INSERT INTO chatbot_messages (conversation_id, sender, message, intent, sources) VALUES (?, ?, ?, ?, ?)',
      [conversationId, sender, message, intent, sourcesJson]
    );
    return res.insertId;
  }

  async getConversationMessages(conversationId, limit = 50) {
    await this.ensureTablesExist();
    const [rows] = await pool.query(
      'SELECT * FROM chatbot_messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC LIMIT ?',
      [conversationId, limit]
    );
    return rows.map(r => ({
      ...r,
      sources: r.sources ? (typeof r.sources === 'string' ? JSON.parse(r.sources) : r.sources) : []
    }));
  }

  async getUserConversations(userId, role, limit = 20) {
    await this.ensureTablesExist();
    let sql = 'SELECT * FROM chatbot_conversations WHERE ';
    const params = [];

    if (userId) {
      sql += 'user_id = ? AND role = ? ';
      params.push(userId, role);
    } else {
      sql += 'role = ? ';
      params.push('guest');
    }

    sql += 'ORDER BY updated_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async deleteConversation(conversationId, userId = null, role = null) {
    await this.ensureTablesExist();
    if (userId && role !== 'super_admin' && role !== 'admin') {
      const [res] = await pool.query(
        'DELETE FROM chatbot_conversations WHERE id = ? AND user_id = ?',
        [conversationId, userId]
      );
      return res.affectedRows > 0;
    }
    const [res] = await pool.query('DELETE FROM chatbot_conversations WHERE id = ?', [conversationId]);
    return res.affectedRows > 0;
  }
}

module.exports = new ChatbotRepository();
