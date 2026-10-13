const chatbotService = require('../services/chatbot.service');
const toolRegistry = require('../tools/tool.registry');
const { successResponse, errorResponse } = require('../../../utils/response');

class ChatbotController {
  /**
   * Main chat endpoint
   * POST /api/ai/chat
   */
  async chat(req, res) {
    try {
      const { message, conversationId } = req.body;
      const user = req.user || null;

      const result = await chatbotService.processMessage(message, conversationId, user);

      return successResponse(res, 'Chat response generated successfully', result);
    } catch (err) {
      console.error('[ChatbotController] Chat error:', err);
      return errorResponse(res, 'Failed to process AI chat message', err.message, 500);
    }
  }

  /**
   * Record user feedback
   * POST /api/ai/feedback
   */
  async feedback(req, res) {
    try {
      const { conversationId, messageId, rating, comment } = req.body;
      if (!conversationId || !rating) {
        return errorResponse(res, 'conversationId and rating (up/down) are required', null, 400);
      }
      const result = await chatbotService.recordFeedback(conversationId, messageId, rating, comment);
      return successResponse(res, 'Feedback recorded', result);
    } catch (err) {
      return errorResponse(res, 'Failed to record feedback', err.message, 500);
    }
  }

  /**
   * Get registered tool definitions
   * GET /api/ai/tools
   */
  async getTools(req, res) {
    try {
      const user = req.user || null;
      const role = user?.role || 'public';
      const tools = toolRegistry.getAllToolDefinitions(role);
      return successResponse(res, 'Available tools retrieved', tools);
    } catch (err) {
      return errorResponse(res, 'Failed to fetch tools', err.message, 500);
    }
  }

  /**
   * Get contextual question suggestions
   * GET /api/ai/suggestions
   */
  async getSuggestions(req, res) {
    try {
      const user = req.user || null;
      const suggestions = chatbotService.getSuggestions(user);
      return successResponse(res, 'Suggestions retrieved', suggestions);
    } catch (err) {
      return errorResponse(res, 'Failed to fetch suggestions', err.message, 500);
    }
  }

  /**
   * List conversations
   * GET /api/ai/conversations
   */
  async getConversations(req, res) {
    try {
      const user = req.user || null;
      const conversations = await chatbotService.getUserConversations(user);
      return successResponse(res, 'Conversations retrieved', conversations);
    } catch (err) {
      return errorResponse(res, 'Failed to fetch conversations', err.message, 500);
    }
  }

  /**
   * Get specific conversation messages
   * GET /api/ai/conversations/:id
   */
  async getConversationById(req, res) {
    try {
      const { id } = req.params;
      const messages = await chatbotService.getConversationMessages(id);
      return successResponse(res, 'Conversation history retrieved', messages);
    } catch (err) {
      return errorResponse(res, 'Failed to fetch conversation history', err.message, 500);
    }
  }

  /**
   * Delete conversation
   * DELETE /api/ai/conversations/:id
   */
  async deleteConversation(req, res) {
    try {
      const { id } = req.params;
      const user = req.user || null;
      await chatbotService.deleteConversation(id, user);
      return successResponse(res, 'Conversation deleted successfully');
    } catch (err) {
      return errorResponse(res, 'Failed to delete conversation', err.message, 500);
    }
  }
}

module.exports = new ChatbotController();
