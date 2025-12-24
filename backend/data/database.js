/**
 * SQLite Database Configuration
 * Using better-sqlite3 for synchronous, fast database operations
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'luxury_booking.db');

// Initialize database connection
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

/**
 * Initialize database tables
 */
function initializeTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Properties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      address TEXT,
      price_per_night REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      bedrooms INTEGER DEFAULT 1,
      bathrooms INTEGER DEFAULT 1,
      max_guests INTEGER DEFAULT 2,
      amenities TEXT,
      images TEXT,
      merchant_id TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (merchant_id) REFERENCES users(id)
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER DEFAULT 1,
      total_price REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'unpaid',
      payment_id TEXT,
      payment_method TEXT,
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      method TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      payment_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      booking_id TEXT,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )
  `);

  console.log('✅ Database tables initialized');
}

/**
 * Seed initial data
 */
function seedDatabase() {
  const checkUser = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (checkUser.count > 0) {
    console.log('📦 Database already has data, skipping seed');
    return;
  }

  console.log('🌱 Seeding database...');

  // Hash passwords
  const saltRounds = 10;
  const userPassword = bcrypt.hashSync('user123', saltRounds);
  const adminPassword = bcrypt.hashSync('admin123', saltRounds);
  const merchantPassword = bcrypt.hashSync('merchant123', saltRounds);

  // Insert users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, name, role, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const userId = uuidv4();
  const adminId = uuidv4();
  const merchantId = uuidv4();

  insertUser.run(userId, 'user@gmail.com', userPassword, 'John Traveler', 'customer', '+1234567890');
  insertUser.run(adminId, 'admin@gmail.com', adminPassword, 'Admin User', 'admin', '+1234567891');
  insertUser.run(merchantId, 'merchant@gmail.com', merchantPassword, 'Villa Owner', 'merchant', '+1234567892');

  console.log('✅ Users seeded');

  // Insert properties
  const insertProperty = db.prepare(`
    INSERT INTO properties (id, name, description, location, address, price_per_night, currency, rating, review_count, bedrooms, bathrooms, max_guests, amenities, images, merchant_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const properties = [
    {
      id: uuidv4(),
      name: '[FREE TRIAL] Cozy Demo Cottage',
      description: 'Perfect for testing our booking system! This complimentary demo property lets you experience our full booking flow without any charges. Ideal for first-time users.',
      location: 'Demo Location',
      address: 'Demo Address, Test City',
      price: 0,
      rating: 5.0,
      reviews: 999,
      bedrooms: 2,
      bathrooms: 1,
      guests: 4,
      amenities: JSON.stringify(['Free Booking', 'Demo Property', 'Test Checkout', 'No Payment Required']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
      ])
    },
    {
      id: uuidv4(),
      name: 'Oceanfront Paradise Villa',
      description: 'Experience the ultimate luxury getaway at our stunning oceanfront villa. Wake up to breathtaking sunrise views, enjoy private beach access, and unwind in your infinity pool overlooking the crystal-clear waters.',
      location: 'Maldives',
      address: 'North Malé Atoll, Maldives',
      price: 2500,
      rating: 4.9,
      reviews: 128,
      bedrooms: 5,
      bathrooms: 6,
      guests: 10,
      amenities: JSON.stringify(['Private Pool', 'Beach Access', 'Butler Service', 'Spa', 'Wine Cellar', 'Home Theater', 'Helipad']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
      ])
    },
    {
      id: uuidv4(),
      name: 'Alpine Luxury Chalet',
      description: 'Nestled in the heart of the Swiss Alps, this magnificent chalet offers unparalleled mountain views and world-class skiing access. Features include a private spa, wine cave, and gourmet kitchen.',
      location: 'Swiss Alps',
      address: 'Zermatt, Switzerland',
      price: 3500,
      rating: 4.8,
      reviews: 89,
      bedrooms: 6,
      bathrooms: 7,
      guests: 12,
      amenities: JSON.stringify(['Mountain View', 'Private Spa', 'Ski-in/Ski-out', 'Fireplace', 'Wine Cave', 'Chef Kitchen', 'Sauna']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
      ])
    },
    {
      id: uuidv4(),
      name: 'Tropical Rainforest Retreat',
      description: 'Immerse yourself in nature at our exclusive rainforest retreat. This eco-luxury property seamlessly blends with its surroundings while offering all modern amenities and personalized service.',
      location: 'Bali, Indonesia',
      address: 'Ubud, Bali, Indonesia',
      price: 1800,
      rating: 4.7,
      reviews: 156,
      bedrooms: 4,
      bathrooms: 5,
      guests: 8,
      amenities: JSON.stringify(['Infinity Pool', 'Yoga Pavilion', 'Organic Garden', 'Spa', 'Rice Terrace View', 'Private Chef']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        'https://images.unsplash.com/photo-1559628233-100c798642d4?w=800'
      ])
    },
    {
      id: uuidv4(),
      name: 'Manhattan Penthouse Suite',
      description: 'Live like royalty in this stunning Manhattan penthouse. Floor-to-ceiling windows offer panoramic city views, while the rooftop terrace provides an exclusive space for entertaining.',
      location: 'New York, USA',
      address: 'Central Park West, Manhattan, NY',
      price: 4500,
      rating: 4.9,
      reviews: 67,
      bedrooms: 4,
      bathrooms: 4,
      guests: 8,
      amenities: JSON.stringify(['City View', 'Rooftop Terrace', 'Concierge', 'Private Elevator', 'Smart Home', 'Gym', 'Wine Room']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ])
    },
    {
      id: uuidv4(),
      name: 'Santorini Cliffside Villa',
      description: 'Perched on the iconic cliffs of Santorini, this whitewashed villa offers mesmerizing caldera views. Watch legendary sunsets from your private terrace or infinity pool.',
      location: 'Santorini, Greece',
      address: 'Oia, Santorini, Greece',
      price: 2200,
      rating: 4.8,
      reviews: 203,
      bedrooms: 3,
      bathrooms: 3,
      guests: 6,
      amenities: JSON.stringify(['Caldera View', 'Infinity Pool', 'Wine Cellar', 'Sunset Terrace', 'Hot Tub', 'Private Chef']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800'
      ])
    },
    {
      id: uuidv4(),
      name: 'Safari Lodge Estate',
      description: 'Experience African luxury at its finest. This exclusive safari lodge offers close encounters with wildlife, guided expeditions, and unmatched stargazing from your private deck.',
      location: 'Kenya',
      address: 'Masai Mara, Kenya',
      price: 3800,
      rating: 5.0,
      reviews: 45,
      bedrooms: 5,
      bathrooms: 5,
      guests: 10,
      amenities: JSON.stringify(['Safari Tours', 'Wildlife Viewing', 'Private Guide', 'Bush Dining', 'Spa', 'Stargazing Deck']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'
      ])
    }
  ];

  properties.forEach(prop => {
    insertProperty.run(
      prop.id, prop.name, prop.description, prop.location, prop.address,
      prop.price, 'USD', prop.rating, prop.reviews, prop.bedrooms,
      prop.bathrooms, prop.guests, prop.amenities, prop.images, merchantId, 'active'
    );
  });

  console.log('✅ Properties seeded');

  // Insert sample bookings
  const insertBooking = db.prepare(`
    INSERT INTO bookings (id, property_id, user_id, check_in, check_out, guests, total_price, currency, status, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const bookingId = uuidv4();
  insertBooking.run(
    bookingId,
    properties[0].id,
    userId,
    '2025-01-15',
    '2025-01-20',
    4,
    12500,
    'USD',
    'confirmed',
    'paid'
  );

  console.log('✅ Sample bookings seeded');
  console.log('🎉 Database seeding complete!');
}

// Initialize database on module load
initializeTables();
seedDatabase();

module.exports = {
  db,
  DB_PATH
};
