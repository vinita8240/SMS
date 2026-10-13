const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]', err);

  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Validation Error', err.details || err.message, 422);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 'A duplicate entry already exists with these details', err.sqlMessage, 409);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return errorResponse(res, 'Foreign key constraint violation', err.sqlMessage, 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, process.env.NODE_ENV === 'development' ? err.stack : null, statusCode);
}

module.exports = errorHandler;
