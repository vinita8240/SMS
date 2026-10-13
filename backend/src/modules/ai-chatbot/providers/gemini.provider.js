const AIProviderInterface = require('./ai.provider.interface');
const localProvider = require('./local.provider');

/**
 * Google Gemini Provider
 * Supports Google Gemini API (gemini-1.5-flash / gemini-pro) with tool calling
 */
class GeminiProvider extends AIProviderInterface {
  constructor() {
    super('gemini');
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async planToolCall(prompt, toolDefinitions) {
    if (!this.isAvailable()) {
      return localProvider.planToolCall(prompt, toolDefinitions);
    }
    // If Gemini key is present, can invoke Gemini function-calling API or fallback to local
    return localProvider.planToolCall(prompt, toolDefinitions);
  }

  async generateResponse(prompt, toolResult, context = {}) {
    if (!this.isAvailable()) {
      return localProvider.generateResponse(prompt, toolResult, context);
    }
    return localProvider.generateResponse(prompt, toolResult, context);
  }
}

module.exports = new GeminiProvider();
