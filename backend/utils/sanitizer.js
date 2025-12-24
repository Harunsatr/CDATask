const validator = require('validator');
const xss = require('xss');

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(validator.trim(value));
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    return sanitizePayload(value);
  }
  return value;
};

const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }
  return Object.entries(payload).reduce((acc, [key, value]) => {
    acc[key] = sanitizeValue(value);
    return acc;
  }, {});
};

module.exports = {
  sanitizePayload,
  sanitizeValue,
};
