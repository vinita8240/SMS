/**
 * Standard API Response Utilities
 */

function successResponse(res, message = 'Success', data = null, pagination = null, statusCode = 200) {
  const payload = {
    success: true,
    message,
    data
  };

  if (pagination) {
    payload.pagination = {
      page: parseInt(pagination.page, 10) || 1,
      limit: parseInt(pagination.limit, 10) || 20,
      total: parseInt(pagination.total, 10) || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 20))
    };
  }

  return res.status(statusCode).json(payload);
}

function errorResponse(res, message = 'An error occurred', errors = null, statusCode = 500) {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse
};
