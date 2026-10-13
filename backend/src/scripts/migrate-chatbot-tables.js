const pool = require('../config/db');

async function migrate() {
  try {
    try {
      await pool.query(`ALTER TABLE chatbot_conversations ADD COLUMN context_json JSON NULL AFTER title`);
      console.log('Added context_json to chatbot_conversations');
    } catch(e) {
      if (!e.message.includes('Duplicate column')) console.log('context_json check:', e.message);
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS chatbot_tool_calls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id VARCHAR(64) NOT NULL,
      message_id INT NULL,
      tool_name VARCHAR(100) NOT NULL,
      input_params JSON,
      output_result JSON,
      execution_time_ms INT,
      status ENUM('success', 'error', 'denied') DEFAULT 'success',
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Created chatbot_tool_calls table');

    await pool.query(`CREATE TABLE IF NOT EXISTS chatbot_feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id VARCHAR(64) NOT NULL,
      message_id INT NULL,
      rating ENUM('up', 'down') NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Created chatbot_feedback table');

    await pool.query(`CREATE TABLE IF NOT EXISTS knowledge_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      content LONGTEXT NOT NULL,
      metadata JSON NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Created knowledge_documents table');

    await pool.query(`CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      document_id INT NOT NULL,
      chunk_index INT NOT NULL,
      chunk_text TEXT NOT NULL,
      keywords VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Created knowledge_chunks table');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
