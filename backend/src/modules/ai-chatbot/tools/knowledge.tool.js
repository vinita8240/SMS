const pool = require('../../../config/db');

/**
 * Knowledge Base & RAG tool for unstructured policy, syllabus, and document retrieval
 */
const knowledgeTool = {
  /**
   * Search knowledge base documents and chunks
   */
  async searchKnowledge(params = {}) {
    const query = typeof params === 'object' ? params?.query : params;
    if (!query) return [];
    try {
      // Search chunks first
      const chunkSql = `
        SELECT kc.chunk_text, kd.title, kd.category, kd.metadata
        FROM knowledge_chunks kc
        JOIN knowledge_documents kd ON kc.document_id = kd.id
        WHERE kd.is_active = 1
          AND (kc.chunk_text LIKE ? OR kc.keywords LIKE ? OR kd.title LIKE ?)
        LIMIT ?
      `;
      const term = `%${query}%`;
      const [chunks] = await pool.query(chunkSql, [term, term, term, Number(params?.limit || 5)]);
      if (chunks.length > 0) return chunks;

      // Fallback search full documents
      let docSql = `
        SELECT id, title, category, content, metadata
        FROM knowledge_documents
        WHERE is_active = 1 AND (title LIKE ? OR content LIKE ?)
      `;
      const docParams = [term, term];
      if (params?.category) {
        docSql += ` AND category = ?`;
        docParams.push(params.category);
      }
      docSql += ` LIMIT ?`;
      docParams.push(Number(params?.limit || 5));

      const [docs] = await pool.query(docSql, docParams);
      return docs;
    } catch (err) {
      // Tables may not exist yet — return empty gracefully
      return [];
    }
  },

  /**
   * Add a new knowledge document with automated chunking
   */
  async addKnowledgeDocument({ title, category = 'general', content, metadata = null }) {
    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    const [docResult] = await pool.query(
      `INSERT INTO knowledge_documents (title, category, content, metadata) VALUES (?, ?, ?, ?)`,
      [title, category, content, metadata ? JSON.stringify(metadata) : null]
    );
    const documentId = docResult.insertId;

    // Simple paragraph/sentence chunker
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    for (let i = 0; i < paragraphs.length; i++) {
      const pText = paragraphs[i].trim();
      const keywords = pText.slice(0, 100).replace(/[^\w\s]/g, '').toLowerCase();
      await pool.query(
        `INSERT INTO knowledge_chunks (document_id, chunk_index, chunk_text, keywords) VALUES (?, ?, ?, ?)`,
        [documentId, i, pText, keywords]
      );
    }

    return { documentId, chunksCreated: paragraphs.length };
  }
};

module.exports = knowledgeTool;
