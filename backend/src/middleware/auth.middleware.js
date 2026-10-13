const { verifyAccessToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication token required', null, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired, please login again', null, 401);
    }
    return errorResponse(res, 'Invalid authentication token', null, 401);
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', null, 401);
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const formattedRoles = allowedRoles.map(r => r.toLowerCase());

    if (userRole === 'super_admin' || formattedRoles.includes(userRole) || formattedRoles.includes('*')) {
      return next();
    }

    return errorResponse(res, 'Forbidden: You do not have permission to perform this action', null, 403);
  };
}

module.exports = {
  authenticate,
  authorizeRoles
};
