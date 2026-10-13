const settingsRepo = require('../repositories/settings.repository');

class SettingsService {
  async getSettings() {
    return settingsRepo.getAllSettings();
  }

  async updateSettings(settingsMap) {
    if (!settingsMap || typeof settingsMap !== 'object') {
      throw { statusCode: 400, message: 'Settings map object required' };
    }
    return settingsRepo.updateSettings(settingsMap);
  }

  async getRoles() {
    return settingsRepo.getRoles();
  }

  async getAuditLogs(limit) {
    return settingsRepo.getAuditLogs(limit);
  }

  async getMetadata() {
    const [roles, languages, houses, clubs, studentCategories, socialCategories] = await Promise.all([
      settingsRepo.getRoles(),
      settingsRepo.getLanguages(),
      settingsRepo.getHouses(),
      settingsRepo.getClubs(),
      settingsRepo.getStudentCategories(),
      settingsRepo.getSocialCategories()
    ]);

    return {
      roles,
      languages,
      houses,
      clubs,
      studentCategories,
      socialCategories
    };
  }
}

module.exports = new SettingsService();
