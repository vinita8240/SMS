const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, username, password, role } = req.body;
      const identifier = (username || email || '').trim();
      const result = await authService.login(identifier, password, role);
      return successResponse(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, 'Token refreshed successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user);
      return successResponse(res, 'Profile fetched successfully', user);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user, currentPassword, newPassword);
      return successResponse(res, result.message, null);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    return successResponse(res, 'Logged out successfully');
  }
}

module.exports = new AuthController();
