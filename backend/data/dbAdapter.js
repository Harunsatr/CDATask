/**
 * Database Adapter
 * Automatically switches between SQLite (local) and JSON (serverless) based on environment
 */

const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;

let db;

if (isServerless) {
  // Use JSON-based database for serverless environment
  db = require('./jsonDatabase');
} else {
  // Use SQLite for local development
  try {
    db = require('./database');
  } catch (error) {
    console.warn('SQLite not available, falling back to JSON database');
    db = require('./jsonDatabase');
  }
}

module.exports = db;
