/**
 * Property Repository
 * Database operations for properties - works with both SQLite and JSON adapter
 */

const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;

if (isServerless) {
  const jsonDb = require('./jsonDatabase');
  module.exports = {
    findById: (id) => jsonDb.properties.findById(id),
    findAll: (options = {}) => jsonDb.properties.findAll(options),
    create: (propertyData) => jsonDb.properties.create({
      name: propertyData.name,
      description: propertyData.description || '',
      location: propertyData.location,
      address: propertyData.address || '',
      price_per_night: propertyData.pricePerNight,
      currency: propertyData.currency || 'USD',
      bedrooms: propertyData.bedrooms || 1,
      bathrooms: propertyData.bathrooms || 1,
      max_guests: propertyData.maxGuests || 2,
      amenities: propertyData.amenities || [],
      images: propertyData.images || [],
      merchant_id: propertyData.merchantId,
      status: propertyData.status || 'active',
    }),
    update: (id, propertyData) => {
      const updates = {};
      if (propertyData.name !== undefined) updates.name = propertyData.name;
      if (propertyData.description !== undefined) updates.description = propertyData.description;
      if (propertyData.location !== undefined) updates.location = propertyData.location;
      if (propertyData.address !== undefined) updates.address = propertyData.address;
      if (propertyData.pricePerNight !== undefined) updates.price_per_night = propertyData.pricePerNight;
      if (propertyData.bedrooms !== undefined) updates.bedrooms = propertyData.bedrooms;
      if (propertyData.bathrooms !== undefined) updates.bathrooms = propertyData.bathrooms;
      if (propertyData.maxGuests !== undefined) updates.max_guests = propertyData.maxGuests;
      if (propertyData.amenities !== undefined) updates.amenities = propertyData.amenities;
      if (propertyData.images !== undefined) updates.images = propertyData.images;
      if (propertyData.status !== undefined) updates.status = propertyData.status;
      return jsonDb.properties.update(id, updates);
    },
    delete: (id) => jsonDb.properties.delete(id),
    updateRating: () => { /* not implemented for serverless */ },
    count: (options = {}) => jsonDb.properties.findAll(options).length,
    getFeatured: (limit = 6) => jsonDb.properties.findAll({ status: 'active' }).slice(0, limit),
    getStats: () => jsonDb.properties.getStats(),
  };
} else {
  const { db } = require('./database');
  const { v4: uuidv4 } = require('uuid');

  const propertyRepository = {
    /**
     * Find property by ID
     */
    findById(id) {
      const stmt = db.prepare('SELECT * FROM properties WHERE id = ?');
      const property = stmt.get(id);
      
      if (property) {
        property.amenities = JSON.parse(property.amenities || '[]');
        property.images = JSON.parse(property.images || '[]');
      }
      
      return property;
    },

  /**
   * Get all properties with filters
   */
  findAll(options = {}) {
    const limit = parseInt(options.limit) || 20;
    const offset = parseInt(options.offset) || 0;
    const { 
      location, 
      minPrice, 
      maxPrice,
      bedrooms,
      guests,
      status = 'active',
      merchantId,
      search
    } = options;

    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (minPrice) {
      query += ' AND price_per_night >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND price_per_night <= ?';
      params.push(maxPrice);
    }

    if (bedrooms) {
      query += ' AND bedrooms >= ?';
      params.push(bedrooms);
    }

    if (guests) {
      query += ' AND max_guests >= ?';
      params.push(guests);
    }

    if (merchantId) {
      query += ' AND merchant_id = ?';
      params.push(merchantId);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY rating DESC, review_count DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const properties = stmt.all(...params);

    return properties.map(p => ({
      ...p,
      amenities: JSON.parse(p.amenities || '[]'),
      images: JSON.parse(p.images || '[]')
    }));
  },

  /**
   * Create new property
   */
  create(propertyData) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO properties (
        id, name, description, location, address, price_per_night, 
        currency, bedrooms, bathrooms, max_guests, amenities, images, 
        merchant_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      propertyData.name,
      propertyData.description || '',
      propertyData.location,
      propertyData.address || '',
      propertyData.pricePerNight,
      propertyData.currency || 'USD',
      propertyData.bedrooms || 1,
      propertyData.bathrooms || 1,
      propertyData.maxGuests || 2,
      JSON.stringify(propertyData.amenities || []),
      JSON.stringify(propertyData.images || []),
      propertyData.merchantId,
      propertyData.status || 'active'
    );

    return this.findById(id);
  },

  /**
   * Update property
   */
  update(id, propertyData) {
    const updates = [];
    const values = [];

    const fields = {
      name: 'name',
      description: 'description',
      location: 'location',
      address: 'address',
      pricePerNight: 'price_per_night',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      maxGuests: 'max_guests',
      status: 'status'
    };

    Object.entries(fields).forEach(([key, column]) => {
      if (propertyData[key] !== undefined) {
        updates.push(`${column} = ?`);
        values.push(propertyData[key]);
      }
    });

    if (propertyData.amenities) {
      updates.push('amenities = ?');
      values.push(JSON.stringify(propertyData.amenities));
    }

    if (propertyData.images) {
      updates.push('images = ?');
      values.push(JSON.stringify(propertyData.images));
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE properties SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  },

  /**
   * Delete property
   */
  delete(id) {
    const stmt = db.prepare('DELETE FROM properties WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Update property rating
   */
  updateRating(id) {
    const stmt = db.prepare(`
      UPDATE properties SET 
        rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE property_id = ?), 0),
        review_count = (SELECT COUNT(*) FROM reviews WHERE property_id = ?),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(id, id, id);
  },

  /**
   * Count properties
   */
  count(options = {}) {
    let query = 'SELECT COUNT(*) as count FROM properties WHERE 1=1';
    const params = [];

    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    if (options.merchantId) {
      query += ' AND merchant_id = ?';
      params.push(options.merchantId);
    }

    const stmt = db.prepare(query);
    return stmt.get(...params).count;
  },

  /**
   * Get featured properties
   */
  getFeatured(limit = 6) {
    const stmt = db.prepare(`
      SELECT * FROM properties 
      WHERE status = 'active' 
      ORDER BY rating DESC, review_count DESC 
      LIMIT ?
    `);
    
    const properties = stmt.all(limit);
    return properties.map(p => ({
      ...p,
      amenities: JSON.parse(p.amenities || '[]'),
      images: JSON.parse(p.images || '[]')
    }));
  },

  getStats() {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM properties
    `);
    return stmt.get();
  }
};

module.exports = propertyRepository;
}
