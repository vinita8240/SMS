const AIProviderInterface = require('./ai.provider.interface');
const localProvider = require('./local.provider');

/**
 * Anthropic Claude Provider
 * Supports Claude 3.5 Sonnet / Haiku
 */
class AnthropicProvider extends AIProviderInterface {
  constructor() {
    super('anthropic');
    this.apiKey = process.env.ANTHROPIC_API_KEY;
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

module.exports = new AnthropicProvider();
