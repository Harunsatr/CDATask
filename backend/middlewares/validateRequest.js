const { sanitizePayload } = require('../utils/sanitizer');

const validateRequest = (schema) => async (req, res, next) => {
  try {
    const sanitized = sanitizePayload(req.body || {});
    const parsed = await schema.parseAsync(sanitized);
    req.validatedBody = parsed;
    return next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: error.errors || error.message,
    });
  }
};

module.exports = validateRequest;
