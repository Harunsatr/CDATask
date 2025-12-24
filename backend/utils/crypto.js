const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const hashPassword = async (plain) => bcrypt.hash(plain, 12);
const verifyPassword = async (plain, hash) => bcrypt.compare(plain, hash);

const signToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.tokenExpiresIn,
  });

const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
};
