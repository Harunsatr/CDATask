/**
 * Auth Service
 * Handles authentication and user registration using SQLite
 */

const userRepository = require('../data/userRepository');
const { hashPassword, verifyPassword, signToken } = require('../utils/crypto');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeFields } = user;
  return safeFields;
};

const registerUser = async ({ name, email, password, role = 'customer' }) => {
  const normalizedEmail = email.toLowerCase();
  
  // Check if user exists
  const exists = userRepository.findByEmail(normalizedEmail);
  if (exists) {
    const error = new Error('Email already registered.');
    error.status = 409;
    throw error;
  }

  const hashed = await hashPassword(password);
  
  // Create user in database
  const newUser = userRepository.create({
    email: normalizedEmail,
    password: hashed,
    name,
    role
  });

  return sanitizeUser(newUser);
};

const authenticate = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  
  // Find user by email
  const user = userRepository.findByEmail(normalizedEmail);
  if (!user) {
    const error = new Error('Invalid credentials.');
    error.status = 401;
    throw error;
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    const error = new Error('Invalid credentials.');
    error.status = 401;
    throw error;
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: sanitizeUser(user) };
};

const getUserById = (userId) => {
  const user = userRepository.findById(userId);
  return sanitizeUser(user);
};

const updateUser = async (userId, updateData) => {
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }
  const user = userRepository.update(userId, updateData);
  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  authenticate,
  getUserById,
  updateUser,
  sanitizeUser
};
