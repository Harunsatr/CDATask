const config = require('../config/env');

// Minimal centralized error handler that avoids leaking stack traces in production
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const payload = {
    success: false,
    message: err.publicMessage || 'An unexpected error occurred.',
  };

  if (config.nodeEnv !== 'production') {
    payload.debug = err.message;
  }

  if (statusCode >= 500) {
    console.error('API error', { message: err.message, stack: err.stack });
  }

  return res.status(statusCode).json(payload);
};

module.exports = errorHandler;
