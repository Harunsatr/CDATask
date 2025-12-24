/**
 * JSON-based Database for Serverless Environment (Netlify Functions)
 * This provides in-memory storage with JSON fallback for serverless deployments
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In-memory data store (resets on each cold start, but works for demo)
let store = {
  users: [],
  properties: [],
  bookings: [],
  payments: [],
};

// Initialize with seed data
function initializeData() {
  // Check if already initialized
  if (store.users.length > 0) return;

  const now = new Date().toISOString();

  // Seed users
  store.users = [
    {
      id: uuidv4(),
      email: 'admin@gmail.com',
      password: bcrypt.hashSync('admin123', 10),
      name: 'Admin User',
      role: 'admin',
      phone: '+1234567890',
      avatar: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      email: 'merchant@gmail.com',
      password: bcrypt.hashSync('merchant123', 10),
      name: 'Merchant User',
      role: 'merchant',
      phone: '+1234567891',
      avatar: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      email: 'user@gmail.com',
      password: bcrypt.hashSync('user123', 10),
      name: 'Regular User',
      role: 'customer',
      phone: '+1234567892',
      avatar: null,
      created_at: now,
      updated_at: now,
    },
  ];

  const merchantId = store.users.find(u => u.role === 'merchant').id;

  // Seed properties
  store.properties = [
    {
      id: uuidv4(),
      name: 'Oceanfront Paradise Villa',
      description: 'A stunning beachfront villa with panoramic ocean views, private infinity pool, and direct beach access.',
      location: 'Maldives',
      address: 'North Malé Atoll, Maldives',
      price_per_night: 1500,
      currency: 'USD',
      rating: 4.9,
      review_count: 127,
      bedrooms: 4,
      bathrooms: 4,
      max_guests: 8,
      amenities: JSON.stringify(['Private Pool', 'Ocean View', 'Beach Access', 'Chef Service', 'Spa', 'WiFi']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      ]),
      merchant_id: merchantId,
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      name: 'Alpine Luxury Chalet',
      description: 'Exclusive mountain retreat with ski-in/ski-out access, hot tub, and breathtaking alpine views.',
      location: 'Swiss Alps',
      address: 'Zermatt, Switzerland',
      price_per_night: 2000,
      currency: 'USD',
      rating: 4.8,
      review_count: 89,
      bedrooms: 5,
      bathrooms: 5,
      max_guests: 10,
      amenities: JSON.stringify(['Hot Tub', 'Fireplace', 'Ski Access', 'Mountain View', 'Sauna', 'WiFi']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
      ]),
      merchant_id: merchantId,
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      name: 'Tuscan Estate Vineyard',
      description: 'Historic Tuscan estate surrounded by private vineyards, olive groves, and Renaissance gardens.',
      location: 'Tuscany, Italy',
      address: 'Chianti Region, Tuscany',
      price_per_night: 1800,
      currency: 'USD',
      rating: 4.9,
      review_count: 156,
      bedrooms: 6,
      bathrooms: 6,
      max_guests: 12,
      amenities: JSON.stringify(['Vineyard', 'Pool', 'Wine Cellar', 'Garden', 'Chef Available', 'WiFi']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800',
        'https://images.unsplash.com/photo-1559599238-308793637427?w=800',
      ]),
      merchant_id: merchantId,
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      name: 'Free Demo Property',
      description: 'Experience our booking system with this complimentary demo property. Perfect for testing the platform.',
      location: 'Demo Location',
      address: 'Virtual Address',
      price_per_night: 0,
      currency: 'USD',
      rating: 5.0,
      review_count: 50,
      bedrooms: 2,
      bathrooms: 2,
      max_guests: 4,
      amenities: JSON.stringify(['Demo Feature', 'Free Booking', 'Test Mode']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      ]),
      merchant_id: merchantId,
      status: 'active',
      created_at: now,
      updated_at: now,
    },
  ];

  store.bookings = [];
  store.payments = [];
}

// User operations
const userOps = {
  findByEmail: (email) => store.users.find(u => u.email === email),
  findById: (id) => store.users.find(u => u.id === id),
  create: (userData) => {
    const user = {
      id: uuidv4(),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.users.push(user);
    return user;
  },
  findAll: (filters = {}) => {
    let users = [...store.users];
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }
    return users.map(({ password, ...user }) => user);
  },
  update: (id, updates) => {
    const index = store.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    store.users[index] = { ...store.users[index], ...updates, updated_at: new Date().toISOString() };
    return store.users[index];
  },
};

// Property operations
const propertyOps = {
  findById: (id) => {
    const prop = store.properties.find(p => p.id === id);
    if (!prop) return null;
    return {
      ...prop,
      amenities: prop.amenities ? JSON.parse(prop.amenities) : [],
      images: prop.images ? JSON.parse(prop.images) : [],
    };
  },
  findAll: (filters = {}) => {
    let properties = [...store.properties];
    if (filters.status) {
      properties = properties.filter(p => p.status === filters.status);
    }
    if (filters.merchant_id) {
      properties = properties.filter(p => p.merchant_id === filters.merchant_id);
    }
    if (filters.location) {
      properties = properties.filter(p => 
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    return properties.map(p => ({
      ...p,
      amenities: p.amenities ? JSON.parse(p.amenities) : [],
      images: p.images ? JSON.parse(p.images) : [],
    }));
  },
  create: (propertyData) => {
    const property = {
      id: uuidv4(),
      ...propertyData,
      amenities: JSON.stringify(propertyData.amenities || []),
      images: JSON.stringify(propertyData.images || []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.properties.push(property);
    return {
      ...property,
      amenities: propertyData.amenities || [],
      images: propertyData.images || [],
    };
  },
  update: (id, updates) => {
    const index = store.properties.findIndex(p => p.id === id);
    if (index === -1) return null;
    if (updates.amenities) updates.amenities = JSON.stringify(updates.amenities);
    if (updates.images) updates.images = JSON.stringify(updates.images);
    store.properties[index] = { ...store.properties[index], ...updates, updated_at: new Date().toISOString() };
    const prop = store.properties[index];
    return {
      ...prop,
      amenities: prop.amenities ? JSON.parse(prop.amenities) : [],
      images: prop.images ? JSON.parse(prop.images) : [],
    };
  },
  delete: (id) => {
    const index = store.properties.findIndex(p => p.id === id);
    if (index === -1) return false;
    store.properties.splice(index, 1);
    return true;
  },
  getStats: () => ({
    total: store.properties.length,
    active: store.properties.filter(p => p.status === 'active').length,
    pending: store.properties.filter(p => p.status === 'pending').length,
  }),
};

// Booking operations
const bookingOps = {
  findById: (id) => {
    const booking = store.bookings.find(b => b.id === id);
    if (!booking) return null;
    const property = store.properties.find(p => p.id === booking.property_id);
    const user = store.users.find(u => u.id === booking.user_id);
    return {
      ...booking,
      property_name: property?.name,
      user_name: user?.name,
      user_email: user?.email,
    };
  },
  findAll: (filters = {}) => {
    let bookings = [...store.bookings];
    if (filters.user_id) {
      bookings = bookings.filter(b => b.user_id === filters.user_id);
    }
    if (filters.property_id) {
      bookings = bookings.filter(b => b.property_id === filters.property_id);
    }
    if (filters.status) {
      bookings = bookings.filter(b => b.status === filters.status);
    }
    return bookings.map(booking => {
      const property = store.properties.find(p => p.id === booking.property_id);
      const user = store.users.find(u => u.id === booking.user_id);
      return {
        ...booking,
        property_name: property?.name,
        user_name: user?.name,
        user_email: user?.email,
      };
    });
  },
  findByMerchant: (merchantId) => {
    const merchantProperties = store.properties.filter(p => p.merchant_id === merchantId);
    const propertyIds = merchantProperties.map(p => p.id);
    return store.bookings
      .filter(b => propertyIds.includes(b.property_id))
      .map(booking => {
        const property = store.properties.find(p => p.id === booking.property_id);
        const user = store.users.find(u => u.id === booking.user_id);
        return {
          ...booking,
          property_name: property?.name,
          user_name: user?.name,
          user_email: user?.email,
        };
      });
  },
  create: (bookingData) => {
    const booking = {
      id: uuidv4(),
      ...bookingData,
      status: 'pending',
      payment_status: 'unpaid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.bookings.push(booking);
    return booking;
  },
  update: (id, updates) => {
    const index = store.bookings.findIndex(b => b.id === id);
    if (index === -1) return null;
    store.bookings[index] = { ...store.bookings[index], ...updates, updated_at: new Date().toISOString() };
    return store.bookings[index];
  },
  checkAvailability: (propertyId, checkIn, checkOut) => {
    const conflicting = store.bookings.find(b => 
      b.property_id === propertyId &&
      b.status !== 'cancelled' &&
      new Date(b.check_in) < new Date(checkOut) &&
      new Date(b.check_out) > new Date(checkIn)
    );
    return !conflicting;
  },
  getStats: () => ({
    total: store.bookings.length,
    revenue: store.bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0),
    pending: store.bookings.filter(b => b.status === 'pending').length,
    confirmed: store.bookings.filter(b => b.status === 'confirmed').length,
  }),
};

// Payment operations
const paymentOps = {
  findById: (id) => store.payments.find(p => p.id === id),
  findByBookingId: (bookingId) => store.payments.find(p => p.booking_id === bookingId),
  findAll: (filters = {}) => {
    let payments = [...store.payments];
    if (filters.user_id) {
      payments = payments.filter(p => p.user_id === filters.user_id);
    }
    if (filters.status) {
      payments = payments.filter(p => p.status === filters.status);
    }
    return payments;
  },
  create: (paymentData) => {
    const payment = {
      id: uuidv4(),
      ...paymentData,
      transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.payments.push(payment);
    return payment;
  },
  update: (id, updates) => {
    const index = store.payments.findIndex(p => p.id === id);
    if (index === -1) return null;
    store.payments[index] = { ...store.payments[index], ...updates, updated_at: new Date().toISOString() };
    return store.payments[index];
  },
  getStats: () => ({
    total: store.payments.length,
    completed: store.payments.filter(p => p.status === 'completed').length,
    completedAmount: store.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    pending: store.payments.filter(p => p.status === 'pending').length,
    pendingAmount: store.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    failed: store.payments.filter(p => p.status === 'failed').length,
  }),
};

// Initialize on load
initializeData();

module.exports = {
  users: userOps,
  properties: propertyOps,
  bookings: bookingOps,
  payments: paymentOps,
  initializeData,
};
