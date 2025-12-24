/**
 * User Service
 * Handles user management operations using SQLite
 */

const userRepository = require('../data/userRepository');

const listUsers = async (options = {}) => {
  return userRepository.findAll(options);
};

const getUserById = async (id) => {
  const user = userRepository.findById(id);
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  return user;
};

const updateUser = async (id, updateData) => {
  const user = userRepository.findById(id);
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  return userRepository.update(id, updateData);
};

const deleteUser = async (id) => {
  const user = userRepository.findById(id);
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  userRepository.delete(id);
  return { message: 'User deleted successfully' };
};

const getUserCount = async (role = null) => {
  return userRepository.count(role);
};

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserCount
};
