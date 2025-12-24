/**
 * Payment Repository
 * Database operations for payments - works with both SQLite and JSON adapter
 */

const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;

if (isServerless) {
  const jsonDb = require('./jsonDatabase');
  module.exports = {
    findById: (id) => jsonDb.payments.findById(id),
    findByBookingId: (bookingId) => {
      const payment = jsonDb.payments.findByBookingId(bookingId);
      return payment ? [payment] : [];
    },
    findByUserId: (userId, options = {}) => jsonDb.payments.findAll({ user_id: userId, ...options }),
    findAll: (options = {}) => jsonDb.payments.findAll(options),
    create: (paymentData) => jsonDb.payments.create({
      booking_id: paymentData.bookingId,
      user_id: paymentData.userId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      method: paymentData.method,
      status: paymentData.status || 'pending',
      transaction_id: paymentData.transactionId || null,
      payment_data: paymentData.paymentData ? JSON.stringify(paymentData.paymentData) : null,
    }),
    update: (id, paymentData) => {
      const updates = {};
      if (paymentData.status !== undefined) updates.status = paymentData.status;
      if (paymentData.transactionId !== undefined) updates.transaction_id = paymentData.transactionId;
      if (paymentData.paymentData !== undefined) updates.payment_data = JSON.stringify(paymentData.paymentData);
      return jsonDb.payments.update(id, updates);
    },
    getStats: (options = {}) => jsonDb.payments.getStats(),
  };
} else {

const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');

const paymentRepository = {
  /**
   * Find payment by ID
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT p.*, 
             b.property_id,
             b.check_in,
             b.check_out,
             u.name as user_name,
             u.email as user_email
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `);
    
    const payment = stmt.get(id);
    
    if (payment && payment.payment_data) {
      payment.payment_data = JSON.parse(payment.payment_data);
    }
    
    return payment;
  },

  /**
   * Find payment by booking ID
   */
  findByBookingId(bookingId) {
    const stmt = db.prepare('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC');
    const payments = stmt.all(bookingId);
    
    return payments.map(p => ({
      ...p,
      payment_data: p.payment_data ? JSON.parse(p.payment_data) : null
    }));
  },

  /**
   * Find payments by user ID
   */
  findByUserId(userId, options = {}) {
    const limit = parseInt(options.limit) || 20;
    const offset = parseInt(options.offset) || 0;
    const status = options.status;

    let query = `
      SELECT p.*, 
             b.property_id,
             b.check_in,
             b.check_out,
             prop.name as property_name
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN properties prop ON b.property_id = prop.id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const payments = stmt.all(...params);

    return payments.map(p => ({
      ...p,
      payment_data: p.payment_data ? JSON.parse(p.payment_data) : null
    }));
  },

  /**
   * Find all payments (for admin)
   */
  findAll(options = {}) {
    const limit = parseInt(options.limit) || 50;
    const offset = parseInt(options.offset) || 0;
    const status = options.status;
    const method = options.method;

    let query = `
      SELECT p.*, 
             b.property_id,
             u.name as user_name,
             u.email as user_email,
             prop.name as property_name
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN properties prop ON b.property_id = prop.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (method) {
      query += ' AND p.method = ?';
      params.push(method);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const payments = stmt.all(...params);

    return payments.map(p => ({
      ...p,
      payment_data: p.payment_data ? JSON.parse(p.payment_data) : null
    }));
  },

  /**
   * Create new payment
   */
  create(paymentData) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO payments (
        id, booking_id, user_id, amount, currency, method,
        status, transaction_id, payment_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      paymentData.bookingId,
      paymentData.userId,
      paymentData.amount,
      paymentData.currency || 'USD',
      paymentData.method,
      paymentData.status || 'pending',
      paymentData.transactionId || null,
      paymentData.paymentData ? JSON.stringify(paymentData.paymentData) : null
    );

    return this.findById(id);
  },

  /**
   * Update payment
   */
  update(id, paymentData) {
    const updates = [];
    const values = [];

    if (paymentData.status !== undefined) {
      updates.push('status = ?');
      values.push(paymentData.status);
    }

    if (paymentData.transactionId !== undefined) {
      updates.push('transaction_id = ?');
      values.push(paymentData.transactionId);
    }

    if (paymentData.paymentData !== undefined) {
      updates.push('payment_data = ?');
      values.push(JSON.stringify(paymentData.paymentData));
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE payments SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  },

  /**
   * Get payment statistics
   */
  getStats(options = {}) {
    const { startDate, endDate } = options;

    let baseQuery = 'FROM payments WHERE 1=1';
    const params = [];

    if (startDate) {
      baseQuery += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      baseQuery += ' AND created_at <= ?';
      params.push(endDate);
    }

    const totalStmt = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`);
    const completedStmt = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount 
      ${baseQuery} AND status = 'completed'
    `);
    const pendingStmt = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount 
      ${baseQuery} AND status = 'pending'
    `);
    const failedStmt = db.prepare(`
      SELECT COUNT(*) as count ${baseQuery} AND status = 'failed'
    `);

    const completed = completedStmt.get(...params);
    const pending = pendingStmt.get(...params);

    return {
      total: totalStmt.get(...params).count,
      completed: completed.count,
      completedAmount: completed.amount,
      pending: pending.count,
      pendingAmount: pending.amount,
      failed: failedStmt.get(...params).count
    };
  }
};

module.exports = paymentRepository;
}
