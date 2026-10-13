/**
 * Base AI Provider Interface
 */
class AIProviderInterface {
  constructor(name) {
    this.name = name;
  }

  /**
   * Determine intent and tool call requirement
   * @param {string} prompt
   * @param {Array} toolDefinitions
   * @returns {Promise<{toolName: string, params: object, confidence: number}|null>}
   */
  async planToolCall(prompt, toolDefinitions) {
    throw new Error('planToolCall method must be implemented');
  }

  /**
   * Generate conversational natural-language response given tool output
   * @param {string} prompt
   * @param {object} toolResult
   * @param {object} context
   * @returns {Promise<string>}
   */
  async generateResponse(prompt, toolResult, context) {
    throw new Error('generateResponse method must be implemented');
  }
}

module.exports = AIProviderInterface;
