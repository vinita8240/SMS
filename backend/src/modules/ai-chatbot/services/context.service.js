const pool = require('../../../config/db');

/**
 * Enterprise Context & Memory Service
 * Tracks conversation state, active entities (student, class, teacher), and resolves pronouns
 */
class ContextService {
  /**
   * Get active context from database for a conversation
   */
  async getContext(conversationId) {
    if (!conversationId) return {};
    try {
      const [rows] = await pool.query(
        'SELECT context_json FROM chatbot_conversations WHERE id = ?',
        [conversationId]
      );
      if (rows.length > 0 && rows[0].context_json) {
        return typeof rows[0].context_json === 'string'
          ? JSON.parse(rows[0].context_json)
          : rows[0].context_json;
      }
    } catch (err) {
      console.error('[ContextService] Error getting context:', err.message);
    }
    return {};
  }

  /**
   * Update active context for a conversation
   */
  async updateContext(conversationId, newContext) {
    if (!conversationId) return;
    try {
      const existing = await this.getContext(conversationId);
      const merged = { ...existing, ...newContext, updatedAt: new Date().toISOString() };
      await pool.query(
        'UPDATE chatbot_conversations SET context_json = ? WHERE id = ?',
        [JSON.stringify(merged), conversationId]
      );
      return merged;
    } catch (err) {
      console.error('[ContextService] Error updating context:', err.message);
    }
  }

  /**
   * Resolve pronouns and context references in user message
   */
  resolveContext(message, context = {}, userContext = {}) {
    const lower = message.toLowerCase();
    const resolved = { ...context };

    // Pronoun indicators for students
    const hasStudentPronoun = /\b(his|her|he|she|him|their|this student|the student)\b/i.test(lower);
    if (hasStudentPronoun && context.lastStudentId) {
      resolved.studentId = context.lastStudentId;
      resolved.studentName = context.lastStudentName;
    }

    // Pronoun indicators for teachers
    const hasTeacherPronoun = /\b(his teacher|her teacher|this teacher|the teacher)\b/i.test(lower);
    if (hasTeacherPronoun && context.lastTeacherId) {
      resolved.teacherId = context.lastTeacherId;
      resolved.teacherName = context.lastTeacherName;
    }

    // Context indicators for class
    const hasClassRef = /\b(that class|this class|the class|same class)\b/i.test(lower);
    if (hasClassRef && context.lastClassId) {
      resolved.classId = context.lastClassId;
      resolved.className = context.lastClassName;
    }

    // If logged in as student, enforce self context if not specified
    if (userContext.role === 'student' && userContext.studentId) {
      resolved.studentId = userContext.studentId;
      resolved.studentName = userContext.studentName || resolved.studentName;
    }

    return resolved;
  }
}

module.exports = new ContextService();
