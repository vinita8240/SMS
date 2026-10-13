const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { validateChatMessage } = require('../validators/chatbot.validator');
const { verifyAccessToken } = require('../../../utils/jwt');

// Middleware to extract optional JWT authentication
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch {
      // Invalid/expired token: continue as guest user
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

// AI Chatbot Endpoints
router.post('/chat', optionalAuth, validateChatMessage, chatbotController.chat.bind(chatbotController));
router.post('/feedback', optionalAuth, chatbotController.feedback.bind(chatbotController));
router.get('/tools', optionalAuth, chatbotController.getTools.bind(chatbotController));
router.get('/suggestions', optionalAuth, chatbotController.getSuggestions.bind(chatbotController));
router.get('/conversations', optionalAuth, chatbotController.getConversations.bind(chatbotController));
router.get('/conversations/:id', optionalAuth, chatbotController.getConversationById.bind(chatbotController));
router.delete('/conversations/:id', optionalAuth, chatbotController.deleteConversation.bind(chatbotController));

module.exports = router;
