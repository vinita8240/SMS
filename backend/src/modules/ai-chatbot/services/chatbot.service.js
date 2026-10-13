const chatbotRepository = require('../repositories/chatbot.repository');
const intentService = require('./intent.service');
const queryPlannerService = require('./query-planner.service');
const responseGeneratorService = require('./response-generator.service');
const contextService = require('./context.service');
const providerManager = require('../providers/provider.manager');
const pool = require('../../../config/db');
const crypto = require('crypto');

class ChatbotService {
  /**
   * Process incoming user chat message through secure AI pipeline
   */
  async processMessage(message, conversationId = null, user = null) {
    const activeConversationId = conversationId || `conv_${crypto.randomBytes(8).toString('hex')}`;

    // 1. Ensure conversation exists in database
    await chatbotRepository.getOrCreateConversation(activeConversationId, user, message);

    // 2. Store user message in history
    await chatbotRepository.addMessage(activeConversationId, 'user', message);

    // 3. Load conversation memory and resolve context / pronouns
    const existingContext = await contextService.getContext(activeConversationId);
    const resolvedContext = contextService.resolveContext(message, existingContext, user || {});

    // 4. Intent classification (using Provider Manager or IntentService)
    const intentResult = intentService.detectIntent(message, user);

    // 5. Query Planner: Execute approved data tools with permission checks & context
    const planResult = await queryPlannerService.planAndExecute(intentResult, user, message, resolvedContext);

    // 6. Update conversation context if entities were identified
    if (planResult.contextUpdates && Object.keys(planResult.contextUpdates).length > 0) {
      await contextService.updateContext(activeConversationId, planResult.contextUpdates);
    }

    // 7. Response Generator: Synthesize final answer from authoritative data
    const answer = responseGeneratorService.generateResponse(planResult, message, user);

    // 8. Store AI response in history
    const messageId = await chatbotRepository.addMessage(
      activeConversationId,
      'bot',
      answer,
      planResult.intent,
      planResult.sources
    );

    return {
      answer,
      intent: planResult.intent,
      sources: planResult.sources || [],
      conversationId: activeConversationId,
      messageId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Record user feedback (thumbs up / down)
   */
  async recordFeedback(conversationId, messageId, rating, comment = null) {
    try {
      await pool.query(
        `INSERT INTO chatbot_feedback (conversation_id, message_id, rating, comment) VALUES (?, ?, ?, ?)`,
        [conversationId, messageId || null, rating, comment]
      );
      return { success: true };
    } catch (err) {
      console.error('[ChatbotService] Error recording feedback:', err.message);
      throw err;
    }
  }

  /**
   * Get suggestions for the user interface based on authenticated role
   */
  getSuggestions(user = null) {
    const role = (user?.role || user?.userType || 'guest').toLowerCase();

    if (role === 'student') {
      return [
        { label: '📊 My Attendance', prompt: 'What is my attendance?' },
        { label: '📝 My Exam Marks', prompt: 'What are my marks?' },
        { label: '💰 Fee Balance', prompt: 'How much fee do I need to pay?' },
        { label: '📋 Due Assignments', prompt: 'What assignments are due?' },
        { label: '🗓️ Upcoming Exams', prompt: 'What exams are coming?' },
        { label: '📚 Study Materials', prompt: 'Show my study materials' }
      ];
    }

    if (role === 'parent') {
      return [
        { label: '📊 Child Attendance', prompt: 'What is my child\'s attendance?' },
        { label: '📝 Child Marks', prompt: 'What are my child\'s marks?' },
        { label: '💰 Pending Fees', prompt: 'What fees are pending?' },
        { label: '📋 Pending Homework', prompt: 'What assignments are pending?' },
        { label: '📢 Class Notices', prompt: 'What notices apply to my child\'s class?' }
      ];
    }

    if (role === 'teacher') {
      return [
        { label: '📅 Today\'s Attendance', prompt: 'Show today\'s attendance' },
        { label: '❌ Absent Students', prompt: 'Which students are absent?' },
        { label: '👥 My Class Students', prompt: 'How many students are in my class?' },
        { label: '📘 Assigned Subjects', prompt: 'Show my assigned subjects' },
        { label: '⚠️ Low Attendance', prompt: 'Which students have low attendance?' }
      ];
    }

    if (role === 'admin' || role === 'super_admin') {
      return [
        { label: '🎒 Enrolled Students', prompt: 'How many students are enrolled?' },
        { label: '👨‍🏫 Total Teachers', prompt: 'How many teachers are there?' },
        { label: '💰 Fee Collections', prompt: 'How much fee has been collected?' },
        { label: '📊 Today\'s Attendance', prompt: 'What is today\'s school attendance?' },
        { label: '📑 Recent Admissions', prompt: 'Show recent admissions' }
      ];
    }

    // Public Guest Suggestions
    return [
      { label: '📋 Admission Process', prompt: 'What is the admission process?' },
      { label: '🕒 School Timings', prompt: 'What are the school timings?' },
      { label: '🔬 Campus Facilities', prompt: 'What facilities does the school have?' },
      { label: '💰 Fee Structure', prompt: 'What is the fee structure?' },
      { label: '📢 Latest Notices', prompt: 'What are the latest notices?' },
      { label: '📍 Contact & Location', prompt: 'Where is the school located?' }
    ];
  }

  /**
   * Get conversations for user
   */
  async getUserConversations(user) {
    const userId = user ? (user.id || user.student_id || user.teacher_id || user.parent_id || user.admin_id) : null;
    const role = user?.role || 'guest';
    return chatbotRepository.getUserConversations(userId, role);
  }

  /**
   * Get specific conversation messages
   */
  async getConversationMessages(conversationId) {
    return chatbotRepository.getConversationMessages(conversationId);
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId, user) {
    const userId = user ? (user.id || user.student_id || user.teacher_id || user.parent_id || user.admin_id) : null;
    const role = user?.role || 'guest';
    return chatbotRepository.deleteConversation(conversationId, userId, role);
  }
}

module.exports = new ChatbotService();
