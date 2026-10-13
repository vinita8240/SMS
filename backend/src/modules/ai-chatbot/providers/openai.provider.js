const AIProviderInterface = require('./ai.provider.interface');
const localProvider = require('./local.provider');

/**
 * OpenAI Provider
 * Supports GPT-4o / GPT-3.5-Turbo with function calling
 */
class OpenAIProvider extends AIProviderInterface {
  constructor() {
    super('openai');
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async planToolCall(prompt, toolDefinitions) {
    if (!this.isAvailable()) {
      return localProvider.planToolCall(prompt, toolDefinitions);
    }
    return localProvider.planToolCall(prompt, toolDefinitions);
  }

  async generateResponse(prompt, toolResult, context = {}) {
    if (!this.isAvailable()) {
      return localProvider.generateResponse(prompt, toolResult, context);
    }
    return localProvider.generateResponse(prompt, toolResult, context);
  }
}

module.exports = new OpenAIProvider();
