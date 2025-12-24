/**
 * User Repository
 * Database operations for users
 */

const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');

const userRepository = {
  /**
   * Find user by email
   */
  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  /**
   * Find user by ID
   */
  findById(id) {
    const stmt = db.prepare('SELECT id, email, name, role, phone, avatar, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Find user by ID with password (for auth)
   */
  findByIdWithPassword(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Create new user
   */
  create(userData) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userData.email,
      userData.password,
      userData.name,
      userData.role || 'customer',
      userData.phone || null
    );

    return this.findById(id);
  },

  /**
   * Update user
   */
  update(id, userData) {
    const updates = [];
    const values = [];

    if (userData.name) {
      updates.push('name = ?');
      values.push(userData.name);
    }
    if (userData.phone) {
      updates.push('phone = ?');
      values.push(userData.phone);
    }
    if (userData.avatar) {
      updates.push('avatar = ?');
      values.push(userData.avatar);
    }
    if (userData.password) {
      updates.push('password = ?');
      values.push(userData.password);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.findById(id);
  },

  /**
   * Delete user
   */
  delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Get all users (for admin)
   */
  findAll(options = {}) {
    const limit = parseInt(options.limit) || 50;
    const offset = parseInt(options.offset) || 0;
    const role = options.role;
    
    let query = 'SELECT id, email, name, role, phone, avatar, created_at FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  /**
   * Count users
   */
  count(role) {
    let query = 'SELECT COUNT(*) as count FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    const stmt = db.prepare(query);
    return stmt.get(...params).count;
  }
};

module.exports = userRepository;
