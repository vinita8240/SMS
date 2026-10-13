const localProvider = require('./local.provider');
const geminiProvider = require('./gemini.provider');
const openaiProvider = require('./openai.provider');
const anthropicProvider = require('./anthropic.provider');

/**
 * AI Provider Manager
 * Dynamically chooses the active AI provider based on environment config with automatic fallback
 */
class ProviderManager {
  constructor() {
    this.providers = {
      local: localProvider,
      gemini: geminiProvider,
      openai: openaiProvider,
      anthropic: anthropicProvider
    };
  }

  getActiveProvider() {
    const configuredProvider = (process.env.AI_PROVIDER || 'local').toLowerCase();
    const provider = this.providers[configuredProvider];
    if (provider && (configuredProvider === 'local' || provider.isAvailable())) {
      return provider;
    }
    // Check if any other cloud provider is available
    if (geminiProvider.isAvailable()) return geminiProvider;
    if (openaiProvider.isAvailable()) return openaiProvider;
    if (anthropicProvider.isAvailable()) return anthropicProvider;

    // Fallback to local
    return localProvider;
  }
}

module.exports = new ProviderManager();
