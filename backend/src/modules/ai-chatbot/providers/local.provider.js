const AIProviderInterface = require('./ai.provider.interface');
const intentService = require('../services/intent.service');
const responseGenerator = require('../services/response-generator.service');

/**
 * Local NLP Provider
 * High speed, zero external latency, deterministic tool planner and response formatter
 */
class LocalNLPProvider extends AIProviderInterface {
  constructor() {
    super('local_nlp');
  }

  async planToolCall(prompt, toolDefinitions) {
    const analysis = intentService.classify(prompt);
    return {
      intent: analysis.intent,
      entities: analysis.entities,
      confidence: analysis.confidence
    };
  }

  async generateResponse(prompt, toolResult, context = {}) {
    return responseGenerator.generateResponse(context.intent, toolResult, context);
  }
}

module.exports = new LocalNLPProvider();
