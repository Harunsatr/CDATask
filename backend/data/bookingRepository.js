/**
 * Booking Repository
 * Database operations for bookings - works with both SQLite and JSON adapter
 */

const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;

if (isServerless) {
  const jsonDb = require('./jsonDatabase');
  module.exports = {
    findById: (id) => jsonDb.bookings.findById(id),
    findByUserId: (userId, options = {}) => jsonDb.bookings.findAll({ user_id: userId, ...options }),
    findByPropertyId: (propertyId, options = {}) => jsonDb.bookings.findAll({ property_id: propertyId, ...options }),
    findAll: (options = {}) => {
      if (options.merchantId) {
        return jsonDb.bookings.findByMerchant(options.merchantId);
      }
      return jsonDb.bookings.findAll(options);
    },
    create: (bookingData) => jsonDb.bookings.create({
      property_id: bookingData.propertyId,
      user_id: bookingData.userId,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      guests: bookingData.guests || 1,
      total_price: bookingData.totalPrice,
      currency: bookingData.currency || 'USD',
      status: bookingData.status || 'pending',
      payment_status: bookingData.paymentStatus || 'unpaid',
      special_requests: bookingData.specialRequests || null,
    }),
    update: (id, bookingData) => {
      const updates = {};
      if (bookingData.checkIn !== undefined) updates.check_in = bookingData.checkIn;
      if (bookingData.checkOut !== undefined) updates.check_out = bookingData.checkOut;
      if (bookingData.guests !== undefined) updates.guests = bookingData.guests;
      if (bookingData.totalPrice !== undefined) updates.total_price = bookingData.totalPrice;
      if (bookingData.status !== undefined) updates.status = bookingData.status;
      if (bookingData.paymentStatus !== undefined) updates.payment_status = bookingData.paymentStatus;
      if (bookingData.paymentId !== undefined) updates.payment_id = bookingData.paymentId;
      if (bookingData.paymentMethod !== undefined) updates.payment_method = bookingData.paymentMethod;
      if (bookingData.specialRequests !== undefined) updates.special_requests = bookingData.specialRequests;
      return jsonDb.bookings.update(id, updates);
    },
    delete: (id) => { /* not implemented */ },
    checkAvailability: (propertyId, checkIn, checkOut, excludeBookingId = null) => 
      jsonDb.bookings.checkAvailability(propertyId, checkIn, checkOut),
    count: (options = {}) => jsonDb.bookings.findAll(options).length,
    getStats: (options = {}) => jsonDb.bookings.getStats(),
  };
} else {

const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');

const bookingRepository = {
  /**
   * Find booking by ID
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT b.*, 
             p.name as property_name, 
             p.location as property_location,
             p.images as property_images,
             u.name as user_name,
             u.email as user_email
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `);
    
    const booking = stmt.get(id);
    
    if (booking && booking.property_images) {
      booking.property_images = JSON.parse(booking.property_images);
    }
    
    return booking;
  },

  /**
   * Find bookings by user ID
   */
  findByUserId(userId, options = {}) {
    const limit = parseInt(options.limit) || 20;
    const offset = parseInt(options.offset) || 0;
    const status = options.status;

    let query = `
      SELECT b.*, 
             p.name as property_name, 
             p.location as property_location,
             p.images as property_images
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE b.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const bookings = stmt.all(...params);

    return bookings.map(b => ({
      ...b,
      property_images: b.property_images ? JSON.parse(b.property_images) : []
    }));
  },

  /**
   * Find bookings by property ID
   */
  findByPropertyId(propertyId, options = {}) {
    const limit = parseInt(options.limit) || 50;
    const offset = parseInt(options.offset) || 0;
    const status = options.status;

    let query = `
      SELECT b.*, 
             u.name as user_name,
             u.email as user_email
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.property_id = ?
    `;
    const params = [propertyId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.check_in DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  /**
   * Find all bookings (for admin/merchant)
   */
  findAll(options = {}) {
    const limit = parseInt(options.limit) || 50;
    const offset = parseInt(options.offset) || 0;
    const status = options.status;
    const merchantId = options.merchantId;

    let query = `
      SELECT b.*, 
             p.name as property_name, 
             p.location as property_location,
             p.merchant_id,
             u.name as user_name,
             u.email as user_email
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (merchantId) {
      query += ' AND p.merchant_id = ?';
      params.push(merchantId);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  /**
   * Create new booking
   */
  create(bookingData) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO bookings (
        id, property_id, user_id, check_in, check_out, guests,
        total_price, currency, status, payment_status, special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      bookingData.propertyId,
      bookingData.userId,
      bookingData.checkIn,
      bookingData.checkOut,
      bookingData.guests || 1,
      bookingData.totalPrice,
      bookingData.currency || 'USD',
      bookingData.status || 'pending',
      bookingData.paymentStatus || 'unpaid',
      bookingData.specialRequests || null
    );

    return this.findById(id);
  },

  /**
   * Update booking
   */
  update(id, bookingData) {
    const updates = [];
    const values = [];

    const fields = {
      checkIn: 'check_in',
      checkOut: 'check_out',
      guests: 'guests',
      totalPrice: 'total_price',
      status: 'status',
      paymentStatus: 'payment_status',
      paymentId: 'payment_id',
      paymentMethod: 'payment_method',
      specialRequests: 'special_requests'
    };

    Object.entries(fields).forEach(([key, column]) => {
      if (bookingData[key] !== undefined) {
        updates.push(`${column} = ?`);
        values.push(bookingData[key]);
      }
    });

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE bookings SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  },

  /**
   * Delete booking
   */
  delete(id) {
    const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Check availability
   */
  checkAvailability(propertyId, checkIn, checkOut, excludeBookingId = null) {
    let query = `
      SELECT COUNT(*) as count FROM bookings 
      WHERE property_id = ? 
        AND status NOT IN ('cancelled', 'rejected')
        AND (
          (check_in <= ? AND check_out > ?) OR
          (check_in < ? AND check_out >= ?) OR
          (check_in >= ? AND check_out <= ?)
        )
    `;
    const params = [propertyId, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut];

    if (excludeBookingId) {
      query += ' AND id != ?';
      params.push(excludeBookingId);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);
    return result.count === 0;
  },

  /**
   * Count bookings
   */
  count(options = {}) {
    let query = 'SELECT COUNT(*) as count FROM bookings b';
    const params = [];
    const conditions = [];

    if (options.userId) {
      conditions.push('b.user_id = ?');
      params.push(options.userId);
    }

    if (options.status) {
      conditions.push('b.status = ?');
      params.push(options.status);
    }

    if (options.merchantId) {
      query += ' LEFT JOIN properties p ON b.property_id = p.id';
      conditions.push('p.merchant_id = ?');
      params.push(options.merchantId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const stmt = db.prepare(query);
    return stmt.get(...params).count;
  },

  /**
   * Get booking statistics
   */
  getStats(options = {}) {
    const { merchantId, startDate, endDate } = options;

    let baseQuery = `
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (merchantId) {
      baseQuery += ' AND p.merchant_id = ?';
      params.push(merchantId);
    }

    if (startDate) {
      baseQuery += ' AND b.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      baseQuery += ' AND b.created_at <= ?';
      params.push(endDate);
    }

    const totalStmt = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`);
    const revenueStmt = db.prepare(`
      SELECT COALESCE(SUM(b.total_price), 0) as revenue 
      ${baseQuery} AND b.payment_status = 'paid'
    `);
    const pendingStmt = db.prepare(`
      SELECT COUNT(*) as count ${baseQuery} AND b.status = 'pending'
    `);
    const confirmedStmt = db.prepare(`
      SELECT COUNT(*) as count ${baseQuery} AND b.status = 'confirmed'
    `);

    return {
      total: totalStmt.get(...params).count,
      revenue: revenueStmt.get(...params).revenue,
      pending: pendingStmt.get(...params).count,
      confirmed: confirmedStmt.get(...params).count
    };
  }
};

module.exports = bookingRepository;
}
