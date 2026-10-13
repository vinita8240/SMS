const settingsService = require('../services/settings.service');
const { successResponse } = require('../utils/response');

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getSettings();
      return successResponse(res, 'Settings fetched successfully', settings);
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      await settingsService.updateSettings(req.body);
      return successResponse(res, 'Settings updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getMetadata(req, res, next) {
    try {
      const metadata = await settingsService.getMetadata();
      return successResponse(res, 'Metadata definitions retrieved', metadata);
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const logs = await settingsService.getAuditLogs(req.query.limit || 50);
      return successResponse(res, 'Audit logs retrieved', logs);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SettingsController();
