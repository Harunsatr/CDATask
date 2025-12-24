/**
 * Booking Service
 * Handles booking operations using SQLite
 */

const bookingRepository = require('../data/bookingRepository');
const propertyRepository = require('../data/propertyRepository');
const paymentRepository = require('../data/paymentRepository');

/**
 * Calculate number of nights between dates
 */
const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * List bookings by user
 */
const listBookingsByUser = async (userId, options = {}) => {
  return bookingRepository.findByUserId(userId, options);
};

/**
 * List bookings for merchant (their properties)
 */
const listBookingsForMerchant = async (merchantId, options = {}) => {
  return bookingRepository.findAll({ ...options, merchantId });
};

/**
 * List all bookings (admin)
 */
const listAllBookings = async (options = {}) => {
  return bookingRepository.findAll(options);
};

/**
 * Get booking by ID
 */
const getBookingById = async (id) => {
  const booking = bookingRepository.findById(id);
  if (!booking) {
    const error = new Error('Booking not found.');
    error.status = 404;
    throw error;
  }
  return booking;
};

/**
 * Create a new booking
 */
const createBooking = async (payload, user) => {
  const property = propertyRepository.findById(payload.propertyId);
  
  if (!property || property.status !== 'active') {
    const error = new Error('Property unavailable.');
    error.status = 404;
    throw error;
  }

  if (payload.guests > property.max_guests) {
    const error = new Error('Guest count exceeds property limit.');
    error.status = 400;
    throw error;
  }

  // Check availability
  const isAvailable = bookingRepository.checkAvailability(
    property.id,
    payload.checkIn,
    payload.checkOut
  );
  
  if (!isAvailable) {
    const error = new Error('Dates already reserved.');
    error.status = 409;
    throw error;
  }

  // Calculate total price
  const nights = calculateNights(payload.checkIn, payload.checkOut);
  const totalPrice = property.price_per_night * nights;

  // Create booking
  const booking = bookingRepository.create({
    propertyId: property.id,
    userId: user.id,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    guests: payload.guests,
    totalPrice,
    currency: property.currency,
    specialRequests: payload.specialRequests,
    status: 'pending',
    paymentStatus: 'unpaid'
  });

  return booking;
};

/**
 * Update booking status
 */
const updateBookingStatus = async (id, status, user) => {
  const booking = bookingRepository.findById(id);
  
  if (!booking) {
    const error = new Error('Booking not found.');
    error.status = 404;
    throw error;
  }

  // Validate status transition
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'];
  if (!validStatuses.includes(status)) {
    const error = new Error('Invalid status.');
    error.status = 400;
    throw error;
  }

  return bookingRepository.update(id, { status });
};

/**
 * Cancel booking
 */
const cancelBooking = async (id, user) => {
  const booking = bookingRepository.findById(id);
  
  if (!booking) {
    const error = new Error('Booking not found.');
    error.status = 404;
    throw error;
  }

  // Only allow user to cancel their own booking or admin
  if (booking.user_id !== user.id && user.role !== 'admin') {
    const error = new Error('Not authorized to cancel this booking.');
    error.status = 403;
    throw error;
  }

  // Can't cancel completed bookings
  if (booking.status === 'completed') {
    const error = new Error('Cannot cancel completed booking.');
    error.status = 400;
    throw error;
  }

  return bookingRepository.update(id, { status: 'cancelled' });
};

/**
 * Get booking statistics
 */
const getBookingStats = async (options = {}) => {
  return bookingRepository.getStats(options);
};

/**
 * Check property availability
 */
const checkAvailability = async (propertyId, checkIn, checkOut) => {
  const property = propertyRepository.findById(propertyId);
  
  if (!property) {
    const error = new Error('Property not found.');
    error.status = 404;
    throw error;
  }

  const isAvailable = bookingRepository.checkAvailability(propertyId, checkIn, checkOut);
  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = property.price_per_night * nights;

  return {
    available: isAvailable,
    property: {
      id: property.id,
      name: property.name,
      pricePerNight: property.price_per_night,
      currency: property.currency
    },
    nights,
    totalPrice
  };
};

module.exports = {
  listBookingsByUser,
  listBookingsForMerchant,
  listAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  checkAvailability
};
