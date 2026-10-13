/**
 * Chatbot request validation
 */

function validateChatMessage(req, res, next) {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message is required and must be a non-empty string.'
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Message is too long. Please limit questions to 2000 characters.'
    });
  }

  next();
}

module.exports = {
  validateChatMessage
};
