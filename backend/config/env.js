const dotenv = require('dotenv');

dotenv.config();

const parseOrigins = (origins) => {
  if (!origins) {
    // Allow all localhost ports for development
    return ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:8888'];
  }
  return origins.split(',').map((origin) => origin.trim()).filter(Boolean);
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'insecure-change-me',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || '4h',
  corsOrigins: parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
};
